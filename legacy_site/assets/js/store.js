/* Xevoras storefront — shared state, catalogue, cart, wishlist, header and UI.
   Plain browser JavaScript. No framework, no build step. */
window.XEVORA = window.XEVORA || {};

(function (X) {
  "use strict";

  // The Android WebView adds this token to the user agent. Hide the website's
  // install button when the storefront is already running inside the app.
  if (navigator.userAgent.indexOf("XevorasApp/") !== -1) {
    document.documentElement.classList.add("in-app");
  }

  var CART_KEY = "xevora_cart_v1";
  var WISHLIST_KEY = "xevora_wishlist_v1";

  var state = {
    user: null,
    profile: null,
    authLoading: true,
    products: [],
    categories: [],
    catalogueSource: "bundled",
    catalogueLoading: true,
  };

  X.state = state;

  /* ------------------------------------------------------------------ */
  /* Icons                                                               */
  /* ------------------------------------------------------------------ */

  var iconPaths = {
    arrow: '<path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>',
    heart:
      '<path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/>',
    check: '<path d="M20 6 9 17l-5-5"/>',
    package:
      '<path d="m7.5 4.27 9 5.15"/><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/>',
    search: '<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
    menu: '<path d="M4 12h16"/><path d="M4 6h16"/><path d="M4 18h16"/>',
    close: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    minus: '<path d="M5 12h14"/>',
    plus: '<path d="M12 5v14"/><path d="M5 12h14"/>',
    trash:
      '<path d="M3 6h18"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/><path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>',
    truck:
      '<path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2"/><path d="M15 18H9"/><path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.62l-3.48-4.35A1 1 0 0 0 17.52 8H14"/><circle cx="17" cy="18" r="2"/><circle cx="7" cy="18" r="2"/>',
    shield:
      '<path d="M20 13c0 5-3.5 7.5-7.66 8.95a1 1 0 0 1-.67-.01C7.5 20.5 4 18 4 13V6a1 1 0 0 1 1-1c2 0 4.5-1.2 6.24-2.72a1.17 1.17 0 0 1 1.52 0C14.51 3.81 17 5 19 5a1 1 0 0 1 1 1z"/>',
    rotate:
      '<path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/>',
    sparkles:
      '<path d="m12 3-1.9 5.8a2 2 0 0 1-1.3 1.3L3 12l5.8 1.9a2 2 0 0 1 1.3 1.3L12 21l1.9-5.8a2 2 0 0 1 1.3-1.3L21 12l-5.8-1.9a2 2 0 0 1-1.3-1.3Z"/>',
    lock:
      '<rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>',
    user: '<path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>',
    logout:
      '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5"/><path d="M21 12H9"/>',
    refresh:
      '<path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M21 3v5h-5"/><path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M8 16H3v5"/>',
    database:
      '<ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/>',
    image:
      '<rect width="18" height="18" x="3" y="3" rx="2"/><circle cx="9" cy="9" r="2"/><path d="m21 15-3.09-3.09a2 2 0 0 0-2.82 0L6 21"/>',
    settings:
      '<path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/>',
    external: '<path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
    loader: '<path d="M21 12a9 9 0 1 1-6.219-8.56"/>',
    tag: '<path d="M12.586 2.586A2 2 0 0 0 11.172 2H4a2 2 0 0 0-2 2v7.172a2 2 0 0 0 .586 1.414l8.704 8.704a2.426 2.426 0 0 0 3.42 0l6.58-6.58a2.426 2.426 0 0 0 0-3.42z"/><circle cx="7.5" cy="7.5" r=".5" fill="currentColor"/>',
    copy: '<rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/>',
    users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
    download: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
  };

  X.icon = function (name, size) {
    var body = iconPaths[name] || "";
    return (
      '<svg class="x-icon" xmlns="http://www.w3.org/2000/svg" width="' +
      (size || 16) +
      '" height="' +
      (size || 16) +
      '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
      body +
      "</svg>"
    );
  };

  X.heartIcon = function (filled, size) {
    return (
      '<svg xmlns="http://www.w3.org/2000/svg" width="' +
      (size || 17) +
      '" height="' +
      (size || 17) +
      '" viewBox="0 0 24 24" fill="' +
      (filled ? "currentColor" : "none") +
      '" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z"/></svg>'
    );
  };

  /* ------------------------------------------------------------------ */
  /* Toasts                                                              */
  /* ------------------------------------------------------------------ */

  X.toast = function (message, tone) {
    var stack = document.getElementById("toast-stack");
    if (!stack) return;
    var node = document.createElement("div");
    node.className = "toast toast-" + (tone || "default");
    node.textContent = message;
    stack.appendChild(node);
    window.setTimeout(function () {
      node.remove();
    }, 3800);
  };

  /* ------------------------------------------------------------------ */
  /* Auth                                                                */
  /* ------------------------------------------------------------------ */

  var authResolve;
  X.authReady = new Promise(function (resolve) {
    authResolve = resolve;
  });

  function withTimeout(promise, ms) {
    return Promise.race([
      promise,
      new Promise(function (resolve) {
        window.setTimeout(function () {
          resolve(null);
        }, ms);
      }),
    ]);
  }

  function loadProfile(user) {
    var ref = X.db.collection("users").doc(user.uid);
    return ref
      .get()
      .then(function (snapshot) {
        if (snapshot.exists) {
          var data = snapshot.data();
          var existing = Object.assign(
            { uid: user.uid, email: user.email || "", fullName: user.displayName || "" },
            data,
          );
          if (!existing.email) existing.email = user.email || "";
          if (!existing.fullName) existing.fullName = user.displayName || "";
          return existing;
        }
        var profile = {
          uid: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
          role: "customer",
        };
        return ref
          .set({
            email: profile.email,
            fullName: profile.fullName,
            phoneNumber: profile.phoneNumber,
            role: "customer",
            createdAt: X.serverTimestamp(),
            updatedAt: X.serverTimestamp(),
          })
          .then(function () {
            return profile;
          });
      })
      .catch(function (error) {
        console.error("[Xevoras] Could not load the customer profile.", error);
        return {
          uid: user.uid,
          email: user.email || "",
          fullName: user.displayName || "",
          phoneNumber: user.phoneNumber || "",
          role: "customer",
        };
      });
  }

  function finishAuth() {
    state.authLoading = false;
    renderHeader();
    document.dispatchEvent(new CustomEvent("xevora:auth", { detail: state }));
    authResolve(state);
  }

  if (X.auth) {
    X.auth.onAuthStateChanged(
      function (user) {
        state.user = user;
        if (!user) {
          state.profile = null;
          finishAuth();
          return;
        }
        withTimeout(loadProfile(user), 4500).then(function (profile) {
          state.profile = profile;
          finishAuth();
        });
      },
      function (error) {
        console.error("[Xevoras] Auth listener failed.", error);
        state.user = null;
        state.profile = null;
        finishAuth();
      },
    );
  } else {
    state.authLoading = false;
    authResolve(state);
  }

  X.isAdmin = function () {
    return Boolean(state.profile && state.profile.role === "admin");
  };

  X.refreshProfile = function () {
    if (!X.auth || !X.auth.currentUser) {
      state.profile = null;
      renderHeader();
      return Promise.resolve(null);
    }
    return loadProfile(X.auth.currentUser).then(function (profile) {
      state.profile = profile;
      renderHeader();
      document.dispatchEvent(new CustomEvent("xevora:auth", { detail: state }));
      return profile;
    });
  };

  X.logout = function () {
    if (!X.auth) return Promise.resolve();
    return X.auth.signOut().then(function () {
      state.user = null;
      state.profile = null;
      renderHeader();
      X.toast("Signed out.");
    });
  };

  /* ------------------------------------------------------------------ */
  /* Catalogue                                                           */
  /* ------------------------------------------------------------------ */

  function normaliseProduct(product) {
    var copy = Object.assign({}, product);
    copy.images = X.uniqueImages(
      (product.images || []).map(function (image) {
        return Object.assign({}, image, { url: X.media(image.url) });
      }),
      function (image) { return image.url; },
      function (image, url) { return Object.assign({}, image, { url: url }); }
    );
    return copy;
  }

  function normaliseCategory(category) {
    return Object.assign({}, category, { image: X.media(category.image) });
  }

  var cataloguePromise = null;

  function fetchBundled() {
    return fetch("assets/data/catalogue.json", { cache: "no-store" }).then(function (response) {
      if (!response.ok) throw new Error("Bundled catalogue could not be loaded.");
      return response.json();
    });
  }

  function loadCatalogue() {
    if (cataloguePromise) return cataloguePromise;

    cataloguePromise = (function () {
      var products = [];
      var categories = [];
      var live = null;

      var liveRequest = X.db
        ? withTimeout(
            Promise.all([
              X.db.collection("products").where("status", "==", "published").get(),
              X.db.collection("categories").get(),
            ]),
            3500,
          ).catch(function (error) {
            console.warn("[Xevoras] Firestore catalogue unavailable; using the bundled catalogue.", error);
            return null;
          })
        : Promise.resolve(null);

      return liveRequest
        .then(function (result) {
          if (result) {
            live = result;
            products = X.snapshotRows(result[0]);
            categories = X.snapshotRows(result[1]);
          }
          if (products.length) return null;
          return fetchBundled();
        })
        .then(function (bundled) {
          if (bundled) {
            products = bundled.products || [];
            categories = bundled.categories || [];
            state.catalogueSource = "bundled";
          } else {
            state.catalogueSource = "firestore";
            if (!categories.length) {
              return fetchBundled().then(function (extra) {
                categories = extra.categories || [];
              });
            }
          }
        })
        .catch(function (error) {
          console.error("[Xevoras] Catalogue failed to load.", error);
        })
        .then(function () {
          state.products = products.map(normaliseProduct);
          state.categories = categories.map(normaliseCategory);
          state.catalogueLoading = false;
          document.dispatchEvent(new CustomEvent("xevora:catalogue", { detail: state }));
          return state;
        });
    })();

    return cataloguePromise;
  }

  X.loadCatalogue = loadCatalogue;
  X.catalogueReady = loadCatalogue();

  X.refreshCatalogue = function () {
    cataloguePromise = null;
    return loadCatalogue();
  };

  X.findProduct = function (slug) {
    return state.products.find(function (product) {
      return product.slug === slug || product.id === slug;
    });
  };

  X.featuredProducts = function (limit) {
    return state.products
      .filter(function (product) {
        return product.featured;
      })
      .slice(0, limit || 8);
  };

  X.newArrivals = function (limit) {
    return state.products.slice().reverse().slice(0, limit || 4);
  };

  X.searchProducts = function (term) {
    var query = String(term || "").trim().toLowerCase();
    if (!query) return state.products.slice();
    return state.products.filter(function (product) {
      return [product.name, product.shortDescription, product.description, product.keywords, product.categoryName]
        .join(" ")
        .toLowerCase()
        .indexOf(query) !== -1;
    });
  };

  /* ------------------------------------------------------------------ */
  /* Cart                                                                */
  /* ------------------------------------------------------------------ */

  function readCart() {
    try {
      var raw = window.localStorage.getItem(CART_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  var cart = readCart();

  function cartCount() {
    return cart.reduce(function (sum, line) {
      return sum + line.qty;
    }, 0);
  }

  function cartSubtotal() {
    return cart.reduce(function (sum, line) {
      return sum + line.pricePaise * line.qty;
    }, 0);
  }

  function persistCart() {
    try {
      window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
    } catch (error) {
      console.warn("[Xevoras] Could not save the cart.", error);
    }
    renderHeader();
    document.dispatchEvent(new CustomEvent("xevora:cartchange", { detail: X.cart.lines() }));
  }

  X.cart = {
    lines: function () {
      return cart.slice();
    },
    count: cartCount,
    subtotal: cartSubtotal,
    shipping: function () {
      return X.shippingFor(cartSubtotal());
    },
    total: function () {
      return cartSubtotal() + X.shippingFor(cartSubtotal());
    },
    refreshFromCatalogue: function () {
      var changed = false;
      cart = cart.map(function (line) {
        var product = X.findProduct(line.productId);
        if (!product) return line;
        var variant = (product.variants || []).find(function (item) { return item.sku === line.sku; });
        if (!variant) return line;
        var refreshed = Object.assign({}, line, {
          name: product.name,
          slug: product.slug,
          pricePaise: Number(product.pricePaise) || 0,
          image: X.media(product.images && product.images[0] ? product.images[0].url : line.image),
          stock: Math.max(0, Number(variant.stock) || 0),
          sourcing: product.sourcing === "on_demand" ? "on_demand" : "stock",
          size: variant.size,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
        });
        if (refreshed.stock > 0) refreshed.qty = Math.min(Number(line.qty) || 1, refreshed.stock);
        if (JSON.stringify(refreshed) !== JSON.stringify(line)) changed = true;
        return refreshed;
      });
      if (changed) persistCart();
      return cart.slice();
    },
    add: function (product, variant, qty) {
      var amount = Math.max(1, Number(qty) || 1);
      if (!variant || Number(variant.stock) <= 0) {
        X.toast("That size is sold out.", "error");
        return;
      }
      var existing = cart.find(function (line) {
        return line.sku === variant.sku;
      });
      if (existing) {
        existing.qty = Math.min(existing.qty + amount, Number(variant.stock));
        existing.stock = Number(variant.stock);
      } else {
        cart.push({
          productId: product.id,
          slug: product.slug,
          name: product.name,
          pricePaise: product.pricePaise,
          image: X.media(product.images && product.images[0] ? product.images[0].url : ""),
          sku: variant.sku,
          size: variant.size,
          colorName: variant.colorName,
          colorHex: variant.colorHex,
          qty: Math.min(amount, Number(variant.stock)),
          stock: Number(variant.stock),
          sourcing: product.sourcing === "on_demand" ? "on_demand" : "stock",
        });
      }
      persistCart();
      X.toast(product.name + " added to your bag.", "success");
    },
    setQty: function (sku, qty) {
      cart = cart.map(function (line) {
        if (line.sku !== sku) return line;
        var limit = Number(line.stock) > 0 ? Number(line.stock) : Infinity;
        return Object.assign({}, line, {
          qty: Math.min(Math.max(1, Number(qty) || 1), limit),
        });
      });
      persistCart();
    },
    remove: function (sku) {
      cart = cart.filter(function (line) {
        return line.sku !== sku;
      });
      persistCart();
    },
    clear: function () {
      cart = [];
      persistCart();
    },
  };

  /* ------------------------------------------------------------------ */
  /* Wishlist                                                            */
  /* ------------------------------------------------------------------ */

  function readWishlist() {
    try {
      var raw = window.localStorage.getItem(WISHLIST_KEY);
      var parsed = raw ? JSON.parse(raw) : [];
      return Array.isArray(parsed)
        ? parsed.filter(function (item) {
            return typeof item === "string";
          })
        : [];
    } catch (error) {
      return [];
    }
  }

  var wishlist = readWishlist();

  function persistWishlist() {
    try {
      window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
    } catch (error) {
      console.warn("[Xevoras] Could not save the wishlist.", error);
    }
    renderHeader();
    syncWishlistButtons();
    document.dispatchEvent(new CustomEvent("xevora:wishlistchange", { detail: wishlist.slice() }));
  }

  X.wishlist = {
    ids: function () {
      return wishlist.slice();
    },
    has: function (id) {
      return wishlist.indexOf(id) !== -1;
    },
    toggle: function (id, name) {
      if (wishlist.indexOf(id) !== -1) {
        wishlist = wishlist.filter(function (item) {
          return item !== id;
        });
        X.toast((name || "Item") + " removed from your wishlist.");
      } else {
        wishlist.push(id);
        X.toast((name || "Item") + " saved to your wishlist.", "success");
      }
      persistWishlist();
    },
  };

  /* ------------------------------------------------------------------ */
  /* Header and common UI                                                */
  /* ------------------------------------------------------------------ */

  function setBadge(id, count) {
    var node = document.getElementById(id);
    if (!node) return;
    node.textContent = count;
    node.hidden = count <= 0;
  }

  function renderHeader() {
    setBadge("cart-count", cartCount());
    setBadge("wishlist-count", wishlist.length);

    var accountHref = state.user ? "account.html" : "login.html";
    var accountLink = document.getElementById("account-link");
    if (accountLink) accountLink.setAttribute("href", accountHref);

    var searchButton = document.getElementById("search-open");
    var headerSearch = document.getElementById("header-search-form");
    if (!headerSearch && searchButton && searchButton.parentNode) {
      headerSearch = document.createElement("form");
      headerSearch.id = "header-search-form";
      headerSearch.className = "header-search-form";
      headerSearch.action = "search.html";
      headerSearch.method = "get";
      headerSearch.innerHTML =
        '<input type="search" name="q" placeholder="Search kurtas, shirts, dresses…" aria-label="Search products" autocomplete="off">' +
        '<button type="submit" aria-label="Search">' + X.icon("search", 17) + "</button>";
      searchButton.parentNode.insertBefore(headerSearch, searchButton);
    }
    var ordersLink = document.getElementById("header-orders-link");
    if (!ordersLink && searchButton && searchButton.parentNode) {
      ordersLink = document.createElement("a");
      ordersLink.id = "header-orders-link";
      ordersLink.className = "header-orders-link";
      ordersLink.innerHTML = X.icon("package", 17) + '<span>Your orders</span>';
      searchButton.parentNode.insertBefore(ordersLink, searchButton.nextSibling);
    }
    if (ordersLink) {
      ordersLink.href = "account.html#account-orders";
      ordersLink.hidden = !state.user;
    }

    var mobileAccount = document.getElementById("mobile-account-link");
    if (mobileAccount) {
      mobileAccount.setAttribute("href", accountHref);
      mobileAccount.innerHTML =
        (state.user ? "My account" : "Sign in") + " " + X.icon("user", 18);
    }

    var mobileAdmin = document.getElementById("mobile-admin-link");
    if (mobileAdmin) mobileAdmin.hidden = !X.isAdmin();

    var footerAdmin = document.getElementById("footer-admin-link");
    if (footerAdmin) footerAdmin.hidden = !X.isAdmin();

    var mobileSignout = document.getElementById("mobile-signout");
    if (mobileSignout) mobileSignout.hidden = !state.user;

    var footnote = document.getElementById("mobile-footnote");
    if (footnote) {
      var signedInAs = state.profile
        ? state.profile.email || state.profile.phoneNumber || ""
        : "";
      footnote.textContent = signedInAs
        ? "Signed in as " + signedInAs
        : "Designed in India · GST-inclusive pricing";
    }

    var year = document.getElementById("year");
    if (year) year.textContent = new Date().getFullYear();

    var email = document.getElementById("footer-email");
    if (email) {
      email.textContent = X.brand.supportEmail;
      email.setAttribute("href", "mailto:" + X.brand.supportEmail);
    }
  }

  function setOverlay(open) {
    document.body.classList.toggle("overlay-open", open);
  }

  function closeMenu() {
    var menu = document.getElementById("mobile-menu");
    if (menu) menu.hidden = true;
    var search = document.getElementById("search-overlay");
    if (search && !search.hidden) return;
    setOverlay(false);
  }

  function openMenu() {
    var menu = document.getElementById("mobile-menu");
    var search = document.getElementById("search-overlay");
    if (search) search.hidden = true;
    if (menu) menu.hidden = false;
    setOverlay(true);
  }

  function closeSearch() {
    var search = document.getElementById("search-overlay");
    if (search) search.hidden = true;
    var menu = document.getElementById("mobile-menu");
    if (menu && !menu.hidden) return;
    setOverlay(false);
  }

  function openSearch() {
    var search = document.getElementById("search-overlay");
    var menu = document.getElementById("mobile-menu");
    if (menu) menu.hidden = true;
    if (search) search.hidden = false;
    setOverlay(true);
    var input = document.getElementById("search-input");
    if (input) window.setTimeout(function () { input.focus(); }, 50);
  }

  function syncWishlistButtons() {
    document.querySelectorAll("[data-wishlist-toggle]").forEach(function (button) {
      var id = button.getAttribute("data-wishlist-toggle");
      var saved = X.wishlist.has(id);
      button.classList.toggle("active", saved);
      button.classList.toggle("saved", saved);
      button.setAttribute("aria-pressed", saved ? "true" : "false");
      var name = button.getAttribute("data-name") || "item";
      button.setAttribute("aria-label", saved ? "Remove " + name + " from wishlist" : "Save " + name);
      var svg = button.querySelector("svg");
      if (svg) svg.setAttribute("fill", saved ? "currentColor" : "none");
    });
  }

  X.syncWishlistButtons = syncWishlistButtons;

  X.productCard = function (product) {
    var discount = X.discountPercent(product.pricePaise, product.compareAtPricePaise);
    var stock = X.productStock(product);
    var onDemand = X.isOnDemand(product);
    var colors = [];
    var seen = {};
    (product.variants || []).forEach(function (variant) {
      if (!seen[variant.colorName]) {
        seen[variant.colorName] = true;
        colors.push(variant);
      }
    });
    var saved = X.wishlist.has(product.id);
    var image = product.images && product.images[0] ? product.images[0] : { url: "", alt: product.name };
    var altImage = product.images && product.images[1] ? product.images[1] : null;

    return (
      '<article class="product-card">' +
      '<a href="product.html?slug=' +
      encodeURIComponent(product.slug) +
      '" class="product-media" aria-label="' +
      X.escapeAttr(product.name) +
      '">' +
      '<img src="' +
      X.escapeAttr(X.media(image.url)) +
      '" alt="' +
      X.escapeAttr(image.alt || product.name) +
      '" loading="lazy">' +
      (altImage
        ? '<img class="product-media-alt" src="' +
          X.escapeAttr(X.media(altImage.url)) +
          '" alt="' +
          X.escapeAttr(altImage.alt || product.name) +
          '" loading="lazy">'
        : "") +
      '<div class="product-badges">' +
      (discount ? '<span class="badge badge-sale">' + discount + "% off</span>" : "") +
      (onDemand ? '<span class="badge badge-made">Made to order</span>' : "") +
      (product.featured ? '<span class="badge">The edit</span>' : "") +
      (!onDemand && stock === 0 ? '<span class="badge badge-muted">Sold out</span>' : "") +
      "</div></a>" +
      '<button type="button" class="wishlist-button' +
      (saved ? " active" : "") +
      '" data-wishlist-toggle="' +
      X.escapeAttr(product.id) +
      '" data-name="' +
      X.escapeAttr(product.name) +
      '" aria-label="' +
      (saved ? "Remove " + X.escapeAttr(product.name) + " from wishlist" : "Save " + X.escapeAttr(product.name)) +
      '" aria-pressed="' +
      (saved ? "true" : "false") +
      '">' +
      X.heartIcon(saved, 17) +
      "</button>" +
      '<div class="product-info"><div><p class="product-category">' +
      X.escapeHtml(product.categoryName) +
      '</p><h3><a href="product.html?slug=' +
      encodeURIComponent(product.slug) +
      '">' +
      X.escapeHtml(product.name) +
      "</a></h3></div>" +
      '<div class="product-price"><span>' +
      X.formatINR(product.pricePaise) +
      "</span>" +
      (product.compareAtPricePaise ? "<s>" + X.formatINR(product.compareAtPricePaise) + "</s>" : "") +
      "</div>" +
      '<div class="product-meta"><div class="swatches" aria-label="Available colours">' +
      colors
        .map(function (variant) {
          return (
            '<span title="' +
            X.escapeAttr(variant.colorName) +
            '" style="background-color:' +
            X.escapeAttr(variant.colorHex) +
            '"></span>'
          );
        })
        .join("") +
      "</div><span>" +
      (onDemand ? "Made to order" : stock > 0 ? (stock <= 5 ? '<b class="low-stock">Only ' + stock + " left</b>" : "In stock") : "Sold out") +
      "</span></div></div></article>"
    );
  };

  X.renderProductGrid = function (target, products) {
    var node = typeof target === "string" ? document.getElementById(target) : target;
    if (!node) return;
    node.innerHTML = products.map(X.productCard).join("");
    syncWishlistButtons();
  };

  function markNav() {
    var file = window.location.pathname.split("/").pop() || "index.html";
    var params = new URLSearchParams(window.location.search);
    document.querySelectorAll("[data-nav]").forEach(function (link) {
      var key = link.getAttribute("data-nav");
      var active = false;
      if (key === "women") active = file === "women.html";
      if (key === "men") active = file === "men.html";
      if (key === "new") active = file === "shop.html" && params.get("sort") === "newest";
      if (key === "edit") active = file === "shop.html" && params.get("featured") === "1";
      link.classList.toggle("active", active);
      if (active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    });
  }

  function initCommon() {
    renderHeader();
    syncWishlistButtons();
    markNav();

    var menuOpen = document.getElementById("menu-open");
    if (menuOpen) menuOpen.addEventListener("click", openMenu);
    var menuClose = document.getElementById("menu-close");
    if (menuClose) menuClose.addEventListener("click", closeMenu);
    var searchOpen = document.getElementById("search-open");
    if (searchOpen) searchOpen.addEventListener("click", openSearch);
    var searchClose = document.getElementById("search-close");
    if (searchClose) searchClose.addEventListener("click", closeSearch);
    var mobileSignout = document.getElementById("mobile-signout");
    if (mobileSignout) {
      mobileSignout.addEventListener("click", function () {
        X.logout().then(closeMenu);
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeMenu();
        closeSearch();
      }
    });

    var newsletter = document.getElementById("newsletter-form");
    if (newsletter) {
      newsletter.addEventListener("submit", function (event) {
        event.preventDefault();
        var input = newsletter.querySelector("input[type=email]");
        var value = input ? input.value.trim() : "";
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          X.toast("Enter a valid email address.", "error");
          return;
        }
        try {
          window.localStorage.setItem("xevora_newsletter_email", value);
        } catch (error) {}

        function done(message, tone) {
          if (input) input.value = "";
          X.toast(message, tone);
        }

        if (!X.db) {
          done("Saved on this device. The mailing list is not connected yet.");
          return;
        }

        X.db.collection("newsletter").add({
          email: value,
          source: "footer",
          createdAt: X.serverTimestamp(),
        }).then(function () {
          done("You’re on the list. Welcome to Xevoras.", "success");
        }).catch(function (error) {
          console.warn("[Xevoras] Newsletter signup could not reach Firestore.", error);
          done("Saved on this device. The mailing list is not connected yet.");
        });
      });
    }

    document.addEventListener("click", function (event) {
      var button = event.target.closest ? event.target.closest("[data-wishlist-toggle]") : null;
      if (!button) return;
      event.preventDefault();
      X.wishlist.toggle(
        button.getAttribute("data-wishlist-toggle"),
        button.getAttribute("data-name") || "Item",
      );
    });

    document.addEventListener("xevora:cartchange", renderHeader);
    document.addEventListener("xevora:wishlistchange", renderHeader);
    document.addEventListener("xevora:auth", renderHeader);
  }

  X.initCommon = initCommon;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initCommon);
  } else {
    initCommon();
  }
})(window.XEVORA);
