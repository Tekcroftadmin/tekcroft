/* Global 404 — chrome (theme/nav) + mouse-parallax on the big 404 */
(function () {
  "use strict";
  var $ = function (s, r) {
    return (r || document).querySelector(s);
  };
  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  $$(".js-theme").forEach(function (btn) {
    btn.addEventListener("click", function () {
      root.setAttribute(
        "data-theme",
        root.getAttribute("data-theme") === "dark" ? "light" : "dark"
      );
      btn.classList.toggle("spin");
    });
  });

  /* ---------------- button labels (site ink-wipe expects .btn-label) ---------------- */
  $$(".btn").forEach(function (btn) {
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

  /* ---------------- nav ---------------- */
  var nav = $("#nav"),
    burger = $(".js-burger"),
    mnav = $(".js-mnav");

  function navHeight() {
    if (!nav) return;
    var __bar = nav.querySelector(".nav-in");
    var __cs = getComputedStyle(nav);
    var __h =
      (__bar ? __bar.offsetHeight : 64) +
      (parseFloat(__cs.paddingTop) || 0) +
      (parseFloat(__cs.paddingBottom) || 0);
    root.style.setProperty("--nav-h", Math.round(__h) + "px");root.style.setProperty("--nav-h-live", Math.round(__h) + "px");
  }
  navHeight();
  window.addEventListener("resize", navHeight);

  /* 404 scene is a soft plate (not a photo hero) — keep the nav solid so
     light-mode chrome stays readable over the aurora. */
  var queued = false;
  function onScroll() {
    queued = false;
    if (nav) nav.classList.add("stuck");
  }
  window.addEventListener(
    "scroll",
    function () {
      if (queued) return;
      queued = true;
      requestAnimationFrame(onScroll);
    },
    { passive: true }
  );
  onScroll();

  function closeMenu() {
    if (!mnav) return;
    mnav.classList.remove("open");
    if (burger) {
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  }
  if (burger && mnav) {
    burger.addEventListener("click", function () {
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.addEventListener("click", function (e) {
      if (e.target.closest(".mm-acc")) return;
      if (e.target.closest("a[href],[data-jump]")) closeMenu();
    });
  }
/* ---------------- 404 mouse-parallax tilt ---------------- */
  var big = document.getElementById("nfBig");
  var reduce = false;
  try {
    reduce = matchMedia("(prefers-reduced-motion:reduce)").matches;
  } catch (e) {}
  if (big && !reduce) {
    window.addEventListener(
      "pointermove",
      function (e) {
        var x = e.clientX / window.innerWidth - 0.5,
          y = e.clientY / window.innerHeight - 0.5;
        big.style.transform =
          "rotateX(" +
          (-y * 12).toFixed(1) +
          "deg) rotateY(" +
          (x * 14).toFixed(1) +
          "deg) translateZ(0)";
      },
      { passive: true }
    );
    window.addEventListener(
      "pointerleave",
      function () {
        big.style.transform = "";
      },
      { passive: true }
    );
  }
})();
