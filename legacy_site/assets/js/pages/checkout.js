/* Checkout — cash on delivery order created in a Firestore transaction. */
(function (X) {
  "use strict";

  var root = document.getElementById("checkout-root");
  var busy = false;

  function money(value) { return X.formatINR(value); }

  function emptyBag() {
    root.innerHTML =
      '<div class="empty-page"><p class="eyebrow">Checkout</p><h1>Your bag is empty.</h1>' +
      '<a href="shop.html" class="button button-primary">Shop the collection</a></div>';
  }

  function signedOut() {
    root.innerHTML =
      '<div class="empty-page"><p class="eyebrow">Checkout</p><h1>Sign in to continue.</h1>' +
      "<p>Use your email address and password to sign in or create an account. Your bag will be waiting.</p>" +
      '<div class="empty-actions"><a href="login.html?next=checkout.html" class="button button-primary">Sign in ' +
      X.icon("arrow", 16) + '</a><a href="cart.html" class="button button-outline">Back to bag</a></div></div>';
  }

  function render() {
    if (!root) return;
    if (!X.state.user) return signedOut();
    var lines = X.cart.lines();
    if (!lines.length) return emptyBag();

    var profile = X.state.profile || {};
    var email = profile.email || (X.state.user && X.state.user.email) || "";
    var phone = (profile.phoneNumber || "").replace(/^\+91/, "");
    var subtotal = X.cart.subtotal();
    var shipping = X.cart.shipping();
    var total = X.cart.total();
    var hasOnDemand = lines.some(function (line) { return line.sourcing === "on_demand"; });

    root.innerHTML =
      '<div class="page-head"><p class="eyebrow">Checkout</p><h1>Almost yours.</h1>' +
      "<p>Signed in as " + X.escapeHtml(email) +
      ". Cash on delivery.</p></div>" +
      '<form class="checkout-layout" id="checkout-form" novalidate><div class="checkout-form">' +
      '<section class="form-section"><h2>Delivery details</h2><div class="form-grid">' +
      '<label class="field full-span"><span>Full name</span><input id="co-name" autocomplete="name" value="' +
      X.escapeAttr(profile.fullName || "") + '"></label>' +
      '<label class="field"><span>Phone</span><input id="co-phone" type="tel" inputmode="numeric" maxlength="10" autocomplete="tel-national" value="' +
      X.escapeAttr(phone) + '"></label>' +
      '<label class="field"><span>PIN code</span><input id="co-pincode" inputmode="numeric" maxlength="6" autocomplete="postal-code"></label>' +
      '<label class="field full-span"><span>Address line 1</span><input id="co-line1" autocomplete="address-line1"></label>' +
      '<label class="field full-span"><span>Address line 2 <em>optional</em></span><input id="co-line2" autocomplete="address-line2"></label>' +
      '<label class="field"><span>City</span><input id="co-city" autocomplete="address-level2"></label>' +
      '<label class="field"><span>State</span><input id="co-state" autocomplete="address-level1"></label>' +
      '<label class="field full-span"><span>Order note <em>optional</em></span><textarea id="co-notes" rows="3" placeholder="Delivery instructions, gift note…"></textarea></label>' +
      "</div></section>" +
      '<section class="form-section"><h2>Payment</h2><div class="payment-option active"><div>' +
      "<strong>Cash on delivery</strong><p>Pay the courier when your order arrives. No online payment is collected on this site.</p>" +
      '</div><span class="radio-dot"></span></div><div class="payment-option disabled"><div>' +
      "<strong>Online payment</strong><p>UPI, cards and net banking can be enabled after Cloud Functions and Razorpay are configured.</p>" +
      '</div><span class="soon">Coming soon</span></div></section>' +
      '<p class="form-error checkout-error" id="checkout-error" hidden></p>' +
      '<button type="submit" class="button button-primary full checkout-submit" id="place-order">Place COD order · ' +
      money(total) + " " + X.icon("lock", 16) + "</button>" +
      '<p class="checkout-legal">By placing this order you agree to our <a href="terms.html">Terms</a> and ' +
      '<a href="returns-policy.html">Returns Policy</a>.</p></div>' +

      '<aside class="order-summary checkout-summary"><h2>Your order</h2><div class="checkout-lines">' +
      lines.map(function (line) {
        return (
          '<div class="checkout-line"><img src="' + X.escapeAttr(X.media(line.image)) + '" alt="' +
          X.escapeAttr(line.name) + '"><div><p>' + X.escapeHtml(line.name) + "</p><span>" +
          X.escapeHtml(line.colorName) + " · " + X.escapeHtml(line.size) + " · Qty " + line.qty +
          "</span></div><strong>" + money(line.pricePaise * line.qty) + "</strong></div>"
        );
      }).join("") +
      "</div><dl><div><dt>Subtotal</dt><dd>" + money(subtotal) + "</dd></div>" +
      "<div><dt>Shipping</dt><dd>" + (shipping ? money(shipping) : "Complimentary") + "</dd></div>" +
      '<div class="summary-total"><dt>Total</dt><dd>' + money(total) + "</dd></div></dl>" +
      '<p class="summary-note">Prices include GST. ' +
      (hasOnDemand
        ? "Made-to-order pieces are sourced for you after checkout and dispatch in 3–5 working days."
        : "Stock is reserved when the order is placed.") +
      "</p></aside></form>";

    wire();
  }

  function setError(message) {
    var node = document.getElementById("checkout-error");
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
    if (message) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function wire() {
    var form = document.getElementById("checkout-form");
    if (!form) return;

    ["co-phone", "co-pincode"].forEach(function (id) {
      var input = document.getElementById(id);
      if (!input) return;
      input.addEventListener("input", function () {
        var max = id === "co-phone" ? 10 : 6;
        input.value = input.value.replace(/\D/g, "").slice(0, max);
      });
    });

    form.addEventListener("submit", async function (event) {
      event.preventDefault();
      if (busy) return;
      setError("");

      var address = {
        fullName: document.getElementById("co-name").value.trim(),
        phone: document.getElementById("co-phone").value.replace(/\D/g, "").slice(0, 10),
        line1: document.getElementById("co-line1").value.trim(),
        line2: document.getElementById("co-line2").value.trim(),
        city: document.getElementById("co-city").value.trim(),
        state: document.getElementById("co-state").value.trim(),
        pincode: document.getElementById("co-pincode").value.replace(/\D/g, "").slice(0, 6),
        country: "India",
      };
      var notes = document.getElementById("co-notes").value.trim();

      if (address.fullName.length < 2) return setError("Enter your full name.");
      if (!X.isValidIndianPhone(address.phone)) return setError("Enter a valid delivery phone number.");
      if (address.line1.length < 4) return setError("Enter your street address.");
      if (!address.city) return setError("Enter your city.");
      if (!address.state) return setError("Enter your state.");
      if (!/^\d{6}$/.test(address.pincode)) return setError("Enter a valid 6-digit PIN code.");
      if (!X.firebaseReady || !X.db) return setError("Firebase is not available. Check the browser console.");

      var lines = X.cart.lines();
      if (!lines.length) return emptyBag();

      var button = document.getElementById("place-order");
      busy = true;
      button.disabled = true;
      button.textContent = "Placing order…";

      try {
        var result = await X.db.runTransaction(async function (transaction) {
          var groups = {};
          lines.forEach(function (line) {
            if (!groups[line.productId]) groups[line.productId] = [];
            groups[line.productId].push(line);
          });

          var snapshots = [];
          var productIds = Object.keys(groups);
          for (var i = 0; i < productIds.length; i += 1) {
            var productId = productIds[i];
            var ref = X.db.collection("products").doc(productId);
            var snapshot = await transaction.get(ref);
            if (!snapshot.exists) {
              throw new Error("A piece in your bag is no longer available. Please remove it and try again.");
            }
            var data = X.docData(snapshot);
            if (data.status !== "published") throw new Error(data.name + " is no longer available.");
            var onDemand = X.isOnDemand(data);
            var variants = (data.variants || []).map(function (variant) { return Object.assign({}, variant); });
            groups[productId].forEach(function (line) {
              var index = variants.findIndex(function (variant) { return variant.sku === line.sku; });
              if (index < 0) throw new Error(data.name + " in " + line.size + " is no longer available.");
              if (!onDemand) {
                if (Number(variants[index].stock) < line.qty) {
                  throw new Error("Only " + variants[index].stock + " left of " + data.name + " in " + line.size + ".");
                }
                variants[index] = Object.assign({}, variants[index], {
                  stock: Number(variants[index].stock) - line.qty,
                });
              }
            });
            snapshots.push({
              ref: ref,
              data: data,
              variants: variants,
              lines: groups[productId],
              onDemand: onDemand,
            });
          }

          var orderItems = [];
          snapshots.forEach(function (entry) {
            entry.lines.forEach(function (line) {
              orderItems.push({
                productId: entry.data.id,
                name: entry.data.name,
                slug: entry.data.slug,
                image: X.media(entry.data.images && entry.data.images[0] ? entry.data.images[0].url : line.image),
                sku: line.sku,
                size: line.size,
                colorName: line.colorName,
                qty: line.qty,
                pricePaise: entry.data.pricePaise,
                sourcing: entry.onDemand ? "on_demand" : "stock",
                dispatchNote: entry.onDemand
                  ? entry.data.dispatchNote || "Sourced for you after checkout. Dispatched in 3–5 working days."
                  : "",
              });
            });
          });

          var orderSubtotal = orderItems.reduce(function (sum, item) {
            return sum + item.pricePaise * item.qty;
          }, 0);
          var orderShipping = X.shippingFor(orderSubtotal);
          var orderTotal = orderSubtotal + orderShipping;
          var orderRef = X.db.collection("orders").doc();
          var orderNumber = "XEV-" + Date.now().toString(36).toUpperCase() + "-" +
            Math.random().toString(36).slice(2, 4).toUpperCase();

          snapshots.forEach(function (entry) {
            if (entry.onDemand) return;
            transaction.update(entry.ref, {
              variants: entry.variants,
              updatedAt: X.serverTimestamp(),
            });
          });

          var onDemandItems = orderItems.filter(function (item) { return item.sourcing === "on_demand"; });
          transaction.set(orderRef, {
            orderNumber: orderNumber,
            userId: X.state.user.uid,
            phone: address.phone,
            items: orderItems,
            subtotalPaise: orderSubtotal,
            shippingPaise: orderShipping,
            totalPaise: orderTotal,
            address: address,
            paymentMethod: "cod",
            paymentStatus: "cod_due",
            status: "confirmed",
            hasOnDemand: onDemandItems.length > 0,
            dispatchNote: onDemandItems.length
              ? onDemandItems[0].dispatchNote
              : "",
            notes: notes,
            createdAt: X.serverTimestamp(),
            updatedAt: X.serverTimestamp(),
          });

          if (X.state.profile) {
            transaction.set(
              X.db.collection("users").doc(X.state.user.uid),
              {
                fullName: address.fullName,
                phoneNumber: "+91" + address.phone,
                lastAddress: address,
                updatedAt: X.serverTimestamp(),
              },
              { merge: true },
            );
          }

          return { orderId: orderRef.id, orderNumber: orderNumber };
        });

        X.cart.clear();
        window.location.href = "order.html?id=" + encodeURIComponent(result.orderId) + "&placed=1";
      } catch (caught) {
        console.error(caught);
        var message = caught && caught.message ? caught.message : "Could not place the order.";
        if (message.indexOf("permission") !== -1 || (caught && caught.code === "permission-denied")) {
          message = "Checkout is not permitted by the Firestore rules. Ask the admin to deploy the included rules.";
        }
        setError(message);
        busy = false;
        button.disabled = false;
        button.innerHTML = "Place COD order · " + money(X.cart.total()) + " " + X.icon("lock", 16);
      }
    });
  }

  function boot() {
    if (!root) return;
    Promise.all([X.authReady, X.catalogueReady]).then(function () {
      X.cart.refreshFromCatalogue();
      render();
    });
    document.addEventListener("xevora:auth", function () {
      if (!busy) render();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
