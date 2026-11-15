/* Customer account — profile and order history. */
(function (X) {
  "use strict";

  var root = document.getElementById("account-root");
  var orders = [];
  var loadingOrders = true;
  var orderView = "all";

  function isUpcoming(order) {
    return ["confirmed", "packed", "shipped"].indexOf(order.status) !== -1;
  }

  function ordersForView(view) {
    if (view === "upcoming") return orders.filter(isUpcoming);
    if (view === "past") return orders.filter(function (order) { return !isUpcoming(order); });
    return orders;
  }

  function signedOut() {
    root.innerHTML =
      '<div class="empty-page"><div class="empty-icon">' + X.icon("user", 28) + "</div>" +
      '<p class="eyebrow">Your account</p><h1>Sign in to see your orders.</h1>' +
      "<p>Use your email address and password to sign in or create an account.</p>" +
      '<a href="login.html?next=account.html" class="button button-primary">Sign in ' +
      X.icon("arrow", 16) + "</a></div>";
  }

  function orderCard(order) {
    var pieces = order.items.reduce(function (sum, item) { return sum + item.qty; }, 0);
    return (
      '<a href="order.html?id=' + encodeURIComponent(order.id) + '" class="order-card">' +
      '<div class="order-card-head"><div><strong>' + X.escapeHtml(order.orderNumber) + "</strong><span>" +
      X.formatDate(order.createdAt) + "</span></div>" +
      '<span class="status-pill status-' + X.escapeAttr(order.status) + '">' + X.escapeHtml(order.status) + "</span></div>" +
      '<div class="order-card-body"><div class="order-thumbs">' +
      order.items.slice(0, 3).map(function (item) {
        return '<img src="' + X.escapeAttr(X.media(item.image)) + '" alt="' + X.escapeAttr(item.name) + '">';
      }).join("") +
      "</div><div><p>" + pieces + " pieces</p><strong>" + X.formatINR(order.totalPaise) + "</strong></div>" +
      X.icon("arrow", 17) + "</div></a>"
    );
  }

  function render() {
    if (!root) return;
    if (!X.state.user) return signedOut();

    var profile = X.state.profile || {};
    var name = profile.fullName || "";
    var email = profile.email || (X.state.user && X.state.user.email) || "";
    var firstName = name ? name.split(" ")[0] : "";
    var upcomingCount = orders.filter(isUpcoming).length;
    var pastCount = orders.length - upcomingCount;
    var visibleOrders = ordersForView(orderView);

    root.innerHTML =
      '<div class="account-head"><div><p class="eyebrow">Your account</p><h1>Hello' +
      (firstName ? ", " + X.escapeHtml(firstName) : "") + ".</h1><p>" + X.escapeHtml(email) + "</p></div>" +
      '<div class="account-actions">' +
      (X.isAdmin() ? '<a href="/admin/" class="button button-outline">' + X.icon("shield", 16) + " Admin</a>" : "") +
      '<button type="button" class="button button-outline" id="account-logout">' + X.icon("logout", 16) + " Sign out</button>" +
      "</div></div>" +
      '<div class="account-grid"><aside class="account-sidebar">' +
      '<div class="account-card"><h2>Profile</h2><form class="profile-form" id="profile-form">' +
      '<label class="field"><span>Full name</span><input id="profile-name" value="' + X.escapeAttr(name) + '" placeholder="Your name"></label>' +
      '<label class="field"><span>Email</span><input value="' + X.escapeAttr(email) + '" readonly></label>' +
      '<button type="submit" class="button button-primary full" id="profile-save">Save profile</button>' +
      '<button type="button" class="text-link centered" id="password-reset">Send password reset link</button></form></div>' +
      '<div class="account-card muted"><h2>Need help?</h2><p>Questions about an order, fit or return? Our care team can help.</p>' +
      '<a href="contact.html" class="text-link">Contact care ' + X.icon("arrow", 14) + "</a></div></aside>" +
      '<section class="account-orders" id="account-orders"><div class="account-orders-head"><h2>Orders</h2><span>' +
      orders.length + " total</span></div>" +
      (loadingOrders
        ? '<p class="muted-copy">Loading orders…</p>'
        : orders.length
          ? '<div class="order-view-tabs" role="group" aria-label="Filter your orders">' +
            '<button type="button" data-order-view="all" class="' + (orderView === "all" ? "active" : "") +
            '" aria-pressed="' + (orderView === "all") + '">All <span>' + orders.length + "</span></button>" +
            '<button type="button" data-order-view="upcoming" class="' + (orderView === "upcoming" ? "active" : "") +
            '" aria-pressed="' + (orderView === "upcoming") + '">Active / upcoming <span>' + upcomingCount + "</span></button>" +
            '<button type="button" data-order-view="past" class="' + (orderView === "past" ? "active" : "") +
            '" aria-pressed="' + (orderView === "past") + '">Past <span>' + pastCount + "</span></button></div>" +
            (visibleOrders.length
              ? '<div class="order-list">' + visibleOrders.map(orderCard).join("") + "</div>"
              : '<div class="empty-state small"><h2>No orders in this view.</h2><p>Try another order filter.</p></div>')
          : '<div class="empty-state small">' + X.icon("package", 24) +
            "<h2>No orders yet.</h2><p>When you place an order, it will appear here.</p>" +
            '<a href="shop.html" class="button button-primary">Shop the collection</a></div>') +
      "</section></div>";

    wire();
  }

  function wire() {
    root.querySelectorAll("[data-order-view]").forEach(function (button) {
      button.addEventListener("click", function () {
        orderView = button.getAttribute("data-order-view");
        render();
      });
    });

    var logout = document.getElementById("account-logout");
    if (logout) logout.addEventListener("click", function () { X.logout(); });

    var reset = document.getElementById("password-reset");
    if (reset) {
      reset.addEventListener("click", function () {
        var email = (X.state.user && X.state.user.email) ||
          (X.state.profile && X.state.profile.email) || "";
        if (!email) {
          X.toast("No email address is attached to this account.", "error");
          return;
        }
        reset.disabled = true;
        X.auth.sendPasswordResetEmail(email)
          .then(function () {
            X.toast("Password reset link sent. Check your inbox.", "success");
          })
          .catch(function (error) {
            X.toast(X.friendlyFirebaseError(error).message, "error");
          })
          .then(function () {
            reset.disabled = false;
          });
      });
    }

    var form = document.getElementById("profile-form");
    if (form) {
      form.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = document.getElementById("profile-name");
        var button = document.getElementById("profile-save");
        var name = input.value.trim();
        if (name.length < 2) {
          X.toast("Enter your full name.", "error");
          return;
        }
        if (!X.db || !X.state.user) return;
        button.disabled = true;
        button.textContent = "Saving…";
        X.db.collection("users").doc(X.state.user.uid).update({
          fullName: name,
          updatedAt: X.serverTimestamp(),
        }).then(function () {
          return X.refreshProfile();
        }).then(function () {
          X.toast("Profile updated.", "success");
          render();
        }).catch(function (error) {
          console.error(error);
          X.toast("Could not update your profile.", "error");
          button.disabled = false;
          button.textContent = "Save profile";
        });
      });
    }
  }

  function loadOrders() {
    if (!X.db || !X.state.user) {
      loadingOrders = false;
      render();
      return;
    }
    X.db.collection("orders").where("userId", "==", X.state.user.uid).get()
      .then(function (snapshot) {
        orders = X.snapshotRows(snapshot);
        orders.sort(function (a, b) {
          var aTime = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
          var bTime = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
          return bTime - aTime;
        });
      })
      .catch(function (error) {
        console.error(error);
        X.toast("Could not load your orders.", "error");
      })
      .then(function () {
        loadingOrders = false;
        render();
      });
  }

  function boot() {
    if (!root) return;
    X.authReady.then(function () {
      if (!X.state.user) {
        loadingOrders = false;
        render();
        return;
      }
      render();
      if (window.location.hash === "#account-orders") {
        window.setTimeout(function () {
          var ordersSection = document.getElementById("account-orders");
          if (ordersSection) ordersSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 0);
      }
      loadOrders();
    });
    document.addEventListener("xevora:auth", function () {
      if (!X.state.user) {
        loadingOrders = false;
        render();
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
