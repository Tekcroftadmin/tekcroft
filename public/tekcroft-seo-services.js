/* === f5-script === */

(function(){ var r=document.getElementById('focus'); if(!r) return;
  var cs=[].slice.call(r.querySelectorAll('.f5-c')), k=0, t=null, hov=false, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){ k=i; cs.forEach(function(e,j){ e.classList.remove('on'); if(j===i){ void e.offsetWidth; e.classList.add('on'); } }); }
  function play(){ if(reduce||t) return; t=setInterval(function(){ if(!hov) set((k+1)%cs.length); },3800); }
  function stop(){ clearInterval(t); t=null; }
  cs.forEach(function(e,i){ e.addEventListener('mouseenter',function(){ hov=true; r.classList.add('hold'); set(i); });
    e.addEventListener('mouseleave',function(){ hov=false; r.classList.remove('hold'); }); e.addEventListener('focus',function(){ set(i); }); e.addEventListener('click',function(){ set(i); }); });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ r.classList.add('in'); play(); } else stop(); }); },{threshold:.3}).observe(r); } else { r.classList.add('in'); play(); }
})();


/* === tm-script === */

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
    el.addEventListener('mouseenter',function(){ if(rail.__lock) return; clearTimeout(rail._hi); rail._hi=setTimeout(function(){ if(at!==i) show(i); },220); });
    el.addEventListener('mouseleave',function(){ clearTimeout(rail._hi); });
    el.addEventListener('click',function(){ hold(); show(i); });
    el.addEventListener('keydown',function(e){
      if(e.key==='Enter'||e.key===' '){ e.preventDefault(); hold(); show(i); return; }
      var to = e.key==='ArrowRight'||e.key==='ArrowDown' ? i+1 : e.key==='ArrowLeft'||e.key==='ArrowUp' ? i-1 : -1;
      if(to<0||to>=items.length) return;
      e.preventDefault(); items[to].focus(); hold(); show(to);
    });
  });
  rail.addEventListener('mouseenter',function(){ stop(); rail.classList.add('paused'); });
  rail.addEventListener('mouseleave',function(){ rail.__lock=false; rail.classList.remove('paused'); if(!held) play(); });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(rail);
})();


/* === sx-pick-js === */

(function(){
  var root=document.getElementById('services'); if(!root) return;
  var items=[].slice.call(root.querySelectorAll('.tm-item')), t=null;
  var rail=root.querySelector('.tm-rail');
  [].forEach.call(root.querySelectorAll('.sx-pk'),function(b){ b.addEventListener('click',function(e){
    e.stopPropagation(); var ix=b.getAttribute('data-open'); clearTimeout(t); rail.__lock=true; setTimeout(function(){ rail.__lock=false; },4000);
    [].forEach.call(root.querySelectorAll('.sx-pk'),function(o){ o.classList.toggle('on',o===b); });
    if(!ix){ var j=document.querySelector('[data-jump]'); if(j) j.click(); return; }
    ix=ix.split(',').map(Number); items[ix[0]].click();
    if(ix[1]!=null) t=setTimeout(function(){ items[ix[1]].click(); },2600);
  }); });
})();


/* === dv-script === */

(function(){
  var r=document.getElementById('commit'); if(!r) return;
  var it=[].slice.call(r.querySelectorAll('.dv-i')), bs=[].slice.call(r.querySelectorAll('.dv-bars i')), cur=r.querySelector('.dv-cur'),
      fl=r.querySelector('.dv-float'), k=0, t=null, hov=false, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){ k=i; it.forEach(function(e,j){ e.classList.toggle('on',j===i); }); bs.forEach(function(e,j){ e.classList.toggle('on',j===i); });
    fl.classList.add('sw'); setTimeout(function(){ cur.textContent=it[i].querySelector('b').textContent; fl.classList.remove('sw'); },180); }
  function play(){ if(reduce||t) return; t=setInterval(function(){ if(!hov) set((k+1)%it.length); },3200); }
  function stop(){ clearInterval(t); t=null; }
  it.forEach(function(e,i){ e.addEventListener('mouseenter',function(){ hov=true; set(i); }); e.addEventListener('mouseleave',function(){ hov=false; }); e.addEventListener('focus',function(){ set(i); }); });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?play():stop(); }); },{threshold:.3}).observe(r); } else play();
})();


/* === g3-script === */

(function(){ var r=document.getElementById('goals'); if(!r) return;
  var li=[].slice.call(r.querySelectorAll('.g3-list li')), im=[].slice.call(r.querySelectorAll('.g3-pic img')), k=0, t=null, hov=false,
      reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){ k=i; li.forEach(function(e,j){ e.classList.toggle('on',j===i); }); im.forEach(function(e,j){ e.classList.toggle('on',j===i); }); }
  li.forEach(function(e,i){ e.addEventListener('mouseenter',function(){ hov=true; set(i); }); e.addEventListener('mouseleave',function(){ hov=false; }); e.addEventListener('focus',function(){ set(i); }); });
  if(!reduce) t=setInterval(function(){ if(!hov) set((k+1)%li.length); },3500);
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting) r.classList.add('in'); }); },{threshold:.3}).observe(r); } else r.classList.add('in'); })();


/* === cb-script === */

(function(){ var r=document.getElementById('cost'); if(!r) return;
  var sw=[].slice.call(r.querySelectorAll('.b4-sw span')), pill=r.querySelector('.b4-pill'), k=0, reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(i){ k=i; sw.forEach(function(s,j){ s.classList.toggle('on',j===i); }); var b=sw[i]; pill.style.height=b.offsetHeight+'px'; pill.style.transform='translateY('+b.offsetTop+'px)'; }
  sw.forEach(function(s,i){ s.addEventListener('mouseenter',function(){ set(i); }); });
  set(0); window.addEventListener('resize',function(){ set(k); });
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ if(e.isIntersecting){ r.classList.add('in'); set(k); } }); },{threshold:.3}).observe(r); } else r.classList.add('in');
  if(!reduce) setInterval(function(){ if(r.classList.contains('in')) set((k+1)%3); },2200);
})();


/* === wy8-script === */

(function(){
  var root=document.getElementById('whyus'); if(!root) return;
  var tabs=[].slice.call(root.querySelectorAll('.wy-tab')), panes=[].slice.call(root.querySelectorAll('.wy-pane')), cur=0, t=null, held=false,
      reduce=window.matchMedia&&matchMedia('(prefers-reduced-motion: reduce)').matches;
  function set(k){ cur=(k+tabs.length)%tabs.length; tabs.forEach(function(b,i){ b.classList.toggle('on',i===cur); b.setAttribute('aria-selected',String(i===cur)); });
    panes.forEach(function(p,i){ p.classList.remove('on'); if(i===cur){ void p.offsetWidth; p.classList.add('on'); } }); }
  function play(){ if(reduce||held) return; stop(); t=setInterval(function(){ set(cur+1); },4500); }
  function stop(){ clearInterval(t); t=null; }
  tabs.forEach(function(b,i){ b.addEventListener('click',function(){ held=true; stop(); set(i); clearTimeout(play._h); play._h=setTimeout(function(){ held=false; play(); },10000); }); });
  var st=root.querySelector('.wy-stage'); st.addEventListener('mouseenter',stop); st.addEventListener('mouseleave',function(){ if(!held) play(); });
  set(0);
  if('IntersectionObserver' in window){ new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?play():stop(); }); },{threshold:.3}).observe(root); } else play();
})();


/* === block-10 === */

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
    if (burger){
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
    navHeight();
  }
  if (burger && mnav){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
      navHeight();
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

  /* ---------------- count-up ---------------- */  function countUp(el){
    var raw = el.getAttribute("data-count");
    var target = parseFloat(raw);
    if (isNaN(target)) return;
    var prefix = el.getAttribute("data-prefix") || "";
    var suffix = el.getAttribute("data-suffix") || "";
    /* How many decimals the authored value carries decides how the count
       is rounded and printed. Without this a rating of 4.9 counts up to a
       flat 5, because Math.round was the only rounding here. An integer
       target has no decimals and keeps the thousands separator it had. */
    var dec = (String(raw).split(".")[1] || "").length;
    function affix(t){ return t ? '<i class="fig-af">' + t + '</i>' : ""; }
    function show(n){
      var v = dec ? n.toFixed(dec)
                  : (n >= 1000 ? n.toLocaleString("en-US") : n);
      return affix(prefix) + v + affix(suffix);
    }
    if (calm){ el.innerHTML = show(target); return; }
    var t0 = null, dur = 1400;
    function frame(t){
      if (t0 === null) t0 = t;
      var p = Math.min((t - t0) / dur, 1);
      var e = 1 - Math.pow(1 - p, 3);
      el.innerHTML = show(dec ? +(target * e).toFixed(dec) : Math.round(target * e));
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


/* === walk-script === */

/* ══════════════════════════════════════════════════════════════════════
   THE WALK — ported from the homepage.

   Named eg-script once, after the section it arrived with. That section
   is gone; the blueprint row uses it now, through the same data-walk
   attribute. Nothing in here is tied to either.

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
/* === faq-script === */

/* One question open at a time. The panel is a grid row moving between 0fr
   and 1fr, so it opens to whatever height its own text needs and nothing
   has to be measured: height:auto cannot be transitioned, and reading
   scrollHeight forces a layout on every open. */
(function(){
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var list = document.querySelector(".faq-list");
  if (!list) return;
  list.addEventListener("click", function(e){
    var btn = e.target.closest(".faq-q");
    if (!btn) return;
    var panel = document.getElementById(btn.getAttribute("aria-controls"));
    var isOpen = btn.getAttribute("aria-expanded") === "true";
    list.querySelectorAll(".faq-q").forEach(function(b){
      b.setAttribute("aria-expanded", "false");
      document.getElementById(b.getAttribute("aria-controls")).dataset.open = "false";
    });
    if (!isOpen){
      btn.setAttribute("aria-expanded", "true");
      panel.dataset.open = "true";
      /* the aside follows the question. Its index is read off the button's
         own position, so adding or removing a question needs nothing here. */
      var wrap = list.closest(".faq-wrap");
      if (wrap) wrap.dataset.at = $$(".faq-q", list).indexOf(btn) + 1;
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


/* === wc-script === */

/* ══════════════════════════════════════════════════════════════════════
   WHY CHOOSE US — the panel.

   Each instrument is drawn from nothing every time its tab is opened.
   The panel is taken out of the document and put back so the CSS
   animations restart; the ring's arcs are the exception, since a dash
   cannot be animated from a value it is already sitting on, so they are
   reset to zero and committed before the real one is set.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  var panel = document.querySelector("#wcPanel");
  if (!panel) return;

  var $$ = function(s, r){
    return Array.prototype.slice.call((r || document).querySelectorAll(s));
  };
  var tabs   = $$(".wc-tab", panel),
      panels = $$(".wc-panel", panel),
      body   = panel.querySelector(".wc-body");

  /* the line is measured so its draw ends where the line does */
  $$(".wc-line", panel).forEach(function(pth){
    pth.style.setProperty("--len", pth.getTotalLength().toFixed(1));
  });

  function redraw(pnl){
    $$(".seg", pnl).forEach(function(seg){
      seg.style.strokeDasharray = "0 999";
      void seg.getBoundingClientRect();
      seg.style.strokeDasharray = seg.getAttribute("data-dash");
    });
  }

  function show(i){
    /* the panel squares whichever corner has a tab standing on it */
    if (body){
      body.classList.toggle("first", i === 0);
      body.classList.toggle("last",  i === tabs.length - 1);
    }
    tabs.forEach(function(t, k){
      t.classList.toggle("on", k === i);
      t.setAttribute("aria-selected", k === i ? "true" : "false");
    });
    panels.forEach(function(pnl, k){
      pnl.classList.remove("on");
      if (k === i){
        void pnl.offsetWidth;              /* restart the panel's animations */
        pnl.classList.add("on");
        redraw(pnl);
      }
    });
  }

  tabs.forEach(function(t, i){
    t.addEventListener("click", function(){ show(i); });
    t.addEventListener("keydown", function(e){
      var step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!step) return;
      e.preventDefault();
      var n = (i + step + tabs.length) % tabs.length;
      tabs[n].focus(); show(n);
    });
  });

  /* it draws when it is first reached, not while it is still off-screen */
  if ("IntersectionObserver" in window){
    var io = new IntersectionObserver(function(e){
      if (!e[0].isIntersecting) return;
      show(0);
      io.disconnect();
    }, { threshold:.2 });
    io.observe(panel);
  } else {
    show(0);
  }
})();


/* === wk-script === */

/* Both of these came across from the homepage unchanged. The deck's was
   an inner block of one long IIFE there, so the two helpers it read off
   the enclosing scope are declared here instead — inside a wrapper,
   because `var` at the top of a classic <script> is a global, and five
   other scripts on this page declare helpers by the same two names. */
(function(){
"use strict";
var $  = function(s, r){ return (r || document).querySelector(s); };
var $$ = function(s, r){
  return Array.prototype.slice.call((r || document).querySelectorAll(s));
};

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
    function sync(){
      var mid = rail.scrollLeft + rail.clientWidth / 2, i = 0, near = Infinity;

      all.forEach(function(c, k){
        var d = Math.abs(c.offsetLeft + c.offsetWidth / 2 - mid);
        if (d < near){ near = d; i = k; }
      });
      all.forEach(function(c, k){ c.classList.toggle("on", k === i); });
      /* the copies report the number of the sheet they are a copy of */
      var real = ((i % n) + n) % n;
      at.textContent = ("0" + (real + 1)).slice(-2);
      bar.style.width = ((real + 1) / n * 100) + "%";
    }

    /* The rail opens on the second sheet rather than the first, because at
       scrollLeft 0 the first one rests against the edge with nothing to its
       left. Seated on the second, there is a sheet cut off on both sides and
       one whole sheet in the middle — which is the shape the set is meant to
       be read in. Done with smooth scrolling switched off, so it is a
       starting position rather than an animation nobody asked for. */
    function seat(){
      if (!rail.clientWidth) return;              /* the panel is hidden */
      var held = rail.style.scrollBehavior, c = all[n + 1];
      rail.style.scrollBehavior = "auto";
      rail.scrollLeft = c.offsetLeft + c.offsetWidth / 2 - rail.clientWidth / 2;
      rail.style.scrollBehavior = held;
      sync();
    }

    /* A hidden rail measures zero and loses its scroll position, so the width
       going from nothing to something is the signal that the panel has just
       been shown — and it gets seated again. A real window resize never
       crosses zero, so it only re-reads position and leaves the reader where
       they were. */
    var wide = 0;
    function relayout(){
      var w = rail.clientWidth;
      if (w && !wide) seat(); else sync();
      wide = w;
    }

    arws.forEach(function(b){
      b.addEventListener("click", function(){
        rail.scrollLeft += step() * Number(b.getAttribute("data-wk"));
      });
    });
    var settle;
    rail.addEventListener("scroll", function(){
      window.requestAnimationFrame(sync);
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
    startAuto();
  })();

/* ---------------- reviews ----------------
   The same three reviews the rotating quote used, shown together. The row
   is a grid at full width and a snap track below that; the arrows and dots
   only appear where it actually scrolls. */
(function(){
  var track = document.getElementById('grTrack');
  if(!track) return;

  /* PLACEHOLDER REVIEWS — same status as the three the rotating quote
     carried: written for layout, not collected from clients. Replace every
     one of these with the real Google review before this goes live. */
  var GR = [
    { name:"Dana Whitfield", initials:"DW", guide:true,
      meta:"24 reviews \u00b7 6 photos", when:"2 weeks ago",
      text:"We had three agencies before this one. TekCroft is the first that could tell me, in one sentence, what my money bought last month.",
      tags:["SEO","Paid Media","B2B SaaS"], helpful:24 },
    { name:"Marcus Reyes", initials:"MR", guide:false,
      meta:"8 reviews \u00b7 2 photos", when:"1 month ago",
      text:"They rebuilt the site and then ranked it. Not having to referee between two vendors was worth the fee on its own.",
      tags:["Web Build","SEO"], helpful:18 },
    { name:"Priya Raman", initials:"PR", guide:false,
      meta:"11 reviews", when:"2 months ago",
      text:"The free review found a redirect chain that had been eating a third of our organic traffic for two years. They sent it before we paid them anything.",
      tags:["Technical SEO","Audit"], helpful:32 },
    { name:"Elena Fischer", initials:"EF", guide:true,
      meta:"31 reviews \u00b7 4 photos", when:"3 months ago",
      text:"Placeholder review. One strategist owns the account, the dashboard is live, and the monthly call is about decisions rather than screenshots.",
      tags:["Local SEO","Reporting"], helpful:15 },
    { name:"Tobias Lang", initials:"TL", guide:false,
      meta:"6 reviews", when:"4 months ago",
      text:"Placeholder review. Audit in week one, strategy in week two, campaigns live in week four, and nothing in between that we had to chase.",
      tags:["Onboarding","Paid Media"], helpful:9 },
    { name:"Amara Diallo", initials:"AD", guide:false,
      meta:"17 reviews \u00b7 1 photo", when:"5 months ago",
      text:"Placeholder review. They said no to two things we asked for and explained why, which is the part that made us trust the rest of it.",
      tags:["Ecommerce SEO","CRO"], helpful:21 }
  ];

  var STAR = '<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 3.6 2.7 5.5 6 .9-4.35 4.25 1.03 6L12 17.42 6.62 20.25l1.03-6L3.3 10l6-.9z"/></svg>';
  function stars(n){
    var out = '';
    for (var i = 0; i < 5; i++) out += STAR;
    return '<span class="gr-stars" role="img" aria-label="Rated ' + n + ' out of 5">' + out + '</span>';
  }
  function esc(t){ return String(t).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  track.innerHTML = GR.map(function(r){
    return '<article class="gr-card">'
      + '<div class="gr-top">'
      +   '<span class="gr-av" aria-hidden="true">' + esc(r.initials) + '</span>'
      +   '<span class="gr-who"><b>' + esc(r.name)
      +     (r.guide ? '<span class="gr-guide">Local Guide</span>' : '') + '</b>'
      +     '<span>' + esc(r.meta) + '</span></span>'
      +   '<span class="gr-kebab" aria-hidden="true"><svg viewBox="0 0 24 24" fill="currentColor"><circle cx="12" cy="5" r="1.7"/><circle cx="12" cy="12" r="1.7"/><circle cx="12" cy="19" r="1.7"/></svg></span>'
      + '</div>'
      + '<div class="gr-meta">' + stars(5) + '<span class="gr-when">' + esc(r.when) + '</span></div>'
      + '<p class="gr-text">' + esc(r.text) + '</p>'
      + '<div class="gr-tags">' + r.tags.map(function(t){
            return '<span class="gr-tag">' + esc(t) + '</span>'; }).join('') + '</div>'
      + '<div class="gr-foot">'
      +   '<button type="button"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M7 10.5v9H4.5v-9Z"/><path d="M7 10.5 11 3a2 2 0 0 1 2 2v4h5.4a1.6 1.6 0 0 1 1.6 2l-1.5 7a2 2 0 0 1-2 1.5H7Z"/></svg>Helpful (' + r.helpful + ')</button>'
      +   '<button type="button">Share</button>'
      + '</div></article>';
  }).join('');

  /* the rating shown in the bar */
  var starSlot = document.getElementById('grBarStars');
  if (starSlot) starSlot.innerHTML = stars(4.8);

  /* arrows and dots — one page per card's worth of scroll */
  var prev = document.getElementById('grPrev'),
      next = document.getElementById('grNext'),
      dots = document.getElementById('grDots');
  if(!prev || !next || !dots) return;

  /* The controls belong to the content, not to the breakpoint: they show
     whenever there is more than one page of cards and hide when the row
     fits, at any width. */
  var nav = dots.parentElement;

  /* The gap is read off the track rather than hard-coded, so the step stays
     right as the layout's clamp() resolves differently at each width. */
  function step(){
    var card = track.firstElementChild;
    if(!card) return 1;
    var gap = parseFloat(getComputedStyle(track).columnGap || getComputedStyle(track).gap) || 0;
    return Math.max(1, card.offsetWidth + gap);
  }
  function perView(){ return Math.max(1, Math.round(track.clientWidth / step())); }
  function pages(){ return Math.max(1, track.children.length - perView() + 1); }
  function at(){ return Math.round(track.scrollLeft / step()); }

  function paint(){
    /* the row overflows, or it does not — that single fact decides whether
       there is anything to drive */
    var scrolls = track.scrollWidth - track.clientWidth > 4;
    nav.style.display = scrolls ? 'flex' : 'none';
    if(!scrolls) return;

    var n = pages(), i = Math.min(at(), n - 1);
    if (dots.children.length !== n){
      dots.innerHTML = '';
      for (var k = 0; k < n; k++){
        var b = document.createElement('button');
        b.className = 'gr-dot'; b.type = 'button';
        b.setAttribute('aria-label', 'Go to review ' + (k + 1));
        b.dataset.i = k;
        dots.appendChild(b);
      }
    }
    [].slice.call(dots.children).forEach(function(b, k){
      b.setAttribute('aria-current', k === i ? 'true' : 'false');
    });
    prev.disabled = i <= 0;
    next.disabled = i >= n - 1;
  }
  function go(dir){ track.scrollBy({ left: dir * step(), behavior:'smooth' }); }

  prev.addEventListener('click', function(){ go(-1); });
  next.addEventListener('click', function(){ go(1); });
  dots.addEventListener('click', function(e){
    var b = e.target.closest('.gr-dot'); if(!b) return;
    track.scrollTo({ left: b.dataset.i * step(), behavior:'smooth' });
  });
  track.addEventListener('scroll', paint, { passive:true });
  window.addEventListener('resize', paint);
  paint();
})();

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
  var running = window.matchMedia("(min-width: 901px)");

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


/* === hx-wire-script === */

/* ══════════════════════════════════════════════════════════════════════
   DRAWING THE FOUR WIRES

   One path per card, hub edge to card edge, with the turn where the CSS
   bracket used to put it: the middle of the gap. Measured rather than
   declared, because the gap is a clamp and the cards size themselves.

   Two passes so every resting wire is under every lit one — appended in
   card order, a later card's hairline would otherwise sit on an earlier
   card's light.

   The section is marked is-wired only after a path exists. Until then,
   and if any of this fails, the CSS bracket is what is on screen.
   ══════════════════════════════════════════════════════════════════════ */
(function(){
  var NS  = "http://www.w3.org/2000/svg";
  var sec = document.querySelector(".hx");
  if (!sec) return;
  var grid = sec.querySelector(".hx-grid");
  var core = sec.querySelector(".hx-core");
  if (!grid || !core) return;

  /* reading order, which is the order the light will take */
  var l = sec.querySelectorAll(".hx-l > .hx-card");
  var r = sec.querySelectorAll(".hx-r > .hx-card");
  var cards = [];
  if (l[0]) cards.push({el:l[0], side:-1});
  if (r[0]) cards.push({el:r[0], side: 1});
  if (l[1]) cards.push({el:l[1], side:-1});
  if (r[1]) cards.push({el:r[1], side: 1});
  if (!cards.length) return;

  var svg = document.createElementNS(NS, "svg");
  svg.setAttribute("class", "hx-net");
  svg.setAttribute("aria-hidden", "true");
  svg.setAttribute("preserveAspectRatio", "none");
  var gBase  = document.createElementNS(NS, "g");
  var gTrace = document.createElementNS(NS, "g");
  svg.appendChild(gBase); svg.appendChild(gTrace);
  grid.insertBefore(svg, grid.firstChild);

  /* out from the hub, along to the middle of the gap, down or up to the
     card's line, and in to its edge. The corner radius is the bracket's
     14, given back whatever the three runs can spare. */
  function wire(hx, hy, cx, cy){
    var tx = (hx + cx) / 2;
    var dx = tx > hx ? 1 : -1;
    var dy = cy > hy ? 1 : -1;
    var drop = Math.abs(cy - hy);
    if (drop < 2) return "M" + hx + "," + hy + " L" + cx + "," + cy;
    var rr = Math.min(14, Math.abs(tx - hx) * .8,
                          Math.abs(cx - tx) * .8, drop * .45);
    return "M" + hx + "," + hy +
           " L" + (tx - dx * rr) + "," + hy +
           " Q" + tx + "," + hy + " " + tx + "," + (hy + dy * rr) +
           " L" + tx + "," + (cy - dy * rr) +
           " Q" + tx + "," + cy + " " + (tx + dx * rr) + "," + cy +
           " L" + cx + "," + cy;
  }

  var lastW = 0, lastH = 0;

  function build(force){
    if (window.matchMedia("(max-width:920px)").matches) return;
    var g = grid.getBoundingClientRect();
    if (!g.width || !g.height) return;
    if (!force && Math.abs(g.width - lastW) < 1 && Math.abs(g.height - lastH) < 1) return;
    lastW = g.width; lastH = g.height;

    var c  = core.getBoundingClientRect();
    var hy = c.top + c.height / 2 - g.top;

    svg.setAttribute("viewBox", "0 0 " + g.width + " " + g.height);
    while (gBase.firstChild)  gBase.removeChild(gBase.firstChild);
    while (gTrace.firstChild) gTrace.removeChild(gTrace.firstChild);

    cards.forEach(function(item, i){
      var b  = item.el.getBoundingClientRect();
      var cy = b.top + b.height / 2 - g.top;
      var hx = (item.side < 0 ? c.left  : c.right) - g.left;
      var cx = (item.side < 0 ? b.right : b.left)  - g.left;
      var d  = wire(hx, hy, cx, cy);

      var base = document.createElementNS(NS, "path");
      base.setAttribute("d", d);
      base.setAttribute("class", "base");
      gBase.appendChild(base);

      var tr = document.createElementNS(NS, "path");
      tr.setAttribute("d", d);
      tr.setAttribute("class", "trace");
      gTrace.appendChild(tr);

      var len = tr.getTotalLength();
      tr.style.setProperty("--len",   len.toFixed(1) + "px");
      tr.style.setProperty("--comet", Math.max(36, Math.min(104, len * .3)).toFixed(1) + "px");
      tr.style.setProperty("--i", i);
      item.trace = tr;
    });

    sec.classList.add("is-wired");
  }

  /* a card under the pointer holds its own wire and stops the loop */
  cards.forEach(function(item){
    function hold(){
      grid.classList.add("is-held");
      if (item.trace) item.trace.classList.add("is-lit");
    }
    function drop(){
      grid.classList.remove("is-held");
      if (item.trace) item.trace.classList.remove("is-lit");
    }
    item.el.addEventListener("mouseenter", hold);
    item.el.addEventListener("mouseleave", drop);
    item.el.addEventListener("focusin",  hold);
    item.el.addEventListener("focusout", drop);
  });

  /* nothing runs while the section is not being looked at */
  if ("IntersectionObserver" in window){
    new IntersectionObserver(function(es){
      es.forEach(function(e){ grid.classList.toggle("is-live", e.isIntersecting); });
    }, {rootMargin:"120px"}).observe(grid);
  } else {
    grid.classList.add("is-live");
  }

  build(true);
  window.addEventListener("load", function(){ build(true); });
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(function(){ build(true); });

  var t;
  function later(){ clearTimeout(t); t = setTimeout(function(){ build(false); }, 140); }
  window.addEventListener("resize", later);
  if ("ResizeObserver" in window) new ResizeObserver(later).observe(grid);
})();
