/* ============================================================
   Approach / process section (.eg-sec)

   Desktop (>1000px): auto-rotate + hover-to-select. Normal height.

   Mobile (≤1000px): compact content height (no tall track, no pin).
   Steps advance from viewport scroll position, swipe, or a short
   auto-timer. Timer pauses while the user is scrolling/swiping.
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

  function init(pw) {
    if (pw.__egScroll) return;
    var sec = pw.closest(".eg-sec");
    if (!sec) return;

    var steps = $$(".walk-step", pw);
    var n = steps.length;
    if (n < 2) return;

    pw.__egScroll = true;

    var arc = pw.querySelector(".eg-arc");
    var at = -1;
    var tick = null;
    var mode = null; /* "desk" | "mob" */
    var swipeWired = false;
    var inView = false;
    var hold = false;
    var holdTimer = null;

    function light(k) {
      k = Math.max(0, Math.min(n - 1, k | 0));
      if (k === at) return;
      at = k;
      steps.forEach(function (s, i) {
        s.classList.toggle("on", i === k);
      });
      pw.setAttribute("data-at", String(k));
      if (arc) {
        arc.style.transition = "";
        arc.style.strokeDashoffset = "";
      }
    }

    function stopTimer() {
      if (tick) {
        clearInterval(tick);
        tick = null;
      }
    }

    function runTimer() {
      if (calm || tick || !inView || hold) return;
      /* Mobile cycles sooner; desktop keeps the original 1.6s pace. */
      var ms = mode === "mob" ? 3200 : 1600;
      tick = setInterval(function () {
        light((at + 1) % n);
      }, ms);
    }

    /* Pause auto-advance while the user is driving the step. */
    function pauseForUser() {
      hold = true;
      stopTimer();
      if (holdTimer) clearTimeout(holdTimer);
      holdTimer = setTimeout(function () {
        hold = false;
        holdTimer = null;
        if (inView) runTimer();
      }, 1400);
    }

    function bump(d) {
      light((at + d + n) % n);
      pauseForUser();
    }

    /* Desktop hover selects a step and pauses the timer. */
    steps.forEach(function (s, i) {
      s.addEventListener("mouseenter", function () {
        if (mode !== "desk") return;
        light(i);
        stopTimer();
      });
    });
    pw.addEventListener("mouseleave", function () {
      if (mode !== "desk") return;
      runTimer();
    });

    /* Mobile: steps follow the section only while it is on screen.
       Before it enters → 01. While its top travels bottom→top of the
       viewport → 01…04. After it leaves above → stay on 04. */
    function applyScrollStep() {
      if (mode !== "mob") return;
      var rect = sec.getBoundingClientRect();
      var vh = window.innerHeight || 1;

      if (rect.top >= vh) {
        /* Still below the viewport — do not advance. */
        if (at !== 0) {
          pauseForUser();
          light(0);
        }
        return;
      }
      if (rect.bottom <= 0) {
        /* Fully past — lock the last step. */
        if (at !== n - 1) {
          pauseForUser();
          light(n - 1);
        }
        return;
      }

      /* On screen: map section top from viewport bottom (0) to top (1). */
      var p = 1 - rect.top / vh;
      p = Math.max(0, Math.min(1, p));
      var next = Math.round(p * (n - 1));
      if (next === at) return;
      pauseForUser();
      light(next);
    }

    var ticking = false;
    function onScroll() {
      if (mode !== "mob") return;
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () {
        ticking = false;
        applyScrollStep();
      });
    }

    /* Mobile: clear horizontal swipe only — vertical page scroll stays free. */
    var x0 = null;
    var y0 = null;
    function swipeStart(x, y) {
      if (mode !== "mob") return;
      x0 = x;
      y0 = y;
    }
    function swipeEnd(x, y) {
      if (mode !== "mob" || x0 === null) {
        x0 = null;
        y0 = null;
        return;
      }
      var dx = x - x0;
      var dy = y - y0;
      x0 = null;
      y0 = null;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        bump(dx < 0 ? 1 : -1);
      }
    }

    function wireSwipe() {
      if (swipeWired) return;
      swipeWired = true;
      pw.addEventListener(
        "touchstart",
        function (e) {
          var t = e.changedTouches[0];
          swipeStart(t.clientX, t.clientY);
        },
        { passive: true }
      );
      pw.addEventListener(
        "touchend",
        function (e) {
          var t = e.changedTouches[0];
          swipeEnd(t.clientX, t.clientY);
        },
        { passive: true }
      );
      pw.addEventListener(
        "touchcancel",
        function () {
          x0 = null;
          y0 = null;
        },
        { passive: true }
      );
      pw.addEventListener(
        "pointerdown",
        function (e) {
          if (e.pointerType === "mouse") swipeStart(e.clientX, e.clientY);
        },
        { passive: true }
      );
      pw.addEventListener(
        "pointerup",
        function (e) {
          if (e.pointerType === "mouse") swipeEnd(e.clientX, e.clientY);
        },
        { passive: true }
      );
    }

    var io = new IntersectionObserver(
      function (entries) {
        inView = entries[0].isIntersecting;
        if (!inView) {
          stopTimer();
          if (mode === "mob") applyScrollStep();
          return;
        }
        steps.forEach(function (s) {
          s.classList.add("seen");
        });
        if (mode === "mob") applyScrollStep();
        else if (at < 0) light(0);
        runTimer();
      },
      { threshold: 0 }
    );

    function setMode(next) {
      if (next === mode) return;
      stopTimer();
      mode = next;
      sec.classList.remove("eg-scroll");
      sec.style.height = "";
      if (arc) {
        arc.style.transition = "";
        arc.style.strokeDashoffset = "";
      }
      if (next === "mob") wireSwipe();
      if (at < 0) light(0);
      else light(at);
      if (inView) {
        if (next === "mob") applyScrollStep();
        runTimer();
      }
    }

    function syncMode() {
      setMode(narrow.matches ? "mob" : "desk");
    }

    syncMode();
    io.observe(pw);
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", syncMode, { passive: true });
    if (narrow.addEventListener) narrow.addEventListener("change", syncMode);
    else if (narrow.addListener) narrow.addListener(syncMode);
  }

  function boot() {
    $$(".eg-sec .eg").forEach(function (pw) {
      if (!pw.querySelector(".walk-step")) return;
      /* Soft-nav remounts nodes; clear stale flag if re-used. */
      if (pw.__egScroll && !document.documentElement.contains(pw)) {
        pw.__egScroll = false;
      }
      init(pw);
      /* Immediate reveal so cards are never stuck opacity:0 awaiting IO. */
      $$(".walk-step, .eg-card", pw).forEach(function (s) {
        s.classList.add("seen");
      });
      if (!pw.querySelector(".eg-card.on, .walk-step.on")) {
        var first = pw.querySelector(".eg-card, .walk-step");
        if (first) first.classList.add("on");
        if (!pw.getAttribute("data-at")) pw.setAttribute("data-at", "0");
      }
    });
  }

  /* Soft-nav remounts .eg nodes — re-scan on every route change. */
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
