/* Home page — Diwali banner, deals, trending and new arrivals. */
(function (X) {
  "use strict";

  function cheapest(limit) {
    return X.searchProducts("").slice().sort(function (a, b) {
      return a.pricePaise - b.pricePaise;
    }).slice(0, limit);
  }

  function startTimer() {
    var el = document.getElementById("deal-timer");
    if (!el) return;
    function pad(n) { return (n < 10 ? "0" : "") + n; }
    function tick() {
      var now = new Date();
      var end = new Date(now);
      end.setHours(23, 59, 59, 999);
      var s = Math.max(0, Math.floor((end - now) / 1000));
      el.textContent = pad(Math.floor(s / 3600)) + ":" + pad(Math.floor((s % 3600) / 60)) + ":" + pad(s % 60);
    }
    tick();
    setInterval(tick, 1000);
  }

  /* If media/diwali-couple.jpg exists, it replaces the two festive photos. */
  function useCoupleImage() {
    var art = document.getElementById("diwali-art");
    if (!art) return;
    var probe = new Image();
    probe.onload = function () {
      art.innerHTML = '<div class="arch arch-couple"><img src="media/diwali-couple.jpg" alt="Diwali celebration"></div>';
    };
    probe.src = "media/diwali-couple.jpg";
  }

  async function boot() {
    startTimer();
    useCoupleImage();
    await X.catalogueReady;
    X.renderProductGrid("deals-grid", cheapest(4));
    X.renderProductGrid("featured-grid", X.featuredProducts(8));
    X.renderProductGrid("arrivals-grid", X.newArrivals(8));
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})(window.XEVORA);
