/* Cart page — local bag, quantity changes and checkout hand-off. */
(function (X) {
  "use strict";

  var root = document.getElementById("cart-root");

  function render() {
    if (!root) return;
    var lines = X.cart.lines();

    if (!lines.length) {
      root.innerHTML =
        '<div class="empty-page"><div class="empty-icon">' + X.icon("package", 28) + "</div>" +
        '<p class="eyebrow">Your bag</p><h1>Your bag is empty.</h1>' +
        "<p>Start with the pieces you’ll reach for most.</p>" +
        '<div class="empty-actions"><a href="women.html" class="button button-primary">Shop women</a>' +
        '<a href="men.html" class="button button-outline">Shop men</a></div></div>';
      return;
    }

    var subtotal = X.cart.subtotal();
    var shipping = X.cart.shipping();
    var total = X.cart.total();
    var count = X.cart.count();
    var remaining = X.freeShippingThresholdPaise - subtotal;

    root.innerHTML =
      '<div class="page-head"><p class="eyebrow">Your bag</p><h1>' + count + " " +
      (count === 1 ? "piece" : "pieces") + ".</h1></div>" +
      '<div class="cart-layout"><div class="cart-lines">' +
      lines.map(function (line) {
        return (
          '<article class="cart-line"><a href="product.html?slug=' + encodeURIComponent(line.slug) +
          '" class="cart-line-image"><img src="' + X.escapeAttr(X.media(line.image)) + '" alt="' +
          X.escapeAttr(line.name) + '"></a><div class="cart-line-copy"><div class="cart-line-head"><div>' +
          '<h2><a href="product.html?slug=' + encodeURIComponent(line.slug) + '">' + X.escapeHtml(line.name) +
          "</a></h2><p>" + X.escapeHtml(line.colorName) + " · " + X.escapeHtml(line.size) + "</p></div>" +
          "<strong>" + X.formatINR(line.pricePaise * line.qty) + "</strong></div>" +
          '<div class="cart-line-actions"><div class="quantity">' +
          '<button type="button" data-qty-minus="' + X.escapeAttr(line.sku) + '" aria-label="Decrease quantity">' +
          X.icon("minus", 14) + "</button><span>" + line.qty + "</span>" +
          '<button type="button" data-qty-plus="' + X.escapeAttr(line.sku) + '" aria-label="Increase quantity">' +
          X.icon("plus", 14) + "</button></div>" +
          '<button type="button" class="remove-link" data-remove="' + X.escapeAttr(line.sku) + '">' +
          X.icon("trash", 14) + " Remove</button></div></div></article>"
        );
      }).join("") +
      '</div><aside class="order-summary"><h2>Order summary</h2><dl>' +
      "<div><dt>Subtotal</dt><dd>" + X.formatINR(subtotal) + "</dd></div>" +
      "<div><dt>Shipping</dt><dd>" + (shipping ? X.formatINR(shipping) : "Complimentary") + "</dd></div>" +
      '<div class="summary-total"><dt>Total</dt><dd>' + X.formatINR(total) + "</dd></div></dl>" +
      (remaining > 0
        ? '<p class="shipping-progress">Add ' + X.formatINR(remaining) + " more for complimentary shipping.</p>"
        : '<p class="shipping-progress success">You’ve unlocked complimentary shipping.</p>') +
      '<button type="button" class="button button-primary full" id="cart-checkout">' +
      "Proceed to checkout " + X.icon("arrow", 16) + "</button>" +
      '<p class="summary-note">Taxes included. Cash on delivery available. Secure checkout.</p>' +
      '<a href="shop.html" class="text-link centered">Continue shopping</a></aside></div>';
  }

  function boot() {
    if (!root) return;
    render();

    root.addEventListener("click", function (event) {
      var minus = event.target.closest("[data-qty-minus]");
      if (minus) {
        var sku = minus.getAttribute("data-qty-minus");
        var line = X.cart.lines().find(function (item) { return item.sku === sku; });
        if (line) X.cart.setQty(sku, line.qty - 1);
        return;
      }
      var plus = event.target.closest("[data-qty-plus]");
      if (plus) {
        var sku2 = plus.getAttribute("data-qty-plus");
        var line2 = X.cart.lines().find(function (item) { return item.sku === sku2; });
        if (line2) X.cart.setQty(sku2, line2.qty + 1);
        return;
      }
      var remove = event.target.closest("[data-remove]");
      if (remove) {
        X.cart.remove(remove.getAttribute("data-remove"));
        return;
      }
      if (event.target.closest("#cart-checkout")) {
        X.authReady.then(function () {
          window.location.href = X.state.user ? "checkout.html" : "login.html?next=checkout.html";
        });
      }
    });

    document.addEventListener("xevora:cartchange", render);
    X.catalogueReady.then(function () {
      X.cart.refreshFromCatalogue();
      render();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
