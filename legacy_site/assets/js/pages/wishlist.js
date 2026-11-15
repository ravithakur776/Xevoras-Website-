/* Wishlist page — saved products stored in this browser. */
(function (X) {
  "use strict";

  var root = document.getElementById("wishlist-root");

  function render() {
    if (!root) return;
    var ids = X.wishlist.ids();
    var products = X.state.products.filter(function (product) {
      return ids.indexOf(product.id) !== -1;
    });

    root.innerHTML =
      '<div class="page-head"><p class="eyebrow">Saved pieces</p><h1>Your wishlist.</h1>' +
      "<p>Keep the pieces you love here, and come back when the time is right.</p></div>" +
      (products.length
        ? '<div class="product-grid product-grid-four" id="wishlist-grid"></div>'
        : '<div class="empty-state">' + X.icon("heart", 26) +
          "<h2>Nothing saved yet.</h2><p>Tap the heart on a piece to keep it here.</p>" +
          '<a href="shop.html" class="button button-primary">Shop the collection</a></div>');

    if (products.length) X.renderProductGrid("wishlist-grid", products);
  }

  function boot() {
    if (!root) return;
    X.catalogueReady.then(render);
    document.addEventListener("xevora:wishlistchange", render);
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
