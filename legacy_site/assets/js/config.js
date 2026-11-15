/* Xevoras storefront — shared configuration and formatting helpers.
   The Firebase web config is public by design. Never put a service-account
   key in this file or anywhere else in the website folder. */
window.XEVORA = window.XEVORA || {};

(function (X) {
  "use strict";

  X.brand = {
    name: "Xevoras",
    tagline: "Everyday styles for work, weekends and celebrations",
    description:
      "Easy-to-wear styles for women and men, with clear INR prices, cash on delivery and easy returns.",
    supportEmail: "saraswatrishabh91@gmail.com",
    supportPhone: "+91 86796 89174",
    instagram: "",
    country: "India",
    currency: "INR",
    locale: "en-IN",
  };

  X.firebaseConfig = {
    apiKey: "AIzaSyCpR3pySkDxZjbY2nf5aBR8mjXkTGkMOQE",
    authDomain: "xevora-8784b.firebaseapp.com",
    projectId: "xevora-8784b",
    messagingSenderId: "1048085640675",
    appId: "1:1048085640675:web:526aeedf76ada769389cd6",
    measurementId: "G-DD5YV1LTK6",
  };

  X.freeShippingThresholdPaise = 0;
  X.standardShippingPaise = 0;
  X.orderStatuses = ["confirmed", "packed", "shipped", "delivered", "cancelled", "returned"];

  var inr = new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  });

  X.formatINR = function (paise) {
    return inr.format((Number(paise) || 0) / 100);
  };

  X.formatDate = function (value) {
    if (!value) return "—";
    var date = typeof value.toDate === "function" ? value.toDate() : new Date(value);
    if (isNaN(date.getTime())) return "—";
    return new Intl.DateTimeFormat("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
    }).format(date);
  };

  X.discountPercent = function (pricePaise, compareAtPaise) {
    if (!compareAtPaise || compareAtPaise <= pricePaise) return null;
    return Math.round(((compareAtPaise - pricePaise) / compareAtPaise) * 100);
  };

  X.shippingFor = function (subtotalPaise) {
    return subtotalPaise >= X.freeShippingThresholdPaise || subtotalPaise === 0
      ? 0
      : X.standardShippingPaise;
  };

  X.productStock = function (product) {
    return (product.variants || []).reduce(function (total, variant) {
      return total + Math.max(0, Number(variant.stock) || 0);
    }, 0);
  };

  // Resale products are sourced only after the customer orders. Their variant
  // stock is an availability counter (typically 99), not physical stock.
  X.isOnDemand = function (product) {
    return Boolean(product && product.sourcing === "on_demand");
  };

  X.normalisePhone = function (value) {
    var digits = String(value || "").replace(/\D/g, "");
    if (digits.length === 10) return "+91" + digits;
    if (digits.length === 12 && digits.indexOf("91") === 0) return "+" + digits;
    return "+" + digits;
  };

  X.isValidIndianPhone = function (value) {
    var digits = String(value || "").replace(/\D/g, "");
    var local = digits.length === 12 && digits.indexOf("91") === 0 ? digits.slice(2) : digits;
    return /^[6-9]\d{9}$/.test(local);
  };

  /* Media URLs in the catalogue start with "/". The static site lives at the
     domain root, but relative paths also work in local previews and subfolders. */
  X.media = function (url) {
    if (!url) return "";
    return String(url).replace(/^\/+/, "");
  };

  /* Supplier (Meesho) CDN images come in several sizes such as abc_128.webp,
     abc_256.webp and abc_512.webp. Treat them as one picture, keep the largest
     size, and drop query strings that ask the CDN for a smaller copy. */
  X.isSupplierImage = function (url) {
    return /^https?:\/\/[^/]*(meesho|meeshosupply|meeshofiles)/i.test(String(url || ""));
  };

  X.imageKey = function (url) {
    var value = String(url || "").split("#")[0].split("?")[0];
    return X.isSupplierImage(value) ? value.replace(/_\d{2,4}(\.[a-z0-9]+)$/i, "$1") : value;
  };

  X.bestImageUrl = function (url) {
    var value = String(url || "").trim();
    if (!X.isSupplierImage(value)) return value;
    return value.split("#")[0].split("?")[0].replace(/_\d{2,4}(\.[a-z0-9]+)$/i, "_1200$1");
  };

  X.uniqueImages = function (list, getUrl, setUrl) {
    var seen = {};
    var out = [];
    (list || []).forEach(function (item) {
      var url = getUrl(item);
      if (!url) return;
      var key = X.imageKey(url);
      if (seen[key]) return;
      seen[key] = true;
      out.push(setUrl(item, X.bestImageUrl(url)));
    });
    return out;
  };

  /* If the 1200px copy is missing on the supplier CDN, fall back to 512px once. */
  document.addEventListener("error", function (event) {
    var img = event.target;
    if (!img || img.tagName !== "IMG" || img.getAttribute("data-fallback")) return;
    if (/_1200\.[a-z0-9]+$/i.test(img.src)) {
      img.setAttribute("data-fallback", "1");
      img.src = img.src.replace(/_1200(\.[a-z0-9]+)$/i, "_512$1");
    }
  }, true);

  X.escapeHtml = function (value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  };

  X.escapeAttr = X.escapeHtml;

  X.query = function (name) {
    return new URLSearchParams(window.location.search).get(name) || "";
  };

  X.safeNext = function (raw) {
    if (!raw) return "account.html";
    var value = String(raw).trim();
    if (/^(https?:)?\/\//i.test(value) || value.indexOf("javascript:") === 0) return "account.html";
    value = value.replace(/^\/+/, "");
    if (!value) return "account.html";
    if (/^[a-z0-9-]+$/i.test(value)) return value + ".html";
    return value;
  };
})(window.XEVORA);
