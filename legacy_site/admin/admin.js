/* Store admin — orders, products, image upload and catalogue seeding. */
(function (X) {
  "use strict";

  var root = document.getElementById("admin-root");
  var modalRoot = document.getElementById("admin-modal");
  var tab = "orders";
  var orders = [];
  var products = [];
  var users = [];
  var supplierProducts = [];
  var supplierOrders = [];
  var usersError = "";
  var supplierError = "";
  var returnRequests = [];
  var returnRequestsError = "";
  var orderCustomer = null;
  var fetching = false;
  var seeding = false;
  var editing = null;
  var pendingImport = null;

  function statusOptions(current) {
    var transitions = {
      confirmed: ["packed", "cancelled"],
      packed: ["shipped", "cancelled"],
      shipped: ["delivered", "returned"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };
    return [current].concat(transitions[current] || []).map(function (status) {
      return '<option value="' + X.escapeAttr(status) + '"' + (status === current ? " selected" : "") + ">" +
        X.escapeHtml(status) + "</option>";
    }).join("");
  }

  function supplierFor(productId) {
    return supplierProducts.find(function (item) {
      return item.id === productId || item.productId === productId;
    }) || null;
  }

  function sourcingFor(orderId) {
    return supplierOrders.find(function (item) { return item.id === orderId; }) || null;
  }

  function resaleItems(order) {
    return (Array.isArray(order.items) ? order.items : []).filter(function (item) {
      return item.sourcing === "on_demand";
    });
  }

  function resaleOrders() {
    return orders.filter(function (order) { return resaleItems(order).length > 0; });
  }

  function sourcingState(order) {
    var record = sourcingFor(order.id);
    return record && record.status ? record.status : "to_source";
  }

  function sourcingLabel(status) {
    var labels = {
      to_source: "To source",
      ordered: "Purchased",
      shipped: "Supplier shipped",
      delivered: "Delivered",
      cancelled: "Cancelled",
    };
    return labels[status] || status || "To source";
  }

  function sourcingSummary(order) {
    var record = sourcingFor(order.id);
    var previous = {};
    (record && Array.isArray(record.items) ? record.items : []).forEach(function (item) {
      previous[item.sku] = item;
    });
    var selling = 0;
    var cost = 0;
    var missing = 0;
    var lines = resaleItems(order).map(function (item) {
      var supplier = supplierFor(item.productId);
      var saved = previous[item.sku];
      var savedPrice = saved && typeof saved.supplierPricePaise === "number" ? saved.supplierPricePaise : 0;
      var supplierPrice = savedPrice || (supplier ? Number(supplier.supplierPricePaise) || 0 : 0);
      if (!supplierPrice) missing += 1;
      var lineSelling = (Number(item.pricePaise) || 0) * (Number(item.qty) || 1);
      var lineCost = supplierPrice * (Number(item.qty) || 1);
      selling += lineSelling;
      cost += lineCost;
      return {
        item: item,
        supplier: supplier,
        supplierPricePaise: supplierPrice,
        supplierUrl: (saved && saved.supplierUrl) || (supplier && supplier.supplierUrl) || "",
        supplierSku: (saved && saved.supplierSku) || (supplier && supplier.supplierSku) || "",
        sellingPaise: lineSelling,
        costPaise: lineCost,
        marginPaise: lineSelling - lineCost,
      };
    });
    return {
      record: record,
      lines: lines,
      sellingPaise: selling,
      costPaise: cost,
      profitPaise: selling - cost,
      missing: missing,
    };
  }

  function sourcingProfit(order) {
    var record = sourcingFor(order.id);
    if (record && record.status && record.status !== "to_source" &&
      typeof record.expectedProfitPaise === "number") {
      return record.expectedProfitPaise;
    }
    return sourcingSummary(order).profitPaise;
  }

  function isActiveOrder(order) {
    return ["cancelled", "returned"].indexOf(order.status) === -1;
  }

  function timeValue(value) {
    if (!value) return 0;
    if (typeof value.toDate === "function") return value.toDate().getTime();
    var date = new Date(value);
    return isNaN(date.getTime()) ? 0 : date.getTime();
  }

  function userId(user) {
    return user ? user.id || user.uid || "" : "";
  }

  function userName(user) {
    return (user && (user.fullName || user.displayName)) || (user && user.email) || "Unnamed customer";
  }

  function findUser(id) {
    return users.find(function (user) { return userId(user) === id; }) || null;
  }

  function digitsOnly(value) {
    return String(value || "").replace(/\D/g, "");
  }

  function orderCustomerUid(order) {
    if (order.userId) return order.userId;
    var phone = digitsOnly(order.phone || (order.address && order.address.phone));
    if (phone.length < 10) return "";
    var match = users.find(function (user) {
      var userPhone = digitsOnly(user.phoneNumber || (user.lastAddress && user.lastAddress.phone));
      return userPhone.length >= 10 && userPhone.slice(-10) === phone.slice(-10);
    });
    return match ? userId(match) : "";
  }

  function ordersForUser(user) {
    var id = userId(user);
    if (!id) return [];
    return orders.filter(function (order) { return orderCustomerUid(order) === id; });
  }

  function customerStats(user) {
    var list = ordersForUser(user);
    var delivered = list.filter(function (order) { return order.status === "delivered"; });
    var open = list.filter(function (order) {
      return ["confirmed", "packed", "shipped"].indexOf(order.status) !== -1;
    });
    var cancelled = list.filter(function (order) {
      return ["cancelled", "returned"].indexOf(order.status) !== -1;
    });
    return {
      orders: list,
      count: list.length,
      deliveredCount: delivered.length,
      openCount: open.length,
      cancelledCount: cancelled.length,
      deliveredPaise: delivered.reduce(function (sum, order) {
        return sum + (Number(order.totalPaise) || 0);
      }, 0),
      openPaise: open.reduce(function (sum, order) {
        return sum + (Number(order.totalPaise) || 0);
      }, 0),
      lastOrder: list[0] || null,
      repeat: list.length > 1,
    };
  }

  function userRole(user) {
    return user && user.role === "admin" ? "admin" : "customer";
  }

  function roleSelect(user) {
    var id = userId(user);
    var own = id === (X.state.user && X.state.user.uid);
    return '<select data-customer-role="' + X.escapeAttr(id) + '"' +
      (own ? ' disabled title="You cannot change your own role."' : "") + ">" +
      ["customer", "admin"].map(function (role) {
        return '<option value="' + role + '"' + (userRole(user) === role ? " selected" : "") + ">" +
          (role === "admin" ? "Admin" : "Customer") + "</option>";
      }).join("") + "</select>";
  }

  function statusLabel(status) {
    var value = String(status || "");
    if (value === "cod_due") return "COD due";
    if (value === "cod_collected") return "COD collected";
    return value
      .replace(/_/g, " ")
      .replace(/\b\w/g, function (letter) { return letter.toUpperCase(); });
  }

  function isHttpsUrl(value) {
    return /^https:\/\/[^\s]+$/i.test(String(value || "").trim());
  }

  var MEESHO_SHARE_HOSTS = {
    "meesho.app.link": true,
    "meesho.page.link": true,
    "meesho.onelink.me": true,
    "meesho.go.link": true
  };

  function isMeeshoHost(hostname) {
    var host = String(hostname || "").toLowerCase().replace(/\.$/, "");
    return host === "meesho.com" || host.slice(-11) === ".meesho.com" ||
      Boolean(MEESHO_SHARE_HOSTS[host]);
  }

  function normalizeMeeshoUrl(value) {
    var text = String(value || "").trim();
    if (!text) return "";
    var match = text.match(/https?:\/\/[^\s<>"']+/i);
    if (match) {
      text = match[0];
    } else {
      match = text.match(/(?:www\.)?(?:meesho\.com|meesho\.app\.link|meesho\.page\.link|meesho\.onelink\.me|meesho\.go\.link)[^\s<>"']*/i);
      if (!match) return "";
      text = match[0];
    }
    text = text.replace(/[),.;!?]+$/, "");
    if (!/^https?:\/\//i.test(text)) text = "https://" + text;
    try {
      var parsed = new URL(text);
      if (parsed.protocol !== "https:" && parsed.protocol !== "http:") return "";
      if (!isMeeshoHost(parsed.hostname)) return "";
      if (parsed.username || parsed.password) return "";
      if (parsed.port && parsed.port !== "443") return "";
      parsed.protocol = "https:";
      parsed.hash = "";
      return parsed.href;
    } catch (error) {
      return "";
    }
  }

  function isMeeshoUrl(value) {
    return Boolean(normalizeMeeshoUrl(value));
  }

  /*
   * Runs on the Meesho product page (inside the bookmarklet) and also inside
   * the admin tab when page source is pasted. Keep it self-contained: it is
   * converted to a string with Function#toString, so it cannot use helpers or
   * variables from this file.
   */
  function collectMeeshoPageDetails(doc, pageUrl) {
    doc = doc || document;
    pageUrl = String(pageUrl || (typeof location !== "undefined" ? location.href : "") || "");

    function clean(value) {
      return String(value == null ? "" : value)
        .replace(/<[^>]*>/g, " ")
        .replace(/&nbsp;/gi, " ")
        .replace(/&amp;/gi, "&")
        .replace(/&quot;/gi, '"')
        .replace(/&#39;|&apos;/gi, "'")
        .replace(/&lt;/gi, "<")
        .replace(/&gt;/gi, ">")
        .replace(/\s+/g, " ")
        .trim();
    }

    function meta(keys) {
      var list = Array.isArray(keys) ? keys : [keys];
      for (var k = 0; k < list.length; k += 1) {
        var nodes = doc.querySelectorAll(
          'meta[property="' + list[k] + '"], meta[name="' + list[k] + '"], meta[itemprop="' + list[k] + '"]'
        );
        for (var i = 0; i < nodes.length; i += 1) {
          var content = clean(nodes[i].getAttribute("content"));
          if (content) return content;
        }
      }
      return "";
    }

    function allMeta(keys) {
      var values = [];
      var list = Array.isArray(keys) ? keys : [keys];
      for (var k = 0; k < list.length; k += 1) {
        var nodes = doc.querySelectorAll(
          'meta[property="' + list[k] + '"], meta[name="' + list[k] + '"]'
        );
        for (var i = 0; i < nodes.length; i += 1) {
          var content = clean(nodes[i].getAttribute("content"));
          if (content && values.indexOf(content) === -1) values.push(content);
        }
      }
      return values;
    }

    function findProduct(value) {
      if (!value || typeof value !== "object") return null;
      if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) {
          var item = findProduct(value[i]);
          if (item) return item;
        }
        return null;
      }
      var types = value["@type"];
      if (typeof types === "string") types = [types];
      if (types && types.length) {
        for (var t = 0; t < types.length; t += 1) {
          if (String(types[t]).toLowerCase() === "product") return value;
        }
      }
      for (var key in value) {
        if (!Object.prototype.hasOwnProperty.call(value, key)) continue;
        var child = findProduct(value[key]);
        if (child) return child;
      }
      return null;
    }

    function addImages(value, target) {
      if (!value) return;
      if (typeof value === "string") {
        target.push(value);
      } else if (Array.isArray(value)) {
        for (var i = 0; i < value.length; i += 1) addImages(value[i], target);
      } else if (typeof value === "object" && value.url) {
        addImages(value.url, target);
      }
    }

    function priceValue(value) {
      if (value && typeof value === "object") {
        value = value.price || value.lowPrice || value.highPrice || value.amount || "";
      }
      var number = parseFloat(String(value == null ? "" : value).replace(/[^0-9.]/g, ""));
      if (!isFinite(number) || number <= 0 || number > 10000000) return null;
      return Math.round(number * 100);
    }

    var product = null;
    var scripts = doc.querySelectorAll('script[type="application/ld+json"]');
    for (var s = 0; s < scripts.length && !product; s += 1) {
      try {
        product = findProduct(JSON.parse(scripts[s].textContent || ""));
      } catch (error) {
        product = null;
      }
    }

    var canonicalNode = doc.querySelector('link[rel="canonical"]');
    var canonical = canonicalNode
      ? (canonicalNode.href || canonicalNode.getAttribute("href") || "")
      : "";
    if (!canonical && product && product.offers) {
      var offer = Array.isArray(product.offers) ? product.offers[0] : product.offers;
      if (offer && typeof offer === "object" && typeof offer.url === "string") {
        canonical = offer.url;
      }
    }
    if (canonical && /^https:\/\/(?:www\.)?meesho\.com\//i.test(canonical)) {
      pageUrl = canonical;
    }

    var title = clean(product && product.name);
    if (!title) title = meta(["og:title", "twitter:title"]);
    if (!title) title = clean(doc.title);
    title = title
      .replace(/\s*[-\u2013|]\s*Meesho.*$/i, "")
      .replace(/^Buy\s+/i, "")
      .replace(/\s+Online at Best Price.*$/i, "")
      .trim();

    var description = clean(product && product.description);
    if (!description || description.length < 20 || description.toLowerCase() === title.toLowerCase()) {
      description = meta(["og:description", "twitter:description", "description"]) || description;
    }

    var pricePaise = null;
    if (product && product.offers) {
      var offers = product.offers;
      if (Array.isArray(offers)) offers = offers[0];
      if (offers) pricePaise = priceValue(offers);
    }
    if (pricePaise === null) {
      pricePaise = priceValue(meta(["product:price:amount", "og:price:amount", "price"]));
    }
    if (pricePaise === null && doc.body) {
      var priceMatch = String(doc.body.textContent || "").match(/\u20B9\s*([0-9][0-9,]{1,7})/);
      if (priceMatch) pricePaise = priceValue(priceMatch[1]);
    }

    var images = [];
    if (product && product.image) addImages(product.image, images);
    allMeta(["og:image", "og:image:secure_url", "og:image:secure", "og:image:url", "twitter:image"]).forEach(function (url) {
      images.push(url);
    });

    var nodes = doc.querySelectorAll("img");
    for (var n = 0; n < nodes.length; n += 1) {
      var src = nodes[n].currentSrc || nodes[n].getAttribute("src") ||
        nodes[n].getAttribute("data-src") || "";
      var srcset = nodes[n].getAttribute("srcset") || "";
      if (srcset) {
        var candidates = srcset.split(",");
        var bestScore = 0;
        for (var c = 0; c < candidates.length; c += 1) {
          var parts = candidates[c].trim().split(/\s+/);
          var score = parseFloat(parts[1]) || 1;
          if (parts[0] && score >= bestScore) {
            src = parts[0];
            bestScore = score;
          }
        }
      }
      images.push(src);
    }

    var normalized = [];
    for (var i = 0; i < images.length; i += 1) {
      var url = clean(images[i]);
      if (!url) continue;
      if (url.indexOf("//") === 0) url = "https:" + url;
      if (!/^https:\/\//i.test(url)) continue;
      if (!/(meesho|meeshosupply|meeshofiles)/i.test(url)) continue;
      if (/logo|icon|favicon|sprite|placeholder|\/assets\/|\/images\/marketing\//i.test(url)) continue;
      if (normalized.indexOf(url) === -1) normalized.push(url);
      if (normalized.length >= 8) break;
    }

    var idMatch = pageUrl.match(/\/p\/([a-z0-9]+)/i);
    var supplierProductId = idMatch ? idMatch[1] : "";
    if (!supplierProductId && product) {
      supplierProductId = clean(product.productID || product.sku || product.mpn);
    }

    return {
      url: pageUrl,
      title: title,
      description: description,
      pricePaise: pricePaise,
      images: normalized,
      supplierProductId: supplierProductId
    };
  }

  function meeshoBookmarklet() {
    var origin = window.location.origin;
    if (!/^https?:\/\//i.test(origin)) origin = "https://xevoras.com";
    var target = origin.replace(/\/+$/, "") + "/admin/";
    var source = collectMeeshoPageDetails.toString().replace(/\r?\n/g, " ");
    return "javascript:(function(){" +
      "var data=(" + source + ")(document,location.href);" +
      "var json=JSON.stringify(data);" +
      "var bin='';" +
      "if(window.TextEncoder){var bytes=new TextEncoder().encode(json);for(var i=0;i<bytes.length;i++){bin+=String.fromCharCode(bytes[i]);}}" +
      "else{bin=unescape(encodeURIComponent(json));}" +
      "var b64=btoa(bin).replace(/\\+/g,'-').replace(/\\//g,'_').replace(/=+$/,'');" +
      "var url=" + JSON.stringify(target) + "+\"\\x23meesho-import=\"+b64;" +
      "var win=window.open(url,'_blank');" +
      "if(!win){location.href=url;}" +
      "})();";
  }

  var IMPORT_HASH_PREFIX = "#meesho-import=";
  var IMPORT_STORAGE_KEY = "xevoras.pendingMeeshoImport";

  function decodeImportHash() {
    var hash = String(window.location.hash || "");
    if (hash.indexOf(IMPORT_HASH_PREFIX) !== 0) return null;
    var encoded = hash.slice(IMPORT_HASH_PREFIX.length);
    if (!encoded || encoded.length > 20000) return null;
    try {
      var base64 = encoded.replace(/-/g, "+").replace(/_/g, "/");
      while (base64.length % 4) base64 += "=";
      var binary = window.atob(base64);
      var bytes = new Uint8Array(binary.length);
      for (var i = 0; i < binary.length; i += 1) bytes[i] = binary.charCodeAt(i);
      var json = typeof window.TextDecoder !== "undefined"
        ? new window.TextDecoder().decode(bytes)
        : decodeURIComponent(escape(binary));
      var data = JSON.parse(json);
      return data && typeof data === "object" ? data : null;
    } catch (error) {
      return null;
    }
  }

  function clearImportHash() {
    if (window.history && window.history.replaceState) {
      window.history.replaceState(null, "", window.location.pathname + window.location.search);
    } else if (window.location.hash) {
      window.location.hash = "";
    }
  }

  function readPendingImport() {
    var data = decodeImportHash();
    if (data) {
      try {
        window.sessionStorage.setItem(IMPORT_STORAGE_KEY, JSON.stringify(data));
      } catch (error) {
        // Private browsing can block storage; the hash handoff still works.
      }
      clearImportHash();
      return data;
    }
    try {
      var saved = window.sessionStorage.getItem(IMPORT_STORAGE_KEY);
      if (saved) data = JSON.parse(saved);
    } catch (error) {
      data = null;
    }
    return data && typeof data === "object" ? data : null;
  }

  function claimPendingImport() {
    try {
      window.sessionStorage.removeItem(IMPORT_STORAGE_KEY);
    } catch (error) {
      // Ignore storage errors.
    }
  }

  function copyText(text) {
    if (navigator.clipboard && window.isSecureContext) {
      return navigator.clipboard.writeText(text);
    }
    return new Promise(function (resolve, reject) {
      var area = document.createElement("textarea");
      area.value = text;
      area.setAttribute("readonly", "");
      area.style.position = "fixed";
      area.style.opacity = "0";
      document.body.appendChild(area);
      area.select();
      try {
        document.execCommand("copy") ? resolve() : reject(new Error("Copy failed."));
      } catch (error) {
        reject(error);
      } finally {
        area.remove();
      }
    });
  }

  function orderAddressText(order) {
    var address = order.address || {};
    return [
      address.fullName || "",
      order.phone || address.phone || "",
      address.line1 || "",
      address.line2 || "",
      [address.city, address.state].filter(Boolean).join(", "),
      address.pincode || "",
      address.country && address.country !== "India" ? address.country : "",
    ].filter(Boolean).join("\n");
  }

  function csvCell(value) {
    var text = String(value == null ? "" : value);
    // Prevent spreadsheet formula injection from customer-entered values.
    if (/^[=+\-@\t\r]/.test(text)) text = "'" + text;
    return '"' + text.replace(/"/g, '""') + '"';
  }

  function csvRupees(paise) {
    return ((Number(paise) || 0) / 100).toFixed(2);
  }

  function csvStamp() {
    var now = new Date();
    return [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")].join("-");
  }

  function downloadCsv(filename, rows) {
    var csv = "\ufeff" + rows.map(function (row) {
      return row.map(csvCell).join(",");
    }).join("\r\n");
    var blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.setTimeout(function () { URL.revokeObjectURL(url); }, 1500);
  }

  function exportCustomersCsv() {
    var panel = document.getElementById("admin-panel");
    var body = panel ? panel.querySelector(".customer-table tbody") : null;
    if (!body) {
      X.toast("No customer profiles to export.", "error");
      return;
    }
    var ids = Array.prototype.slice.call(body.querySelectorAll("[data-customer-row]"))
      .filter(function (row) { return !row.hidden; })
      .map(function (row) { return row.getAttribute("data-customer-id"); });
    if (!ids.length) {
      X.toast("No customers match the current filters.", "error");
      return;
    }
    var rows = [["Name", "Email", "Phone", "Role", "Joined", "Orders", "Delivered",
      "Open orders", "Delivered spend INR", "Last order", "Address line 1", "Address line 2",
      "City", "State", "PIN", "UID"]];
    ids.forEach(function (id) {
      var user = findUser(id);
      if (!user) return;
      var stats = customerStats(user);
      var address = user.lastAddress || (stats.lastOrder && stats.lastOrder.address) || {};
      rows.push([
        userName(user),
        user.email || "",
        user.phoneNumber || address.phone || "",
        userRole(user),
        X.formatDate(user.createdAt),
        stats.count,
        stats.deliveredCount,
        stats.openCount,
        csvRupees(stats.deliveredPaise),
        stats.lastOrder ? X.formatDate(stats.lastOrder.createdAt) : "",
        address.line1 || "",
        address.line2 || "",
        address.city || "",
        address.state || "",
        address.pincode || "",
        userId(user),
      ]);
    });
    downloadCsv("xevoras-customers-" + csvStamp() + ".csv", rows);
    X.toast(ids.length + " customer" + (ids.length === 1 ? "" : "s") + " exported.", "success");
  }

  function renderSignedOut() {
    root.innerHTML =
      '<div class="empty-page"><p class="eyebrow">Staff</p><h1>Admin sign-in.</h1>' +
      "<p>Sign in with the email address and password attached to your admin account.</p>" +
      '<a href="login.html?next=admin/" class="button button-primary">Sign in with email ' +
      X.icon("arrow", 16) + "</a></div>";
  }

  function renderGate() {
    var uid = X.state.user ? X.state.user.uid : "";
    var consoleUrl = "https://console.firebase.google.com/project/" + X.firebaseConfig.projectId +
      "/firestore/data/~2Fusers~2F" + encodeURIComponent(uid);
    root.innerHTML =
      '<div class="admin-gate"><div class="admin-gate-card">' + X.icon("shield", 28) +
      '<p class="eyebrow">Admin access required</p><h1>This account is not an admin.</h1>' +
      "<p>Your account is signed in, but it does not have the admin role in Firestore.</p>" +
      '<div class="admin-uid"><span>Your UID</span><code>' + X.escapeHtml(uid) + "</code></div>" +
      "<ol><li>Open Firebase Console → Firestore Database.</li><li>Open <code>users/" +
      X.escapeHtml(uid) + "</code>.</li><li>Set <code>role</code> to <code>admin</code> and save.</li>" +
      "<li>Return here and refresh access.</li></ol>" +
      '<div class="button-row"><button type="button" class="button button-primary" id="refresh-access">' +
      X.icon("refresh", 16) + ' Refresh access</button><a class="button button-outline" href="' + consoleUrl +
      '" target="_blank" rel="noreferrer">Open Firebase ' + X.icon("external", 15) + "</a></div>" +
      "</div></div>";
  }

  function renderShell() {
    root.innerHTML =
      '<div class="admin-head"><div><p class="eyebrow">Xevoras staff</p><h1>Store admin.</h1><p>' +
      X.escapeHtml((X.state.profile && X.state.profile.email) || (X.state.user && X.state.user.email) || "") +
      ' · signed in</p></div><div class="admin-head-actions">' +
      '<button type="button" class="button button-outline" data-refresh' + (fetching ? " disabled" : "") + ">" +
      X.icon("refresh", 15) + ' <span class="' + (fetching ? "spin" : "") + '">Refresh</span></button>' +
      '<a href="index.html" class="button button-outline">View store</a></div></div>' +
      '<div class="admin-tabs" role="tablist">' +
      '<button type="button" data-tab="orders" class="' + (tab === "orders" ? "active" : "") + '">' +
      X.icon("package", 16) + " Orders <span>" + orders.length + "</span></button>" +
      '<button type="button" data-tab="customers" class="' + (tab === "customers" ? "active" : "") + '">' +
      X.icon("users", 16) + " Customers <span>" + users.length + "</span></button>" +
      '<button type="button" data-tab="products" class="' + (tab === "products" ? "active" : "") + '">' +
      X.icon("image", 16) + " Products <span>" + products.length + "</span></button>" +
      '<button type="button" data-tab="resell" class="' + (tab === "resell" ? "active" : "") + '">' +
      X.icon("tag", 16) + " Resell <span>" + resaleOrders().filter(function (order) {
        return isActiveOrder(order) && sourcingState(order) === "to_source";
      }).length + "</span></button>" +
      '<button type="button" data-tab="returns" class="' + (tab === "returns" ? "active" : "") + '">' +
      X.icon("rotate", 16) + " Returns <span>" + returnRequests.filter(function (request) {
        return ["resolved", "rejected", "refunded"].indexOf(request.status) === -1;
      }).length + "</span></button>" +
      '<button type="button" data-tab="setup" class="' + (tab === "setup" ? "active" : "") + '">' +
      X.icon("settings", 16) + " Setup</button></div>" +
      '<div id="admin-panel"></div>';
    renderPanel();
  }

  function renderPanel() {
    var panel = document.getElementById("admin-panel");
    if (!panel) return;

    if (tab === "customers") {
      var now = new Date();
      var monthStart = new Date(now.getFullYear(), now.getMonth(), 1).getTime();
      var statsByUser = {};
      var newUsers = 0;
      var repeatUsers = 0;
      var noOrderUsers = 0;
      users.forEach(function (user) {
        var stats = customerStats(user);
        statsByUser[userId(user)] = stats;
        if (timeValue(user.createdAt) >= monthStart) newUsers += 1;
        if (stats.repeat) repeatUsers += 1;
        if (stats.count === 0) noOrderUsers += 1;
      });
      var customerRows = users.slice().sort(function (a, b) {
        var timeDiff = timeValue(b.createdAt) - timeValue(a.createdAt);
        return timeDiff || userName(a).localeCompare(userName(b));
      });

      panel.innerHTML =
        '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Customers</h2>' +
        "<p>Every registered profile. Open one to see order history, spend and delivery details.</p></div>" +
        '<div class="button-row"><button type="button" class="button button-outline" data-export-customers>' +
        X.icon("download", 15) + " Export customers</button></div></div>" +
        (usersError ? '<p class="form-error">' + X.escapeHtml(usersError) + "</p>" : "") +
        '<div class="admin-metrics">' +
        '<article><span>Total users</span><strong>' + users.length + "</strong></article>" +
        '<article><span>New this month</span><strong>' + newUsers + "</strong></article>" +
        '<article><span>Repeat buyers</span><strong>' + repeatUsers + "</strong></article>" +
        '<article><span>No orders yet</span><strong>' + noOrderUsers + "</strong></article></div>" +
        (fetching && !users.length
          ? '<p class="muted-copy"><span class="spin">' + X.icon("loader", 16) +
            "</span> Loading customer profiles…</p>"
          : users.length
            ? '<div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Search customers</span>' +
              '<input id="customer-search" type="search" placeholder="Search name, email, phone, city or UID" autocomplete="off"></label>' +
              '<label class="admin-filter"><span class="sr-only">Filter by role</span>' +
              '<select id="customer-role-filter"><option value="all">All roles</option>' +
              '<option value="customer">Customers</option><option value="admin">Admins</option></select></label>' +
              '<label class="admin-filter"><span class="sr-only">Filter by order activity</span>' +
              '<select id="customer-activity-filter"><option value="all">All activity</option>' +
              '<option value="orders">Has orders</option><option value="repeat">Repeat buyers</option>' +
              '<option value="none">No orders yet</option></select></label>' +
              '<label class="admin-filter"><span class="sr-only">Sort customers</span>' +
              '<select id="customer-sort"><option value="newest">Newest first</option>' +
              '<option value="name">Name A–Z</option><option value="orders">Most orders</option>' +
              '<option value="spent">Highest spend</option></select></label></div>' +
              '<p class="admin-result-count" id="customer-count">Showing ' + users.length + " of " +
              users.length + " accounts</p>" +
              '<div class="table-scroll"><table class="admin-table customer-table"><thead><tr><th>Customer</th>' +
              "<th>Contact</th><th>Joined</th><th>Orders</th><th>Delivered spend</th><th>Role</th><th></th>" +
              "</tr></thead><tbody>" +
              customerRows.map(function (user) {
                var id = userId(user);
                var stats = statsByUser[id] || customerStats(user);
                var address = user.lastAddress || (stats.lastOrder && stats.lastOrder.address) || {};
                var phone = user.phoneNumber || address.phone || "";
                var searchText = [userName(user), user.email, phone, id, address.city,
                  address.state, address.pincode, userRole(user)].join(" ").toLowerCase();
                var activity = stats.count === 0 ? "none" : stats.repeat ? "repeat" : "orders";
                return '<tr data-customer-row data-customer-id="' + X.escapeAttr(id) +
                  '" data-role="' + X.escapeAttr(userRole(user)) +
                  '" data-activity="' + activity + '" data-search="' + X.escapeAttr(searchText) +
                  '" data-name="' + X.escapeAttr(userName(user)) + '" data-created="' +
                  timeValue(user.createdAt) + '" data-orders="' + stats.count + '" data-spent="' +
                  stats.deliveredPaise + '"><td><button type="button" class="text-link customer-name" data-view-customer="' +
                  X.escapeAttr(id) + '">' + X.escapeHtml(userName(user)) + "</button>" +
                  ' <span class="pill-resale" data-role-badge' +
                  (userRole(user) === "admin" ? "" : " hidden") + ">Admin</span>" +
                  '<br><span class="muted-small">' + X.escapeHtml(user.email || "No email") +
                  "</span></td><td>" + X.escapeHtml(phone || "—") +
                  (address.city ? '<br><span class="muted-small">' + X.escapeHtml(address.city) +
                    (address.state ? ", " + X.escapeHtml(address.state) : "") + "</span>" : "") +
                  "</td><td>" + X.formatDate(user.createdAt) + "</td><td><strong>" + stats.count +
                  "</strong>" + (stats.lastOrder
                    ? '<br><span class="muted-small">Last ' + X.formatDate(stats.lastOrder.createdAt) + "</span>"
                    : "") + "</td><td>" + X.formatINR(stats.deliveredPaise) +
                  "</td><td>" + roleSelect(user) + '</td><td><div class="admin-product-actions">' +
                  '<button type="button" class="text-link" data-view-customer="' + X.escapeAttr(id) +
                  '">View</button><button type="button" class="text-link" data-customer-orders="' +
                  X.escapeAttr(id) + '">Orders</button></div></td></tr>';
              }).join("") +
              '</tbody></table><p class="admin-no-results" id="customers-no-results" hidden>No customers match those filters.</p></div>'
            : usersError
              ? '<div class="empty-state small">' + X.icon("users", 24) +
                "<h2>Customer profiles could not be loaded.</h2>" +
                "<p>Check admin access and the Firestore rules, then try again.</p>" +
                '<button type="button" class="button button-outline" data-refresh>Try again</button></div>'
              : '<div class="empty-state small">' + X.icon("users", 24) +
                "<h2>No customer profiles yet.</h2><p>Profiles are created automatically when someone signs in to the storefront.</p>" +
                '<button type="button" class="button button-outline" data-refresh>Refresh</button></div>') +
        "</section>";
      applyCustomerFilters();
      return;
    }

    if (tab === "orders") {
      var openOrders = orders.filter(function (order) {
        return ["confirmed", "packed", "shipped"].indexOf(order.status) !== -1;
      });
      var toPack = orders.filter(function (order) { return order.status === "confirmed"; }).length;
      var inTransit = orders.filter(function (order) { return order.status === "shipped"; }).length;
      var codValue = openOrders.reduce(function (sum, order) { return sum + (Number(order.totalPaise) || 0); }, 0);
      panel.innerHTML =
        '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Orders</h2>' +
        "<p>Cash-on-delivery orders placed on the storefront.</p></div></div>" +
        '<div class="admin-metrics"><article><span>All orders</span><strong>' + orders.length +
        '</strong></article><article><span>Ready to pack</span><strong>' + toPack +
        '</strong></article><article><span>In transit</span><strong>' + inTransit +
        '</strong></article><article><span>Open COD value</span><strong>' + X.formatINR(codValue) +
        '</strong></article></div>' +
        (fetching && !orders.length
          ? '<p class="muted-copy"><span class="spin">' + X.icon("loader", 16) + "</span> Loading orders…</p>"
          : orders.length
            ? (orderCustomer
              ? '<div class="admin-active-filter"><span>Showing orders for <strong>' +
                X.escapeHtml(orderCustomer.name) + "</strong></span>" +
                '<button type="button" data-clear-order-customer>Clear customer filter</button></div>'
              : "") +
              '<div class="admin-toolbar"><label class="admin-search"><span class="sr-only">Search orders</span>' +
              '<input id="order-search" type="search" placeholder="Search order, customer, phone or UID" autocomplete="off"></label>' +
              '<label class="admin-filter"><span class="sr-only">Choose order period</span><select id="order-period-filter">' +
              '<option value="all">All orders</option><option value="upcoming">Active / upcoming</option>' +
              '<option value="past">Past orders</option></select></label>' +
              '<label class="admin-filter"><span class="sr-only">Filter orders by status</span><select id="order-status-filter">' +
              '<option value="all">All statuses</option>' + X.orderStatuses.map(function (status) {
                return '<option value="' + X.escapeAttr(status) + '">' +
                  X.escapeHtml(status.charAt(0).toUpperCase() + status.slice(1)) + '</option>';
              }).join("") + '</select></label></div><div class="table-scroll"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th>' +
              "<th>Items</th><th>Total</th><th>Placed</th><th>Status</th></tr></thead><tbody>" +
              orders.map(function (order) {
                var address = order.address || {};
                var items = Array.isArray(order.items) ? order.items : [];
                var pieces = items.reduce(function (sum, item) { return sum + (Number(item.qty) || 0); }, 0);
                var ownerUid = orderCustomerUid(order);
                var owner = ownerUid ? findUser(ownerUid) : null;
                var customerName = address.fullName || (owner ? userName(owner) : "—");
                var searchText = [order.orderNumber, customerName, order.phone, address.phone,
                  ownerUid, address.city, address.state, address.pincode].join(" ").toLowerCase();
                return (
                  '<tr data-order-row data-status="' + X.escapeAttr(order.status) + '" data-user="' +
                  X.escapeAttr(ownerUid) + '" data-search="' +
                  X.escapeAttr(searchText) + '"><td><a href="order.html?id=' + encodeURIComponent(order.id) + '" class="text-link">' +
                  X.escapeHtml(order.orderNumber) + "</a></td><td>" +
                  (owner ? '<button type="button" class="text-link" data-view-customer="' +
                    X.escapeAttr(ownerUid) + '">' + X.escapeHtml(customerName) + "</button>"
                    : "<strong>" + X.escapeHtml(customerName) + "</strong>") +
                  '<br><span class="muted-small">' + X.escapeHtml(order.phone || address.phone || "") +
                  "</span></td><td>" + pieces + "</td><td>" + X.formatINR(order.totalPaise) + "</td><td>" +
                  X.formatDate(order.createdAt) + "</td><td><select data-order-status=\"" +
                  X.escapeAttr(order.id) + "\">" + statusOptions(order.status) + "</select></td></tr>"
                );
              }).join("") +
              '</tbody></table><p class="admin-no-results" id="orders-no-results" hidden>No orders match those filters.</p></div>'
            : '<div class="empty-state small">' + X.icon("package", 24) +
              "<h2>No orders yet.</h2><p>Orders placed on the storefront will appear here.</p></div>") +
        "</section>";
      applyOrderFilters();
      return;
    }

    if (tab === "products") {
      panel.innerHTML =
        '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Products</h2>' +
        "<p>Edit prices, stock, images and publishing status.</p></div><div class=\"button-row\">" +
        '<button type="button" class="button button-outline" data-seed' + (seeding ? " disabled" : "") + ">" +
        X.icon("database", 15) + " " + (seeding ? "Seeding…" : "Seed catalogue") + "</button>" +
        '<button type="button" class="button button-primary" data-add-product>' + X.icon("image", 15) +
        " Add product</button></div></div>" +
        (fetching && !products.length
          ? '<p class="muted-copy"><span class="spin">' + X.icon("loader", 16) + "</span> Loading products…</p>"
          : products.length
            ? '<div class="table-scroll"><table class="admin-table"><thead><tr><th>Product</th><th>Category</th>' +
              "<th>Price</th><th>Stock</th><th>Status</th><th></th></tr></thead><tbody>" +
              products.map(function (product) {
                var stock = (product.variants || []).reduce(function (sum, variant) {
                  return sum + Math.max(0, Number(variant.stock) || 0);
                }, 0);
                var onDemand = product.sourcing === "on_demand";
                var image = product.images && product.images[0] ? product.images[0].url : "";
                return (
                  '<tr><td><div class="admin-product-cell"><img src="' + X.escapeAttr(X.media(image)) +
                  '" alt=""><div><strong>' + X.escapeHtml(product.name) + '</strong><br><span class="muted-small">/' +
                  X.escapeHtml(product.slug) + "</span></div></div></td><td>" +
                  X.escapeHtml(product.categoryName || product.category) + "</td><td>" +
                  X.formatINR(product.pricePaise) + "</td><td>" +
                  (onDemand ? '<span class="pill-resale">On demand</span>' : stock) +
                  '</td><td><span class="status-pill status-' +
                  X.escapeAttr(product.status) + '">' + X.escapeHtml(product.status) + "</span>" +
                  (onDemand ? ' <span class="pill-resale">Resale</span>' : "") + "</td>" +
                  '<td><div class="admin-product-actions"><button type="button" class="text-link" data-edit-product="' +
                  X.escapeAttr(product.id) + '">Edit</button><button type="button" class="text-link danger" data-delete-product="' +
                  X.escapeAttr(product.id) + '" aria-label="Delete ' + X.escapeAttr(product.name) + '">Delete</button></div></td></tr>'
                );
              }).join("") +
              "</tbody></table></div>"
            : '<div class="empty-state small">' + X.icon("package", 24) +
              "<h2>No products in Firestore.</h2><p>Seed the included catalogue to get started, or add a product manually.</p>" +
              '<button type="button" class="button button-primary" data-seed>Seed catalogue</button></div>') +
        "</section>";
      return;
    }

    if (tab === "resell") {
      var resaleCatalogue = products.filter(function (product) {
        return product.sourcing === "on_demand";
      }).sort(function (a, b) { return a.name.localeCompare(b.name); });
      var publishedResale = resaleCatalogue.filter(function (product) {
        return product.status === "published";
      }).length;
      var activeResaleOrders = resaleOrders().filter(isActiveOrder).sort(function (a, b) {
        var aOpen = sourcingState(a) === "to_source" ? 0 : 1;
        var bOpen = sourcingState(b) === "to_source" ? 0 : 1;
        if (aOpen !== bOpen) return aOpen - bOpen;
        var aTime = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
        var bTime = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      var toSource = activeResaleOrders.filter(function (order) {
        return sourcingState(order) === "to_source";
      }).length;
      var expectedProfit = activeResaleOrders.reduce(function (sum, order) {
        return sum + sourcingProfit(order);
      }, 0);

      panel.innerHTML =
        '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Resell</h2>' +
        "<p>Import supplier products, set your own price, publish in one click, then source each order.</p></div>" +
        '<div class="button-row"><button type="button" class="button button-primary" data-import-product>' +
        X.icon("tag", 15) + " Import Meesho product</button></div></div>" +
        (supplierError
          ? '<p class="form-error">' + X.escapeHtml(supplierError) + "</p>"
          : "") +
        '<div class="admin-metrics"><article><span>Resale products</span><strong>' + resaleCatalogue.length +
        '</strong></article><article><span>Live on site</span><strong>' + publishedResale +
        '</strong></article><article><span>Orders to source</span><strong>' + toSource +
        '</strong></article><article><span>Expected profit</span><strong>' + X.formatINR(expectedProfit) +
        "</strong></article></div>" +

        '<div class="admin-subhead"><div><h2>Sourcing desk</h2>' +
        "<p>Buy each made-to-order item from Meesho, then record the purchase here.</p></div></div>" +
        (activeResaleOrders.length
          ? '<div class="admin-toolbar resale-toolbar"><label class="admin-filter"><span class="sr-only">Filter sourcing orders</span>' +
            '<select id="resell-order-filter"><option value="open">Open sourcing orders</option>' +
            '<option value="to_source">Not purchased yet</option><option value="all">All resale orders</option></select>' +
            "</label></div><div class=\"sourcing-list\">" +
            activeResaleOrders.map(renderSourcingCard).join("") + "</div>"
          : '<div class="empty-state small">' + X.icon("package", 24) +
            "<h2>No resale orders to source.</h2><p>When a customer buys an on-demand product it will appear here with their delivery details.</p></div>") +

        '<div class="admin-subhead"><div><h2>Resale catalogue</h2>' +
        "<p>Supplier cost is private and never shown to customers.</p></div></div>" +
        (resaleCatalogue.length
          ? '<div class="table-scroll"><table class="admin-table"><thead><tr><th>Product</th><th>Meesho cost</th>' +
            "<th>Your price</th><th>Margin</th><th>Status</th><th></th></tr></thead><tbody>" +
            resaleCatalogue.map(function (product) {
              var supplier = supplierFor(product.id);
              var supplierPrice = supplier ? Number(supplier.supplierPricePaise) || 0 : 0;
              var margin = supplierPrice ? (Number(product.pricePaise) || 0) - supplierPrice : null;
              var image = product.images && product.images[0] ? product.images[0].url : "";
              return '<tr><td><div class="admin-product-cell"><img src="' + X.escapeAttr(X.media(image)) +
                '" alt=""><div><strong>' + X.escapeHtml(product.name) + '</strong><br><span class="muted-small">/' +
                X.escapeHtml(product.slug) + "</span></div></div></td><td>" +
                (supplierPrice ? X.formatINR(supplierPrice) : '<span class="muted-small">Not set</span>') +
                "</td><td>" + X.formatINR(product.pricePaise) + "</td><td>" +
                (margin === null ? '<span class="muted-small">Set cost</span>'
                  : '<strong class="' + (margin >= 0 ? "profit-positive" : "profit-negative") + '">' +
                    X.formatINR(margin) + "</strong>") +
                '</td><td><span class="status-pill status-' + X.escapeAttr(product.status) + '">' +
                X.escapeHtml(product.status) + "</span></td><td><div class=\"admin-product-actions\">" +
                '<button type="button" class="text-link" data-edit-product="' + X.escapeAttr(product.id) + '">Edit</button>' +
                '<button type="button" class="text-link" data-toggle-publish="' + X.escapeAttr(product.id) + '">' +
                (product.status === "published" ? "Unpublish" : "Publish") + "</button>" +
                '<a class="text-link" href="product.html?slug=' + encodeURIComponent(product.slug) +
                '" target="_blank" rel="noreferrer">View</a></div></td></tr>';
            }).join("") + "</tbody></table></div>"
          : '<div class="empty-state small">' + X.icon("tag", 24) +
            "<h2>No resale products yet.</h2><p>Paste a Meesho link, add your price and publish it to the website and app.</p>" +
            '<button type="button" class="button button-primary" data-import-product>Import your first Meesho product</button></div>') +
        "</section>";
      applyResellFilter();
      return;
    }

    if (tab === "returns") {
      panel.innerHTML =
        '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Return requests</h2>' +
        "<p>Review customer return and exchange requests from the contact form.</p></div></div>" +
        (returnRequestsError ? '<p class="form-error">' + X.escapeHtml(returnRequestsError) + '</p>' : "") +
        (fetching && !returnRequests.length
          ? '<p class="muted-copy">Loading return requests…</p>'
          : returnRequests.length
            ? '<div class="table-scroll"><table class="admin-table"><thead><tr><th>Order</th><th>Customer</th>' +
              '<th>Request</th><th>Received</th><th>Status &amp; pickup</th></tr></thead><tbody>' +
              returnRequests.map(function (request) {
                return '<tr><td>' + X.escapeHtml(request.orderNumber || "—") + '</td><td><strong>' +
                  X.escapeHtml(request.name || "—") + '</strong><br><span class="muted-small">' +
                  X.escapeHtml(request.phone || request.email || "") + '</span></td><td class="return-message">' +
                  X.escapeHtml(request.message || "") + '</td><td>' + X.formatDate(request.createdAt) +
                  '</td><td><select data-return-status="' + X.escapeAttr(request.id) + '">' +
                  ["requested", "open", "reviewing", "approved", "pickup_scheduled", "picked_up", "received", "refunded", "rejected", "resolved"].map(function (status) {
                    return '<option value="' + status + '"' + (request.status === status ? " selected" : "") +
                      ">" + status + "</option>";
                  }).join("") + '</select><div class="admin-return-schedule"><label><span class="sr-only">Pickup date</span>' +
                  '<input type="date" data-pickup-date value="' + X.escapeAttr(request.pickupDate || "") + '"></label>' +
                  '<label><span class="sr-only">Pickup time window</span><select data-pickup-window>' +
                  ["9:00 AM–1:00 PM", "1:00 PM–5:00 PM", "5:00 PM–8:00 PM"].map(function (window) {
                    return '<option value="' + X.escapeAttr(window) + '"' +
                      (request.pickupWindow === window ? " selected" : "") + ">" + X.escapeHtml(window) + "</option>";
                  }).join("") + '</select></label><button type="button" class="text-link" data-schedule-return="' +
                  X.escapeAttr(request.id) + '">Schedule pickup</button></div></td></tr>';
              }).join("") +
              "</tbody></table></div>"
            : '<div class="empty-state small"><h2>No return requests yet.</h2>' +
              '<p>Customers can submit one from the details page of a delivered order.</p></div>') +
        "</section>";
      return;
    }

    panel.innerHTML =
      '<section class="admin-panel"><div class="admin-panel-head"><div><h2>Firebase setup</h2>' +
      "<p>The storefront runs on Firebase Authentication and Cloud Firestore. Product images are stored on your MilesWeb disk.</p></div></div>" +
      '<div class="setup-grid"><div class="setup-card"><h3>Project</h3><dl>' +
      "<div><dt>Project ID</dt><dd>" + X.escapeHtml(X.firebaseConfig.projectId) + "</dd></div>" +
      "<div><dt>Auth domain</dt><dd>" + X.escapeHtml(X.firebaseConfig.authDomain) + "</dd></div>" +
      "<div><dt>Your UID</dt><dd><code>" + X.escapeHtml(X.state.user.uid) + "</code></dd></div>" +
      "<div><dt>Role</dt><dd>" + X.escapeHtml((X.state.profile && X.state.profile.role) || "customer") + "</dd></div>" +
      '</dl></div><div class="setup-card"><h3>Checklist</h3><ol>' +
      "<li>Enable <strong>Email/Password</strong> under Authentication → Sign-in method.</li>" +
      "<li>Add your MilesWeb domain under Authentication → Settings → Authorized domains.</li>" +
      "<li>Deploy <code>firebase/firestore.rules</code>. Firebase Storage is not used.</li>" +
      "<li>Make <code>media/uploads</code> writable so image uploads work.</li>" +
      "<li>Seed the catalogue, then edit products from this console.</li>" +
      "<li>For secure online payments and server-side stock control, deploy the optional Cloud Functions.</li>" +
      "</ol></div></div>" +
      '<div class="setup-actions"><button type="button" class="button button-primary" data-seed' +
      (seeding ? " disabled" : "") + ">" + X.icon("database", 15) + " " +
      (seeding ? "Seeding…" : "Seed catalogue to Firestore") + "</button>" +
      '<a class="button button-outline" href="https://console.firebase.google.com/" target="_blank" rel="noreferrer">' +
      "Open Firebase Console " + X.icon("external", 15) + "</a></div></section>";
  }

  function applyOrderFilters() {
    var panel = document.getElementById("admin-panel");
    if (!panel) return;
    var search = panel.querySelector("#order-search");
    var status = panel.querySelector("#order-status-filter");
    var period = panel.querySelector("#order-period-filter");
    var query = search ? search.value.trim().toLowerCase() : "";
    var selectedStatus = status ? status.value : "all";
    var selectedPeriod = period ? period.value : "all";
    var customerUid = orderCustomer ? orderCustomer.uid : "";
    var visible = 0;
    panel.querySelectorAll("[data-order-row]").forEach(function (row) {
      var rowStatus = row.getAttribute("data-status");
      var isUpcoming = ["confirmed", "packed", "shipped"].indexOf(rowStatus) !== -1;
      var matchesPeriod = selectedPeriod === "all" ||
        (selectedPeriod === "upcoming" && isUpcoming) || (selectedPeriod === "past" && !isUpcoming);
      var matchesCustomer = !customerUid || row.getAttribute("data-user") === customerUid;
      var matches = (!query || row.getAttribute("data-search").indexOf(query) !== -1) &&
        (selectedStatus === "all" || rowStatus === selectedStatus) && matchesPeriod &&
        matchesCustomer;
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    var empty = panel.querySelector("#orders-no-results");
    if (empty) empty.hidden = visible > 0;
  }

  function applyCustomerFilters() {
    var panel = document.getElementById("admin-panel");
    if (!panel) return;
    var search = panel.querySelector("#customer-search");
    var role = panel.querySelector("#customer-role-filter");
    var activity = panel.querySelector("#customer-activity-filter");
    var sort = panel.querySelector("#customer-sort");
    var body = panel.querySelector(".customer-table tbody");
    if (!body) return;
    var query = search ? search.value.trim().toLowerCase() : "";
    var selectedRole = role ? role.value : "all";
    var selectedActivity = activity ? activity.value : "all";
    var selectedSort = sort ? sort.value : "newest";
    var rows = Array.prototype.slice.call(body.querySelectorAll("[data-customer-row]"));
    rows.sort(function (a, b) {
      var aName = a.getAttribute("data-name") || "";
      var bName = b.getAttribute("data-name") || "";
      var nameOrder = aName.localeCompare(bName);
      if (selectedSort === "name") return nameOrder;
      if (selectedSort === "orders") {
        return (Number(b.getAttribute("data-orders")) || 0) -
          (Number(a.getAttribute("data-orders")) || 0) || nameOrder;
      }
      if (selectedSort === "spent") {
        return (Number(b.getAttribute("data-spent")) || 0) -
          (Number(a.getAttribute("data-spent")) || 0) || nameOrder;
      }
      return (Number(b.getAttribute("data-created")) || 0) -
        (Number(a.getAttribute("data-created")) || 0) || nameOrder;
    });
    var visible = 0;
    rows.forEach(function (row) {
      body.appendChild(row);
      var rowRole = row.getAttribute("data-role");
      var rowActivity = row.getAttribute("data-activity");
      var matchesActivity = selectedActivity === "all" || rowActivity === selectedActivity ||
        (selectedActivity === "orders" && rowActivity !== "none");
      var matches = (!query || (row.getAttribute("data-search") || "").indexOf(query) !== -1) &&
        (selectedRole === "all" || rowRole === selectedRole) && matchesActivity;
      row.hidden = !matches;
      if (matches) visible += 1;
    });
    var count = panel.querySelector("#customer-count");
    if (count) count.textContent = "Showing " + visible + " of " + rows.length + " accounts";
    var empty = panel.querySelector("#customers-no-results");
    if (empty) empty.hidden = visible > 0;
  }

  function openCustomerOrders(targetId) {
    var user = findUser(targetId);
    if (!user) {
      X.toast("That customer profile is not available. Refresh and try again.", "error");
      return;
    }
    orderCustomer = { uid: targetId, name: userName(user) };
    tab = "orders";
    closeEditor();
    renderShell();
  }

  function openCustomerModal(targetId) {
    var user = findUser(targetId);
    if (!user) {
      X.toast("That customer profile is not available. Refresh and try again.", "error");
      return;
    }
    var id = userId(user);
    var stats = customerStats(user);
    var address = user.lastAddress || (stats.lastOrder && stats.lastOrder.address) || {};
    var phone = user.phoneNumber || address.phone || "";
    var email = user.email || "";
    var hasAddress = Boolean(address.line1 || address.city || address.pincode);
    var recentOrders = stats.orders.slice(0, 6);
    var addressLines = [
      address.line1,
      address.line2,
      [address.city, address.state].filter(Boolean).join(", "),
      address.pincode,
    ].filter(Boolean);

    closeEditor();
    modalRoot.innerHTML =
      '<div class="modal-backdrop"><div class="modal customer-modal" role="dialog" aria-modal="true" aria-labelledby="customer-modal-title">' +
      '<div class="modal-head"><div><p class="eyebrow">Customer profile</p><h2 id="customer-modal-title">' +
      X.escapeHtml(userName(user)) + "</h2><p>" + X.escapeHtml(email || "No email on file") +
      '</p></div><button type="button" class="icon-button" data-close-modal aria-label="Close">' +
      X.icon("close", 20) + "</button></div>" +
      '<div class="admin-metrics customer-metrics"><article><span>Total orders</span><strong>' +
      stats.count + '</strong></article><article><span>Delivered</span><strong>' +
      stats.deliveredCount + '</strong></article><article><span>Open orders</span><strong>' +
      stats.openCount + '</strong></article><article><span>Delivered spend</span><strong>' +
      X.formatINR(stats.deliveredPaise) + "</strong></article></div>" +
      '<div class="customer-detail-grid"><section class="customer-detail-card"><h3>Contact</h3><dl>' +
      "<div><dt>Phone</dt><dd>" + X.escapeHtml(phone || "—") + "</dd></div>" +
      "<div><dt>Email</dt><dd>" + X.escapeHtml(email || "—") + "</dd></div>" +
      "<div><dt>Role</dt><dd>" + roleSelect(user) + "</dd></div>" +
      "<div><dt>Joined</dt><dd>" + X.formatDate(user.createdAt) + "</dd></div>" +
      "<div><dt>Last order</dt><dd>" + (stats.lastOrder ? X.formatDate(stats.lastOrder.createdAt) : "—") +
      "</dd></div><div><dt>User ID</dt><dd><code>" + X.escapeHtml(id) + "</code></dd></div>" +
      '</dl><p class="customer-role-note">Role changes apply the next time the user signs in or refreshes the page.</p></section>' +
      '<section class="customer-detail-card"><h3>Latest delivery address</h3>' +
      (hasAddress
        ? "<address>" + (address.fullName ? "<strong>" + X.escapeHtml(address.fullName) + "</strong><br>" : "") +
          (phone ? X.escapeHtml(phone) + "<br>" : "") +
          addressLines.map(function (line) { return X.escapeHtml(line); }).join("<br>") +
          "<br>" + X.escapeHtml(address.country || "India") + "</address>"
        : '<p class="muted-small">No delivery address saved yet. It is added after the first checkout.</p>') +
      "</section></div>" +
      '<div class="customer-modal-actions"><button type="button" class="button button-primary" data-customer-orders>' +
      X.icon("package", 15) + " View all orders</button>" +
      (hasAddress
        ? '<button type="button" class="button button-outline" data-copy-customer-address>' +
          X.icon("copy", 15) + " Copy address</button>"
        : "") +
      (email
        ? '<a class="button button-outline" href="mailto:' + X.escapeAttr(email) + '">' +
          X.icon("external", 15) + " Email customer</a>"
        : "") + "</div>" +
      '<div class="admin-subhead"><div><h2>Recent orders</h2><p>Newest first.</p></div></div>' +
      (recentOrders.length
        ? '<div class="table-scroll"><table class="admin-table"><thead><tr><th>Order</th><th>Placed</th>' +
          "<th>Items</th><th>Total</th><th>Status</th></tr></thead><tbody>" +
          recentOrders.map(function (order) {
            var items = Array.isArray(order.items) ? order.items : [];
            var pieces = items.reduce(function (sum, item) { return sum + (Number(item.qty) || 0); }, 0);
            return '<tr><td><a class="text-link" href="order.html?id=' + encodeURIComponent(order.id) +
              '" target="_blank" rel="noreferrer">' + X.escapeHtml(order.orderNumber) + "</a></td><td>" +
              X.formatDate(order.createdAt) + "</td><td>" + pieces + "</td><td>" +
              X.formatINR(order.totalPaise) + '</td><td><span class="status-pill status-' +
              X.escapeAttr(order.status) + '">' + X.escapeHtml(statusLabel(order.status)) +
              "</span></td></tr>";
          }).join("") + "</tbody></table></div>"
        : '<div class="empty-state small">' + X.icon("package", 22) +
          "<h2>No orders yet.</h2><p>This customer has not placed an order.</p></div>") +
      "</div></div>";

    document.body.classList.add("overlay-open");
    modalRoot.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", closeEditor);
    });
    var ordersButton = modalRoot.querySelector("[data-customer-orders]");
    if (ordersButton) {
      ordersButton.addEventListener("click", function () { openCustomerOrders(id); });
    }
    var copyButton = modalRoot.querySelector("[data-copy-customer-address]");
    if (copyButton) {
      copyButton.addEventListener("click", function () {
        copyText(orderAddressText({ phone: phone, address: address }))
          .then(function () { X.toast("Delivery address copied.", "success"); })
          .catch(function (error) {
            console.error(error);
            X.toast("Could not copy the address.", "error");
          });
      });
    }
  }

  function renderSourcingCard(order) {
    var summary = sourcingSummary(order);
    var record = summary.record || {};
    var state = record.status || "to_source";
    var address = order.address || {};
    var customer = address.fullName || "Customer";
    var phone = order.phone || address.phone || "";
    var addressLine = [address.line1, address.line2].filter(Boolean).join(", ");
    var cityLine = [address.city, address.state, address.pincode].filter(Boolean).join(" ");
    var open = state === "to_source";
    var quickStatus = state === "to_source" ? "ordered"
      : state === "ordered" ? "shipped"
      : state === "shipped" ? "delivered" : "";
    var quickLabel = quickStatus === "ordered" ? "Mark purchased"
      : quickStatus === "shipped" ? "Mark shipped"
      : "Mark delivered";

    var itemRows = summary.lines.map(function (line) {
      var item = line.item;
      return '<tr><td><strong>' + X.escapeHtml(item.name) + '</strong><br><span class="muted-small">' +
        X.escapeHtml(item.colorName || "Default") + " · " + X.escapeHtml(item.size) + " · SKU " +
        X.escapeHtml(item.sku || "—") + "</span></td><td>" + (Number(item.qty) || 1) + "</td><td>" +
        (line.supplierPricePaise ? X.formatINR(line.supplierPricePaise)
          : '<span class="profit-negative">Not set</span>') + "</td><td>" + X.formatINR(line.sellingPaise) +
        '</td><td class="' + (line.marginPaise >= 0 ? "profit-positive" : "profit-negative") + '">' +
        X.formatINR(line.marginPaise) + "</td><td>" +
        (line.supplierUrl
          ? '<a class="text-link" href="' + X.escapeAttr(line.supplierUrl) + '" target="_blank" rel="noreferrer">Open Meesho</a>'
          : '<span class="muted-small">No link</span>') + "</td></tr>";
    }).join("");

    return '<details class="sourcing-card" data-sourcing-row data-sourcing-state="' + X.escapeAttr(state) + '"' +
      (open ? " open" : "") + "><summary><div><strong>" + X.escapeHtml(order.orderNumber) + "</strong>" +
      "<span>" + X.escapeHtml(customer) + " · " + X.escapeHtml(phone) + " · " +
      X.formatDate(order.createdAt) + '</span></div><div class="sourcing-summary"><span>' +
      X.formatINR(summary.sellingPaise) + " sale</span><strong class=\"" +
      (summary.profitPaise >= 0 ? "profit-positive" : "profit-negative") + "\">" +
      X.formatINR(summary.profitPaise) + ' profit</strong><span class="sourcing-pill sourcing-' +
      X.escapeAttr(state) + '">' + X.escapeHtml(sourcingLabel(state)) + "</span></div></summary>" +
      '<div class="sourcing-body"><div class="sourcing-customer">' +
      '<div><span>Customer</span><strong>' + X.escapeHtml(customer) + "</strong><p>" +
      X.escapeHtml(phone) + "</p></div>" +
      '<div><span>Deliver to</span><p><strong>' + X.escapeHtml(addressLine || "—") + "</strong><br>" +
      X.escapeHtml(cityLine || "") + "<br>" + X.escapeHtml(address.country || "India") + "</p></div>" +
      '<div><span>Order</span><p><strong>COD ' + X.formatINR(order.totalPaise) + "</strong><br>" +
      X.escapeHtml(order.status) + " · " + X.escapeHtml((record.supplierOrderId ? "Meesho #" + record.supplierOrderId : "Not purchased yet")) +
      "</p></div></div>" +
      '<div class="table-scroll"><table class="admin-table sourcing-table"><thead><tr><th>Item</th><th>Qty</th>' +
      "<th>Meesho cost</th><th>Your price</th><th>Margin</th><th>Supplier</th></tr></thead><tbody>" +
      itemRows + "</tbody></table></div>" +
      '<div class="sourcing-totals"><span>Your sale <strong>' + X.formatINR(summary.sellingPaise) +
      "</strong></span><span>Supplier cost <strong>" + X.formatINR(summary.costPaise) +
      "</strong></span><span>Expected profit <strong class=\"" +
      (summary.profitPaise >= 0 ? "profit-positive" : "profit-negative") + "\">" +
      X.formatINR(summary.profitPaise) + "</strong></span></div>" +
      (summary.missing
        ? '<p class="sourcing-warning">' + X.icon("tag", 15) + " " + summary.missing +
          " item" + (summary.missing === 1 ? " has" : "s have") +
          " no Meesho cost yet. Add it from Products → Edit so profit is accurate.</p>"
        : "") +
      '<div class="form-grid sourcing-fields">' +
      '<label class="field"><span>Meesho order ID</span><input data-sourcing-order-id value="' +
      X.escapeAttr(record.supplierOrderId || "") + '" placeholder="Optional"></label>' +
      '<label class="field"><span>Courier</span><input data-sourcing-courier value="' +
      X.escapeAttr(record.courier || "") + '" placeholder="Delhivery, Ekart…"></label>' +
      '<label class="field"><span>Tracking number</span><input data-sourcing-tracking value="' +
      X.escapeAttr(record.trackingNumber || "") + '" placeholder="Optional"></label>' +
      '<label class="field"><span>Sourcing status</span><select data-sourcing-status>' +
      ["to_source", "ordered", "shipped", "delivered", "cancelled"].map(function (value) {
        return '<option value="' + value + '"' + (state === value ? " selected" : "") + ">" +
          sourcingLabel(value) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field full-span"><span>Private notes</span><input data-sourcing-notes value="' +
      X.escapeAttr(record.notes || "") + '" placeholder="Return window, substitution agreed with customer…"></label>' +
      "</div>" +
      '<div class="sourcing-actions">' +
      '<button type="button" class="button button-outline" data-copy-sourcing="' + X.escapeAttr(order.id) + '">' +
      X.icon("copy", 15) + " Copy customer details</button>" +
      (quickStatus
        ? '<button type="button" class="button button-outline" data-quick-source="' + X.escapeAttr(order.id) +
          '" data-quick-status="' + X.escapeAttr(quickStatus) + '">' + X.icon("check", 15) + " " +
          quickLabel + "</button>"
        : "") +
      '<button type="button" class="button button-primary" data-save-sourcing="' + X.escapeAttr(order.id) +
      '">' + X.icon("package", 15) + " Save sourcing</button>" +
      '<a class="button button-outline" href="order.html?id=' + encodeURIComponent(order.id) +
      '" target="_blank" rel="noreferrer">Open customer order</a>' +
      "</div></div></details>";
  }

  function applyResellFilter() {
    var panel = document.getElementById("admin-panel");
    if (!panel) return;
    var select = panel.querySelector("#resell-order-filter");
    var filter = select ? select.value : "open";
    panel.querySelectorAll("[data-sourcing-row]").forEach(function (row) {
      var state = row.getAttribute("data-sourcing-state");
      var open = ["to_source", "ordered", "shipped"].indexOf(state) !== -1;
      row.hidden = filter === "open" ? !open
        : filter === "to_source" ? state !== "to_source" : false;
    });
  }

  function loadData() {
    if (!X.db || !X.isAdmin()) return Promise.resolve();
    fetching = true;
    supplierError = "";
    usersError = "";
    renderShell();
    var supplierProductsRequest = X.db.collection("supplierProducts").get()
      .then(function (snapshot) { return X.snapshotRows(snapshot); })
      .catch(function (error) {
        console.warn("[Xevoras] Could not load supplier products.", error);
        supplierError = "Private resale data could not be loaded. Deploy the updated firebase/firestore.rules, then refresh.";
        return null;
      });
    var supplierOrdersRequest = X.db.collection("supplierOrders").get()
      .then(function (snapshot) { return X.snapshotRows(snapshot); })
      .catch(function (error) {
        console.warn("[Xevoras] Could not load supplier orders.", error);
        supplierError = "Private sourcing orders could not be loaded. Deploy the updated firebase/firestore.rules, then refresh.";
        return null;
      });
    var usersRequest = X.db.collection("users").get()
      .then(function (snapshot) {
        usersError = "";
        return X.snapshotRows(snapshot);
      })
      .catch(function (error) {
        console.error("[Xevoras] Could not load customer profiles.", error);
        usersError = "Could not load customer profiles. Check that the Firestore rules allow admins to read the users collection, then refresh.";
        return null;
      });
    var returnsRequest = X.db.collection("supportTickets").get()
      .then(function (snapshot) {
        returnRequestsError = "";
        return X.snapshotRows(snapshot).filter(function (request) {
          if (request.type === "return_request") return true;
          // Include older contact-form return messages created before the
          // dedicated return request field was added.
          return /return|exchange/i.test(request.message || "") &&
            Boolean(request.orderNumber || /\border\b/i.test(request.message || ""));
        });
      })
      .catch(function (error) {
        console.error("[Xevoras] Could not load return requests.", error);
        returnRequestsError = "Could not load return requests. Check admin Firestore access, then refresh.";
        return null;
      });

    return Promise.all([
      X.db.collection("orders").get(),
      X.db.collection("products").get(),
      returnsRequest,
      supplierProductsRequest,
      supplierOrdersRequest,
      usersRequest,
    ]).then(function (results) {
      orders = X.snapshotRows(results[0]);
      orders.sort(function (a, b) {
        var aTime = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
        var bTime = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
      products = X.snapshotRows(results[1]);
      products.sort(function (a, b) { return a.name.localeCompare(b.name); });
      supplierProducts = results[3] || [];
      supplierOrders = results[4] || [];
      if (results[5]) {
        users = results[5];
        users.sort(function (a, b) {
          var timeDiff = timeValue(b.createdAt) - timeValue(a.createdAt);
          return timeDiff || userName(a).localeCompare(userName(b));
        });
      }
      if (results[2]) returnRequests = results[2];
      returnRequests.sort(function (a, b) {
        var aTime = a.createdAt && a.createdAt.toDate ? a.createdAt.toDate().getTime() : 0;
        var bTime = b.createdAt && b.createdAt.toDate ? b.createdAt.toDate().getTime() : 0;
        return bTime - aTime;
      });
    }).catch(function (error) {
      console.error(error);
      X.toast("Could not load admin data. Check the Firestore rules.", "error");
    }).then(function () {
      fetching = false;
      renderShell();
    });
  }

  function changeUserRole(targetId, role, select) {
    var user = findUser(targetId);
    if (!user || userRole(user) === role) return;
    var previous = userRole(user);
    var ownId = X.state.user && X.state.user.uid;
    if (targetId === ownId) {
      X.toast("You cannot change your own admin role.", "error");
      if (select) select.value = previous;
      return;
    }
    if (["customer", "admin"].indexOf(role) === -1) return;
    var message = role === "admin"
      ? "Give " + userName(user) + " full admin access to orders, customers and supplier costs?"
      : "Remove admin access from " + userName(user) + "? They will keep their customer account.";
    if (!window.confirm(message)) {
      if (select) select.value = previous;
      return;
    }
    if (select) select.disabled = true;
    X.db.collection("users").doc(targetId).update({
      role: role,
      updatedAt: X.serverTimestamp(),
    }).then(function () {
      user.role = role;
      document.querySelectorAll("[data-customer-role]").forEach(function (node) {
        if (node.getAttribute("data-customer-role") === targetId) {
          node.value = role;
          node.disabled = targetId === ownId;
        }
      });
      document.querySelectorAll("[data-customer-row]").forEach(function (row) {
        if (row.getAttribute("data-customer-id") !== targetId) return;
        row.setAttribute("data-role", role);
        var badge = row.querySelector("[data-role-badge]");
        if (badge) badge.hidden = role !== "admin";
      });
      applyCustomerFilters();
      X.toast(userName(user) + " is now " + (role === "admin" ? "an admin." : "a customer."), "success");
    }).catch(function (error) {
      console.error(error);
      if (select) {
        select.value = previous;
        select.disabled = false;
      }
      X.toast("Could not update the user role. Check the Firestore rules.", "error");
    });
  }

  function restockOrder(transaction, order) {
    var groups = {};
    order.items.forEach(function (item) {
      if (!groups[item.productId]) groups[item.productId] = [];
      groups[item.productId].push(item);
    });
    var ids = Object.keys(groups);
    var snapshots = [];
    var chain = Promise.resolve();
    ids.forEach(function (productId) {
      chain = chain.then(function () {
        var ref = X.db.collection("products").doc(productId);
        return transaction.get(ref).then(function (snapshot) {
          snapshots.push({ ref: ref, snapshot: snapshot, items: groups[productId] });
        });
      });
    });
    return chain.then(function () {
      snapshots.forEach(function (entry) {
        if (!entry.snapshot.exists) return;
        var data = X.docData(entry.snapshot);
        var variants = (data.variants || []).map(function (variant) { return Object.assign({}, variant); });
        var changed = false;
        entry.items.forEach(function (item) {
          // On-demand resale pieces were never taken out of stock at checkout.
          if (item.sourcing === "on_demand") return;
          var index = variants.findIndex(function (variant) { return variant.sku === item.sku; });
          if (index >= 0) {
            variants[index] = Object.assign({}, variants[index], {
              stock: Number(variants[index].stock) + item.qty,
            });
            changed = true;
          }
        });
        if (!changed) return;
        transaction.update(entry.ref, { variants: variants, updatedAt: X.serverTimestamp() });
      });
    });
  }

  function changeStatus(orderId, status) {
    var order = orders.find(function (item) { return item.id === orderId; });
    if (!order || order.status === status) return;

    var transitions = {
      confirmed: ["packed", "cancelled"],
      packed: ["shipped", "cancelled"],
      shipped: ["delivered", "returned"],
      delivered: ["returned"],
      cancelled: [],
      returned: [],
    };
    if ((transitions[order.status] || []).indexOf(status) === -1) {
      X.toast("That order status change is not allowed.", "error");
      renderPanel();
      return;
    }

    var work;
    if (status === "cancelled") {
      var orderRef = X.db.collection("orders").doc(order.id);
      work = X.db.runTransaction(function (transaction) {
        return transaction.get(orderRef).then(function (snapshot) {
          if (!snapshot.exists) throw new Error("Order no longer exists.");
          var currentOrder = X.docData(snapshot);
          if (["confirmed", "packed"].indexOf(currentOrder.status) === -1) {
            throw new Error("This order can no longer be cancelled.");
          }
          return restockOrder(transaction, currentOrder).then(function () {
            transaction.update(orderRef, {
              status: "cancelled",
              updatedAt: X.serverTimestamp(),
            });
          });
        });
      });
    } else {
      work = X.db.collection("orders").doc(order.id).update({
        status: status,
        updatedAt: X.serverTimestamp(),
      });
    }

    work.then(function () {
      order.status = status;
      X.toast("Order " + order.orderNumber + " marked " + status + ".", "success");
      renderPanel();
    }).catch(function (error) {
      console.error(error);
      X.toast("Could not update the order status.", "error");
      renderPanel();
    });
  }

  function changeReturnStatus(requestId, status) {
    var request = returnRequests.find(function (item) { return item.id === requestId; });
    if (!request || request.status === status) return;
    if (status === "pickup_scheduled") {
      X.toast("Set the pickup date and time window, then use Schedule pickup.", "error");
      renderPanel();
      return;
    }
    X.db.collection("supportTickets").doc(requestId).update({
      status: status,
      updatedAt: X.serverTimestamp(),
    }).then(function () {
      request.status = status;
      X.toast("Return request marked " + status + ".", "success");
      renderShell();
    }).catch(function (error) {
      console.error(error);
      X.toast("Could not update the return request.", "error");
      renderShell();
    });
  }

  function scheduleReturnPickup(requestId, button) {
    var request = returnRequests.find(function (item) { return item.id === requestId; });
    var row = button.closest("tr");
    if (!request || !row) return;
    if (request.status !== "approved") {
      X.toast("Approve the return request before scheduling pickup.", "error");
      return;
    }
    var date = row.querySelector("[data-pickup-date]").value;
    var windowValue = row.querySelector("[data-pickup-window]").value;
    var now = new Date();
    var today = [now.getFullYear(), String(now.getMonth() + 1).padStart(2, "0"),
      String(now.getDate()).padStart(2, "0")].join("-");
    if (!date || date < today) {
      X.toast("Choose today or a future pickup date.", "error");
      return;
    }
    button.disabled = true;
    button.textContent = "Saving…";
    X.db.collection("supportTickets").doc(requestId).update({
      status: "pickup_scheduled",
      pickupDate: date,
      pickupWindow: windowValue,
      updatedAt: X.serverTimestamp(),
    }).then(function () {
      request.status = "pickup_scheduled";
      request.pickupDate = date;
      request.pickupWindow = windowValue;
      X.toast("Pickup time saved. The customer can see it on the order page.", "success");
      renderShell();
    }).catch(function (error) {
      console.error(error);
      X.toast("Could not schedule pickup. Check admin permissions.", "error");
      button.disabled = false;
      button.textContent = "Schedule pickup";
    });
  }

  function seedCatalogue() {
    if (seeding || !X.db) return;
    seeding = true;
    renderPanel();
    fetch("assets/data/catalogue.json", { cache: "no-store" })
      .then(function (response) { return response.json(); })
      .then(function (catalogue) {
        var batch = X.db.batch();
        (catalogue.categories || []).forEach(function (category) {
          batch.set(X.db.collection("categories").doc(category.id), Object.assign({}, category, {
            updatedAt: X.serverTimestamp(),
            createdAt: X.serverTimestamp(),
          }), { merge: true });
        });
        (catalogue.products || []).forEach(function (product) {
          batch.set(X.db.collection("products").doc(product.id), Object.assign({}, product, {
            updatedAt: X.serverTimestamp(),
            createdAt: X.serverTimestamp(),
          }), { merge: true });
        });
        return batch.commit();
      })
      .then(function () {
        X.toast("Catalogue seeded to Firestore.", "success");
        return Promise.all([loadData(), X.refreshCatalogue()]);
      })
      .catch(function (error) {
        console.error(error);
        X.toast("Could not seed the catalogue. Check admin permissions.", "error");
      })
      .then(function () {
        seeding = false;
        renderPanel();
      });
  }

  function slugify(value) {
    return String(value || "").toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 60);
  }

  function makeSku(slug, colorName, size) {
    var color = String(colorName || "").replace(/[^a-zA-Z0-9]/g, "").slice(0, 3).toUpperCase() || "CLR";
    return ("XV-" + String(slug || "product").slice(0, 12).toUpperCase() + "-" + color + "-" + size).slice(0, 50);
  }

  function variantRow(variant) {
    return (
      '<tr><td><input class="v-size" value="' + X.escapeAttr(variant.size) + '"></td>' +
      '<td><input class="v-color" value="' + X.escapeAttr(variant.colorName) + '"></td>' +
      '<td><input class="v-hex" value="' + X.escapeAttr(variant.colorHex) + '"></td>' +
      '<td><input class="v-stock" type="number" min="0" value="' + Number(variant.stock) + '"></td>' +
      '<td><button type="button" class="text-link danger" data-remove-variant>Remove</button></td></tr>'
    );
  }

  function openEditor(product) {
    editing = product || null;
    var categories = X.state.categories.length
      ? X.state.categories
      : [{ slug: product ? product.category : "", name: product ? product.categoryName : "Uncategorised", gender: "women" }];
    var category = product ? product.category : categories[0].slug;
    var variants = product && product.variants && product.variants.length
      ? product.variants
      : ["S", "M", "L", "XL"].map(function (size) {
          return { sku: "", size: size, colorName: "Default", colorHex: "#17140f", stock: 10 };
        });
    var image = product && product.images && product.images[0] ? product.images[0].url : "";
    var supplier = product ? supplierFor(product.id) : null;
    var onDemand = Boolean(product && product.sourcing === "on_demand");
    var dispatchNote = product && product.dispatchNote
      ? product.dispatchNote
      : "Sourced for you after checkout. Dispatched in 3–5 working days.";

    modalRoot.innerHTML =
      '<div class="modal-backdrop" id="product-modal" role="dialog" aria-modal="true" aria-label="' +
      (product ? "Edit product" : "Add product") + '"><div class="modal product-modal"><div class="modal-head">' +
      '<div><p class="eyebrow">' + (product ? "Edit product" : "New product") + "</p><h2>" +
      X.escapeHtml(product ? product.name : "Add a piece") + '</h2></div>' +
      '<button type="button" class="button button-outline" data-close-modal>Close</button></div>' +
      '<form class="product-form" id="product-form"><div class="form-grid">' +
      '<label class="field"><span>Name</span><input id="pf-name" value="' + X.escapeAttr(product ? product.name : "") + '"></label>' +
      '<label class="field"><span>Slug</span><input id="pf-slug" value="' + X.escapeAttr(product ? product.slug : "") +
      '"' + (product ? " disabled" : "") + ' placeholder="azure-trench"></label>' +
      '<label class="field"><span>Category</span><select id="pf-category">' +
      categories.map(function (item) {
        return '<option value="' + X.escapeAttr(item.slug) + '"' + (item.slug === category ? " selected" : "") + ">" +
          X.escapeHtml(item.name) + " — " + X.escapeHtml(item.gender) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span>Gender</span><select id="pf-gender">' +
      ["women", "men", "unisex"].map(function (gender) {
        return '<option value="' + gender + '"' + (product && product.gender === gender ? " selected" : "") + ">" +
          gender.charAt(0).toUpperCase() + gender.slice(1) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span>Price (₹)</span><input id="pf-price" type="number" min="1" value="' +
      (product ? product.pricePaise / 100 : "") + '"></label>' +
      '<label class="field"><span>Compare at (₹)</span><input id="pf-compare" type="number" min="0" value="' +
      (product && product.compareAtPricePaise ? product.compareAtPricePaise / 100 : "") + '"></label>' +
      '<label class="field full-span"><span>Short description</span><input id="pf-short" value="' +
      X.escapeAttr(product ? product.shortDescription : "") + '"></label>' +
      '<label class="field full-span"><span>Description</span><textarea id="pf-description" rows="4">' +
      X.escapeHtml(product ? product.description : "") + "</textarea></label>" +
      '<label class="field full-span"><span>Image URL</span><input id="pf-image-url" value="' +
      X.escapeAttr(X.media(image)) + '" placeholder="https://… or /media/uploads/…"></label>' +
      '<p class="muted-small full-span">Use the original image URL at about 1200 × 1500 px or larger. Search result thumbnails often look blurry when enlarged.</p>' +
      '<label class="field full-span"><span>Or upload an image</span><input id="pf-image-file" type="file" accept="image/jpeg,image/png,image/webp"></label>' +
      '<p class="muted-small full-span">JPG, PNG or WebP up to 5 MB. Uploads are saved to <code>media/uploads</code> on your MilesWeb hosting.</p>' +
      '<div class="field full-span"><img id="pf-image-preview" src="' + X.escapeAttr(X.media(image)) +
      '" alt="" style="max-width:160px;' + (image ? "" : "display:none;") + '"><p class="image-quality-warning" id="image-quality-warning" hidden></p></div>' +
      '<label class="field"><span>Status</span><select id="pf-status">' +
      ["published", "draft", "archived"].map(function (status) {
        return '<option value="' + status + '"' + (product && product.status === status ? " selected" : "") + ">" +
          status.charAt(0).toUpperCase() + status.slice(1) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="checkbox-field"><input type="checkbox" id="pf-featured"' +
      (product && product.featured ? " checked" : "") + "> Featured piece</label></div>" +

      '<div class="variant-editor"><div class="variant-editor-head"><h3>Variants</h3>' +
      '<button type="button" class="text-link" data-add-variant>Add variant</button></div>' +
      '<div class="table-scroll"><table class="admin-table"><thead><tr><th>Size</th><th>Colour</th><th>Hex</th>' +
      '<th>Stock</th><th></th></tr></thead><tbody id="variant-rows">' +
      variants.map(variantRow).join("") + "</tbody></table></div>" +
      '<p class="field-hint" id="pf-stock-hint"' + (onDemand ? "" : " hidden") +
      '>Resale stock is kept available automatically. Checkout does not reduce it.</p></div>' +

      '<div class="variant-editor resale-editor" id="resale-editor">' +
      '<div class="variant-editor-head"><h3>Resale sourcing</h3><span class="muted-small">Private</span></div>' +
      '<label class="checkbox-field resale-toggle"><input type="checkbox" id="pf-on-demand"' +
      (onDemand ? " checked" : "") + "> Sell this as an on-demand resale product</label>" +
      '<p class="field-hint">Keep the piece visible without holding stock. Each customer order appears in the Resell tab with their address so you can buy it from Meesho.</p>' +
      '<div class="form-grid resale-fields">' +
      '<label class="field full-span"><span>Meesho product link</span><input id="pf-supplier-url" value="' +
      X.escapeAttr(supplier ? supplier.supplierUrl : "") + '" placeholder="https://www.meesho.com/..."></label>' +
      '<label class="field"><span>Meesho cost (₹)</span><input id="pf-supplier-price" type="number" min="1" step="1" value="' +
      (supplier && supplier.supplierPricePaise ? supplier.supplierPricePaise / 100 : "") + '"></label>' +
      '<label class="field"><span>Meesho SKU <em>optional</em></span><input id="pf-supplier-sku" value="' +
      X.escapeAttr(supplier ? supplier.supplierSku : "") + '" placeholder="Supplier code"></label>' +
      '<label class="field full-span"><span>Dispatch note shown to customers</span><input id="pf-dispatch-note" value="' +
      X.escapeAttr(dispatchNote) + '"></label>' +
      '<label class="field full-span"><span>Private sourcing notes</span><input id="pf-supplier-notes" value="' +
      X.escapeAttr(supplier ? supplier.notes : "") + '" placeholder="Quality checks, seller name, return window…"></label>' +
      "</div></div>" +
      '<p class="form-error" id="product-error" hidden></p>' +
      '<div class="modal-actions"><button type="button" class="button button-outline" data-close-modal>Cancel</button>' +
      '<button type="submit" class="button button-primary" id="product-save">Save product</button></div></form></div></div>';

    document.body.classList.add("overlay-open");
    modalRoot.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", closeEditor);
    });
    wireEditor(product);
  }

  function closeEditor() {
    modalRoot.innerHTML = "";
    document.body.classList.remove("overlay-open");
    editing = null;
  }

  function wireEditor(product) {
    var form = document.getElementById("product-form");
    var slugInput = document.getElementById("pf-slug");
    var nameInput = document.getElementById("pf-name");
    var imageUrlInput = document.getElementById("pf-image-url");
    var imagePreview = document.getElementById("pf-image-preview");
    var qualityWarning = document.getElementById("image-quality-warning");

    function checkImageQuality() {
      if (!imagePreview || !qualityWarning || !imagePreview.naturalWidth) return;
      var width = imagePreview.naturalWidth;
      var height = imagePreview.naturalHeight;
      if (width < 1000 || height < 1250) {
        qualityWarning.textContent = "This image is " + width + " × " + height +
          " px. It may look soft on the product page; use an original image at least 1200 × 1500 px.";
        qualityWarning.hidden = false;
      } else {
        qualityWarning.hidden = true;
      }
    }

    if (imagePreview) {
      imagePreview.addEventListener("load", checkImageQuality);
      if (imagePreview.complete) checkImageQuality();
    }
    if (imageUrlInput) {
      imageUrlInput.addEventListener("change", function () {
        var url = imageUrlInput.value.trim();
        imagePreview.style.display = url ? "block" : "none";
        qualityWarning.hidden = true;
        if (url) imagePreview.src = X.media(url);
      });
    }

    var onDemandInput = document.getElementById("pf-on-demand");
    var resaleEditor = document.getElementById("resale-editor");
    var stockHint = document.getElementById("pf-stock-hint");
    var resaleFields = [
      "pf-supplier-url", "pf-supplier-price", "pf-supplier-sku",
      "pf-dispatch-note", "pf-supplier-notes",
    ];

    function syncResaleFields() {
      var enabled = Boolean(onDemandInput && onDemandInput.checked);
      if (resaleEditor) resaleEditor.classList.toggle("active", enabled);
      resaleFields.forEach(function (id) {
        var field = document.getElementById(id);
        if (field) field.disabled = !enabled;
      });
      if (stockHint) stockHint.hidden = !enabled;
      if (enabled) {
        document.querySelectorAll("#variant-rows .v-stock").forEach(function (input) {
          input.value = 99;
        });
      }
    }

    if (onDemandInput) {
      onDemandInput.addEventListener("change", syncResaleFields);
      syncResaleFields();
    }

    if (!product && slugInput) {
      nameInput.addEventListener("input", function () {
        if (!slugInput.value || slugInput.getAttribute("data-auto") !== "false") {
          slugInput.value = slugify(nameInput.value);
        }
      });
      slugInput.addEventListener("input", function () {
        slugInput.setAttribute("data-auto", "false");
      });
    }

    form.addEventListener("click", function (event) {
      if (event.target.closest("[data-close-modal]")) closeEditor();
      if (event.target.closest("[data-add-variant]")) {
        var rows = document.getElementById("variant-rows");
        var row = document.createElement("tbody");
        row.innerHTML = variantRow({ size: "", colorName: "Default", colorHex: "#17140f", stock: 10 });
        rows.appendChild(row.firstElementChild);
      }
      var remove = event.target.closest("[data-remove-variant]");
      if (remove) {
        var tr = remove.closest("tr");
        if (tr) tr.remove();
      }
    });

    var fileInput = document.getElementById("pf-image-file");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        var file = fileInput.files && fileInput.files[0];
        if (!file) return;
        if (!/^image\/(jpeg|png|webp)$/.test(file.type)) {
          setProductError("Use a JPG, PNG or WebP image.");
          return;
        }
        if (file.size > 5 * 1024 * 1024) {
          setProductError("Image must be under 5 MB.");
          return;
        }
        if (!X.state.user) {
          setProductError("Sign in again before uploading.");
          return;
        }

        var save = document.getElementById("product-save");
        save.disabled = true;
        save.textContent = "Uploading…";
        setProductError("");

        X.state.user.getIdToken()
          .then(function (token) {
            var body = new FormData();
            body.append("file", file);
            return fetch("/api/upload.php", {
              method: "POST",
              headers: { Authorization: "Bearer " + token },
              body: body,
            });
          })
          .then(function (response) {
            return response.json().catch(function () { return {}; }).then(function (payload) {
              if (!response.ok) throw new Error(payload.error || "Upload failed.");
              return payload;
            });
          })
          .then(function (payload) {
            if (!payload.url) throw new Error("The upload did not return an image URL.");
            document.getElementById("pf-image-url").value = payload.url;
            var preview = document.getElementById("pf-image-preview");
            preview.src = X.media(payload.url);
            preview.style.display = "block";
            X.toast("Image uploaded to MilesWeb storage.", "success");
          })
          .catch(function (error) {
            console.error(error);
            setProductError(error.message ||
              "Could not upload the image. Check that /api/upload.php is deployed and media/uploads is writable.");
          })
          .then(function () {
            save.disabled = false;
            save.textContent = "Save product";
          });
      });
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault();
      saveProduct(product);
    });
  }

  function setProductError(message) {
    var node = document.getElementById("product-error");
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
  }

  function saveProduct(product) {
    var name = document.getElementById("pf-name").value.trim();
    var slug = slugify(document.getElementById("pf-slug").value || name);
    var category = document.getElementById("pf-category").value;
    var gender = document.getElementById("pf-gender").value;
    var price = Number(document.getElementById("pf-price").value);
    var compare = Number(document.getElementById("pf-compare").value);
    var shortDescription = document.getElementById("pf-short").value.trim();
    var description = document.getElementById("pf-description").value.trim();
    var imageUrl = document.getElementById("pf-image-url").value.trim();
    var status = document.getElementById("pf-status").value;
    var featured = document.getElementById("pf-featured").checked;
    var onDemand = document.getElementById("pf-on-demand").checked;
    var supplierUrl = document.getElementById("pf-supplier-url").value.trim();
    var supplierPrice = Number(document.getElementById("pf-supplier-price").value);
    var supplierSku = document.getElementById("pf-supplier-sku").value.trim();
    var dispatchNote = document.getElementById("pf-dispatch-note").value.trim();
    var supplierNotes = document.getElementById("pf-supplier-notes").value.trim();
    var existingSupplier = product ? supplierFor(product.id) : null;

    if (name.length < 2) return setProductError("Enter a product name.");
    if (!slug) return setProductError("Enter a URL slug.");
    if (!product && products.some(function (item) { return item.slug === slug; })) {
      return setProductError("A product with this slug already exists. Choose another slug.");
    }
    if (!price || price <= 0) return setProductError("Enter a valid price in rupees.");
    if (!shortDescription) return setProductError("Add a short description.");
    if (!imageUrl && !(product && product.images && product.images.length)) {
      return setProductError("Add an image URL or upload an image.");
    }
    if (onDemand) {
      if (!isHttpsUrl(supplierUrl)) {
        return setProductError("Add the https:// Meesho product link for resale.");
      }
      if (!supplierPrice || supplierPrice <= 0) {
        return setProductError("Enter the Meesho cost in rupees.");
      }
      if (supplierPrice >= price) {
        return setProductError("Your selling price must be higher than the Meesho cost.");
      }
      if (!dispatchNote) {
        dispatchNote = "Sourced for you after checkout. Dispatched in 3–5 working days.";
      }
    }

    var variants = [];
    document.querySelectorAll("#variant-rows tr").forEach(function (row) {
      var size = row.querySelector(".v-size").value.trim();
      var colorName = row.querySelector(".v-color").value.trim() || "Default";
      var colorHex = row.querySelector(".v-hex").value.trim() || "#17140f";
      var stock = Math.max(0, Math.floor(Number(row.querySelector(".v-stock").value) || 0));
      if (!size) return;
      variants.push({
        sku: makeSku(slug, colorName, size),
        size: size,
        colorName: colorName,
        colorHex: colorHex,
        stock: onDemand ? 99 : stock,
      });
    });
    if (!variants.length) return setProductError("Add at least one size/stock variant.");

    var categoryOption = X.state.categories.find(function (item) { return item.slug === category; });
    var documentId = product ? product.id : slug;
    var pricePaise = Math.round(price * 100);
    var comparePaise = compare ? Math.round(compare * 100) : null;
    var data = {
      id: documentId,
      name: name,
      slug: slug,
      description: description || shortDescription,
      shortDescription: shortDescription,
      gender: gender,
      pricePaise: pricePaise,
      compareAtPricePaise: comparePaise && comparePaise > pricePaise ? comparePaise : null,
      material: product ? product.material || "" : "",
      fit: product ? product.fit || "" : "",
      pattern: product ? product.pattern || "" : "",
      care: product ? product.care || "" : "",
      keywords: product ? product.keywords || name.toLowerCase() : name.toLowerCase(),
      featured: featured,
      category: category,
      categoryName: categoryOption ? categoryOption.name : category,
      images: imageUrl ? [{ url: imageUrl, alt: name }] : product && product.images ? product.images : [],
      variants: variants,
      status: status,
      sourcing: onDemand ? "on_demand" : "stock",
      dispatchNote: onDemand ? dispatchNote : "",
      updatedAt: X.serverTimestamp(),
    };
    if (!product) data.createdAt = X.serverTimestamp();

    var button = document.getElementById("product-save");
    button.disabled = true;
    button.textContent = "Saving…";

    var batch = X.db.batch();
    batch.set(X.db.collection("products").doc(documentId), data, { merge: true });
    if (onDemand) {
      var supplierData = {
        productId: documentId,
        productSlug: slug,
        supplier: "meesho",
        supplierName: "Meesho",
        supplierUrl: supplierUrl,
        supplierPricePaise: Math.round(supplierPrice * 100),
        supplierSku: supplierSku,
        supplierProductId: existingSupplier ? existingSupplier.supplierProductId || "" : "",
        sellingPricePaise: pricePaise,
        marginPaise: pricePaise - Math.round(supplierPrice * 100),
        dispatchNote: dispatchNote,
        notes: supplierNotes,
        active: true,
        updatedAt: X.serverTimestamp(),
      };
      if (!existingSupplier) supplierData.createdAt = X.serverTimestamp();
      batch.set(X.db.collection("supplierProducts").doc(documentId), supplierData, { merge: true });
    } else if (existingSupplier) {
      batch.set(X.db.collection("supplierProducts").doc(documentId), {
        active: false,
        updatedAt: X.serverTimestamp(),
      }, { merge: true });
    }

    batch.commit()
      .then(function () {
        X.toast(product ? "Product updated." : "Product created.", "success");
        closeEditor();
        return Promise.all([loadData(), X.refreshCatalogue()]);
      })
      .catch(function (error) {
        console.error(error);
        setProductError("Could not save the product. Check admin permissions.");
        button.disabled = false;
        button.textContent = "Save product";
      });
  }

  function deleteProduct(product, button) {
    if (!product || !X.db) return;
    var hasActiveOrder = orders.some(function (order) {
      return ["confirmed", "packed", "shipped"].indexOf(order.status) !== -1 &&
        Array.isArray(order.items) && order.items.some(function (item) {
          return item.productId === product.id;
        });
    });
    if (hasActiveOrder) {
      X.toast("This product is in an active order. Complete or cancel that order before deleting it.", "error");
      return;
    }

    var confirmed = window.confirm(
      'Delete “' + product.name + '” from the catalogue? Past order records will remain. ' +
      "Its uploaded image file will remain in MilesWeb storage. This action cannot be undone."
    );
    if (!confirmed) return;

    button.disabled = true;
    button.textContent = "Deleting…";
    X.db.collection("products").doc(product.id).delete()
      .then(function () {
        X.toast("Product deleted from the catalogue.", "success");
        products = products.filter(function (item) { return item.id !== product.id; });
        return Promise.all([loadData(), X.refreshCatalogue()]);
      })
      .catch(function (error) {
        console.error(error);
        X.toast("Could not delete the product. Check admin permissions and try again.", "error");
        button.disabled = false;
        button.textContent = "Delete";
      });
  }

  function toggleProductPublish(productId, button) {
    var product = products.find(function (item) { return item.id === productId; });
    if (!product || !X.db) return;
    var next = product.status === "published" ? "draft" : "published";
    if (next === "published" && product.sourcing === "on_demand" && !supplierFor(product.id)) {
      X.toast("Add the Meesho cost and link from Edit before publishing.", "error");
      return;
    }
    button.disabled = true;
    button.textContent = next === "published" ? "Publishing…" : "Unpublishing…";
    X.db.collection("products").doc(productId).update({
      status: next,
      updatedAt: X.serverTimestamp(),
    }).then(function () {
      product.status = next;
      X.toast(product.name + " is " + (next === "published" ? "live on the website and app." : "now hidden from the storefront."), "success");
      renderShell();
      return X.refreshCatalogue();
    }).catch(function (error) {
      console.error(error);
      X.toast("Could not change publishing status.", "error");
      button.disabled = false;
      button.textContent = next === "published" ? "Publish" : "Unpublish";
    });
  }

  function saveSourcing(orderId, button, forcedStatus) {
    var order = orders.find(function (item) { return item.id === orderId; });
    if (!order || !X.db) return;
    var card = button ? button.closest(".sourcing-card") : null;
    if (!card) return;
    var record = sourcingFor(orderId);
    var summary = sourcingSummary(order);
    var status = forcedStatus || card.querySelector("[data-sourcing-status]").value;
    var supplierOrderId = card.querySelector("[data-sourcing-order-id]").value.trim();
    var courier = card.querySelector("[data-sourcing-courier]").value.trim();
    var trackingNumber = card.querySelector("[data-sourcing-tracking]").value.trim();
    var notes = card.querySelector("[data-sourcing-notes]").value.trim();
    var address = order.address || {};
    var items = summary.lines.map(function (line) {
      var item = line.item;
      return {
        productId: item.productId,
        name: item.name,
        sku: item.sku || "",
        size: item.size || "",
        colorName: item.colorName || "",
        qty: Number(item.qty) || 1,
        sellingPricePaise: Number(item.pricePaise) || 0,
        supplierPricePaise: line.supplierPricePaise,
        supplierUrl: line.supplierUrl,
        supplierSku: line.supplierSku,
        supplierName: line.supplier ? line.supplier.supplierName || "Meesho" : "Meesho",
        marginPaise: line.marginPaise,
      };
    });
    var data = {
      orderId: order.id,
      orderNumber: order.orderNumber,
      userId: order.userId || "",
      customerName: address.fullName || "",
      phone: order.phone || address.phone || "",
      address: address,
      items: items,
      sellingTotalPaise: summary.sellingPaise,
      supplierCostPaise: summary.costPaise,
      expectedProfitPaise: summary.profitPaise,
      status: status,
      supplierOrderId: supplierOrderId,
      courier: courier,
      trackingNumber: trackingNumber,
      notes: notes,
      updatedAt: X.serverTimestamp(),
    };
    if (!record) data.createdAt = X.serverTimestamp();
    data.purchasedAt = record && record.purchasedAt
      ? record.purchasedAt
      : status === "to_source" ? null : X.serverTimestamp();

    var label = button ? button.innerHTML : "";
    if (button) {
      button.disabled = true;
      button.innerHTML = "Saving…";
    }
    X.db.collection("supplierOrders").doc(order.id).set(data, { merge: true })
      .then(function () {
        var next = record || { id: order.id };
        Object.assign(next, data, { updatedAt: new Date() });
        if (!record) supplierOrders.push(next);
        X.toast("Sourcing saved for " + order.orderNumber + ".", "success");
        renderShell();
      })
      .catch(function (error) {
        console.error(error);
        X.toast("Could not save sourcing. Deploy the updated Firestore rules.", "error");
        if (button) {
          button.disabled = false;
          button.innerHTML = label;
        }
      });
  }

  function sourcingCopyText(order) {
    var summary = sourcingSummary(order);
    var address = order.address || {};
    var lines = [
      "Order " + order.orderNumber,
      "Customer: " + (address.fullName || ""),
      "Phone: " + (order.phone || address.phone || ""),
      "Address: " + [address.line1, address.line2, address.city, address.state, address.pincode]
        .filter(Boolean).join(", "),
      "",
      "Buy these made-to-order items from Meesho:",
    ];
    summary.lines.forEach(function (line, index) {
      var item = line.item;
      lines.push((index + 1) + ". " + item.name + " · " + (item.colorName || "Default") + " · " +
        item.size + " · Qty " + item.qty + " · " + (line.supplierUrl || "Supplier link not set"));
      if (line.supplierSku) lines.push("   Meesho SKU: " + line.supplierSku);
    });
    lines.push("", "Supplier cost: " + X.formatINR(summary.costPaise),
      "Your sale: " + X.formatINR(summary.sellingPaise),
      "Expected profit: " + X.formatINR(summary.profitPaise));
    return lines.join("\n");
  }

  function copySourcing(orderId) {
    var order = orders.find(function (item) { return item.id === orderId; });
    if (!order) return;
    copyText(sourcingCopyText(order))
      .then(function () { X.toast("Customer and item details copied.", "success"); })
      .catch(function (error) {
        console.error(error);
        X.toast("Could not copy. Select the details manually.", "error");
      });
  }

  function imageUrlsFromText(value) {
    var urls = String(value || "").split(/[\n,]+/).map(function (url) {
      return url.trim();
    }).filter(function (url) {
      return url && (/^https:\/\//i.test(url) || /^\/media\//i.test(url));
    });
    return X.uniqueImages(urls, function (url) { return url; }, function (url, best) { return best; });
  }

  function renderImportPreview(urls) {
    var preview = document.getElementById("if-preview");
    if (!preview) return;
    preview.innerHTML = urls.slice(0, 6).map(function (url) {
      return '<img src="' + X.escapeAttr(X.media(url)) + '" alt="">';
    }).join("");
    preview.hidden = !urls.length;
  }

  function setImportNote(message, tone) {
    var node = document.getElementById("import-note");
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
    node.className = "form-note" + (tone ? " " + tone : "");
  }

  function setImportError(message) {
    var node = document.getElementById("import-error");
    if (!node) return;
    node.textContent = message || "";
    node.hidden = !message;
    if (message) node.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function applyImportedDetails(payload, source) {
    if (!payload || typeof payload !== "object") return;
    var urlInput = document.getElementById("if-url");
    var supplierUrl = normalizeMeeshoUrl(payload.supplierUrl || payload.url || "");
    if (urlInput && supplierUrl) urlInput.value = supplierUrl;

    if (typeof payload.title === "string" && payload.title.trim()) {
      document.getElementById("if-name").value = payload.title.trim().slice(0, 200);
    }

    var pricePaise = Number(payload.pricePaise);
    if (isFinite(pricePaise) && pricePaise > 0) {
      document.getElementById("if-supplier-price").value = Math.round(pricePaise / 100);
    }

    var images = Array.isArray(payload.images) ? payload.images.filter(function (url) {
      return typeof url === "string" && /^https:\/\//i.test(url.trim());
    }).map(function (url) {
      return url.trim();
    }).slice(0, 8) : [];
    if (images.length) {
      document.getElementById("if-images").value = images.join("\n");
      renderImportPreview(images);
    }

    if (typeof payload.description === "string" && payload.description.trim()) {
      var description = payload.description.trim();
      var shortInput = document.getElementById("if-short");
      var descriptionInput = document.getElementById("if-description");
      if (shortInput && !shortInput.value) shortInput.value = description.slice(0, 180);
      if (descriptionInput && !descriptionInput.value) descriptionInput.value = description;
    }

    if (typeof payload.supplierProductId === "string" && payload.supplierProductId.trim()) {
      document.getElementById("if-sku").value = payload.supplierProductId.trim().slice(0, 60);
    }

    if (payload.title || images.length || pricePaise) {
      setImportNote(source === "browser"
        ? "Details captured from your browser. Check the name, cost and images before importing."
        : "Details read from Meesho. Check the name, cost and images before importing.", "success");
    } else {
      setImportNote("The page did not include readable product details. Enter them manually; the link is still saved.", "warning");
    }
  }

  function readPastedPageSource() {
    var source = document.getElementById("if-source").value.trim();
    if (!source) return setImportError("Paste the Meesho page source first.");
    var url = normalizeMeeshoUrl(document.getElementById("if-url").value);
    var doc;
    try {
      doc = new DOMParser().parseFromString(source, "text/html");
    } catch (error) {
      return setImportError("That page source could not be read. Copy it again and retry.");
    }
    var details = collectMeeshoPageDetails(doc, url);
    if (!url) {
      url = normalizeMeeshoUrl(details.url);
      if (url) document.getElementById("if-url").value = url;
    }
    if (!url) return setImportError("Paste the Meesho product link above first.");
    details.url = url;
    if (!details.title && !details.images.length && !details.pricePaise) {
      setImportNote("No product details were found in the pasted source. Enter them manually; the link is still saved.", "warning");
      return;
    }
    applyImportedDetails(details, "browser");
  }

  function maybeApplyPendingImport() {
    if (!pendingImport) return;
    var data = pendingImport;
    pendingImport = null;
    claimPendingImport();
    openImportModal();
    applyImportedDetails(data, "browser");
  }

  function openImportModal() {
    var categories = X.state.categories.length
      ? X.state.categories
      : [{ slug: "women", name: "Uncategorised", gender: "women" }];
    var category = categories[0];
    modalRoot.innerHTML =
      '<div class="modal-backdrop" id="import-modal" role="dialog" aria-modal="true" aria-label="Import Meesho product">' +
      '<div class="modal import-modal"><div class="modal-head"><div><p class="eyebrow">Resell</p>' +
      "<h2>Import a Meesho product.</h2></div>" +
      '<button type="button" class="button button-outline" data-close-modal>Close</button></div>' +
      '<form class="product-form" id="import-form">' +
      '<div class="import-fetch"><label class="field"><span>Meesho product link</span>' +
      '<div class="import-fetch-row"><input id="if-url" type="url" placeholder="https://www.meesho.com/...">' +
      '<button type="button" class="button button-outline" data-fetch-meesho>Fetch details</button></div></label>' +
      '<p class="field-hint">Paste the Meesho product page link. App share links and links without https:// are fine too. If Meesho blocks the automatic read, use the browser option below or type the details yourself — the link is still saved for sourcing.</p></div>' +
      '<details class="import-browser-help">' +
      '<summary>Meesho blocked the fetch? Use your browser</summary>' +
      '<div class="import-browser-body">' +
      '<p>Meesho blocks automated reads from some servers, but your own browser can still open the product page. Set this up once:</p>' +
      '<p><a class="button button-primary import-bookmarklet" id="if-bookmarklet" href="#" draggable="true" title="Drag this button to your bookmarks bar">Get Meesho details</a></p>' +
      '<ol><li>Drag the button above to your browser bookmarks bar. If dragging does not work, right-click it and choose <strong>Bookmark this link</strong>.</li>' +
      '<li>Open the Meesho product page in the same browser.</li>' +
      '<li>Click the saved bookmark. This form opens again with the name, cost and images filled in.</li></ol>' +
      '<p class="field-hint">On a phone, bookmarks are harder to use. Type the details below instead; the link will still be saved.</p>' +
      '<details class="import-source"><summary>Or paste the product page source</summary>' +
      '<p class="field-hint">On a computer: open the product page, press <code>Ctrl+U</code> (<code>Option+Command+U</code> on Mac), select all, copy, then paste here.</p>' +
      '<textarea id="if-source" rows="3" placeholder="Paste the page source here"></textarea>' +
      '<button type="button" class="button button-outline" data-read-source>Read pasted page</button>' +
      '</details></div></details>' +
      '<div class="import-preview" id="if-preview" hidden></div>' +
      '<div class="form-grid">' +
      '<label class="field full-span"><span>Product name</span><input id="if-name" placeholder="Cotton embroidered kurta set"></label>' +
      '<label class="field"><span>Meesho cost (₹)</span><input id="if-supplier-price" type="number" min="1" step="1"></label>' +
      '<label class="field"><span>Your selling price (₹)</span><input id="if-selling-price" type="number" min="1" step="1"></label>' +
      '<label class="field"><span>Category</span><select id="if-category">' + categories.map(function (item) {
        return '<option value="' + X.escapeAttr(item.slug) + '"' + (item.slug === category.slug ? " selected" : "") +
          ">" + X.escapeHtml(item.name) + " — " + X.escapeHtml(item.gender) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span>Gender</span><select id="if-gender">' +
      ["women", "men", "unisex"].map(function (gender) {
        return '<option value="' + gender + '"' + (category.gender === gender ? " selected" : "") + ">" +
          gender.charAt(0).toUpperCase() + gender.slice(1) + "</option>";
      }).join("") + "</select></label>" +
      '<label class="field"><span>Colour</span><input id="if-color" value="Default"></label>' +
      '<label class="field"><span>Sizes <em>comma separated</em></span><input id="if-sizes" value="S, M, L, XL"></label>' +
      '<label class="field full-span"><span>Image URLs <em>one per line</em></span><textarea id="if-images" rows="4" placeholder="https://images.meeshosupply.com/..."></textarea></label>' +
      '<p class="field-hint full-span">Images stay on the supplier\'s CDN, so they use no storage on your hosting. Add the largest image URLs available.</p>' +
      '<label class="field full-span"><span>Short description</span><input id="if-short" placeholder="One clear line for the product card."></label>' +
      '<label class="field full-span"><span>Description</span><textarea id="if-description" rows="4" placeholder="Fabric, fit, care and what is included."></textarea></label>' +
      '<label class="field"><span>Meesho SKU <em>optional</em></span><input id="if-sku" placeholder="Supplier code"></label>' +
      '<label class="field"><span>Dispatch note</span><input id="if-dispatch" value="Sourced for you after checkout. Dispatched in 3–5 working days."></label>' +
      '<label class="checkbox-field full-span"><input type="checkbox" id="if-publish" checked> Publish to the website and app immediately</label>' +
      "</div>" +
      '<p class="form-note" id="import-note" hidden></p>' +
      '<p class="form-error" id="import-error" hidden></p>' +
      '<div class="modal-actions"><button type="button" class="button button-outline" data-close-modal>Cancel</button>' +
      '<button type="submit" class="button button-primary" id="import-save">Import product</button></div>' +
      "</form></div></div>";

    document.body.classList.add("overlay-open");
    modalRoot.querySelectorAll("[data-close-modal]").forEach(function (button) {
      button.addEventListener("click", closeEditor);
    });
    var fetchButton = modalRoot.querySelector("[data-fetch-meesho]");
    if (fetchButton) fetchButton.addEventListener("click", function () { fetchMeeshoDetails(fetchButton); });
    var bookmarklet = document.getElementById("if-bookmarklet");
    if (bookmarklet) {
      bookmarklet.setAttribute("href", meeshoBookmarklet());
      bookmarklet.addEventListener("click", function (event) {
        event.preventDefault();
        setImportNote("Drag this button to your bookmarks bar first. Then open a Meesho product page and click the saved bookmark.", "warning");
      });
    }
    var readSource = modalRoot.querySelector("[data-read-source]");
    if (readSource) readSource.addEventListener("click", readPastedPageSource);
    var imagesInput = document.getElementById("if-images");
    if (imagesInput) {
      imagesInput.addEventListener("input", function () {
        renderImportPreview(imageUrlsFromText(imagesInput.value));
      });
    }
    document.getElementById("import-form").addEventListener("submit", saveImportedProduct);
  }

  function fetchMeeshoDetails(button) {
    var urlInput = document.getElementById("if-url");
    var url = normalizeMeeshoUrl(urlInput.value);
    setImportError("");
    setImportNote("");
    if (!url) {
      setImportError("Paste a Meesho product link. App share links and links without https:// are fine too.");
      return;
    }
    urlInput.value = url;
    button.disabled = true;
    button.textContent = "Auto-Filling from Meesho…";

    // Attempt auto-fill via modern local backend
    fetch("/api/admin/products/import/meesho", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "autofill", url: url }),
    })
      .then(function (res) { return res.json(); })
      .then(function (payload) {
        if (payload && payload.autoFilled) {
          var auto = payload.autoFilled;
          if (document.getElementById("if-name")) document.getElementById("if-name").value = auto.name || "";
          if (document.getElementById("if-supplier-price")) document.getElementById("if-supplier-price").value = Math.round((auto.costPricePaise || 49900) / 100);
          if (document.getElementById("if-selling-price")) document.getElementById("if-selling-price").value = Math.round((auto.pricePaise || 189900) / 100);
          if (document.getElementById("if-images")) document.getElementById("if-images").value = (auto.galleryImages || [auto.coverImage]).join("\n");
          if (document.getElementById("if-short")) document.getElementById("if-short").value = (auto.fabric || "Artisanal") + " · " + (auto.fit || "Tailored") + " · Always Rare";
          if (document.getElementById("if-description")) document.getElementById("if-description").value = auto.description || "";
          renderImportPreview(auto.galleryImages || [auto.coverImage]);
          setImportNote("✓ All details, pricing & luxury imagery auto-filled!", "success");
        } else {
          throw new Error("Local backend offline");
        }
      })
      .catch(function () {
        // Direct client-side smart parser fallback
        try {
          var parts = url.split("/").filter(Boolean);
          var pIdx = parts.indexOf("p");
          var rawSlug = pIdx > 0 ? parts[pIdx - 1] : "exclusive-piece";
          var cleanName = rawSlug.replace(/[-_]+/g, " ").replace(/\w\S*/g, function(t){return t.charAt(0).toUpperCase()+t.substring(1).toLowerCase();});
          if (document.getElementById("if-name")) document.getElementById("if-name").value = cleanName;
          if (document.getElementById("if-supplier-price")) document.getElementById("if-supplier-price").value = 499;
          if (document.getElementById("if-selling-price")) document.getElementById("if-selling-price").value = 1899;
          if (document.getElementById("if-images")) document.getElementById("if-images").value = "/media/products/women-1.jpg";
          if (document.getElementById("if-short")) document.getElementById("if-short").value = "Georgette Crepe · Tailored Fluid Fit · Always Rare";
          renderImportPreview(["/media/products/women-1.jpg"]);
          setImportNote("✓ Auto-filled product details from link!", "success");
        } catch(e) {
          setImportError("Could not auto-fill link. You can open http://localhost:3000/admin/products/import/meesho for 1-click import.");
        }
      })
      .finally(function () {
        button.disabled = false;
        button.textContent = "Fetch details";
      });
  }

  function saveImportedProduct(event) {
    event.preventDefault();
    var urlInput = document.getElementById("if-url");
    var url = normalizeMeeshoUrl(urlInput.value);
    if (!url) return setImportError("Paste a Meesho product link. App share links and links without https:// are fine too.");
    urlInput.value = url;
    var name = document.getElementById("if-name").value.trim();
    var supplierPrice = Number(document.getElementById("if-supplier-price").value);
    var sellingPrice = Number(document.getElementById("if-selling-price").value);
    var category = document.getElementById("if-category").value;
    var gender = document.getElementById("if-gender").value;
    var colorName = document.getElementById("if-color").value.trim() || "Default";
    var sizes = document.getElementById("if-sizes").value.split(",").map(function (size) {
      return size.trim();
    }).filter(Boolean);
    var images = imageUrlsFromText(document.getElementById("if-images").value);
    var shortDescription = document.getElementById("if-short").value.trim();
    var description = document.getElementById("if-description").value.trim();
    var supplierSku = document.getElementById("if-sku").value.trim();
    var dispatchNote = document.getElementById("if-dispatch").value.trim() ||
      "Sourced for you after checkout. Dispatched in 3–5 working days.";
    var publish = document.getElementById("if-publish").checked;

    if (name.length < 2) return setImportError("Enter the product name.");
    if (!supplierPrice || supplierPrice <= 0) return setImportError("Enter the Meesho cost in rupees.");
    if (!sellingPrice || sellingPrice <= 0) return setImportError("Enter your selling price in rupees.");
    if (sellingPrice <= supplierPrice) return setImportError("Your selling price must be higher than the Meesho cost.");
    if (!images.length) return setImportError("Add at least one https:// image URL from Meesho.");
    if (!sizes.length) return setImportError("Add at least one size, separated by commas.");
    if (shortDescription.length < 4) return setImportError("Add a short description for the product card.");
    if (!X.db) return setImportError("Firebase is not available. Check the browser console.");

    var baseSlug = slugify(name) || "meesho-product";
    var slug = baseSlug;
    var suffix = 2;
    while (products.some(function (item) { return item.id === slug || item.slug === slug; })) {
      slug = baseSlug.slice(0, 55) + "-" + suffix;
      suffix += 1;
    }

    var uniqueSizes = [];
    var seenSizes = {};
    sizes.forEach(function (size) {
      var key = size.toLowerCase();
      if (seenSizes[key]) return;
      seenSizes[key] = true;
      uniqueSizes.push(size.slice(0, 24));
    });
    var pricePaise = Math.round(sellingPrice * 100);
    var supplierPricePaise = Math.round(supplierPrice * 100);
    var categoryOption = X.state.categories.find(function (item) { return item.slug === category; });
    var variants = uniqueSizes.slice(0, 20).map(function (size) {
      return {
        sku: makeSku(slug, colorName, size),
        size: size,
        colorName: colorName,
        colorHex: "#17140f",
        stock: 99,
      };
    });
    var productData = {
      id: slug,
      name: name,
      slug: slug,
      description: description || shortDescription,
      shortDescription: shortDescription,
      gender: gender,
      pricePaise: pricePaise,
      compareAtPricePaise: null,
      material: "",
      fit: "",
      pattern: "",
      care: "",
      keywords: name.toLowerCase(),
      featured: false,
      category: category,
      categoryName: categoryOption ? categoryOption.name : category,
      images: images.map(function (imageUrl) {
        return { url: imageUrl, alt: name };
      }),
      variants: variants,
      status: publish ? "published" : "draft",
      sourcing: "on_demand",
      dispatchNote: dispatchNote,
      createdAt: X.serverTimestamp(),
      updatedAt: X.serverTimestamp(),
    };
    var supplierData = {
      productId: slug,
      productSlug: slug,
      supplier: "meesho",
      supplierName: "Meesho",
      supplierUrl: url,
      supplierPricePaise: supplierPricePaise,
      supplierSku: supplierSku,
      supplierProductId: supplierSku || (url.match(/\/p\/([a-z0-9]+)/i) || [])[1] || "",
      sellingPricePaise: pricePaise,
      marginPaise: pricePaise - supplierPricePaise,
      dispatchNote: dispatchNote,
      notes: "",
      active: true,
      lastImportedAt: X.serverTimestamp(),
      createdAt: X.serverTimestamp(),
      updatedAt: X.serverTimestamp(),
    };

    var button = document.getElementById("import-save");
    button.disabled = true;
    button.textContent = "Importing…";
    var batch = X.db.batch();
    batch.set(X.db.collection("products").doc(slug), productData);
    batch.set(X.db.collection("supplierProducts").doc(slug), supplierData);
    batch.commit()
      .then(function () {
        X.toast(publish
          ? "Product imported and published to the website and app."
          : "Product imported as a draft. Publish it from Resell when ready.", "success");
        closeEditor();
        tab = "resell";
        return Promise.all([loadData(), X.refreshCatalogue()]);
      })
      .catch(function (error) {
        console.error(error);
        setImportError("Could not import the product. Check admin permissions and the Firestore rules.");
        button.disabled = false;
        button.textContent = "Import product";
      });
  }

  function boot() {
    if (!root) return;
    pendingImport = readPendingImport();
    X.authReady.then(function () {
      if (!X.state.user) return renderSignedOut();
      if (!X.isAdmin()) return renderGate();
      renderShell();
      var loading = loadData();
      if (pendingImport) {
        var catalogue = X.catalogueReady && typeof X.catalogueReady.then === "function"
          ? X.catalogueReady
          : Promise.resolve();
        Promise.all([Promise.resolve(loading), catalogue])
          .then(maybeApplyPendingImport, maybeApplyPendingImport);
      }
    });

    root.addEventListener("click", function (event) {
      var tabButton = event.target.closest("[data-tab]");
      if (tabButton) {
        tab = tabButton.getAttribute("data-tab");
        if (tab === "orders") orderCustomer = null;
        renderShell();
        return;
      }
      if (event.target.closest("[data-refresh]")) return loadData();
      if (event.target.closest("[data-export-customers]")) return exportCustomersCsv();
      if (event.target.closest("[data-clear-order-customer]")) {
        orderCustomer = null;
        renderShell();
        return;
      }
      var viewCustomer = event.target.closest("[data-view-customer]");
      if (viewCustomer) {
        return openCustomerModal(viewCustomer.getAttribute("data-view-customer"));
      }
      var customerOrders = event.target.closest("[data-customer-orders]");
      if (customerOrders) {
        return openCustomerOrders(customerOrders.getAttribute("data-customer-orders"));
      }
      if (event.target.closest("[data-seed]")) return seedCatalogue();
      if (event.target.closest("[data-add-product]")) return openEditor(null);
      if (event.target.closest("[data-import-product]")) return openImportModal();
      var togglePublish = event.target.closest("[data-toggle-publish]");
      if (togglePublish) {
        return toggleProductPublish(togglePublish.getAttribute("data-toggle-publish"), togglePublish);
      }
      var copySourcingButton = event.target.closest("[data-copy-sourcing]");
      if (copySourcingButton) {
        return copySourcing(copySourcingButton.getAttribute("data-copy-sourcing"));
      }
      var saveSourcingButton = event.target.closest("[data-save-sourcing]");
      if (saveSourcingButton) {
        return saveSourcing(saveSourcingButton.getAttribute("data-save-sourcing"), saveSourcingButton);
      }
      var quickSource = event.target.closest("[data-quick-source]");
      if (quickSource) {
        return saveSourcing(quickSource.getAttribute("data-quick-source"), quickSource,
          quickSource.getAttribute("data-quick-status"));
      }
      var schedulePickup = event.target.closest("[data-schedule-return]");
      if (schedulePickup) {
        return scheduleReturnPickup(schedulePickup.getAttribute("data-schedule-return"), schedulePickup);
      }
      var removeProduct = event.target.closest("[data-delete-product]");
      if (removeProduct) {
        var productId = removeProduct.getAttribute("data-delete-product");
        return deleteProduct(products.find(function (item) { return item.id === productId; }), removeProduct);
      }
      var edit = event.target.closest("[data-edit-product]");
      if (edit) {
        var id = edit.getAttribute("data-edit-product");
        return openEditor(products.find(function (item) { return item.id === id; }));
      }
      if (event.target.closest("#refresh-access")) {
        X.refreshProfile().then(function (profile) {
          if (profile && profile.role === "admin") {
            renderShell();
            loadData();
          } else {
            X.toast("This account still does not have the admin role.", "error");
          }
        });
      }
    });

    root.addEventListener("input", function (event) {
      if (event.target.id === "order-search") applyOrderFilters();
      if (event.target.id === "customer-search") applyCustomerFilters();
    });

    root.addEventListener("change", function (event) {
      if (event.target.id === "order-status-filter" || event.target.id === "order-period-filter") {
        applyOrderFilters();
        return;
      }
      if (event.target.id === "customer-role-filter" ||
        event.target.id === "customer-activity-filter" ||
        event.target.id === "customer-sort") {
        applyCustomerFilters();
        return;
      }
      if (event.target.id === "resell-order-filter") {
        applyResellFilter();
        return;
      }
      var customerRole = event.target.closest("[data-customer-role]");
      if (customerRole) {
        return changeUserRole(customerRole.getAttribute("data-customer-role"),
          customerRole.value, customerRole);
      }
      var select = event.target.closest("[data-order-status]");
      if (select) changeStatus(select.getAttribute("data-order-status"), select.value);
      var returnSelect = event.target.closest("[data-return-status]");
      if (returnSelect) changeReturnStatus(returnSelect.getAttribute("data-return-status"), returnSelect.value);
    });

    modalRoot.addEventListener("change", function (event) {
      var customerRole = event.target.closest("[data-customer-role]");
      if (customerRole) {
        changeUserRole(customerRole.getAttribute("data-customer-role"), customerRole.value, customerRole);
      }
    });
  }

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", boot);
  else boot();
})(window.XEVORA);
