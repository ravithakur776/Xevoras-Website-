/* Product detail page — gallery, colour/size selection, quantity and add to bag. */
(function (X) {
  "use strict";

  var root = document.getElementById("product-root");
  var slug = X.query("slug");
  var product = null;
  var activeImage = 0;
  var color = "";
  var size = "";
  var qty = 1;

  function notFound() {
    root.innerHTML =
      '<div class="empty-page"><p class="eyebrow">404</p><h1>This piece has moved on.</h1>' +
      "<p>The piece you’re looking for is not here.</p>" +
      '<div class="empty-actions"><a href="index.html" class="button button-primary">Back home</a>' +
      '<a href="shop.html" class="button button-outline">Shop the collection</a></div></div>';
    document.title = "Piece not found — Xevoras";
  }

  function render() {
    if (!product) return notFound();

    var colors = [];
    var seen = {};
    product.variants.forEach(function (variant) {
      if (!seen[variant.colorName]) {
        seen[variant.colorName] = true;
        colors.push(variant);
      }
    });

    var selectedColor = color || (colors[0] ? colors[0].colorName : "");
    var colorVariants = product.variants.filter(function (variant) {
      return variant.colorName === selectedColor;
    });
    var firstAvailable = colorVariants.find(function (variant) {
      return Number(variant.stock) > 0;
    });
    var selectedSize = size || (firstAvailable ? firstAvailable.size : "");
    var selectedVariant = colorVariants.find(function (variant) {
      return variant.size === selectedSize;
    });
    var discount = X.discountPercent(product.pricePaise, product.compareAtPricePaise);
    var totalStock = X.productStock(product);
    var onDemand = X.isOnDemand(product);
    var dispatchNote = product.dispatchNote ||
      "Sourced for you after checkout. Dispatched in 3–5 working days.";
    var related = X.state.products
      .filter(function (item) {
        return item.id !== product.id && item.category === product.category;
      })
      .slice(0, 4);

    var gallery =
      '<div class="product-gallery"><div class="product-gallery-main">' +
      '<img src="' + X.escapeAttr(product.images[activeImage] ? product.images[activeImage].url : "") +
      '" alt="' + X.escapeAttr(product.images[activeImage] ? product.images[activeImage].alt : product.name) + '">' +
      '<div class="product-badges">' +
      (discount ? '<span class="badge badge-sale">' + discount + "% off</span>" : "") +
      (onDemand ? '<span class="badge badge-made">Made to order</span>' : "") +
      "</div></div>" +
      (product.images.length > 1
        ? '<div class="product-thumbs">' +
          product.images.map(function (image, index) {
            return (
              '<button type="button" data-image-index="' + index + '" class="' +
              (index === activeImage ? "active" : "") +
              '" aria-label="View image ' + (index + 1) + '"><img src="' + X.escapeAttr(image.url) + '" alt=""></button>'
            );
          }).join("") +
          "</div>"
        : "") +
      "</div>";

    var detail =
      '<div class="product-detail"><div class="product-detail-head">' +
      '<p class="eyebrow">' + X.escapeHtml(product.categoryName) + "</p>" +
      "<h1>" + X.escapeHtml(product.name) + "</h1>" +
      '<div class="product-detail-price"><strong>' + X.formatINR(product.pricePaise) + "</strong>" +
      (product.compareAtPricePaise ? "<s>" + X.formatINR(product.compareAtPricePaise) + "</s>" : "") +
      "<span>Inclusive of all taxes</span></div>" +
      '<p class="product-short">' + X.escapeHtml(product.shortDescription) + "</p>" +
      (onDemand
        ? '<p class="sourcing-note">' + X.icon("truck", 17) + "<span><strong>Made to order.</strong> " +
          X.escapeHtml(dispatchNote) + "</span></p>"
        : "") +
      "</div>" +

      '<div class="option-block"><div class="option-head"><span>Colour</span><strong>' +
      X.escapeHtml(selectedColor) + "</strong></div><div class=\"colour-options\">" +
      colors.map(function (variant) {
        return (
          '<button type="button" data-color="' + X.escapeAttr(variant.colorName) + '" class="' +
          (selectedColor === variant.colorName ? "active" : "") +
          '" aria-label="' + X.escapeAttr(variant.colorName) + '" title="' + X.escapeAttr(variant.colorName) +
          '"><span style="background-color:' + X.escapeAttr(variant.colorHex) + '"></span></button>'
        );
      }).join("") +
      "</div></div>" +

      '<div class="option-block"><div class="option-head"><span>Size</span>' +
      '<a href="size-guide.html" class="text-link small">Size guide</a></div><div class="size-options">' +
      colorVariants.map(function (variant) {
        return (
          '<button type="button" data-size="' + X.escapeAttr(variant.size) + '" class="' +
          (selectedSize === variant.size ? "active" : "") +
          '"' + (Number(variant.stock) <= 0 ? " disabled" : "") + ">" +
          X.escapeHtml(variant.size) +
          (Number(variant.stock) <= 0 ? "<small>Sold out</small>" : "") +
          "</button>"
        );
      }).join("") +
      "</div>" +
      (!onDemand && selectedVariant && selectedVariant.stock > 0 && selectedVariant.stock <= 3
        ? '<p class="stock-warning">Only ' + selectedVariant.stock + " left in this size.</p>"
        : "") +
      "</div>" +

      '<div class="buy-row"><div class="quantity">' +
      '<button type="button" id="qty-minus" aria-label="Decrease quantity">' + X.icon("minus", 15) + "</button>" +
      "<span>" + qty + "</span>" +
      '<button type="button" id="qty-plus" aria-label="Increase quantity">' + X.icon("plus", 15) + "</button></div>" +
      '<button type="button" class="button button-primary buy-button" id="add-to-bag"' +
      (!selectedVariant || totalStock === 0 ? " disabled" : "") + ">" +
      (totalStock === 0 ? "Sold out" : "Add to bag") + "</button>" +
      '<button type="button" class="button button-icon' + (X.wishlist.has(product.id) ? " saved" : "") +
      '" data-wishlist-toggle="' + X.escapeAttr(product.id) + '" data-name="' + X.escapeAttr(product.name) +
      '" aria-label="' + (X.wishlist.has(product.id) ? "Remove from wishlist" : "Save to wishlist") + '">' +
      X.heartIcon(X.wishlist.has(product.id), 18) + "</button></div>" +

      '<div class="product-assurances">' +
      "<p>" + X.icon("truck", 16) + " Free delivery on every order</p>" +
      "<p>" + X.icon("rotate", 16) + " 7-day returns on unworn pieces</p>" +
      "<p>" + X.icon("shield", 16) + " Secure checkout</p></div>" +

      '<div class="product-accordions"><details open><summary>Description</summary><p>' +
      X.escapeHtml(product.description) + "</p></details>" +
      "<details><summary>Fabric &amp; fit</summary><dl>" +
      "<div><dt>Material</dt><dd>" + X.escapeHtml(product.material) + "</dd></div>" +
      "<div><dt>Fit</dt><dd>" + X.escapeHtml(product.fit) + "</dd></div>" +
      "<div><dt>Pattern</dt><dd>" + X.escapeHtml(product.pattern) + "</dd></div>" +
      "</dl></details>" +
      "<details><summary>Care</summary><p>" + X.escapeHtml(product.care) + "</p></details>" +
      "<details><summary>Shipping &amp; returns</summary><p>" +
      (onDemand
        ? X.escapeHtml(dispatchNote) + " Delivery usually takes another 2–5 working days after dispatch."
        : "Dispatched within 2–4 working days. Delivery usually takes another 2–5 working days.") +
      " Returns are accepted within 7 days of delivery on unworn pieces with tags intact. Read our " +
      "<a href=\"shipping-policy.html\">shipping</a> and <a href=\"returns-policy.html\">returns</a> policies.</p></details>" +
      "</div></div>";

    root.innerHTML =
      '<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="index.html">Home</a><span>/</span>' +
      '<a href="' + (product.gender === "women" ? "women.html" : "men.html") + '">' +
      (product.gender === "women" ? "Women" : "Men") + "</a><span>/</span><span>" +
      X.escapeHtml(product.name) + "</span></nav>" +
      '<div class="product-layout">' + gallery + detail + "</div>" +
      (related.length
        ? '<section class="section related"><div class="section-heading"><div><p class="eyebrow">Wear it with</p>' +
          "<h2>More from " + X.escapeHtml(product.categoryName.toLowerCase()) + ".</h2></div></div>" +
          '<div class="product-grid product-grid-four" id="related-grid"></div></section>'
        : "");

    if (related.length) X.renderProductGrid("related-grid", related);
    X.syncWishlistButtons();
    document.title = product.name + " — Xevoras";
  }

  function boot() {
    if (!root) return;
    X.catalogueReady.then(function () {
      product = X.findProduct(slug);
      render();
    });

    root.addEventListener("click", function (event) {
      var target = event.target;
      var imageButton = target.closest("[data-image-index]");
      if (imageButton) {
        activeImage = Number(imageButton.getAttribute("data-image-index"));
        render();
        return;
      }

      var colorButton = target.closest("[data-color]");
      if (colorButton) {
        color = colorButton.getAttribute("data-color");
        var first = product.variants.find(function (variant) {
          return variant.colorName === color && Number(variant.stock) > 0;
        });
        size = first ? first.size : "";
        qty = 1;
        render();
        return;
      }

      var sizeButton = target.closest("[data-size]");
      if (sizeButton) {
        size = sizeButton.getAttribute("data-size");
        qty = 1;
        render();
        return;
      }

      if (target.closest("#qty-minus")) {
        qty = Math.max(1, qty - 1);
        render();
        return;
      }

      if (target.closest("#qty-plus")) {
        var selectedColor = color || product.variants[0].colorName;
        var selectedSize = size;
        var variant = product.variants.find(function (item) {
          return item.colorName === selectedColor && item.size === selectedSize;
        });
        qty = Math.min(Math.max(1, Number(variant ? variant.stock : 1)), qty + 1);
        render();
        return;
      }

      if (target.closest("#add-to-bag")) {
        var activeColor = color || product.variants[0].colorName;
        var activeVariant = product.variants.find(function (item) {
          return item.colorName === activeColor && item.size === size;
        }) || product.variants.find(function (item) {
          return item.colorName === activeColor && Number(item.stock) > 0;
        });
        if (activeVariant) X.cart.add(product, activeVariant, qty);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
