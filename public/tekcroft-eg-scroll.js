/* ============================================================
   Approach / process section (.eg-sec)

   Desktop / tablet (>767px):
     - auto every 3s, looping
     - click / tap a step card (restarts the 3s timer)
     - swipe on the card list (≤1000px)
     - Prev / Next buttons (≤1000px)
     - Desktop pauses while the pointer moves over the section
   Mobile (≤767px) sticky stack (same values as platforms cards):
     - no autoplay (scroll owns the active step)
     - sticky stacking cards; top card drives circle / arc / image
     - arc tip stays on the active dot (never past the last)
   Auto pauses while the section is off-screen or the tab is hidden.
   prefers-reduced-motion: no autoplay (manual still works above 767).
   Soft-nav: destroy + re-init on tekcroft:nav so timers do not leak.
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
  /* Carousel layout / swipe / Prev-Next (existing eg mobile sheet) */
  var narrow = window.matchMedia("(max-width: 1000px)");
  /* Sticky stack mode — same breakpoint as platforms sticky lock */
  var stackMq = window.matchMedia("(max-width: 767px)");
  var DWELL = 3000;
  /* Circle r=90 in viewBox 0 0 200 200 → circumference 2πr */
  var ARC_R = 90;
  var ARC_C = 2 * Math.PI * ARC_R;
  /* Tiny visible stub at step 1 so the round linecap reads on the first dot */
  var ARC_STUB = 2;

  var CHEV_L =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6 9 12l6 6"/></svg>';
  var CHEV_R =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="m9 6 6 6-6 6"/></svg>';

  function cwDelta(from, to) {
    var d = to - from;
    while (d < 0) d += 2 * Math.PI;
    while (d >= 2 * Math.PI) d -= 2 * Math.PI;
    /* First dot ≈ stroke start: measurement noise can land just
       "behind" the start and wrap to ~359°, shooting the arc
       almost full-circle. Snap that to 0. */
    if (d > 2 * Math.PI - 0.15) d = 0;
    return d;
  }

  function arcRotateRad(arc) {
    if (!arc) return 0;
    var tr = window.getComputedStyle(arc).transform;
    if (!tr || tr === "none") return 0;
    var m = tr.match(/matrix\(([^)]+)\)/);
    if (!m) return 0;
    var p = m[1].split(",").map(parseFloat);
    return Math.atan2(p[1], p[0]);
  }

  /* Build stroke-dashoffset stops from real .eg-node centres so the arc
     tip lands on each active dot (any step count / page layout). */
  function measureStops(pw, arc, stepCount) {
    var nodes = $$(".eg-node", pw);
    var core = pw.querySelector(".eg-core") || pw;
    var startAng = arcRotateRad(arc);
    var angles = [];
    var i;
    var node;
    var prevDisplay = [];
    var prevVisibility = [];

    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      prevDisplay[i] = node.style.display;
      prevVisibility[i] = node.style.visibility;
      /* Mobile hides dots — still need their laid-out centres */
      if (window.getComputedStyle(node).display === "none") {
        node.style.display = "block";
        node.style.visibility = "hidden";
      }
    }

    var cr = core.getBoundingClientRect();
    var cx = cr.left + cr.width / 2;
    var cy = cr.top + cr.height / 2;

    for (i = 0; i < nodes.length; i++) {
      node = nodes[i];
      var nr = node.getBoundingClientRect();
      if (nr.width > 0 || nr.height > 0) {
        angles.push(
          Math.atan2(
            nr.top + nr.height / 2 - cy,
            nr.left + nr.width / 2 - cx
          )
        );
      }
      node.style.display = prevDisplay[i];
      node.style.visibility = prevVisibility[i];
    }

    var stops = [];
    if (angles.length >= 2) {
      var count = Math.min(stepCount, angles.length);
      for (i = 0; i < count; i++) {
        var len = ARC_R * cwDelta(startAng, angles[i]);
        if (i === 0) len = Math.max(len, ARC_STUB);
        stops.push(ARC_C - len);
      }
    }

    /* Fallback if nodes missing: even spacing over the default right-side sweep */
    if (stops.length < 2) {
      var span = (Math.PI * 2) / 3;
      for (i = 0; i < stepCount; i++) {
        var L = i === 0 ? ARC_STUB : (span * i) / (stepCount - 1);
        stops.push(ARC_C - L);
      }
    } else if (stops.length < stepCount) {
      /* More steps than dots — extrapolate evenly beyond last measured */
      var last = stops[stops.length - 1];
      var prev = stops[stops.length - 2];
      var step = last - prev;
      while (stops.length < stepCount) {
        last = last + step;
        stops.push(last);
      }
    }

    return stops;
  }

  var live = [];

  function destroy(pw) {
    if (pw && typeof pw.__egCleanup === "function") {
      try {
        pw.__egCleanup();
      } catch (err) {}
    }
    if (pw) {
      pw.__egCleanup = null;
      pw.__egScroll = false;
    }
    var ix = live.indexOf(pw);
    if (ix >= 0) live.splice(ix, 1);
  }

  function destroyOrphans() {
    live.slice().forEach(function (pw) {
      if (!pw || !document.documentElement.contains(pw)) destroy(pw);
    });
  }

  function init(pw) {
    if (pw.__egScroll && document.documentElement.contains(pw)) return;
    destroy(pw);

    var sec = pw.closest(".eg-sec");
    if (!sec) return;
    var steps = $$(".walk-step", pw);
    var n = steps.length;
    if (n < 2) return;

    pw.__egScroll = true;

    var arc = pw.querySelector(".eg-arc");
    var list = pw.querySelector(".eg-list");
    var stops = measureStops(pw, arc, n);
    var at = 0;
    var from = stops[0];
    var to = stops[1];
    var acc = 0;
    var last = 0;
    var raf = 0;
    var inView = false;
    var hovering = false;
    var nav = null;
    var prevBtn = null;
    var nextBtn = null;
    var scrollRaf = 0;

    sec.classList.remove("eg-scroll");
    sec.style.height = "";
    sec.style.minHeight = "";
    if (arc) arc.style.transition = "none";

    function isStack() {
      return stackMq.matches;
    }

    function stopAt(i) {
      var k = ((i % stops.length) + stops.length) % stops.length;
      return stops[k];
    }

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
      from = stopAt(at);
      /* Hold at the last dot during its dwell — never draw past it.
         Loop snaps back to step 1 via setStep(0).
         In sticky-stack mode there is no dwell toward the next step. */
      if (!isStack() && at < n - 1) to = stopAt(at + 1);
      else to = from;
      acc = 0;
      last = 0;
      paint(from);
    }

    function shouldRun() {
      if (calm) return false;
      /* Sticky stack: scroll owns the step — no autoplay fight. */
      if (isStack()) return false;
      if (!inView || document.hidden) return false;
      if (hovering && !narrow.matches) return false;
      return true;
    }

    function stopRaf() {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      last = 0;
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
      paint(from + (to - from) * t);
      raf = requestAnimationFrame(frame);
    }

    function kick() {
      if (raf || !shouldRun()) return;
      last = 0;
      raf = requestAnimationFrame(frame);
    }

    function manual(delta) {
      if (isStack()) return;
      setStep(at + delta);
      kick();
    }

    function onStepActivate(i) {
      if (isStack()) return;
      setStep(i);
      kick();
    }

    function onStepClick(e) {
      var i = steps.indexOf(e.currentTarget);
      if (i < 0) return;
      onStepActivate(i);
    }

    steps.forEach(function (s) {
      s.addEventListener("click", onStepClick);
    });

    function onPrev() {
      manual(-1);
    }
    function onNext() {
      manual(1);
    }

    nav = pw.querySelector(".eg-nav");
    if (list && !nav) {
      nav = document.createElement("div");
      nav.className = "eg-nav";
      nav.innerHTML =
        '<button type="button" class="eg-prev" aria-label="Previous step">' +
        CHEV_L +
        "<span>Prev</span></button>" +
        '<button type="button" class="eg-next" aria-label="Next step"><span>Next</span>' +
        CHEV_R +
        "</button>";
      list.parentNode.insertBefore(nav, list);
    }
    if (nav) {
      prevBtn = nav.querySelector(".eg-prev");
      nextBtn = nav.querySelector(".eg-next");
      if (prevBtn) prevBtn.addEventListener("click", onPrev);
      if (nextBtn) nextBtn.addEventListener("click", onNext);
    }

    var x0 = null;
    var y0 = null;
    var pid = null;
    function onPointerDown(e) {
      if (!narrow.matches || isStack()) return;
      if (e.pointerType === "mouse" && e.button !== 0) return;
      x0 = e.clientX;
      y0 = e.clientY;
      pid = e.pointerId;
    }
    function onPointerUp(e) {
      if (x0 === null || e.pointerId !== pid) return;
      var dx = e.clientX - x0;
      var dy = e.clientY - y0;
      x0 = null;
      y0 = null;
      pid = null;
      if (isStack()) return;
      if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) {
        manual(dx < 0 ? 1 : -1);
      }
    }
    function onPointerCancel() {
      x0 = null;
      y0 = null;
      pid = null;
    }
    if (list) {
      list.addEventListener("pointerdown", onPointerDown, { passive: true });
      list.addEventListener("pointerup", onPointerUp, { passive: true });
      list.addEventListener("pointercancel", onPointerCancel, { passive: true });
    }

    /* Pause only on real pointer movement. mouseenter alone also fires when
       the section scrolls under a stationary cursor — that looked like
       "autoplay never runs" while watching the block. */
    function onMove() {
      if (narrow.matches || isStack()) return;
      if (hovering) return;
      hovering = true;
      stopRaf();
    }
    function onLeave() {
      hovering = false;
      kick();
    }
    sec.addEventListener("mousemove", onMove, { passive: true });
    sec.addEventListener("mouseleave", onLeave);

    function onVis() {
      last = 0;
      if (document.hidden) stopRaf();
      else kick();
    }
    document.addEventListener("visibilitychange", onVis);

    var io = new IntersectionObserver(
      function (entries) {
        inView = !!(entries[0] && entries[0].isIntersecting);
        last = 0;
        if (inView) {
          if (isStack()) syncStack();
          else kick();
        } else stopRaf();
      },
      { threshold: 0.15 }
    );

    /* Sticky-stack: which card is on top of the pile drives data-at.
       Same top formula as platforms: nav-h + 16 + stop * 12. */
    function syncStack() {
      if (!isStack()) return;
      var navH =
        parseFloat(
          getComputedStyle(document.documentElement).getPropertyValue("--nav-h")
        ) || 64;
      var base = navH + 16;
      var best = 0;
      var i;
      for (i = 0; i < n; i++) {
        var top = steps[i].getBoundingClientRect().top;
        var stickAt = base + i * 12;
        if (top <= stickAt + 1.5) best = i;
      }
      if (best !== at) setStep(best);
      else {
        /* Keep arc parked on the active stop (no mid-dwell progress). */
        to = from;
        paint(from);
      }
    }

    function onScroll() {
      if (!isStack()) return;
      if (scrollRaf) return;
      scrollRaf = requestAnimationFrame(function () {
        scrollRaf = 0;
        syncStack();
      });
    }
    window.addEventListener("scroll", onScroll, { passive: true });

    function onModeChange() {
      hovering = false;
      stops = measureStops(pw, arc, n);
      stopRaf();
      if (isStack()) {
        syncStack();
      } else {
        from = stopAt(at);
        to = at < n - 1 ? stopAt(at + 1) : from;
        paint(from);
        last = 0;
        kick();
      }
    }
    if (narrow.addEventListener) narrow.addEventListener("change", onModeChange);
    else if (narrow.addListener) narrow.addListener(onModeChange);
    if (stackMq.addEventListener) stackMq.addEventListener("change", onModeChange);
    else if (stackMq.addListener) stackMq.addListener(onModeChange);

    pw.__egCleanup = function () {
      stopRaf();
      if (scrollRaf) {
        cancelAnimationFrame(scrollRaf);
        scrollRaf = 0;
      }
      try {
        io.disconnect();
      } catch (err) {}
      sec.removeEventListener("mousemove", onMove);
      sec.removeEventListener("mouseleave", onLeave);
      document.removeEventListener("visibilitychange", onVis);
      window.removeEventListener("scroll", onScroll);
      if (narrow.removeEventListener) narrow.removeEventListener("change", onModeChange);
      else if (narrow.removeListener) narrow.removeListener(onModeChange);
      if (stackMq.removeEventListener) stackMq.removeEventListener("change", onModeChange);
      else if (stackMq.removeListener) stackMq.removeListener(onModeChange);
      steps.forEach(function (s) {
        s.removeEventListener("click", onStepClick);
      });
      if (prevBtn) prevBtn.removeEventListener("click", onPrev);
      if (nextBtn) nextBtn.removeEventListener("click", onNext);
      if (list) {
        list.removeEventListener("pointerdown", onPointerDown);
        list.removeEventListener("pointerup", onPointerUp);
        list.removeEventListener("pointercancel", onPointerCancel);
      }
    };

    live.push(pw);
    setStep(0);
    io.observe(pw);
    if (isStack()) syncStack();
    else kick();
  }

  function boot() {
    destroyOrphans();
    $$(".eg-sec .eg").forEach(function (pw) {
      if (!pw.querySelector(".walk-step")) return;
      if (!document.documentElement.contains(pw)) {
        destroy(pw);
        return;
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
