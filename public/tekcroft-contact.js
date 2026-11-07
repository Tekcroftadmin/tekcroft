/* === chrome === */

(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };

  /* ---------------- theme ---------------- */
  var root = document.documentElement;
  $$(".js-theme").forEach(function(btn){
    btn.addEventListener("click", function(){
      root.setAttribute("data-theme",
        root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      btn.classList.toggle("spin");
    });
  });

  /* ---------------- button labels ----------------
     The ink wipe is a positioned ::before and would paint over a loose text
     node, so every button's own words get wrapped once, here. */
  $$(".btn").forEach(function(btn){
    if (btn.querySelector(".btn-label")) return;
    Array.prototype.slice.call(btn.childNodes).forEach(function(node){
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
  var nav = $("#nav"), burger = $(".js-burger"), mnav = $(".js-mnav");

  function navHeight(){
    if (nav){
    var __bar = nav.querySelector(".nav-in");
    var __cs = getComputedStyle(nav);
    var __h = (__bar ? __bar.offsetHeight : 64)
      + (parseFloat(__cs.paddingTop) || 0)
      + (parseFloat(__cs.paddingBottom) || 0);
    root.style.setProperty("--nav-h", Math.round(__h) + "px");root.style.setProperty("--nav-h-live", Math.round(__h) + "px");
  }
  }
  navHeight();
  window.addEventListener("resize", navHeight);

  var queued = false;
  function onScroll(){
    queued = false;
    if (nav) nav.classList.toggle("stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", function(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  }, { passive:true });
  onScroll();

  function closeMenu(){
    if (!mnav) return;
    mnav.classList.remove("open");
    burger.classList.remove("open");
    burger.setAttribute("aria-expanded", "false");
  }
  if (burger && mnav){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.addEventListener("click", function(e){ if (e.target.closest(".mm-acc")) return; if (e.target.closest("a[href],[data-jump]")) closeMenu(); });
  }

  /* every "Get a Free Proposal" points at whichever form is on screen */
  $$("[data-jump]").forEach(function(el){
    el.addEventListener("click", function(){
      var form = $(".hs:not([hidden]) form[data-lead]") || $("form[data-lead]");
      if (!form) return;
      closeMenu();
      form.scrollIntoView({ behavior:"smooth", block:"center" });
      var first = form.querySelector("input,select,textarea");
      if (first) setTimeout(function(){ first.focus({ preventScroll:true }); }, 420);
    });
  });

  /* ---------------- the hero's one entrance ---------------- */
  function play(sec){
    if (!sec) return;
    sec.classList.remove("play");
    void sec.offsetWidth;              /* let the removal land before it replays */
    sec.classList.add("play");
  }
  requestAnimationFrame(function(){
    requestAnimationFrame(function(){ play($(".hs:not([hidden])")); });
  });

  /* ---------------- variant switch ----------------
     Review control. Delete this block with its markup and styles once one
     of the two is chosen. */
  var sw = $(".vsw");
  if (sw){
    sw.addEventListener("click", function(e){
      var b = e.target.closest("button[data-variant]");
      if (!b) return;
      var want = b.dataset.variant;
      $$(".vsw button").forEach(function(x){
        x.setAttribute("aria-pressed", x.dataset.variant === want ? "true" : "false");
      });
      $$(".hs").forEach(function(sec){ sec.hidden = sec.id !== "hero-" + want; });
      play($("#hero-" + want));
      window.scrollTo({ top:0, behavior:"auto" });
    });
  }

  /* ---------------- why-section variant switch ----------------
     The same review control as the hero's, on its own attribute so the
     two switches cannot answer each other's clicks. Delete this block
     with its markup and styles once one of the two is chosen. */
  var swWhy = $(".vsw-why");
  if (swWhy){
    swWhy.addEventListener("click", function(e){
      var b = e.target.closest("button[data-why]");
      if (!b) return;
      var want = b.dataset.why;
      $$(".vsw-why button").forEach(function(x){
        x.setAttribute("aria-pressed", x.dataset.why === want ? "true" : "false");
      });
      var one = document.getElementById("why");
      var two = document.getElementById("why-2");
      if (one) one.hidden = want !== "1";
      if (two) two.hidden = want !== "2";
      /* the section that has just appeared has never been scrolled past,
         so its reveals would sit at opacity 0 until the next scroll */
      var shown = want === "1" ? one : two;
      if (shown) $$(".rv", shown).forEach(function(el){ el.classList.add("in"); });
    });
  }

  /* ---------------- the forms ----------------
     The rules hang off each field's own data-rule rather than an id, so the
     form can be moved or duplicated without touching the script. Nothing is
     checked until a person has tried to send once; after that every field
     re-checks itself as it is corrected. */
  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;

  var RULES = {
    name   : function(v){ return v.length >= 2 ? "" : "Please tell us your name."; },
    email  : function(v){ return !v ? "Please add an email we can reply to."
                                    : EMAIL.test(v) ? "" : "That email does not look right."; },
    phone  : function(v){ return v.replace(/\D/g, "").length >= 7 ? ""
                                    : "Please add a number we can reach you on."; },
    service: function(v){ return v ? "" : "Pick the service you are after."; }
  };

  $$("form[data-lead]").forEach(function(form){
    var live = false;
    var fields = $$("[data-rule]", form);

    function check(el){
      var key = el.dataset.rule;
      var box = el.closest(".hs-field");
      var msg = RULES[key] ? RULES[key](el.value.trim()) : "";
      box.setAttribute("data-bad", msg ? "true" : "false");
      el.setAttribute("aria-invalid", msg ? "true" : "false");
      box.querySelector(".hs-err").textContent = msg;
      return !msg;
    }

    fields.forEach(function(el){
      ["input", "change", "blur"].forEach(function(ev){
        el.addEventListener(ev, function(){ if (live) check(el); });
      });
    });

    form.addEventListener("submit", function(e){
      e.preventDefault();
      live = true;
      var bad = null;
      fields.forEach(function(el){ if (!check(el) && !bad) bad = el; });
      if (bad){ bad.focus(); return; }
      form.setAttribute("data-sent", "true");
      form.scrollIntoView({ behavior:"smooth", block:"center" });
    });
  });
})();


/* === tb-script === */

/* ══════════════════════════════════════════════════════════════════════
   Two jobs the hero page did not need until now.

   1. .rv reveals. The class and its transition were already in the
      stylesheet, but nothing was adding .in, so anything marked .rv on
      this page would have stayed at opacity 0. This is the homepage's
      own observer, with the same safety sweep for anything scrolled
      past before it fired.

   2. The count-up, matching the homepage's figures: the number counts,
      the prefix and suffix are wrapped so they can be set smaller, and
      a reduced-motion preference gets the final value straight away.
      Each figure's markup already holds its finished text, so with JS
      off the panel still reads correctly.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- reveal on scroll ---------------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
  $$(".rv").forEach(function(el){ io.observe(el); });

  /* safety net: anything already above the fold shows without waiting */
  requestAnimationFrame(function(){
    $$(".rv").forEach(function(el){
      if (el.getBoundingClientRect().top < window.innerHeight) el.classList.add("in");
    });
  });

  /* ---------------- the client carousel ----------------
     The slide moves the track a flat -50%, so the second half has to be
     an exact copy of the first for the loop to be invisible. Doing it
     here rather than in the markup means the eight logos are written
     once. Under a reduced-motion preference the track does not move and
     is laid out as a static wrapped row, so the copy is skipped — it
     would only show every client twice. */
  var track = document.getElementById("tbMarq");
  if (track && !calm) track.innerHTML += track.innerHTML;

  /* ---------------- count-up ---------------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute("data-count"));
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    function affix(t){ return t ? '<i class="fig-af">' + t + '</i>' : ""; }
    function show(n){
      return affix(prefix) + (n >= 1000 ? n.toLocaleString("en-US") : n) + affix(suffix);
    }
    if (calm){ el.innerHTML = show(target); return; }
    var t0 = null, dur = 1400;
    function frame(t){
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.innerHTML = show(Math.round(target * e));
      if (p < 1) requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }

  var ioCount = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (!en.isIntersecting) return;
      countUp(en.target);
      ioCount.unobserve(en.target);
    });
  }, { threshold:.4 });
  $$("[data-count]").forEach(function(el){ ioCount.observe(el); });
})();
/* === ct-hero-script === */

/* Publishes the pointer's place in the band as two numbers between -1 and
   1. Nothing else: which layer moves, and how far, is the stylesheet's,
   so the depths can be re-tuned without touching this.

   Reads are cheap but a pointermove fires far more often than the screen
   redraws, so the write is deferred to the next frame and any moves in
   between are dropped — one write per frame rather than one per event.
   Left alone on touch screens, where there is no pointer to follow. */
(function(){
  "use strict";
  var hero = document.querySelector(".ct-hero");
  if (!hero) return;
  if (!window.matchMedia("(hover: hover)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var x = 0, y = 0, queued = false;
  function write(){
    queued = false;
    hero.style.setProperty("--mx", x.toFixed(3));
    hero.style.setProperty("--my", y.toFixed(3));
  }
  hero.addEventListener("pointermove", function(e){
    var r = hero.getBoundingClientRect();
    x = (e.clientX - r.left) / r.width  * 2 - 1;
    y = (e.clientY - r.top)  / r.height * 2 - 1;
    if (queued) return;
    queued = true;
    requestAnimationFrame(write);
  });
  hero.addEventListener("pointerleave", function(){
    x = 0; y = 0;
    if (!queued){ queued = true; requestAnimationFrame(write); }
  });
})();
