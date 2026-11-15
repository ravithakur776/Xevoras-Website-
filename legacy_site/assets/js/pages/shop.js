/* Shop, women and men pages — filters, sorting and URL state. */
(function (X) {
  "use strict";

  var fixedGender = document.body.getAttribute("data-fixed-gender") || "";
  var params = new URLSearchParams(window.location.search);
  var filters = document.getElementById("shop-filters");
  var grid = document.getElementById("shop-grid");
  var empty = document.getElementById("shop-empty");
  var count = document.getElementById("shop-count");
  var sortSelect = document.getElementById("sort-select");

  function selectedCategories() {
    return (params.get("category") || "").split(",").filter(Boolean);
  }

  function setParam(key, value) {
    if (value) params.set(key, value);
    else params.delete(key);
    var query = params.toString();
    window.history.pushState(null, "", query ? "?" + query : window.location.pathname);
    render();
  }

  function toggleCategory(slug) {
    var selected = selectedCategories();
    var index = selected.indexOf(slug);
    if (index >= 0) selected.splice(index, 1);
    else selected.push(slug);
    setParam("category", selected.join(","));
  }

  function sortProducts(products, sort) {
    var copy = products.slice();
    if (sort === "price-low") return copy.sort(function (a, b) { return a.pricePaise - b.pricePaise; });
    if (sort === "price-high") return copy.sort(function (a, b) { return b.pricePaise - a.pricePaise; });
    if (sort === "newest") return copy.reverse();
    return copy.sort(function (a, b) { return Number(b.featured) - Number(a.featured); });
  }

  function renderFilters(gender, categories, selected, featured) {
    var html = "";
    if (!fixedGender) {
      html +=
        '<div class="filter-group"><h2>Shop</h2>' +
        '<button type="button" data-gender="" class="' + (!gender ? "active" : "") + '">All</button>' +
        '<button type="button" data-gender="women" class="' + (gender === "women" ? "active" : "") + '">Women</button>' +
        '<button type="button" data-gender="men" class="' + (gender === "men" ? "active" : "") + '">Men</button>' +
        "</div>";
    }

    var counts = {};
    X.state.categories.forEach(function (category) {
      counts[category.name] = (counts[category.name] || 0) + 1;
    });

    html += '<div class="filter-group"><h2>Category</h2>';
    categories.forEach(function (category) {
      var label = X.escapeHtml(category.name);
      if ((counts[category.name] || 0) > 1) {
        label += " · " + (category.gender === "women" ? "Women" : category.gender === "men" ? "Men" : "Unisex");
      }
      html +=
        '<button type="button" data-category="' +
        X.escapeAttr(category.slug) +
        '" class="' +
        (selected.indexOf(category.slug) >= 0 ? "active" : "") +
        '">' +
        label +
        "</button>";
    });
    html += "</div>";

    html +=
      '<div class="filter-group"><h2>Edit</h2><button type="button" data-featured="1" class="' +
      (featured ? "active" : "") +
      '">Featured pieces</button></div>';

    if (selected.length || featured || gender) {
      html += '<button type="button" class="clear-filters" id="clear-filters">Clear filters</button>';
    }

    filters.innerHTML = html;
  }

  function render() {
    var gender = fixedGender || params.get("gender") || "";
    var featured = params.get("featured") === "1";
    var sort = params.get("sort") || "featured";
    var selected = selectedCategories();

    var categories = X.state.categories.filter(function (category) {
      return !gender || category.gender === gender;
    });

    var products = X.state.products.filter(function (product) {
      if (gender && product.gender !== gender) return false;
      if (featured && !product.featured) return false;
      if (selected.length && selected.indexOf(product.category) === -1) return false;
      return true;
    });

    products = sortProducts(products, sort);

    renderFilters(gender, categories, selected, featured);
    if (sortSelect) sortSelect.value = sort;
    if (count) count.textContent = products.length + (products.length === 1 ? " piece" : " pieces");

    if (products.length) {
      grid.hidden = false;
      empty.hidden = true;
      X.renderProductGrid(grid, products);
    } else {
      grid.hidden = true;
      empty.hidden = false;
      empty.innerHTML =
        '<div class="empty-state"><h2>Nothing here yet.</h2><p>Try removing a filter, or explore the full collection.</p></div>';
    }
  }

  function boot() {
    if (!filters || !grid) return;
    X.catalogueReady.then(render);

    filters.addEventListener("click", function (event) {
      var button = event.target.closest("button");
      if (!button) return;
      if (button.hasAttribute("data-gender")) setParam("gender", button.getAttribute("data-gender"));
      else if (button.hasAttribute("data-category")) toggleCategory(button.getAttribute("data-category"));
      else if (button.hasAttribute("data-featured")) setParam("featured", params.get("featured") === "1" ? "" : "1");
      else if (button.id === "clear-filters") {
        var sort = params.get("sort");
        params = new URLSearchParams();
        if (sort && sort !== "featured") params.set("sort", sort);
        var query = params.toString();
        window.history.pushState(null, "", query ? "?" + query : window.location.pathname);
        render();
      }
    });

    if (sortSelect) {
      sortSelect.addEventListener("change", function () {
        setParam("sort", sortSelect.value === "featured" ? "" : sortSelect.value);
      });
    }

    window.addEventListener("popstate", function () {
      params = new URLSearchParams(window.location.search);
      render();
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
