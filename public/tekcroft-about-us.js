/* About Us page interactions */
(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  $$(".js-theme").forEach(function(btn){
    btn.addEventListener("click", function(){
      root.setAttribute("data-theme",
        root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      btn.classList.toggle("spin");
    });
  });
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
  var nav = $("#nav"), burger = $(".js-burger"), mnav = $(".js-mnav");
  function navHeight(){
    if (!nav) return;
    var __bar = nav.querySelector(".nav-in");
    var __cs = getComputedStyle(nav);
    var __h = (__bar ? __bar.offsetHeight : 64)
      + (parseFloat(__cs.paddingTop) || 0)
      + (parseFloat(__cs.paddingBottom) || 0);
    root.style.setProperty("--nav-h", Math.round(__h) + "px");
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
  }
  if (burger && mnav){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.addEventListener("click", function(e){
      if (e.target.closest(".mm-acc")) return;
      if (e.target.closest("a[href],[data-jump]")) closeMenu();
    });
  }
  $$("[data-jump]").forEach(function(el){
    el.addEventListener("click", function(){
      var form = $(".hs:not([hidden]) form[data-lead]") || $("form[data-lead]") || $("#cta");
      if (!form) return;
      closeMenu();
      form.scrollIntoView({ behavior:"smooth", block:"center" });
    });
  });
})();

(function(){var s=document.getElementById('what-we-do-h');if(!s)return;
new IntersectionObserver(function(en,o){en.forEach(function(e){if(e.isIntersecting){s.classList.add('in');o.disconnect();}});},{threshold:.15}).observe(s);})();

(function(){
  var WWB=document.getElementById('wwb');
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function initStage(root){
    var tabs  = [].slice.call(root.querySelectorAll('.era'));
    var panes = [].slice.call(root.querySelectorAll('.pane'));
    var cur = 0, timer = null, DUR = 11000;

    function show(i, focus){
      cur = (i + tabs.length) % tabs.length;
      tabs.forEach(function(t, n){
        var on = n === cur;
        t.setAttribute('aria-selected', on ? 'true' : 'false');
        t.tabIndex = on ? 0 : -1;
        t.classList.remove('run');
      });
      panes.forEach(function(p, n){
        var on = n === cur;
        p.hidden = !on;
        p.classList.toggle('on', on);
      });
      WWB.setAttribute('data-era', String(cur));
      if (focus) tabs[cur].focus();
      restart();
    }
    function restart(){
      if (timer){ clearTimeout(timer); timer = null; }
      var bar = tabs[cur];
      bar.classList.remove('run');
      if (reduce || root.hidden) return;
      void bar.offsetWidth;
      bar.style.setProperty('--dur', DUR + 'ms');
      bar.classList.add('run');
      timer = setTimeout(function(){ show(cur + 1); }, DUR);
    }
    function pause(){ if (timer){ clearTimeout(timer); timer = null; } tabs[cur].classList.remove('run'); }

    tabs.forEach(function(t, n){ t.addEventListener('click', function(){ show(n); }); });
    root.addEventListener('keydown', function(e){
      if (e.key === 'ArrowRight'){ e.preventDefault(); show(cur + 1, true); }
      if (e.key === 'ArrowLeft'){  e.preventDefault(); show(cur - 1, true); }
    });
    root.addEventListener('mouseenter', pause);
    root.addEventListener('mouseleave', restart);
    root.addEventListener('focusin', pause);
    if ('IntersectionObserver' in window){
      new IntersectionObserver(function(en){
        en.forEach(function(e){ (e.isIntersecting && !root.hidden) ? restart() : pause(); });
      }, {threshold:.25}).observe(root);
    }
    show(0);
    return { show:show, restart:restart, pause:pause, root:root };
  }

  var variants = {};
  [].slice.call(document.querySelectorAll('#wwb .variant')).forEach(function(v){ variants[v.dataset.v] = initStage(v); });

  function setVariant(v){
    [].slice.call(document.querySelectorAll('#wwb .variant')).forEach(function(el){ el.hidden = el.dataset.v !== v; });
    Object.keys(variants).forEach(function(k){ variants[k].pause(); });
    variants[v].show(0);
    [].slice.call(document.querySelectorAll('#wwb .vsw button')).forEach(function(b){ b.classList.toggle('on', b.dataset.v === v); });
  }
  [].slice.call(document.querySelectorAll('#wwb .vsw button')).forEach(function(b){ b.addEventListener('click', function(){ setVariant(b.dataset.v); }); });

  setVariant('c');
})();

(function(){
  /* Rich Picture variant switcher (Orbit / Scan / Living map / Business map) */
  var sw=document.getElementById('rp-switch');
  if(sw){
    sw.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      var v=b.dataset.rv;
      [].forEach.call(document.querySelectorAll('.rp-variant'),function(el){ el.hidden=el.dataset.rv!==v; });
      [].forEach.call(sw.querySelectorAll('button'),function(x){ x.classList.toggle('on',x===b); });
    });
  }
})();

/* =================== OPTION A SCRIPT (mouse parallax) =================== */
(function () {
  var map = document.querySelector('.hgra-map');
  if (!map) return;
  var rm = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (rm) return;
  map.addEventListener('pointermove', function (e) {
    if (e.pointerType !== 'mouse') return;
    var r = map.getBoundingClientRect();
    map.style.setProperty('--mx', ((e.clientX - r.left) / r.width - 0.5).toFixed(3));
    map.style.setProperty('--my', ((e.clientY - r.top) / r.height - 0.5).toFixed(3));
  });
  map.addEventListener('pointerleave', function () {
    map.style.setProperty('--mx', 0);
    map.style.setProperty('--my', 0);
  });
})();
/* =================== END OPTION A SCRIPT =================== */

(function(){
  var sec=document.getElementById('rpk-sec'); if(!sec) return;
  var svg=sec.querySelector('.rpk-svg'), chips=[].slice.call(sec.querySelectorAll('.rpk-chip'));
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(){ sec.classList.add('in'); setTimeout(function(){ sec.classList.add('live'); }, reduce?0:2600); }
  if(reduce||!('IntersectionObserver' in window)) go();
  else new IntersectionObserver(function(en,o){ en.forEach(function(e){ if(e.isIntersecting){ go(); o.disconnect(); } }); },{threshold:.2}).observe(sec);
  function focus(k){
    if(k) svg.setAttribute('data-focus',k); else svg.removeAttribute('data-focus');
    chips.forEach(function(c){ c.setAttribute('aria-pressed', String(c.dataset.k===k)); });
  }
  var pinned=null;
  chips.forEach(function(c){
    c.addEventListener('click',function(){ pinned = pinned===c.dataset.k ? null : c.dataset.k; focus(pinned); });
    c.addEventListener('mouseenter',function(){ if(!pinned) focus(c.dataset.k); });
    c.addEventListener('mouseleave',function(){ if(!pinned) focus(null); });
  });
})();

(function(){
  var sec=document.getElementById('rpm-sec'); if(!sec) return;
  var svgs=[].slice.call(sec.querySelectorAll('.rpm-svg')), chips=[].slice.call(sec.querySelectorAll('.rpk-chip'));
  var reduce=window.matchMedia&&window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function go(){ sec.classList.add('in'); setTimeout(function(){ sec.classList.add('live'); }, reduce?0:2600); }
  if(reduce||!('IntersectionObserver' in window)) go();
  else new IntersectionObserver(function(en,o){ en.forEach(function(e){ if(e.isIntersecting){ go(); o.disconnect(); } }); },{threshold:.15}).observe(sec);
  var pinned=null;
  function focus(k){
    svgs.forEach(function(s){ if(k) s.setAttribute('data-focus',k); else s.removeAttribute('data-focus'); });
    chips.forEach(function(c){ c.setAttribute('aria-pressed', String(c.dataset.k===k)); });
  }
  chips.forEach(function(c){
    c.addEventListener('click',function(){ pinned = pinned===c.dataset.k ? null : c.dataset.k; focus(pinned); });
    c.addEventListener('mouseenter',function(e){ if(!pinned && matchMedia('(hover:hover)').matches) focus(c.dataset.k); });
    c.addEventListener('mouseleave',function(){ if(!pinned) focus(null); });
  });
})();

(function(){
  var reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.querySelectorAll('[data-hwwalk]').forEach(function(pw){
    var steps=[].slice.call(pw.querySelectorAll('.walk-step')), at=-1, tick=null;
    function light(k){ at=k; pw.setAttribute('data-at',String(k)); steps.forEach(function(s,n){ s.classList.toggle('on', n===k); }); }
    function go(){ light((at+1)%steps.length); }
    function reveal(){ steps.forEach(function(s){ s.classList.add('seen'); }); }
    function start(){ reveal(); if(at<0) light(0); if(reduce||tick) return; tick=setInterval(go,3200); }
    function stop(){ if(tick){ clearInterval(tick); tick=null; } }
    steps.forEach(function(s,n){ s.addEventListener('click',function(){ stop(); reveal(); light(n); if(!reduce) tick=setInterval(go,3200); }); });
    if('IntersectionObserver' in window){
      new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting?start():stop(); }); },{threshold:.3}).observe(pw);
    } else { start(); }
  })})();

(function(){
  /* People — founders timeline */
  var cc=document.getElementById('people-c');
  if(cc){ new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){cc.classList.add('sp-seen');o.disconnect();}});},{threshold:.2}).observe(cc); }
})();

(function(){var wg=document.getElementById('wg');
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)wg.classList.add('in');});},{threshold:.25}).observe(wg);})();

(function(){var cta=document.getElementById('cta');
  new IntersectionObserver(function(es){es.forEach(function(e){if(e.isIntersecting)cta.classList.add('in');});},{threshold:.25}).observe(cta);})();

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

