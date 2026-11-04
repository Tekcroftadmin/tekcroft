
(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------- theme ---------------- */
  var root = document.documentElement;   /* light is the default; the toggle opts into dark */
  $$(".js-theme").forEach(function(btn){
    btn.addEventListener("click", function(){
      var next = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      root.setAttribute("data-theme", next);
      btn.classList.toggle("spin");
    });
  });

  /* In-page section scroll — never write # into the URL */
  if (!window.__tekcroftDataScroll) {
    window.__tekcroftDataScroll = true;
    document.addEventListener("click", function(e){
      var el = e.target.closest("[data-scroll]");
      if (!el) return;
      e.preventDefault();
      var id = el.getAttribute("data-scroll");
      if (!id) return;
      if (id === "top"){ window.scrollTo({ top:0, behavior:"smooth" }); return; }
      var target = document.getElementById(id);
      if (target){ target.scrollIntoView({ behavior:"smooth", block:"start" }); return; }
      var form = document.querySelector(".hs:not([hidden]) form[data-lead], form[data-lead]");
      if (form) form.scrollIntoView({ behavior:"smooth", block:"center" });
    }, true);
  }

  /* ---------------- button labels ----------------
     A button has one hover move: the ink wipe. The label used to roll its
     letters at the same time, so the roll is gone. The label still has to
     be wrapped rather than left as a bare text node — the wipe is a
     positioned ::before at z-index 0 and would paint straight over loose
     inline text. One span is enough: .btn > * lifts it to z-index 1. */
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

  /* One listener drives everything that reacts to scroll, and it does its
     work inside a frame. Reading layout on every raw scroll event was the
     one thing on this page that could drop frames on a trackpad. */
  var scrollJobs = [], queued = false;
  function runJobs(){
    queued = false;
    for (var i = scrollJobs.length - 1; i >= 0; i--){
      if (scrollJobs[i]() === false) scrollJobs.splice(i, 1);   /* done — stop calling it */
    }
  }
  window.addEventListener("scroll", function(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(runJobs);
  }, { passive:true });
  function onScrollAdd(fn){ if (fn() !== false) scrollJobs.push(fn); }   /* run now, then on scroll */
  function onScrollWatch(fn){ scrollJobs.push(fn); }                     /* only ever on scroll */

  /* The bar only takes its plate once the page has been scrolled. A reload
     restores the old scroll position before the first paint, so the bar was
     arriving with a plate already on and then going transparent once the
     boot put the page back at the top. Turning the restore off stops that,
     and the bar is not allowed to stick at all until the boot is over.
     (The boot branch below already returns the page to the top itself.) */
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";

  /* Everything that has to clear the bar — sticky columns, scroll padding,
     the hero's top — is written against --nav-h, and the bar's height moves
     with the viewport, so it is measured rather than assumed. */
  var __navHQueued = false;
  function navHeight(){
    /* PERF: coalesce resize/menu measurements into one rAF (read then write) */
    if (__navHQueued) return;
    __navHQueued = true;
    requestAnimationFrame(function(){
      __navHQueued = false;
      var __bar = nav.querySelector(".nav-in");
      var __cs = getComputedStyle(nav);
      var __h = (__bar ? __bar.offsetHeight : 64)
        + (parseFloat(__cs.paddingTop) || 0)
        + (parseFloat(__cs.paddingBottom) || 0);
      document.documentElement.style.setProperty("--nav-h", Math.round(__h) + "px");
    });
  }
  navHeight();
  window.addEventListener("resize", navHeight);

  function navPlate(){
    var booting = document.body.classList.contains("booting");
    var was = nav.classList.contains("stuck");
    var now = !booting && window.scrollY > 12;
    nav.classList.toggle("stuck", now);
    if (was !== now) navHeight();
  }
  onScrollAdd(function(){ navPlate(); });

  /* Active page pill on desktop nav links (and Services on service routes) */
  (function markNavCurrent(){
    var path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    $$(".nav-links a[href]").forEach(function(a){
      var href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      var on = href === path;
      if (on) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    var mm = $("#mmTrigger");
    if (!mm) return;
    var service =
      path === "/services" ||
      path === "/seo-services" ||
      path.indexOf("/seo-") === 0 ||
      path.indexOf("/local-seo") === 0 ||
      path.indexOf("/ecommerce-seo") === 0 ||
      path.indexOf("/on-page-seo") === 0 ||
      path.indexOf("/technical-seo") === 0 ||
      path.indexOf("/ai-seo") === 0 ||
      path.indexOf("/franchise-seo") === 0 ||
      path.indexOf("/google-business-profile") === 0 ||
      path.indexOf("/artificial-intelligence") === 0 ||
      path.indexOf("/ai-") === 0 ||
      path.indexOf("/web-design") === 0 ||
      path.indexOf("/custom-software") === 0 ||
      path.indexOf("/mobile-app") === 0 ||
      path.indexOf("/web-and-app") === 0;
    if (service) mm.setAttribute("aria-current", "page");
    else mm.removeAttribute("aria-current");
  })();

  function closeMenu(){
    if (!mnav) return;
    mnav.classList.remove("open");
    if (burger){
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
    navHeight();
  }
  if (burger){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      navHeight();
    });
  }
  $$(".mnav a").forEach(function(a){ a.addEventListener("click", closeMenu); });
  document.addEventListener("keydown", function(e){ if (e.key === "Escape") closeMenu(); });
  window.addEventListener("resize", function(){ if (window.innerWidth > 1080) closeMenu(); else navHeight(); });

  /* the dialog needs somewhere to say it is open; everything the beam
     loop used to drive is now plain, static CSS */
  var modalOpen = false;

  /* ---------------- the rotating keyword ----------------
     Both the ink copy and the beam-lit copy are driven from the same
     index, so the two layers can never fall out of step.
  --------------------------------------------------------------- */
  var KEYWORDS = ["AI-Era Search Growth", "Google", "AI Overviews", "ChatGPT",
                  "Gemini", "Perplexity"];
  var kwSlots = $$("[data-kw]");
  if (kwSlots.length){
    kwSlots.forEach(function(slot){
      slot.innerHTML = "<u></u>" + KEYWORDS.map(function(w, i){
        return "<i" + (i === 0 ? ' class="on"' : "") + ">" + w + "</i>";
      }).join("");
    });

    /* Width comes from CSS grid (longest keyword). JS only swaps classes. */
    var kwAt = 0;
    if (!calm){
      setInterval(function(){
        var next = (kwAt + 1) % KEYWORDS.length;
        kwSlots.forEach(function(slot){
          var words = $$("i", slot);
          words[kwAt].classList.remove("on");
          words[kwAt].classList.add("out");
          words[next].classList.remove("out");
          words[next].classList.add("on");
        });
        kwAt = next;
      }, 2900);
    }
  }

  /* ---------------- hero slider ----------------
     The slides are in the markup, so this only decides which one is lit.
     Add or remove a .hero-slide and the cycle adjusts itself.
  --------------------------------------------------------------- */
  var SHOT_HOLD = 6000;
  var shots = $$(".hero-slide");
  if (shots.length > 1 && !calm){
    var shotAt = 0;
    setInterval(function(){
      if (document.hidden) return;   /* don't cross-fade into an empty tab */
      shots[shotAt].classList.remove("on");
      shotAt = (shotAt + 1) % shots.length;
      shots[shotAt].classList.add("on");
    }, SHOT_HOLD);
  }

  /* ---------------- brand ticker ---------------- */
  var CLIENTS = ["MedVital", "CarePoint", "ServiClean", "FixMaster",
                 "BrightWay", "CloudScale", "DataDrive", "ShopSphere",
                 "PeakCart", "GrowPilot"];
  /* Doubling the row is what makes either loop seamless: the animation
     travels exactly one row's width, so the copy arrives where the original
     left. Two tracks now use that, so it is written once. */
  function fillMarq(el, items, sep){
    if (!el || el.childElementCount > 0) return; /* SSR/static markup already sized */
    var row = items.map(function(t){
      return "<span>" + t + "</span>" + (sep ? "<i></i>" : "");
    }).join("");
    el.innerHTML = row + row;
  }
  fillMarq($("#marqTrack"), CLIENTS, false);
  fillMarq($("#ftMarq"), [
    "SEO", "AI development", "Automation", "Web development",
    "Software development", "Digital marketing", "Local SEO",
    "Answer engine visibility", "Paid search", "Content strategy",
    "Conversion design", "Analytics"
  ], true);

  /* ---------------- reveal on scroll ---------------- */
  var io = new IntersectionObserver(function(entries){
    entries.forEach(function(en){
      if (en.isIntersecting){ en.target.classList.add("in"); io.unobserve(en.target); }
    });
  }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
  function startReveals(){
    $$(".rv").forEach(function(el){ io.observe(el); });
    onScrollWatch(sweepReveals);   /* the observer owns the first paint; this only catches strays */
  }

  /* safety net: anything scrolled past without firing still shows. The list is
     collected once and shrinks as it is used, then the job retires itself. */
  var pending = null;
  function sweepReveals(){
    if (!pending) pending = $$(".rv");
    var vh = window.innerHeight;
    for (var i = pending.length - 1; i >= 0; i--){
      var el = pending[i];
      if (el.classList.contains("in") || el.getBoundingClientRect().top < vh){
        el.classList.add("in");
        pending.splice(i, 1);
      }
    }
    if (!pending.length) return false;   /* every reveal has run — unhook */
  }

  /* ---------------- boot, then the hero entrance ----------------
     Everything above the fold waits for the logo to land, so the
     page does not start animating behind the curtain.
  --------------------------------------------------------------- */
  var hero = $("#top");
  var boot = $("#boot"), bootLogo = $("#bootLogo");
  var navLogo = $(".nav .logo");

  function enterPage(){
    document.body.classList.remove("booting");
    navPlate();                       /* now that scrolling is allowed again */
    hero.classList.add("play");
    startReveals();
    armAutoInvite();
  }

  function skipBoot(){
    if (boot) boot.classList.add("done");
    enterPage();
  }

  /* Boot logo intro — restored original fly-to-nav sequence.
     PERF: do not wait on webfonts; start on next frame; failsafe timeout. */
  if (!boot || calm){
    skipBoot();
  } else {
    document.body.classList.add("booting");
    window.scrollTo(0, 0);

    var started = false;

    function runBoot(){
      if (started) return;
      started = true;

      /* Pin the boot logo exactly onto the nav logo, then push it out to the
         middle of the screen. Flying home is a return to transform:none, so
         the landing is the nav logo's own position by definition — there is
         no second measurement that can disagree with it. */
      function place(){
        if (!bootLogo || !navLogo) return;
        var b = navLogo.getBoundingClientRect();
        bootLogo.style.left = b.left + "px";
        bootLogo.style.top  = b.top  + "px";
        var dx = (window.innerWidth  / 2) - (b.left + b.width  / 2);
        var dy = (window.innerHeight / 2) - (b.top  + b.height / 2);
        bootLogo.style.transform =
          "translate(" + dx + "px," + dy + "px) scale(var(--s))";
      }
      place();

      requestAnimationFrame(function(){ boot.classList.add("lit"); });

      /* Same flight, tighter cadence — hero LCP can paint sooner after land */
      setTimeout(function(){
        boot.classList.add("flying");
        bootLogo.style.transform = "none";
        setTimeout(function(){ boot.classList.add("clear"); }, 360);
      }, 720);

      /* land: hand off to the real logo, drop the curtain, start the page */
      setTimeout(function(){
        enterPage();
        setTimeout(function(){ boot.classList.add("done"); }, 60);
      }, 1550);
    }

    requestAnimationFrame(function(){ requestAnimationFrame(runBoot); });
    setTimeout(runBoot, 300);
    setTimeout(function(){
      if (document.body.classList.contains("booting")) skipBoot();
    }, 3200);
  }

  /* ---------------- count-up ---------------- */
  function countUp(el){
    var target = parseFloat(el.getAttribute("data-count"));
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    /* past a thousand an ungrouped figure stops reading as a quantity and
       starts reading as an id, so the separator goes in */
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
      if (en.isIntersecting){ countUp(en.target); ioCount.unobserve(en.target); }
    });
  }, { threshold:0.6 });
  $$("[data-count]").forEach(function(el){ ioCount.observe(el); });

  /* ---------------- the process walk ----------------
     Two separate things happen here, and keeping them apart is the
     point. The row DRAWS as soon as it is reached — all steps at once,
     each about a tenth of a second behind the last, so the whole
     thing is down in roughly a second. Nobody should have to sit
     through an animation to read a paragraph.

     Only then does the light start stepping along, and that part is
     decoration: if you never watch it, you have still seen everything
     the section had to say. Any layout marked data-walk is wired the
     same way, and each keeps its own timer, which runs only while it
     is the one on screen.

     The process disc (.eg) is different below 1000px: one card at a
     time, auto-advance every 7s, and a drag that restarts the clock.
     Other walks (blueprint strip) keep the 1.6s desktop pace.
  --------------------------------------------------------------- */
  $$("[data-walk]").forEach(function(pw){
    var steps = $$(".walk-step", pw), at = -1, tick = null;
    var isEg = !!pw.querySelector(".eg-list");
    var narrow = window.matchMedia("(max-width: 1000px)");

    function tops(){
      return steps.map(function(s){ return s.getBoundingClientRect().top; });
    }
    function play(before){
      var deltas = steps.map(function(s, k){
        return before[k] - s.getBoundingClientRect().top;
      });
      var moved = [];
      steps.forEach(function(s, k){
        if (!deltas[k]) return;
        s.style.transition = "none";
        s.style.transform = "translateY(" + deltas[k] + "px)";
        moved.push(s);
      });
      if (!moved.length) return;
      void moved[0].offsetHeight;
      moved.forEach(function(s){
        s.style.transition = "transform .52s cubic-bezier(.16,1,.3,1)";
        s.style.transform = "";
        s.addEventListener("transitionend", function done(){
          s.style.transition = "";
          s.removeEventListener("transitionend", done);
        });
      });
    }

    function go(){
      var before = calm ? null : tops();
      at = (at + 1) % steps.length;
      steps.forEach(function(s, k){ s.classList.toggle("on", k === at); });
      pw.setAttribute("data-at", at);
      if (before) play(before);
    }

    function stop(){
      if (tick){ clearInterval(tick); tick = null; }
    }

    function light(k){
      if (k === at) return;
      at = k;
      steps.forEach(function(s, i){ s.classList.toggle("on", i === k); });
      pw.setAttribute("data-at", k);
    }

    function run(){
      if (tick) return;
      tick = setInterval(function(){ light((at + 1) % steps.length); }, 7000);
    }

    var wired = false;

    function move(d){
      if (!isEg || !narrow.matches) return;
      light((at + d + steps.length) % steps.length);
      if (tick){ clearInterval(tick); tick = null; }
      if (!calm) run();
    }

    function wire(){
      if (!isEg || wired) return;
      wired = true;
      var list = pw.querySelector(".eg-list");
      if (!list) return;
      var x0 = null, y0 = null;

      function start(x, y){ x0 = x; y0 = y; }
      function end(x, y){
        if (x0 === null) return;
        if (!narrow.matches){ x0 = null; return; }
        var dx = x - x0, dy = y - y0;
        x0 = null;
        if (Math.abs(dx) > 40 && Math.abs(dx) > Math.abs(dy) * 1.2) move(dx < 0 ? 1 : -1);
      }

      list.addEventListener("touchstart", function(e){
        var t = e.changedTouches[0]; start(t.clientX, t.clientY);
      }, { passive: true });
      list.addEventListener("touchend", function(e){
        var t = e.changedTouches[0]; end(t.clientX, t.clientY);
      }, { passive: true });
      list.addEventListener("touchcancel", function(){ x0 = null; }, { passive: true });

      list.addEventListener("pointerdown", function(e){
        if (e.pointerType === "mouse") start(e.clientX, e.clientY);
      }, { passive: true });
      list.addEventListener("pointerup", function(e){
        if (e.pointerType === "mouse") end(e.clientX, e.clientY);
      }, { passive: true });
    }

    var io = new IntersectionObserver(function(entries){
      var here = entries[0].isIntersecting;
      if (!here){ stop(); return; }
      steps.forEach(function(s){ s.classList.add("seen"); });

      if (isEg && narrow.matches){
        wire();
        if (at < 0) light(0);
        if (calm) return;
        run();
        return;
      }

      if (calm) return;
      if (!tick){
        go();
        tick = setInterval(go, 1600);
      }
    }, { threshold:0.25 });
    io.observe(pw);

    if (isEg){
      var swap = function(){ stop(); io.unobserve(pw); io.observe(pw); };
      if (narrow.addEventListener) narrow.addEventListener("change", swap);
      else narrow.addListener(swap);
    }
  });

  /* ---------------- the review dialog ----------------
     Hidden with [hidden] so it is out of the render tree entirely
     until someone asks for it: no layout, no paint, no cost on load.
     Opening animates opacity and transform only.
  --------------------------------------------------------------- */
  var modal   = $("#modal"),
      frame   = $(".modal-frame", modal),
      lastFocus = null, closeTimer, lastTrigger = null;

  function lockScroll(on){
    if (on){
      /* hiding the scrollbar widens the viewport; the body and the fixed nav
         are both padded so nothing — least of all the button the dialog is
         flying out of — moves sideways at the moment it opens */
      var gap = window.innerWidth - document.documentElement.clientWidth;
      var pad = gap > 0 ? gap + "px" : "";
      document.body.style.paddingRight = pad;
      nav.style.paddingRight = pad;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      nav.style.paddingRight = "";
      document.body.style.overflow = "";
    }
  }

  var modalSeen = false;

  /* ---------------- where the dialog flies from ----------------
     The closed state of the frame is not a fixed offset: it is the trigger
     itself. We measure the dialog at rest, measure the button, and store the
     difference as three custom properties. The frame's own CSS then reads
     them, so opening and closing are a single transform in each direction
     and the browser can keep the whole thing on the compositor.
  --------------------------------------------------------------- */
  function aimAt(trigger){
    /* Read trigger geometry first (before mutating the frame) to avoid
       interleaved style writes + geometry reads (forced reflow). */
    var b = trigger && trigger.getBoundingClientRect ? trigger.getBoundingClientRect() : null;
    var rad = 8;
    if (b && b.width && b.height && trigger){
      rad = parseFloat(getComputedStyle(trigger).borderTopLeftRadius) || 0;
      if (rad < 6) rad = b.height / 2;
      rad = Math.min(rad, b.height / 2);
    }

    frame.style.transition = "none";
    frame.style.transform  = "none";
    var f = frame.getBoundingClientRect();

    var bw, bh, dx, dy;
    if (b && b.width && b.height){
      bw = b.width; bh = b.height;
      dx = (b.left + bw / 2) - (f.left + f.width  / 2);
      dy = (b.top  + bh / 2) - (f.top  + f.height / 2);
    } else {
      /* nothing to open from — a button-shaped seam in the middle of the page */
      bw = Math.min(260, f.width * 0.5); bh = 52; rad = 8;
      dx = 0; dy = 22;
    }

    frame.style.setProperty("--tx",   dx.toFixed(1) + "px");
    frame.style.setProperty("--ty",   dy.toFixed(1) + "px");
    frame.style.setProperty("--cx",   Math.max(0, (f.width  - bw) / 2).toFixed(1) + "px");
    frame.style.setProperty("--cy",   Math.max(0, (f.height - bh) / 2).toFixed(1) + "px");
    frame.style.setProperty("--crad", rad.toFixed(1) + "px");
    frame.style.transform = "";          /* back to the CSS closed state */
    /* Commit closed transform on next frame instead of sync offsetWidth flush */
    requestAnimationFrame(function(){ frame.style.transition = ""; });
  }

  /* one ripple off the trigger's own outline — same box, same radius */
  function spark(trigger){
    if (calm || !trigger || !trigger.getBoundingClientRect) return;
    var b = trigger.getBoundingClientRect();
    if (!b.width) return;
    var cs = getComputedStyle(trigger);
    var el = document.createElement("span");
    el.className = "pop-spark";
    el.style.left   = b.left + "px";
    el.style.top    = b.top  + "px";
    el.style.width  = b.width  + "px";
    el.style.height = b.height + "px";
    el.style.borderRadius = cs.borderTopLeftRadius;
    document.body.appendChild(el);
    setTimeout(function(){ el.remove(); }, 750);
  }

  function openModal(trigger, auto){
    if (!modal.hidden && modal.classList.contains("on")) return;   /* already open */
    clearTimeout(closeTimer);
    modalSeen = true;
    modalOpen = true;

    /* a trigger inside the mobile menu is about to be hidden by closeMenu,
       so the flight starts from the burger the reader actually tapped */
    var src = trigger;
    if (src && src.closest && src.closest(".mnav")) src = burger;
    closeMenu();

    lastFocus   = trigger || document.activeElement;
    lastTrigger = src && src.offsetParent ? src : null;

    /* reset in case this open interrupted a close that had not finished */
    $("#modalBody").style.display = "";
    $("#modalDone").classList.remove("on");
    $$(".field", modal).forEach(function(f){ f.classList.remove("bad"); });

    modal.hidden = false;
    modal.classList.add("arm");     /* blue sheet on, no transition */
    lockScroll(true);
    aimAt(lastTrigger);
    spark(lastTrigger);
    if (lastTrigger){
      lastTrigger.classList.remove("fired");
      requestAnimationFrame(function(){
        if (lastTrigger) lastTrigger.classList.add("fired");
      });
    }

    requestAnimationFrame(function(){
      modal.classList.add("on");
      modal.classList.remove("arm");
      /* a click puts you in the first field; an automatic open lands on the
         close button instead, so it announces itself without hijacking typing */
      var target = auto ? $(".modal-x", modal) : $("#m-name");
      if (target) target.focus({ preventScroll:true });
    });
  }

  function closeModal(){
    if (modal.hidden) return;
    /* re-aim first: the page may have scrolled or resized while it was open,
       so the return flight is measured against where the button is *now* */
    if (lastTrigger && lastTrigger.offsetParent) aimAt(lastTrigger);
    modal.classList.remove("on");
    modal.classList.remove("arm");
    modalOpen = false;
    lockScroll(false);
    if (lastTrigger) lastTrigger.classList.remove("fired");
    closeTimer = setTimeout(function(){
      modal.hidden = true;
      $("#modalBody").style.display = "";
      $("#modalDone").classList.remove("on");
      $$(".field", modal).forEach(function(f){ f.classList.remove("bad"); });
    }, 640);
    if (lastFocus && lastFocus.focus) lastFocus.focus({ preventScroll:true });
  }

  $$("[data-modal]").forEach(function(btn){
    /* data-modal="ask" opens #askModal (tekcroft-ask-modal.js) — leave it alone */
    if (btn.getAttribute("data-modal") === "ask") return;
    btn.addEventListener("click", function(e){ e.preventDefault(); openModal(btn); });
  });
  $$("[data-close]", modal).forEach(function(el){
    el.addEventListener("click", closeModal);
  });

  /* ---------------- the automatic invitation ----------------
     Two gates: every resource has finished loading, and the reader is a tenth
     of the way down the page. Waiting on both keeps the dialog off the
     critical path, and means it is never an entry interstitial — the form
     Google demotes. Shown once per session, and it flies out of the same
     Book a call button a click would have used.
  --------------------------------------------------------------- */
  var AUTO_SCROLL   = 0.15;   /* share of the page scrolled before it appears */
  var AUTO_SETTLE   = 500;    /* ms after that point, so it does not snap open */
  var AUTO_FALLBACK = 9000;   /* ms — only used when the page cannot scroll */

  function seenThisSession(){
    try { return sessionStorage.getItem("tc_invite") === "1"; }
    catch (err) { return false; }
  }
  function markSeen(){
    try { sessionStorage.setItem("tc_invite", "1"); } catch (err) {}
  }

  /* prefer the Book a call button in the nav; fall back to any trigger that
     is actually on screen, so the flight always starts somewhere visible */
  function autoOrigin(){
    var cands = $$(".nav-right [data-modal]").concat($$("[data-modal]"));
    for (var i = 0; i < cands.length; i++){
      var el = cands[i];
      if (el.getAttribute("data-modal") === "ask") continue;
      if (!el.offsetParent) continue;
      var r = el.getBoundingClientRect();
      if (r.width && r.top > 4 && r.bottom < window.innerHeight - 4) return el;
    }
    return null;
  }

  function armAutoInvite(){
    if (seenThisSession()) return;
    var armed = false;

    function fire(){
      if (modalSeen || seenThisSession()) return;
      markSeen();
      openModal(autoOrigin(), true);
    }

    function watchScroll(){
      if (armed) return;
      armed = true;

      var max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0){ setTimeout(fire, AUTO_FALLBACK); return; }

      onScrollAdd(function(){
        if (modalSeen) return false;
        if (window.scrollY / max < AUTO_SCROLL) return;
        setTimeout(fire, AUTO_SETTLE);
        return false;                      /* one shot — retire the job */
      });
    }

    /* gate on the load event, or go now if it has already fired */
    if (document.readyState === "complete") watchScroll();
    else window.addEventListener("load", watchScroll, { once:true });
  }

  document.addEventListener("keydown", function(e){
    if (modal.hidden) return;
    if (e.key === "Escape"){ closeModal(); return; }
    if (e.key !== "Tab") return;
    /* keep focus inside the dialog while it is open */
    var f = $$("button, input, select, a[href]", modal).filter(function(el){
      return el.offsetParent !== null;
    });
    if (!f.length) return;
    var first = f[0], last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if (!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  /* front-end validation only — point the submit at your endpoint when you wire it up */
  var mGo = $("#modalGo");
  if (mGo){
    var checks = [
        ["#wrap-name",  "#m-name",  function(v){ return v.trim().length > 1; }],
        ["#wrap-mail",  "#m-mail",  function(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()); }],
        ["#wrap-phone", "#m-phone", function(v){ return v.replace(/\D/g, "").length >= 7; }],
        ["#wrap-svc",   "#m-svc",   function(v){ return v !== ""; }]
    ];
    var mfFill = $("#mfFill"), mfAt = $("#mfAt");

    /* mark=true is the press: only then may a field go red. While typing it
       can turn green but never red, so nobody is told they are wrong
       halfway through typing an address. One list of rules read two ways —
       to tick a field and to fill the meter — so the two cannot disagree. */
    function grade(mark){
      var done = 0, firstBad = null;
      checks.forEach(function(c){
        var wrap = $(c[0]), input = $(c[1]), ok = c[2](input.value);
        wrap.classList.toggle("good", ok);
        if (ok){ done++; wrap.classList.remove("bad"); }
        else if (mark){ wrap.classList.add("bad"); if (!firstBad) firstBad = input; }
      });
      if (mfFill) mfFill.style.width = (done / checks.length * 100) + "%";
      if (mfAt) mfAt.textContent = done;
      return firstBad;
    }

    mGo.addEventListener("click", function(){
      var firstBad = grade(true);
      if (firstBad){ firstBad.focus(); return; }
      mGo.classList.add("sending");
      setTimeout(function(){
        mGo.classList.remove("sending");
        $("#modalBody").style.display = "none";
        $("#modalDone").classList.add("on");
      }, calm ? 0 : 620);
    });

    $$(".field input, .field select", modal).forEach(function(el){
      el.addEventListener("input", function(){ grade(false); });
      el.addEventListener("change", function(){ grade(false); });
    });
    grade(false);
  }
  /* ---------------- services: the console ----------------
     One rail, one panel. The cards share a grid cell and cross over in
     place, so switching cannot change the height of the block.
  --------------------------------------------------------------- */
  $$("[data-console]").forEach(function(cn){
    var cnTabs  = $$(".cn-tab", cn),
        cnCards = $$(".cn-card", cn),
        cnSheet = $(".cn-sheet", cn),
        cnLift  = $(".cn-lift", cn),
        cnFold  = window.matchMedia("(max-width:1040px)"),
        cnAt    = 0,
        cnSeated = false,
        cnTries = 0;

    /* ---- the travelling pane ----
       The lit pill is one pane parked over the rail, and switching a
       service moves it rather than repainting a row. Where it goes is the
       only thing here that needs measuring, and it is read off the row it
       is going to — four numbers set once, and the transition does the
       carrying. Nothing is tracked frame by frame.

       The width it is given is the row's own column: the row plus the
       right margin the row keeps clear of the sheet. The overhang past
       that is padding on the pane itself, so the reach never has to be
       worked out twice.

       The first placement is not animated. There is nowhere for a pane to
       travel from before anything has been chosen, and a pane sliding in
       from the corner of the block on load would say a switch had been
       thrown when nobody had touched it. */
    function cnPlaceLift(i, animate){
      if (!cnLift) return;
      if (cnFold.matches || i < 0){ cnLift.classList.remove("on"); return; }
      var t = cnTabs[i];
      if (!t) return;
      /* A row with no height has not been laid out yet — the block can be
         reached before the webfont has settled its lines. Measuring it now
         would park the pane on nothing, so the frame is given back and the
         measurement retried, a bounded number of times so a row that is
         genuinely never laid out cannot spin. */
      var h = t.offsetHeight;
      if (!h){
        if (cnTries++ < 20) requestAnimationFrame(function(){ cnPlaceLift(cnAt, false); });
        return;
      }
      cnTries = 0;
      /* PERF: batch all layout reads before style writes */
      var gap = parseFloat(getComputedStyle(t).marginRight) || 0;
      var top = t.offsetTop;
      var left = t.offsetLeft;
      var width = t.offsetWidth + gap;
      if (!animate) cnLift.style.transition = "none";
      cnLift.style.top    = top + "px";
      cnLift.style.left   = left + "px";
      cnLift.style.height = h + "px";
      cnLift.style.width  = width + "px";
      cnLift.classList.add("on");
      if (!animate){
        requestAnimationFrame(function(){ cnLift.style.transition = ""; });
      }
    }

    /* Where a card lives depends on the shape of the block. Beside a rail
       it belongs to the sheet, stacked with its siblings. Once the rail
       has nothing to stand beside, the open card is lifted out and put
       directly after the row that called for it — that is the accordion.
       The rest go back to the sheet, which is out of the paint there. */
    function cnHouse(i){
      if (!cnFold.matches){
        var strayed = cnCards.some(function(c){ return c.parentNode !== cnSheet; });
        if (strayed) cnCards.forEach(function(c){ cnSheet.appendChild(c); });
        return;
      }
      cnCards.forEach(function(c, k){
        if (k === i){
          if (c.previousElementSibling !== cnTabs[k]){
            cnTabs[k].insertAdjacentElement("afterend", c);
          }
        } else if (c.parentNode !== cnSheet){
          cnSheet.appendChild(c);
        }
      });
    }

    /* Whichever service is chosen, its answer should already be under the
       eye. On the wide layout that means the sheet's top edge; on the
       accordion it means the row itself, since the card opens beneath it.
       Not done on every click — if the thing already sits somewhere
       readable the page is left still, because jogging it for no reason
       is worse than not moving at all. */
    function cnReveal(i){
      var mark = cnFold.matches ? cnTabs[i] : cnSheet;
      if (!mark) return;

      var navH = parseFloat(getComputedStyle(document.documentElement)
                  .getPropertyValue("--nav-h")) || 74,
          rest = navH + (cnFold.matches ? 10 : 14),
          top;

      /* a pinned row reports where it is pinned, not where it sits, and
         aiming at that would open the card above the fold — so the pin is
         lifted for the length of one measurement */
      if (cnFold.matches){
        var held = mark.style.position;
        mark.style.position = "static";
        top = mark.getBoundingClientRect().top;
        mark.style.position = held;
      } else {
        top = mark.getBoundingClientRect().top;
      }

      var slack = cnFold.matches ? rest + 90 : window.innerHeight * 0.42;
      if (top >= rest - 2 && top <= slack) return;

      window.scrollTo({
        top: top + window.pageYOffset - rest,
        behavior: calm ? "auto" : "smooth"
      });
    }

    /* i of -1 is a shut accordion — reachable only on the folded layout */
    function cnSetShot(url){
      var plate = $(".cn-plate", cn);
      if (!plate || !url) return;
      plate.style.setProperty("--cn-shot", "url('" + url + "')");
    }
    function cnTabShot(i){
      var t = cnTabs[i];
      return t && t.getAttribute("data-shot");
    }
    function cnSyncRoles(){
      /* Accordion puts panels inside the rail — tablist must not own tabpanels.
         Wide layout: real tabs. Folded: disclosure buttons + regions. */
      var fold = cnFold.matches;
      var rail = $(".cn-rail", cn);
      if (rail){
        if (fold) rail.removeAttribute("role");
        else rail.setAttribute("role", "tablist");
      }
      cnTabs.forEach(function(t, k){
        var on = k === cnAt;
        if (fold){
          t.setAttribute("role", "button");
          t.removeAttribute("aria-selected");
          t.setAttribute("aria-expanded", on ? "true" : "false");
          t.setAttribute("tabindex", "0");
        } else {
          t.setAttribute("role", "tab");
          t.removeAttribute("aria-expanded");
          t.setAttribute("aria-selected", on ? "true" : "false");
          t.setAttribute("tabindex", on ? "0" : "-1");
        }
      });
      cnCards.forEach(function(c, k){
        var on = k === cnAt;
        if (fold){
          c.setAttribute("role", "region");
        } else {
          c.setAttribute("role", "tabpanel");
        }
        c.setAttribute("aria-hidden", on ? "false" : "true");
      });
    }
    function cnShow(i, move){
      cnAt = i;
      cnTabs.forEach(function(t, k){
        t.classList.toggle("on", k === i);
      });
      cnCards.forEach(function(c, k){
        c.classList.toggle("on", k === i);
      });
      cnSyncRoles();
      if (i >= 0) cnSetShot(cnTabShot(i));
      cnHouse(i);
      cnPlaceLift(i, cnSeated && !calm);
      cnSeated = true;
      if (move && i >= 0) cnReveal(i);
    }

    cnTabs.forEach(function(t, i){
      t.addEventListener("click", function(){
        /* a second tap on the open row shuts it, and walks the page back
           to that row, so the index resumes where the reader left it
           rather than wherever the vanished card dropped the scroll */
        if (cnFold.matches && cnAt === i){ cnShow(-1, false); cnReveal(i); return; }
        cnShow(i, true);
      });
      t.addEventListener("keydown", function(e){
        var step = e.key === "ArrowDown" ? 1 : e.key === "ArrowUp" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var next = (i + step + cnTabs.length) % cnTabs.length;
        cnTabs[next].focus();
        /* arrowing the list is browsing, not choosing — the page is held
           still so the rail does not slide out from under the keys */
        cnShow(next, false);
      });
    });

    /* Sub-service hover swaps the rail photograph; leaving restores the
       active tab's own shot. */
    cnCards.forEach(function(card){
      $$(".cn-subs [data-shot]", card).forEach(function(row){
        row.addEventListener("mouseenter", function(){
          cnSetShot(row.getAttribute("data-shot"));
        });
        row.addEventListener("mouseleave", function(){
          if (cnAt >= 0) cnSetShot(cnTabShot(cnAt));
        });
        row.addEventListener("focusin", function(){
          cnSetShot(row.getAttribute("data-shot"));
        });
        row.addEventListener("focusout", function(){
          if (cnAt >= 0) cnSetShot(cnTabShot(cnAt));
        });
      });
    });

    /* crossing the width re-houses the cards, and a block left shut on
       the accordion cannot arrive on the wide layout empty */
    function cnRehouse(){ cnShow(cnAt < 0 && !cnFold.matches ? 0 : cnAt, false); }
    if (cnFold.addEventListener) cnFold.addEventListener("change", cnRehouse);
    else if (cnFold.addListener) cnFold.addListener(cnRehouse);

    /* The rail changes width with the column and its rows change height
       when the webfont lands, and the pane is parked at pixel positions
       that were true before either happened. Both are re-measured, and
       neither is animated: this is the pane being put back where it
       already was, not being sent anywhere. */
    window.addEventListener("resize", function(){ cnPlaceLift(cnAt, false); });
    if (document.fonts && document.fonts.ready){
      document.fonts.ready.then(function(){ cnPlaceLift(cnAt, false); });
    }

    cnShow(0, false);   /* seat the opening card in whichever layout is live */
  });

  /* ---------------- why us: the panel ----------------
     Each instrument is drawn from nothing every time its tab is opened.
     All three panels already exist in the markup — switching only toggles
     which one is shown. Never clone, append, or re-render panel content.
  --------------------------------------------------------------- */
  var wnPanel = $("#wnPanel");
  if (wnPanel && !wnPanel.getAttribute("data-wn-wired")){
    wnPanel.setAttribute("data-wn-wired", "1");
    var wnTabs   = $$(".wn-tab", wnPanel),
        wnBody   = $(".wn-body", wnPanel),
        /* only direct panel children of the folder body — never nested matches */
        wnPanels = wnBody ? $$(":scope > .wn-panel", wnBody) : $$(".wn-panel", wnPanel);

    /* PERF_V2: measure path lengths lazily (was forced reflow at parse time) */
    var wnLensReady = false;
    function wnMeasureLens(){
      if (wnLensReady) return;
      wnLensReady = true;
      $$(".wn-line", wnPanel).forEach(function(pth){
        pth.style.setProperty("--len", pth.getTotalLength().toFixed(1));
      });
    }

    function wnDraw(pnl){
      var segs = $$(".seg", pnl);
      segs.forEach(function(seg){ seg.style.strokeDasharray = "0 999"; });
      requestAnimationFrame(function(){
        segs.forEach(function(seg){
          seg.style.strokeDasharray = seg.getAttribute("data-dash");
        });
      });
    }

    function wnShow(i){
      if (i < 0 || i >= wnPanels.length) return;

      /* the panel squares whichever corner has a tab standing on it */
      if (wnBody){
        wnBody.classList.toggle("first", i === 0);
        wnBody.classList.toggle("last",  i === wnTabs.length - 1);
      }
      wnTabs.forEach(function(t, k){
        t.classList.toggle("on", k === i);
        t.setAttribute("aria-selected", k === i ? "true" : "false");
        t.setAttribute("tabindex", k === i ? "0" : "-1");
      });

      /* show/hide only — never insert or clone */
      wnPanels.forEach(function(pnl, k){
        var on = k === i;
        pnl.classList.toggle("on", on);
        pnl.hidden = !on;
        pnl.setAttribute("aria-hidden", on ? "false" : "true");
        if (on){
          /* restart enter animation without touching the DOM tree */
          pnl.style.animation = "none";
          void pnl.offsetWidth;
          pnl.style.animation = "";
          wnDraw(pnl);
        }
      });
    }

    wnTabs.forEach(function(t, i){
      t.addEventListener("click", function(){ wnShow(i); });
      t.addEventListener("keydown", function(e){
        var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
        if (!step) return;
        e.preventDefault();
        var n = (i + step + wnTabs.length) % wnTabs.length;
        wnTabs[n].focus(); wnShow(n);
      });
    });

    /* initial hidden state for non-selected panels (markup may only use .on) */
    wnPanels.forEach(function(pnl, k){
      if (!pnl.classList.contains("on")){
        pnl.hidden = true;
        pnl.setAttribute("aria-hidden", "true");
      }
    });

    /* it draws when it is first reached, not while it is still off-screen */
    var wnIO = new IntersectionObserver(function(e){
      if (!e[0].isIntersecting) return;
      wnMeasureLens(); wnShow(0);
      wnIO.disconnect();
    }, { threshold:.2 });
    wnIO.observe(wnPanel);
  }

  /* ---------------- selected work ----------------
     The rail already scrolls, snaps and takes the arrow keys on its own.
     This adds the two buttons, keeps the counter honest — position is
     read back off scrollLeft rather than held in a variable, so a swipe,
     a key and a button all report the same place — and closes the run
     into a ring so it never reaches an end.
  --------------------------------------------------------------- */
  (function(){
    var deck = $("#wkDeck"), rail = $("#wkRail");
    if (!deck || !rail) return;

    var cards = $$(".wk-card", rail),
        at    = $("#wkAt"),
        bar   = $("#wkBar"),
        arws  = $$(".wk-arw", deck);
    if (cards.length < 2) return;

    /* Three copies of the set, and the reader is kept in the middle one.
       Running off either end lands on an identical sheet in the copy next
       door, so the scroll position can be moved by exactly one set without
       anything appearing to move — which is the whole trick. The clones
       are hidden from assistive tech; the seven real sheets are read once. */
    var n = cards.length, all = cards;
    (function ring(){
      var before = document.createDocumentFragment(),
          after  = document.createDocumentFragment();
      cards.forEach(function(c){
        [before, after].forEach(function(f){
          var d = c.cloneNode(true);
          d.setAttribute("aria-hidden", "true");
          d.setAttribute("data-clone", "");
          f.appendChild(d);
        });
      });
      rail.appendChild(after);
      rail.insertBefore(before, rail.firstChild);
      all = $$(".wk-card", rail);
    })();

    function step(){ return all[1].offsetLeft - all[0].offsetLeft; }
    function setW(){ return step() * n; }

    /* Called once the scroll has settled, never mid-glide: moving the
       position while a smooth scroll is in flight would fight its target. */
    function ringWrap(){
      var w = setW(); if (!w) return;
      var x = rail.scrollLeft, y = x;
      if (x < w * 0.5) y = x + w;
      else if (x > w * 1.5) y = x - w;
      if (y === x) return;
      var held = rail.style.scrollBehavior;
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = y;
      rail.style.scrollBehavior = held;
      sync();
    }

    /* Which sheet is being looked at is whichever one is nearest the middle
       of the rail — measured, not counted, so the counter can never drift
       from what is actually on screen. Nothing is dimmed: the middle sheet
       is lifted and grown, and the six around it are left as they are. */
    /* PERF: cache card centers; only mutate DOM when active index changes */
    var centers = [];
    var lastOn = -1;
    function measureCenters(){
      /* PERF: single pass of layout reads */
      var next = new Array(all.length);
      for (var k = 0; k < all.length; k++){
        var c = all[k];
        next[k] = c.offsetLeft + c.offsetWidth / 2;
      }
      centers = next;
    }
    function sync(){
      if (!centers.length) measureCenters();
      var mid = rail.scrollLeft + rail.clientWidth / 2, i = 0, near = Infinity;
      for (var k = 0; k < centers.length; k++){
        var d = Math.abs(centers[k] - mid);
        if (d < near){ near = d; i = k; }
      }
      var real = ((i % n) + n) % n;
      var label = ("0" + (real + 1)).slice(-2);
      var pct = ((real + 1) / n * 100) + "%";
      if (i !== lastOn){
        if (lastOn >= 0 && all[lastOn]) all[lastOn].classList.remove("on");
        if (all[i]) all[i].classList.add("on");
        lastOn = i;
      }
      at.textContent = label;
      bar.style.width = pct;
    }

    /* The rail opens on the second sheet rather than the first, because at
       scrollLeft 0 the first one rests against the edge with nothing to its
       left. Seated on the second, there is a sheet cut off on both sides and
       one whole sheet in the middle — which is the shape the set is meant to
       be read in. Done with smooth scrolling switched off, so it is a
       starting position rather than an animation nobody asked for. */
    function seat(){
      var cw = rail.clientWidth;
      if (!cw) return;
      measureCenters();
      var held = rail.style.scrollBehavior, c = all[n + 1];
      var left = c.offsetLeft + c.offsetWidth / 2 - cw / 2;
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = left;
      rail.style.scrollBehavior = held;
      lastOn = -1;
      sync();
    }

    /* A hidden rail measures zero and loses its scroll position, so the width
       going from nothing to something is the signal that the panel has just
       been shown — and it gets seated again. A real window resize never
       crosses zero, so it only re-reads position and leaves the reader where
       they were. */
    var wide = 0;
    var relayoutQueued = false;
    function relayout(){
      if (relayoutQueued) return;
      relayoutQueued = true;
      requestAnimationFrame(function(){
        relayoutQueued = false;
        var w = rail.clientWidth;
        measureCenters();
        if (w && !wide) seat(); else { lastOn = -1; sync(); }
        wide = w;
      });
    }

    arws.forEach(function(b){
      b.addEventListener("click", function(){
        rail.scrollLeft += step() * Number(b.getAttribute("data-wk"));
      });
    });
    var settle, syncQueued = false;
    rail.addEventListener("scroll", function(){
      if (!syncQueued){
        syncQueued = true;
        window.requestAnimationFrame(function(){ syncQueued = false; sync(); });
      }
      clearTimeout(settle);
      settle = setTimeout(ringWrap, 150);
    }, { passive:true });
    window.addEventListener("resize", relayout);

    /* ---- mouse drag ----
       The rail already scrolls on touch and on a trackpad; a mouse has
       neither, so a plain pointer-drag is added on top of the same
       scrollLeft the rest of the deck already reads and writes. Snap and
       smoothing are both switched off for the length of the drag — snap
       would fight the pointer every frame, and smoothing would lag it. */
    var dragging = false, dragX = 0, dragStart = 0, dragMoved = false;
    rail.addEventListener("pointerdown", function(e){
      if (e.pointerType === "touch") return; /* touch already scrolls natively */
      dragging = true; dragMoved = false;
      dragX = e.clientX; dragStart = rail.scrollLeft;
      rail.classList.add("dragging");
      rail.setPointerCapture(e.pointerId);
      stopAuto();
    });
    rail.addEventListener("pointermove", function(e){
      if (!dragging) return;
      var dx = e.clientX - dragX;
      if (Math.abs(dx) > 3) dragMoved = true;
      rail.scrollLeft = dragStart - dx;
    });
    function endDrag(){
      if (!dragging) return;
      dragging = false;
      rail.classList.remove("dragging");
      ringWrap();
      startAuto();
    }
    rail.addEventListener("pointerup", endDrag);
    rail.addEventListener("pointercancel", endDrag);
    /* a drag that moved the rail should not also fire the sheet's own
       link/button underneath the pointer */
    rail.addEventListener("click", function(e){
      if (dragMoved){ e.preventDefault(); e.stopPropagation(); }
    }, true);

    /* ---- autoplay ----
       Advances one sheet at a time on the same step() the arrows use, so
       it lands on exactly the positions a click would. Paused for as long
       as a pointer is over the deck or the rail has keyboard focus, and
       restarted once both are clear — never fights a drag or a manual
       read of the row. */
    var AUTO_MS = 3400, autoTimer = null;
    function startAuto(){
      stopAuto();
      autoTimer = setInterval(function(){
        rail.scrollLeft += step();
      }, AUTO_MS);
    }
    function stopAuto(){
      if (autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    }
    deck.addEventListener("pointerenter", stopAuto);
    deck.addEventListener("pointerleave", function(){ if (!dragging) startAuto(); });
    rail.addEventListener("focusin", stopAuto);
    rail.addEventListener("focusout", startAuto);
    document.addEventListener("visibilitychange", function(){
      if (document.hidden) stopAuto(); else if (!dragging) startAuto();
    });

    deck.classList.add("wired");
    relayout();
    if ("IntersectionObserver" in window){
      new IntersectionObserver(function(entries){
        if (entries[0].isIntersecting){ if (!dragging) startAuto(); }
        else stopAuto();
      }, { threshold: 0.05 }).observe(deck);
    } else {
      startAuto();
    }
  })();

  /* PERF_PATCHED */
  /* PERF_V2 */
  /* Pause expensive infinite CSS animations while off-screen */
  (function(){
    if (calm || !("IntersectionObserver" in window)) return;
    var sel = ".marq-track, .cg-seal svg, .nav-beam, .ft-marq .marq-track";
    var nodes = $(sel);
    if (!nodes.length) return;
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        en.target.style.animationPlayState = en.isIntersecting ? "running" : "paused";
      });
    }, { rootMargin: "80px" });
    nodes.forEach(function(n){ io.observe(n); });
  })();


})();
