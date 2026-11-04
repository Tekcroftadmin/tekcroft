(function(){
  "use strict";
  var $  = function(sel, r){ return (r || document).querySelector(sel); };
  var $$ = function(sel, r){ return Array.prototype.slice.call((r || document).querySelectorAll(sel)); };
  var calm = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  /* ---------------- the wires to the centre ----------------
     Four lines, both ends read off the boxes rather than guessed. Each
     starts just outside its chip and stops on the hub's outer ring, so
     it points at the middle and touches it without ever crossing into
     the glow.

     Re-measured whenever anything that could have moved either end
     moves: the column width on resize, and the line heights when the
     webfont lands. It is a read-then-write pass with nothing in between
     — every rect is taken first, and only then are the lines set — so
     the browser lays the stage out once rather than eight times.

     Below 1080 the chips are gone and so is this: there is no gutter
     left for a line to cross.
  --------------------------------------------------------------- */
  (function(){
    var axStage = $(".ax-stage"), axSvg = $(".ax-wires"), axHub = $(".ax-hub");
    if (!axStage || !axSvg || !axHub) return;
    var axWireEls = $$(".ax-wire", axSvg);

    function axWires(){
      if (window.innerWidth <= 1080) return;
      var nodes = $$(".ax-node", axStage);
      if (!nodes.length) return;

      /* every read first */
      var s = axStage.getBoundingClientRect(),
          h = axHub.getBoundingClientRect(),
          boxes = nodes.map(function(n){ return n.getBoundingClientRect(); });
      if (!s.width || !h.width) return;

      var hx = h.left - s.left + h.width / 2,
          hy = h.top  - s.top  + h.height / 2,
          hr = h.width / 2 * 0.94;          /* the outer ring, not the box */

      axSvg.setAttribute("viewBox", "0 0 " + s.width + " " + s.height);

      /* then every write */
      boxes.forEach(function(b, i){
        var line = axWireEls[i];
        if (!line) return;
        var nx = b.left - s.left + b.width / 2,
            ny = b.top  - s.top  + b.height / 2,
            dx = hx - nx, dy = hy - ny,
            d  = Math.sqrt(dx * dx + dy * dy) || 1,
            nr = b.width / 2 + 6;
        line.setAttribute("x1", (nx + dx / d * nr).toFixed(1));
        line.setAttribute("y1", (ny + dy / d * nr).toFixed(1));
        line.setAttribute("x2", (hx - dx / d * hr).toFixed(1));
        line.setAttribute("y2", (hy - dy / d * hr).toFixed(1));
      });
    }

    var axWired = false;
    function axWiresOnce(){
      if (axWired) { axWires(); return; }
      axWired = true;
      axWires();
    }
    window.addEventListener("resize", function(){ if (axWired) axWires(); }, { passive:true });
    if ("IntersectionObserver" in window && axStage){
      new IntersectionObserver(function(entries){
        if (!entries[0].isIntersecting) return;
        axWiresOnce();
      }, { rootMargin: "120px", threshold: 0 }).observe(axStage);
    } else {
      setTimeout(axWiresOnce, 0);
    }
  })();

  /* ---------------- the queries that type themselves ----------------
     These used to run once, on the way past. That was the right instinct
     and the wrong result: by the time anyone had scrolled far enough to
     look at the panels the typing had already finished, so the fields
     read as plain text and the whole idea was invisible.

     So they loop — type, hold long enough to be read, clear, and go
     again — but only while the section is actually on screen. Off screen
     every timer is dropped and the field is left holding its sentence,
     which is also what it shows to a reader who has asked for less
     motion or has no JavaScript at all.

     One observer for all four. Each field carries its own delay in the
     markup, so they start staggered and stay staggered through every
     pass, and no two of them are ever typing the same letter.
  --------------------------------------------------------------- */
  var axFields = $$(".ax-type");
  if (axFields.length){

    function axRun(field){
      var live  = $(".ax-type-live", field),
          text  = $(".ax-type-ghost", field).textContent,
          lead  = parseFloat(field.style.getPropertyValue("--t")) || 0,
          timer = null;

      field.classList.add("on");

      if (calm){ live.textContent = text; return { stop:function(){}, start:function(){} }; }

      var caret = document.createElement("b");
      caret.className = "ax-caret";

      function wipe(){
        while (live.firstChild) live.removeChild(live.firstChild);
      }
      function at(n){
        wipe();
        if (n) live.appendChild(document.createTextNode(text.slice(0, n)));
        live.appendChild(caret);
      }
      function later(fn, ms){ timer = setTimeout(fn, ms); }

      function typeFrom(i){
        at(i);
        if (i < text.length){
          /* a space is a pause for thought, not another keystroke */
          later(function(){ typeFrom(i + 1); },
                text.charAt(i) === " " ? 96 : 38);
        } else {
          later(clearFrom, 3400);          /* long enough to be read */
        }
      }
      function clearFrom(){
        var n = text.length;
        (function back(){
          at(n);
          if (n-- > 0) later(back, 16);
          else later(function(){ typeFrom(0); }, 520);
        })();
      }

      return {
        start:function(){ if (timer) return; later(function(){ typeFrom(0); }, lead); },
        stop:function(){ clearTimeout(timer); timer = null; }
      };
    }

    var axRunners = axFields.map(axRun);
    new IntersectionObserver(function(entries){
      var here = entries[0].isIntersecting;
      axRunners.forEach(function(r){ here ? r.start() : r.stop(); });
    }, { threshold:0.15 }).observe($("#ai-ecosystem") || axFields[0]);
  }

  /* ---------------- reviews ---------------- */
  var REVIEWS = [
    { text:"We had three agencies before this one. TekCroft is the first that could tell me, in one sentence, what my money bought last month.",
      name:"Dana Whitfield", role:"VP Marketing, Nordwell Health", initials:"DW", key:"in one sentence" },
    { text:"They rebuilt the site and then ranked it. Not having to referee between two vendors was worth the fee on its own.",
      name:"Marcus Reyes", role:"Owner, Vantage Roofing", initials:"MR", key:"referee between two vendors" },
    { text:"The free review found a redirect chain that had been eating a third of our organic traffic for two years. They sent it before we paid them anything.",
      name:"Priya Raman", role:"Head of Growth, Bright Fork", initials:"PR", key:"before we paid them anything" }
  ];
  var slot = $("#quoteSlot"), qnav = $("#quoteNav"), at = 0, qTimer;

  function esc(s){ return s.replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;"); }

  if (slot && qnav){
    slot.innerHTML = REVIEWS.map(function(r, i){
      var body = esc(r.text).replace(esc(r.key), "<em>" + esc(r.key) + "</em>");
      return '<div class="q' + (i === 0 ? " on" : "") + '">' +
               "<blockquote>&ldquo;" + body + "&rdquo;</blockquote>" +
               '<figcaption><span class="av">' + r.initials + "</span>" +
                 '<span class="who"><b>' + esc(r.name) + "</b><span>" + esc(r.role) + "</span></span>" +
               "</figcaption></div>";
    }).join("");

    qnav.innerHTML = REVIEWS.map(function(r, i){
      return '<button class="q-dot' + (i === 0 ? " on" : "") + '" type="button" role="tab" ' +
             'aria-selected="' + (i === 0) + '" aria-label="Review from ' + esc(r.name) + '"></button>';
    }).join("");

    var qs = $$(".q", slot), dots = $$(".q-dot", qnav);

    function show(i){
      at = (i + REVIEWS.length) % REVIEWS.length;
      qs.forEach(function(el, k){ el.classList.toggle("on", k === at); });
      dots.forEach(function(d, k){
        d.classList.toggle("on", k === at);
        d.setAttribute("aria-selected", k === at ? "true" : "false");
      });
    }
    function auto(){
      if (calm) return;
      clearInterval(qTimer);
      qTimer = setInterval(function(){ show(at + 1); }, 7000);
    }
    dots.forEach(function(d, k){
      d.addEventListener("click", function(){ show(k); auto(); });
    });
    function sizeSlot(){
      /* Measure every quote while forced on, then one write — no interleaved reflow */
      var heights = qs.map(function(el){
        var was = el.className;
        el.className = "q on";
        var h = el.offsetHeight;
        el.className = was;
        return h;
      });
      var tallest = Math.max.apply(null, heights.concat([0]));
      slot.style.minHeight = tallest + "px";
    }
    sizeSlot();
    window.addEventListener("resize", sizeSlot);
    if (document.fonts && document.fonts.ready){ document.fonts.ready.then(sizeSlot); }

    var revsSec = $("#reviews");
    revsSec.addEventListener("pointerenter", function(){ clearInterval(qTimer); });
    revsSec.addEventListener("pointerleave", auto);
    auto();
  }

})();

/* Homepage below-fold widgets — lazy-loaded after first paint */
/* === faq-script === */
/* Homepage FAQ accordion is owned by components/Homepage.tsx (wireFaq).
   A second document-level toggle here raced that handler and made open
   items refuse to close. Do not re-add a .faq-q click listener in this file. */



/* === why-v2 tabs (scoped) === */
(function(){
  "use strict";
  var box = document.querySelector("#why [data-tabs]");
  if (!box) return;
  var tabs  = Array.prototype.slice.call(box.querySelectorAll(".wy-tab")),
      panes = Array.prototype.slice.call(box.querySelectorAll(".wy-pane"));

  function open(i){
    tabs.forEach(function(t, n){
      var on = n === i;
      t.classList.toggle("on", on);
      t.setAttribute("aria-selected", on ? "true" : "false");
      t.setAttribute("tabindex", on ? "0" : "-1");
    });
    panes.forEach(function(p, n){
      var on = n === i;
      p.classList.toggle("on", on);
      p.setAttribute("aria-hidden", on ? "false" : "true");
    });
  }

  box.querySelector(".wy-rail").addEventListener("click", function(e){
    var b = e.target.closest(".wy-tab");
    if (b) open(tabs.indexOf(b));
  });

  box.querySelector(".wy-rail").addEventListener("keydown", function(e){
    var i = tabs.indexOf(document.activeElement);
    if (i < 0) return;
    var to = e.key === "ArrowRight" || e.key === "ArrowDown" ? i + 1
           : e.key === "ArrowLeft"  || e.key === "ArrowUp"   ? i - 1 : -1;
    if (to < 0 && to !== -1) to = tabs.length - 1;
    if (to === -1) return;
    e.preventDefault();
    to = to % tabs.length;
    tabs[to].focus(); open(to);
  });

  var root = document.getElementById("why");
  if (root) {
    var io = new IntersectionObserver(function(en){
      en.forEach(function(x){
        if (x.isIntersecting){ x.target.classList.add("in"); io.unobserve(x.target); }
      });
    }, { threshold:0, rootMargin:"0px 0px -70px 0px" });
    Array.prototype.slice.call(root.querySelectorAll(".rv")).forEach(function(el){
      io.observe(el);
    });
    requestAnimationFrame(function(){
      /* PERF: read all tops first, then write classes */
      var nodes = Array.prototype.slice.call(root.querySelectorAll(".rv"));
      var vh = window.innerHeight;
      var tops = nodes.map(function(el){ return el.getBoundingClientRect().top; });
      for (var i = 0; i < nodes.length; i++){
        if (tops[i] < vh) nodes[i].classList.add("in");
      }
    });
  }
})();


/* === spl-script (search-split) === */
(function(){
  var stage=document.querySelector('#search-split [data-split]'); if(!stage) return;
  var chips=[].slice.call(stage.querySelectorAll('.spl-chip'));
  var order=['gsearch','aio','gmaps','chatgpt','plx','gemini'];
  var idx=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function type(panel){
    var el=panel.querySelector('.spl-typed'); if(!el) return;
    clearTimeout(el._t);               /* one timer per field, so two lanes can type at once */
    var q=el.getAttribute('data-q')||'', n=0;
    if(reduce){ el.textContent=q; return; }
    el.textContent='';
    (function step(){ el.textContent=q.slice(0,++n); if(n<q.length) el._t=setTimeout(step,26); })();
  }
  function show(key){
    var lane=null;
    stage.querySelectorAll('.spl-panel').forEach(function(pn){
      if(pn.dataset.p===key) lane=pn.closest('.spl-lane');
    });
    if(!lane) return;
    /* only this lane changes surface; the other lane keeps showing its own,
       dimmed, so both channels stay on screen at once */
    lane.querySelectorAll('.spl-panel').forEach(function(pn){
      var on=pn.dataset.p===key;
      pn.classList.toggle('on',on);
      if(on){ replay(pn); type(pn); }
    });
    lane.querySelectorAll('.spl-chip').forEach(function(c){ c.setAttribute('aria-selected', String(c.dataset.s===key)); });
    stage.querySelectorAll('.spl-lane').forEach(function(l){ l.classList.toggle('is-live', l===lane); });
  }
  function replay(pn){ /* restart the panel's own little animations (rAF, not sync reflow) */
    var els=pn.querySelectorAll('.spl-r,.spl-pin,.spl-biz,.spl-l,.spl-cites');
    els.forEach(function(el){ el.style.animation='none'; });
    requestAnimationFrame(function(){
      els.forEach(function(el){ el.style.animation=''; });
    });
  }
  function next(){ idx=(idx+1)%order.length; show(order[idx]); }
  function play(){ stop(); if(!held) timer=setInterval(next,3600); }
  function stop(){ clearInterval(timer); }

  function hold(ms){ held=true; stop(); clearTimeout(hold._t);
    hold._t=setTimeout(function(){ held=false; play(); }, ms||12000); }

  chips.forEach(function(c){
    c.addEventListener('click',function(){ hold(); idx=order.indexOf(c.dataset.s); show(c.dataset.s); });
    /* a chip row is a row: the arrow keys walk it, as a tab strip should */
    c.addEventListener('keydown',function(e){
      var row=[].slice.call(c.parentElement.children), at=row.indexOf(c);
      var to = e.key==='ArrowRight' ? at+1 : e.key==='ArrowLeft' ? at-1 : -1;
      if(to<0 || to>=row.length) return;
      e.preventDefault(); row[to].focus(); row[to].click();
    });
    /* hovering a surface holds it open long enough to read */
    c.addEventListener('mouseenter',function(){ if(!c.matches('[aria-selected="true"]')){ idx=order.indexOf(c.dataset.s); show(c.dataset.s); } });
  });
  stage.addEventListener('mouseenter',stop); stage.addEventListener('mouseleave',function(){ if(!held) play(); });

  show('aio'); show(order[0]);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(stage);
})();

/* about counters */
(function(){
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function run(el){
    var target=parseFloat(el.getAttribute('data-count'))||0;
    var suffix=el.getAttribute('data-suffix')||'';
    if(el.dataset.done) return; el.dataset.done='1';
    if(reduce){ el.textContent=target+suffix; return; }
    var t0=null, dur=1400;
    requestAnimationFrame(function frame(t){
      if(t0===null) t0=t;
      var p=Math.min((t-t0)/dur,1), e=1-Math.pow(1-p,3);
      el.textContent=Math.round(target*e)+suffix;
      if(p<1) requestAnimationFrame(frame);
    });
  }
  var io=new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ run(e.target); io.unobserve(e.target); } });
  },{threshold:.4});
  document.querySelectorAll('#about [data-count]').forEach(function(el){ io.observe(el); });
})();

/* === home variants: section behaviors (nsr / blueprint / ix) === */
/* --- ref script 6 --- */
(function(){
  var stage=document.querySelector('[data-nsr]'); if(!stage) return;
  var nodes=[].slice.call(stage.querySelectorAll('.nsr-node'));
  var cards=[].slice.call(stage.querySelectorAll('.nsr-card'));
  var dots=[].slice.call(stage.querySelectorAll('.nsr-dot'));
  var rail=stage.querySelector('.nsr-rail');
  var at=2, timer=null, held=false;   /* the AI Overview screen leads */
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function go(n, scroll){
    at=(n+cards.length)%cards.length;
    cards.forEach(function(c,i){ c.classList.toggle('on', i===at); });
    nodes.forEach(function(x,i){ var on=i===at; x.classList.toggle('on',on); x.setAttribute('aria-selected',String(on)); });
    dots.forEach(function(d,i){ var on=i===at; d.classList.toggle('on',on); d.setAttribute('aria-selected',String(on)); });
    if(scroll!==false){
      var c=cards[at];
      rail.scrollTo({left:c.offsetLeft - (rail.clientWidth - c.offsetWidth)/2, behavior: reduce ? 'auto' : 'smooth'});
    }
  }
  function hold(){ held=true; stop(); clearTimeout(hold._t); hold._t=setTimeout(function(){ held=false; play(); },10000); }
  function play(){ stop(); if(!held && !reduce) timer=setInterval(function(){ go(at+1); },4200); }
  function stop(){ clearInterval(timer); }

  nodes.forEach(function(x,i){
    x.addEventListener('click',function(){ hold(); go(i); });
    x.addEventListener('mouseenter',function(){ go(i); });
    x.addEventListener('keydown',function(e){
      var to = e.key==='ArrowRight' ? i+1 : e.key==='ArrowLeft' ? i-1 : -1;
      if(to<0 || to>=nodes.length) return;
      e.preventDefault(); nodes[to].focus(); hold(); go(to);
    });
  });
  dots.forEach(function(d,i){ d.addEventListener('click',function(){ hold(); go(i); }); });
  stage.querySelector('.nsr-arw.prev').addEventListener('click',function(){ hold(); go(at-1); });
  stage.querySelector('.nsr-arw.next').addEventListener('click',function(){ hold(); go(at+1); });
  stage.addEventListener('mouseenter',stop);
  stage.addEventListener('mouseleave',function(){ if(!held) play(); });

  function centre(){ var c=cards[at]; if(c) rail.scrollLeft = c.offsetLeft - (rail.clientWidth - c.offsetWidth)/2; }
  go(at,false); requestAnimationFrame(centre); setTimeout(centre,300);
  window.addEventListener('resize',centre);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(stage);
})();

/* --- ref script 8 --- */
(function(){
  var board=document.querySelector('[data-blueprint]'); if(!board) return;
  var steps=[].slice.call(board.querySelectorAll('.bw-step'));
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){ at=(i+steps.length)%steps.length;
    steps.forEach(function(s,k){ s.classList.toggle('on', k===at); }); }
  function play(){ stop(); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },2200); }
  function stop(){ clearInterval(timer); }
  steps.forEach(function(s,i){
    s.addEventListener('pointerenter',function(){ held=true; stop(); show(i); });
    s.addEventListener('pointerleave',function(){ held=false; play(); });
  });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.25});
  io.observe(board);
})();

/* --- ref script 16 --- */
(function(){
  var board=document.querySelector('[data-ix]'); if(!board) return;
  var chips=[].slice.call(board.querySelectorAll('.ix-chip'));
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){ at=(i+chips.length)%chips.length;
    chips.forEach(function(c,k){ c.classList.toggle('on', k===at); }); }
  function play(){ stop(); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },900); }
  function stop(){ clearInterval(timer); }
  chips.forEach(function(c,i){
    c.addEventListener('pointerenter',function(){ held=true; stop(); show(i); });
    c.addEventListener('pointerleave',function(){ held=false; play(); });
  });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.3});
  io.observe(board);
})();


/* === about ribbon === */
(function(){
  document.querySelectorAll('[data-ribbon]').forEach(function(board){
  var cvs=[].slice.call(board.querySelectorAll('.cv'));
  var at=0, timer=null, held=false;
  var reduce=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  function show(i){
    at=(i+cvs.length)%cvs.length;
    cvs.forEach(function(c,k){ c.classList.toggle('on',k===at); c.classList.toggle('done',k<at);
      c.setAttribute('aria-selected', String(k===at)); });
  }
  function play(){ stop(); if(!held && !reduce) timer=setInterval(function(){ show(at+1); },1900); }
  function stop(){ clearInterval(timer); }
  function hold(){ held=true; stop(); clearTimeout(hold._t); hold._t=setTimeout(function(){ held=false; play(); },9000); }
  cvs.forEach(function(c,i){
    c.addEventListener('pointerenter',function(){ held=true; stop(); show(i); });
    c.addEventListener('pointerleave',function(){ held=false; play(); });
    c.addEventListener('click',function(){ hold(); show(i); });
    c.addEventListener('keydown',function(e){
      var to = e.key==='ArrowRight' ? i+1 : e.key==='ArrowLeft' ? i-1 : -1;
      if(to<0||to>=cvs.length) return;
      e.preventDefault(); cvs[to].focus(); hold(); show(to);
    });
  });
  show(0);
  var io=new IntersectionObserver(function(es){ es.forEach(function(e){ e.isIntersecting ? play() : stop(); }); },{threshold:.3});
  io.observe(board);
 });
})();
