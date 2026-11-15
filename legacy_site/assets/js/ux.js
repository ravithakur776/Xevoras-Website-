/* Xevoras UX layer — mobile bottom bar, loading skeletons, back-to-top. */
(function () {
  "use strict";
  var page = document.body.getAttribute("data-page") || "";

  function icon(path) {
    return '<svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + path + "</svg>";
  }

  var items = [
    { key: "home", href: "index.html", label: "Home", svg: '<path d="m3 11 9-8 9 8"/><path d="M5 10v10h14V10"/>' },
    { key: "shop", href: "shop.html", label: "Shop", svg: '<rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/>' },
    { key: "search", href: "search.html", label: "Search", svg: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>' },
    { key: "wishlist", href: "wishlist.html", label: "Wishlist", svg: '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>', count: "wishlist-count" },
    { key: "cart", href: "cart.html", label: "Bag", svg: '<path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/>', count: "cart-count" }
  ];

  function buildBottomNav() {
    if (document.querySelector(".bottom-nav")) return;
    var nav = document.createElement("nav");
    nav.className = "bottom-nav";
    nav.setAttribute("aria-label", "Quick navigation");
    nav.innerHTML = items.map(function (item) {
      var active = item.key === page || (item.key === "home" && page === "home");
      return '<a href="' + item.href + '" class="' + (active ? "active" : "") + '"' + (active ? ' aria-current="page"' : "") + ">" +
        '<span class="bn-icon">' + icon(item.svg) + (item.count ? '<em data-mirror="' + item.count + '" hidden>0</em>' : "") + "</span>" +
        "<span>" + item.label + "</span></a>";
    }).join("");
    document.body.appendChild(nav);
    document.body.classList.add("has-bottom-nav");

    function sync() {
      nav.querySelectorAll("[data-mirror]").forEach(function (badge) {
        var source = document.getElementById(badge.getAttribute("data-mirror"));
        if (!source) return;
        badge.textContent = source.textContent;
        badge.hidden = source.hidden || !Number(source.textContent);
      });
    }
    ["cart-count", "wishlist-count"].forEach(function (id) {
      var source = document.getElementById(id);
      if (source) new MutationObserver(sync).observe(source, { childList: true, characterData: true, subtree: true, attributes: true });
    });
    sync();
  }

  function skeletons() {
    var card = '<div class="skeleton-card"><div class="sk-img"></div><div class="sk-line"></div><div class="sk-line short"></div></div>';
    document.querySelectorAll(".product-grid").forEach(function (grid) {
      if (!grid.children.length && !grid.textContent.trim()) {
        var n = grid.id === "deals-grid" ? 4 : 8;
        grid.innerHTML = new Array(n + 1).join(card);
      }
    });
  }

  function backToTop() {
    var button = document.createElement("button");
    button.type = "button";
    button.className = "back-to-top";
    button.setAttribute("aria-label", "Back to top");
    button.innerHTML = icon('<path d="m18 15-6-6-6 6"/>');
    button.hidden = true;
    button.addEventListener("click", function () { window.scrollTo({ top: 0, behavior: "smooth" }); });
    document.body.appendChild(button);
    window.addEventListener("scroll", function () { button.hidden = window.scrollY < 700; }, { passive: true });
  }

  function boot() {
    buildBottomNav();
    skeletons();
    backToTop();
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})();
