/* ============================================================
   Approach / process section (.eg-sec)

   No scroll-pin and no scroll-to-step mapping. The section is a
   normal block. Steps advance by:
     - auto, every 3s, looping 01 → 04 → 01
     - swipe on the card (left = next, right = prev)
     - Prev / Next buttons, mobile only
   A manual move restarts the 3s timer. Desktop pauses while the
   pointer is over the section. Auto pauses while the tab is hidden.
   The ring fills from the current stop toward the next over those 3s.
   ============================================================ */
(function () {
  "use strict";
  if (window.__tekcroftEgScroll) return;
  window.__tekcroftEgScroll = true;

  var $$ = function (s, r) {
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var calm =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var narrow = window.matchMedia("(max-width: 1000px)");
  var DWELL = 3000;
  var STOPS = [563.5, 510.5, 447.7, 392.7];

  var CHEV_L =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6 9 12l6 6"/></svg>';
  var CHEV_R =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  function stopFor(i, n) {
    if (n === 4) return STOPS[i];
    var a = STOPS[0];
    var b = STOPS[STOPS.length - 1];
    if (n < 2) return a;
    return a + ((b - a) * i) / (n - 1);
  }

  function init(pw) {
    if (pw.__egScroll) return;
    var sec = pw.closest(".eg-sec");
    if (!sec) return;
    var steps = $$(".walk-step", pw);
    var n = steps.length;
    if (n < 2) return;

    pw.__egScroll = true;

    var arc = pw.querySelector(".eg-arc");
    var list = pw.querySelector(".eg-list");
    var at = 0;
    var from = stopFor(0, n);
    var to = stopFor(1, n);
    var acc = 0;
    var last = 0;
    var raf = 0;
    var inView = false;
    var hovering = false;

    sec.classList.remove("eg-scroll");
    sec.style.height = "";
    sec.style.minHeight = "";
    if (arc) arc.style.transition = "none";

    function paint(offset) {
      if (!arc) return;
      arc.style.transition = "none";
      arc.style.strokeDashoffset = String(offset);
    }

    function setStep(k) {
      at = ((k % n) + n) % n;
      steps.forEach(function (s, i) {
        s.classList.toggle("on", i === at);
        s.classList.add("seen");
        s.style.removeProperty("opacity");
        s.style.removeProperty("transform");
        s.style.removeProperty("visibility");
      });
      pw.setAttribute("data-at", String(at));
      from = stopFor(at, n);
      if (at < n - 1) to = stopFor(at + 1, n);
      else to = from - (stopFor(0, n) - stopFor(1, n));
      acc = 0;
      last = 0;
      paint(calm ? from : from);
    }

    function shouldRun() {
      if (!inView || document.hidden) return false;
      if (hovering && !narrow.matches) return false;
      return true;
    }

    function frame(now) {
      raf = 0;
      if (!shouldRun()) return;
      if (!last) last = now;
      acc += now - last;
      last = now;
      var t = acc / DWELL;
      if (t >= 1) {
        setStep(at + 1);
        if (shouldRun()) raf = requestAnimationFrame(frame);
        return;
      }
      paint(calm ? from : from + (to - from) * t);
      raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (raf || !shouldRun()) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function manual(delta) {
      setStep(at + delta);
      kick();
    }

    if (list && !pw.querySelector(".eg-nav")) {
      var nav = document.createElement("div");
      nav.className = "eg-nav";
      nav.innerHTML =
        '<button type="button" class="eg-prev" aria-label="Previous step">' +
        CHEV_L +
        "<span>Prev</span></button>" +
        '<button type="button" class="eg-next" aria-label="Next step"><span>Next</span>' +
        CHEV_R +
        "</button>";
      list.parentNode.insertBefore(nav, list);
      nav.querySelector(".eg-prev").addEventListener("click", function () {
        manual(-1);
      });
      nav.querySelector(".eg-next").addEventListener("click", function () {
        manual(1);
      });
    }

    if (list) {
      var x0 = null;
      var y0 = null;
      var pid = null;
      list.addEventListener(
        "pointerdown",
        function (e) {
          if (!narrow.matches) return;
          if (e.pointerType === "mouse" && e.button !== 0) return;
          x0 = e.clientX;
          y0 = e.clientY;
          pid = e.pointerId;
        },
        { passive: true }
      );
      list.addEventListener(
        "pointerup",
        function (e) {
          if (x0 === null || e.pointerId !== pid) return;
          var dx = e.clientX - x0;
          var dy = e.clientY - y0;
          x0 = null;
          y0 = null;
          pid = null;
          if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
            manual(dx < 0 ? 1 : -1);
          }
        },
        { passive: true }
      );
      list.addEventListener(
        "pointercancel",
        function () {
          x0 = null;
          y0 = null;
          pid = null;
        },
        { passive: true }
      );
    }

    sec.addEventListener("mouseenter", function () {
      if (narrow.matches) return;
      hovering = true;
      last = 0;
    });
    sec.addEventListener("mouseleave", function () {
      hovering = false;
      kick();
    });

    document.addEventListener("visibilitychange", function () {
      last = 0;
      if (!document.hidden) kick();
    });

    var io = new IntersectionObserver(
      function (entries) {
        inView = entries[0].isIntersecting;
        last = 0;
        if (inView) kick();
      },
      { threshold: 0.15 }
    );

    setStep(0);
    io.observe(pw);
    if (narrow.addEventListener) {
      narrow.addEventListener("change", function () {
        hovering = false;
        last = 0;
        kick();
      });
    }
  }

  function boot() {
    $$(".eg-sec .eg").forEach(function (pw) {
      if (!pw.querySelector(".walk-step")) return;
      if (pw.__egScroll && !document.documentElement.contains(pw)) {
        pw.__egScroll = false;
      }
      init(pw);
    });
  }

  window.__tekcroftEgScrollRefresh = boot;
  window.addEventListener("tekcroft:nav", boot);
  window.addEventListener("pageshow", boot);
  window.addEventListener("popstate", boot);

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
