/* ============================================================
   Sitewide page init — soft-nav / back-forward safe.

   Architecture: content is VISIBLE by default in CSS. JS adds
   html.js-ready to enable entrance hiding, then immediately reveals
   in-view nodes and force-reveals everything shortly after.

   Soft-nav path: js-ready is already on <html> when new .rv mount.
   Those nodes must get .in (and a hard style clear) synchronously
   before paint, or Chromium can leave opacity stuck at 0.
   ============================================================ */
(function () {
  "use strict";

  var io = null;
  var scheduled = false;
  var forceTimer = null;
  var calm =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function nodes() {
    return Array.prototype.slice.call(document.querySelectorAll(".rv"));
  }

  function hardClear(el) {
    try {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("animation");
      el.style.removeProperty("visibility");
      /* Nuclear clear if a prior transition left computed opacity at 0. */
      if (parseFloat(window.getComputedStyle(el).opacity) < 0.05) {
        el.style.setProperty("opacity", "1", "important");
        el.style.setProperty("transform", "none", "important");
      }
    } catch (e) {}
  }

  function show(el) {
    if (!el || !(el instanceof Element)) return;
    if (!el.classList.contains("in")) el.classList.add("in");
    hardClear(el);
    if (io) {
      try {
        io.unobserve(el);
      } catch (e) {}
    }
  }

  function forceEgCards() {
    var narrow =
      window.matchMedia && window.matchMedia("(max-width: 1000px)").matches;
    var eg = document.querySelectorAll(".eg-sec .eg");
    Array.prototype.forEach.call(eg, function (pw) {
      if (!pw.querySelector(".eg-card.on, .walk-step.on")) {
        var first = pw.querySelector(".eg-card, .walk-step");
        if (first) first.classList.add("on");
      }
      if (!pw.getAttribute("data-at")) pw.setAttribute("data-at", "0");
    });
    var cards = document.querySelectorAll(".eg-card");
    Array.prototype.forEach.call(cards, function (c) {
      c.classList.add("seen");
      /* Mobile stages one card via .on — do not force the rest visible. */
      if (narrow && !c.classList.contains("on")) {
        try {
          c.style.removeProperty("opacity");
          c.style.removeProperty("transform");
          c.style.removeProperty("visibility");
        } catch (e) {}
        return;
      }
      try {
        if (parseFloat(window.getComputedStyle(c).opacity) < 0.05) {
          c.style.setProperty("opacity", "1", "important");
          c.style.setProperty("transform", "none", "important");
          c.style.setProperty("visibility", "visible", "important");
        }
      } catch (e) {}
    });
  }

  function forceAll() {
    nodes().forEach(show);
    forceEgCards();
  }

  function showInView() {
    var list = nodes();
    var vh = window.innerHeight || 0;
    var i;
    var tops = [];
    var bottoms = [];
    for (i = 0; i < list.length; i++) {
      var r = list[i].getBoundingClientRect();
      tops[i] = r.top;
      bottoms[i] = r.bottom;
    }
    for (i = 0; i < list.length; i++) {
      if (tops[i] < vh + 40 && bottoms[i] > -40) show(list[i]);
    }
  }

  /* Bare text in .btn is painted under the ink wipe ::before on hover. */
  function wrapButtons(root) {
    var scope = root || document;
    var btns = scope.querySelectorAll ? scope.querySelectorAll(".btn") : [];
    Array.prototype.forEach.call(btns, function (btn) {
      if (btn.querySelector(".btn-label")) return;
      Array.prototype.slice.call(btn.childNodes).forEach(function (node) {
        if (node.nodeType !== 3) return;
        var text = node.nodeValue.replace(/\s+/g, " ").trim();
        if (!text) return;
        var label = document.createElement("span");
        label.className = "btn-label";
        label.textContent = text;
        btn.replaceChild(label, node);
      });
    });
  }

  function ensureObserver() {
    if (calm || !("IntersectionObserver" in window)) {
      forceAll();
      return;
    }
    if (io) {
      try {
        io.disconnect();
      } catch (e) {}
      io = null;
    }
    io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (en.isIntersecting) show(en.target);
        });
      },
      { threshold: 0, rootMargin: "0px 0px -40px 0px" }
    );
    nodes().forEach(function (el) {
      if (el.classList.contains("in")) return;
      try {
        io.observe(el);
      } catch (e) {}
    });
  }

  function refreshEg() {
    try {
      if (typeof window.__tekcroftEgScrollRefresh === "function") {
        window.__tekcroftEgScrollRefresh();
      }
    } catch (e) {}
  }

  function refresh(opts) {
    scheduled = false;
    opts = opts || {};

    wrapButtons(document);

    var softNav = document.documentElement.classList.contains("js-ready");
    if (softNav) {
      /* Soft-nav / back: new .rv already under js-ready. Mark visible
         immediately so they never sit in :not(.in) long enough to stick. */
      forceAll();
    } else {
      document.documentElement.classList.add("js-ready");
      ensureObserver();
      showInView();
    }

    ensureObserver();
    showInView();
    refreshEg();

    if (forceTimer) clearTimeout(forceTimer);
    forceTimer = setTimeout(function () {
      forceTimer = null;
      forceAll();
      wrapButtons(document);
    }, opts.forceDelay != null ? opts.forceDelay : 400);
  }

  function schedule(opts) {
    if (forceTimer) clearTimeout(forceTimer);
    forceTimer = setTimeout(function () {
      forceTimer = null;
      forceAll();
      wrapButtons(document);
    }, 400);

    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        refresh(opts);
      });
    });
  }

  /* Sync path for React useLayoutEffect — run before paint when possible. */
  window.__tekcroftPageInit = function () {
    wrapButtons(document);
    var softNav = document.documentElement.classList.contains("js-ready");
    if (softNav) {
      forceAll();
    } else {
      document.documentElement.classList.add("js-ready");
      showInView();
    }
    schedule({ forceDelay: 400 });
  };

  window.__tekcroftRevealRefresh = window.__tekcroftPageInit;

  window.addEventListener(
    "pageshow",
    function (e) {
      if (e.persisted && io) {
        try {
          io.disconnect();
        } catch (err) {}
        io = null;
      }
      window.__tekcroftPageInit();
    },
    { passive: true }
  );

  window.addEventListener("tekcroft:nav", function () {
    window.__tekcroftPageInit();
  });
  window.addEventListener("popstate", function () {
    window.__tekcroftPageInit();
  });

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      window.__tekcroftPageInit();
    });
  } else {
    window.__tekcroftPageInit();
  }

  if ("MutationObserver" in window && document.documentElement) {
    var moTimer = null;
    new MutationObserver(function (mutations) {
      var found = false;
      for (var i = 0; i < mutations.length && !found; i++) {
        var m = mutations[i];
        if (!m.addedNodes) continue;
        for (var j = 0; j < m.addedNodes.length; j++) {
          var n = m.addedNodes[j];
          if (n.nodeType !== 1) continue;
          if (
            (n.classList &&
              (n.classList.contains("rv") ||
                n.classList.contains("btn") ||
                n.classList.contains("eg-card"))) ||
            (n.querySelectorAll &&
              (n.querySelectorAll(".rv").length ||
                n.querySelectorAll(".btn").length ||
                n.querySelectorAll(".eg-card").length))
          ) {
            found = true;
            break;
          }
        }
      }
      if (!found) return;
      if (moTimer) clearTimeout(moTimer);
      moTimer = setTimeout(function () {
        window.__tekcroftPageInit();
      }, 16);
    }).observe(document.documentElement, { childList: true, subtree: true });
  }
})();
