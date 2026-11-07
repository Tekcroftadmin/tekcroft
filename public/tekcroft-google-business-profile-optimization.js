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
      var form = $(".hs:not([hidden]) form[data-lead]");
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
/* === faq-script (hardened) === */
(function(){
  function panelFor(btn){
    var id = btn.getAttribute("aria-controls");
    return id ? document.getElementById(id) : null;
  }
  function closeAll(list){
    list.querySelectorAll(".faq-q").forEach(function(b){
      b.setAttribute("aria-expanded", "false");
      var p = panelFor(b);
      if (p){ p.setAttribute("data-open", "false"); p.classList.remove("is-open"); }
    });
  }
  document.addEventListener("click", function(e){
    var t = e.target;
    if (t && t.nodeType === 3) t = t.parentElement;
    if (!t || typeof t.closest !== "function") return;
    var btn = t.closest(".faq-q");
    if (!btn) return;
    var list = btn.closest(".faq-list");
    if (!list) return;
    var panel = panelFor(btn);
    if (!panel) return;
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    closeAll(list);
    if (!isOpen){
      btn.setAttribute("aria-expanded", "true");
      panel.setAttribute("data-open", "true");
      panel.classList.add("is-open");
      var wrap = list.closest(".faq-wrap");
      if (wrap){
        var qs = Array.prototype.slice.call(list.querySelectorAll(".faq-q"));
        wrap.dataset.at = String(qs.indexOf(btn) + 1);
      }
    }
  });
})();

/* === cn-script === */

/* ══════════════════════════════════════════════════════════════════════
   THE SERVICES CONSOLE — ported from the homepage, unchanged.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

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
      if (!t.offsetHeight){
        if (cnTries++ < 20) requestAnimationFrame(function(){ cnPlaceLift(cnAt, false); });
        return;
      }
      cnTries = 0;
      var gap = parseFloat(getComputedStyle(t).marginRight) || 0;
      if (!animate) cnLift.style.transition = "none";
      cnLift.style.top    = t.offsetTop + "px";
      cnLift.style.left   = t.offsetLeft + "px";
      cnLift.style.height = t.offsetHeight + "px";
      cnLift.style.width  = (t.offsetWidth + gap) + "px";
      cnLift.classList.add("on");
      if (!animate){ void cnLift.offsetWidth; cnLift.style.transition = ""; }
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
    function cnShow(i, move){
      cnAt = i;
      cnTabs.forEach(function(t, k){
        t.classList.toggle("on", k === i);
        t.setAttribute("aria-selected", k === i ? "true" : "false");
      });
      cnCards.forEach(function(c, k){ c.classList.toggle("on", k === i); });
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
})();


/* === ws-script === */

/* ══════════════════════════════════════════════════════════════════════
   THE TILT

   The pointer's position inside a card, as a fraction from its centre,
   written back as two angles the stylesheet turns into a rotation. Four
   degrees each way: enough to read as a solid thing being turned,
   little enough that the type stays square to the eye.

   Read on pointermove and written on the next frame rather than
   immediately — a rect read and a style write in the same handler makes
   the browser lay out the section again on every pixel of movement.

   pointerenter/leave rather than mouseenter/leave, and the whole thing is
   skipped where a pointer cannot hover, so a tap on a phone does not
   leave a card stuck at an angle nobody asked for.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  if (!window.matchMedia("(hover:hover) and (pointer:fine)").matches) return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  var MAX = 4;                                   /* degrees, each way */
  document.querySelectorAll(".ws-item").forEach(function(card){
    var frame = null, box = null;

    card.addEventListener("pointerenter", function(){
      box = card.getBoundingClientRect();        /* once, on the way in */
    });

    card.addEventListener("pointermove", function(e){
      if (!box || frame) return;
      var x = (e.clientX - box.left) / box.width  - .5;
      var y = (e.clientY - box.top)  / box.height - .5;
      frame = requestAnimationFrame(function(){
        card.style.setProperty("--ry", (x *  MAX * 2).toFixed(2) + "deg");
        card.style.setProperty("--rx", (y * -MAX * 2).toFixed(2) + "deg");
        frame = null;
      });
    });

    card.addEventListener("pointerleave", function(){
      if (frame) { cancelAnimationFrame(frame); frame = null; }
      card.style.setProperty("--ry", "0deg");
      card.style.setProperty("--rx", "0deg");
      box = null;
    });
  });
})();


/* === pf-script === */

/* ══════════════════════════════════════════════════════════════════════
   THE PLATFORM RUN

   The track holds the seven cards twice, because the slide travels a flat
   half of it and the second half has to be an exact copy for the loop to
   have no seam. Doing it here rather than in the markup means each
   platform is written once.

   ── the copy only exists while the run does ────────────────────────
   Below 600px the run is switched off in the stylesheet and the cards go
   back to a stack the page scrolls through. The copy was still being made
   there, so the stack was fourteen cards long: the seven read through,
   and then the same seven again. That is the repeat.

   So the copy follows the layout rather than being made once at load. The
   same query the stylesheet uses is asked here, and it is listened to —
   turn a phone on its side, or drag a window across the breakpoint, and
   the copies are added or taken away to match. Each one is marked so it
   can be found again; nothing else in the track is touched.

   None of it happens under a reduced-motion preference either: there the
   track does not move and the rail is an ordinary scroller, where a
   second copy would just be the same seven cards twice.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  var track = document.querySelector(".pf-track");
  if (!track) return;

  /* the breakpoint the stylesheet stacks at, asked the same way here */
  var running = window.matchMedia("(min-width: 768px)");

  /* The list is snapshotted before anything is appended. track.children
     is a live collection: appending one of its members back into the
     track removes it from the collection at the same time, so walking it
     while appending would skip every other card and leave the second run
     short. */
  var cards = Array.prototype.slice.call(track.children);

  function add(){
    cards.forEach(function(card){
      var copy = card.cloneNode(true);
      /* The originals are marked .rv, which holds an element at opacity 0
         until the reveal observer gives it .in. That observer collected
         its list before these copies existed, so nothing would ever light
         them — the second half of the track would be there, travelling,
         and invisible the whole way. The copies do not need revealing:
         the cards they duplicate have already been seen. */
      copy.classList.remove("rv");
      copy.removeAttribute("style");
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("tabindex", "-1");
      copy.setAttribute("data-copy", "");
      track.appendChild(copy);
    });
  }

  function drop(){
    Array.prototype.slice.call(track.querySelectorAll("[data-copy]"))
      .forEach(function(el){ el.remove(); });
  }

  function sync(){
    var has = !!track.querySelector("[data-copy]");
    if (running.matches && !has) add();
    else if (!running.matches && has) drop();
  }

  sync();
  if (running.addEventListener) running.addEventListener("change", sync);
  else running.addListener(sync);          /* older Safari */
})();


/* === eg-script === */

/* ══════════════════════════════════════════════════════════════════════
   THE WALK — ported from the homepage

   Any layout marked data-walk steps a light along its .walk-step
   children and publishes the index on the container as data-at, so a
   progress arc or a row of pips can be drawn from it without needing a
   script of its own. Each keeps its own timer, and the timer runs only
   while that layout is on screen.

   Everything the section has to say is readable before the light starts
   moving: the cards are all revealed on first sight, and the stepping is
   decoration on top of that.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  $$("[data-walk]").forEach(function(pw){
    var steps = $$(".walk-step", pw), at = -1, tick = null;

    /* On the narrow layout the lit step is pulled to the head of the list
       with `order`, and order cannot be transitioned — the card is simply
       somewhere else on the next frame. So the move is played back: the
       tops are read before the class changes and again after, each card is
       put back where it was with a transform, and then the transform is
       released. The browser animates the release, which looks like the
       card travelling to its new place.

       On the wide layout nothing reorders, every delta is zero, and this
       costs one rect read per step. */
    function tops(){
      return steps.map(function(s){ return s.getBoundingClientRect().top; });
    }
    function play(before){
      /* Every read first, then every write — otherwise reading a rect,
         writing a style and forcing a commit inside one loop pass makes
         the browser lay the page out again on every card. */
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
      void moved[0].offsetHeight;                 /* one commit for them all */
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

    /* ── narrow: the reader walks it, not the timer ───────────────────
       On one column the light stepping every 1.6s is unreadable — five
       cards is more than anyone can catch at that rate, and the layout
       used to reorder them under the thumb as well. Here each card lights
       as it is scrolled to and stays lit until the next one is reached,
       so the section is read at the reader's own pace and the disc still
       counts the stage being looked at.

       The rootMargin pins the trigger to a band across the middle of the
       screen rather than the edge: a card lights when it is where the eye
       is, not when a corner of it appears. */
    var narrow = window.matchMedia("(max-width: 1000px)");

    function stop(){
      if (tick){ clearInterval(tick); tick = null; }
    }

    function light(k){
      if (k === at) return;
      at = k;
      steps.forEach(function(s, i){ s.classList.toggle("on", i === k); });
      pw.setAttribute("data-at", k);
    }

    /* 1.6s is the wide layout's pace, where all five cards are readable
       already and the light is only pointing at one of them. Here the
       light IS the card, so the interval is what a stage takes to read
       rather than what a pointer takes to move. */
    function run(){
      if (tick) return;
      tick = setInterval(function(){ light((at + 1) % steps.length); }, 7000);
    }

    var wired = false;

    /* Moving a stage by hand restarts the clock rather than stopping it.
       Killing the timer outright meant one drag left the carousel dead
       for the rest of the visit; resetting it gives the stage just landed
       on a full read before anything moves on its own again. */
    function move(d){
      light((at + d + steps.length) % steps.length);
      if (tick){ clearInterval(tick); tick = null; }
      if (!calm) run();
    }

    /* ── narrow: the drag ─────────────────────────────────────────────
       Wired once, not per entry into view, or every scroll back would
       add another set of listeners and one drag would move two stages.

       Touch events for fingers and pointer events for a mouse, rather
       than pointer events for both. A pointer sequence on a phone is
       taken over by the browser the moment it decides the gesture might
       be a scroll: it fires pointercancel and no pointerup ever arrives,
       so a swipe that started even slightly off the horizontal was
       simply never seen. touchend always arrives. The pointer path is
       kept for a mouse only, so a drag is never counted twice.

       Vertical drags are left alone; the page still has to scroll. A
       drag only counts when it is clearly sideways and long enough to
       have been meant. */
    function wire(){
      if (wired) return;
      wired = true;
      var list = pw.querySelector(".eg-list");
      if (!list) return;
      var x0 = null, y0 = null;

      function start(x, y){ x0 = x; y0 = y; }
      function end(x, y){
        if (x0 === null) return;
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

      /* Narrow shows one stage at a time, so a stage has to be lit for
         anything to be on screen at all — even when the reader has asked
         for no motion, where the first one is simply shown and left. */
      if (narrow.matches){
        wire();
        if (at < 0) light(0);
        if (calm) return;
        run();
        return;
      }

      if (calm) return;                            /* drawn, and left still */
      if (!tick){
        go();
        tick = setInterval(go, 1600);
      }
    }, { threshold:0.25 });
    io.observe(pw);

    /* turn a phone on its side, or drag a window across the breakpoint,
       and the section swaps which of the two it is running */
    var swap = function(){ stop(); io.unobserve(pw); io.observe(pw); };
    if (narrow.addEventListener) narrow.addEventListener("change", swap);
    else narrow.addListener(swap);
  });
})();


/* === tm-script (GBP process panels) === */
(function(){
  var rail=document.querySelector('[data-tm]'); if(!rail) return;
  var items=[].slice.call(rail.querySelectorAll('.tm-item'));
  items.forEach(function(el){ var b=document.createElement('span'); b.className='tm-prog';
    b.setAttribute('aria-hidden','true'); el.appendChild(b); });
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){
    at=(i+items.length)%items.length;
    items.forEach(function(el,k){ var on=k===at; el.classList.toggle('on',on);
      el.setAttribute('aria-selected',String(on));
      if(on){ var b=el.querySelector('.tm-prog'); if(b){ b.style.animation='none'; void b.offsetWidth; b.style.animation=''; } }
    });
  }
  function play(){ stop(); rail.classList.remove('paused'); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },6000); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); rail.classList.add('paused'); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); },12000); }
  items.forEach(function(el,i){
    el.addEventListener('mouseenter',function(){ clearTimeout(rail._hi); rail._hi=setTimeout(function(){ if(at!==i) show(i); },220); }); el.addEventListener('mouseleave',function(){ clearTimeout(rail._hi); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0||to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  rail.addEventListener('mouseenter',function(){ stop(); rail.classList.add('paused'); });
  rail.addEventListener('mouseleave',function(){ rail.classList.remove('paused'); if(!held) play(); });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(rail);
})();
