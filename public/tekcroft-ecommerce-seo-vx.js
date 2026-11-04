/* VIDEO CTA — scroll-expand. Reads how far the tall track has scrolled and
   sizes the film to match; click-to-play swaps the cover for the video file
   (data-video on the section), so nothing heavy downloads until someone asks
   for it. The file plays at its own resolution, with the browser's own controls. */
(function(){
  "use strict";
  var sec = document.getElementById("watch");
  if (!sec) return;
  /* once-per-mount: Next.js Strict Mode / client navigations must not double-bind */
  if (sec.getAttribute("data-vx-bound") === "1") return;
  sec.setAttribute("data-vx-bound", "1");

  var trackEl = sec.querySelector(".vx-track"),
      stage   = sec.querySelector(".vx-stage"),
      frame   = sec.querySelector(".vx-frame"),
      glow    = sec.querySelector(".vx-glow"),
      cue     = sec.querySelector(".vx-scroll"),
      cta     = sec.querySelector(".vx-cta-wrap"),
      head    = sec.querySelector(".vx-head"),
      media   = sec.querySelector(".vx-media"),
      play    = sec.querySelector(".vx-play");

  var still   = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var src     = sec.getAttribute("data-video") || "";
  function ytIdFrom(u){
    var m = String(u || "").match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?(?:[^#]*&)?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    return m ? m[1] : "";
  }
  var ytId    = ytIdFrom(src);
  var isYt    = !!ytId;                                      /* YouTube embed on play */
  /* .vx-yt is an explicit static layout opt-in — do NOT force it for every YT URL,
     or the ecommerce scroll-expand design is lost on pages that share this script. */
  var staticYt = sec.classList.contains("vx-yt");
  var videoId = isYt ? (ytId || "youtube") : src.split("?")[0].split("/").pop();          /* file name or YouTube id for analytics */
  var cover   = media.querySelector("img");
  var playing = false, vid = null, frameEl = null;

  /* ---- measurement events for analytics (GTM / GA4 read dataLayer) ---- */
  function ping(name){
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ event: name, video_id: videoId, video_slot: "after-trust-bar", page_path: location.pathname });
  }

  function ytCommand(fn){
    if (!frameEl || !frameEl.contentWindow) return;
    try {
      frameEl.contentWindow.postMessage(JSON.stringify({ event: "command", func: fn, args: [] }), "*");
    } catch (e) {}
  }

  /* ---- click to play ---- */
  function start(){
    if (playing) return;
    playing = true;

    /* YouTube: lazy iframe embed (same click-to-play UX as the mp4 path) */
    if (isYt) {
      sec.classList.add("is-playing");
      playNow = function(){
        if (started) return;
        started = true;
        var title = sec.getAttribute("data-title") || "Video";
        var iframe = frameEl = document.createElement("iframe");
        iframe.src = "https://www.youtube.com/embed/" + ytId +
          "?autoplay=1&rel=0&modestbranding=1&playsinline=1&enablejsapi=1&origin=" +
          encodeURIComponent(location.origin);
        iframe.title = title;
        iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
        iframe.setAttribute("allowfullscreen", "");
        iframe.setAttribute("referrerpolicy", "strict-origin-when-cross-origin");
        media.appendChild(iframe);
        ping("video_play");
      };
      return;
    }

    var v = vid = document.createElement("video");
    v.controls = true; v.playsInline = true; v.preload = "auto";
    v.setAttribute("controlslist", "nodownload");
    v.setAttribute("aria-label", sec.getAttribute("data-title") || "Video");
    if (cover) v.poster = cover.src;                         /* the photo stays up until the first frame is drawn */

    var spin = document.createElement("span");               /* shown while a large file is buffering */
    spin.className = "vx-spin"; spin.setAttribute("aria-hidden", "true");
    var hide = function(){ spin.hidden = true; };
    var show = function(){ spin.hidden = false; };

    var asked = false, marks = { 25: 0, 50: 0, 75: 0 };
    v.addEventListener("playing", function(){
      hide();
      if (!asked) { asked = true; ping("video_play"); }
    });
    v.addEventListener("waiting", show);
    v.addEventListener("canplay", hide);
    v.addEventListener("timeupdate", function(){
      if (!v.duration) return;
      var pct = v.currentTime / v.duration * 100;
      for (var k in marks) if (!marks[k] && pct >= +k) { marks[k] = 1; ping("video_" + k); }
    });
    v.addEventListener("ended", function(){ ping("video_complete"); });
    v.addEventListener("error", function(){
      hide();
      var code = v.error ? v.error.code : 0;
      if (window.console) console.warn("[video] could not load " + src + " (error " + code + ")");
      var m = document.createElement("p");
      m.className = "vx-msg"; m.setAttribute("role", "status");
      var t = document.createElement("span");
      t.textContent = "Sorry, this video could not be loaded right now.";
      m.appendChild(t);
      /* when the page is opened from a file or a local server, say why (visitors never see this line) */
      var inApp = /^(about|blob|data):$/.test(location.protocol);
      if (inApp || location.protocol === "file:" || /^(localhost|127\.|\[::1\])/.test(location.hostname) || /[?&]debug\b/.test(location.search)) {
        var canPlay = !/\.mp4(\?|$)/i.test(src) || !!v.canPlayType('video/mp4; codecs="avc1.4d4033, mp4a.40.2"');
        var why = { 1: "loading was cancelled.", 2: "network error while loading the file.",
                    3: "the browser started the video but could not decode it." }[code];
        if (!why) why = !canPlay
          ? "this browser cannot play H.264 (mp4) video. Open the page in Chrome, Edge or Safari."
          : inApp
            ? "this looks like an in-app preview, which cannot reach the video file. Save the page and open it in Chrome with " + videoId + " in the same folder."
            : "the file was not found at this path. It must be named exactly " + videoId + " and sit in the same folder as this page.";
        var s = document.createElement("small");
        s.textContent = "Error " + code + " \u00b7 " + why;
        m.appendChild(s);
      }
      media.appendChild(m);
    });

    v.src = src;
    media.appendChild(v);
    media.appendChild(spin);
    sec.classList.add("is-playing");
    /* the file starts loading now, but playback starts in playNow(): a 4K video that begins decoding in the
       middle of the growth would make the growth stutter, so the click handler waits for the film to land */
    playNow = function(){
      if (started) return;
      started = true;
      var p = v.play();
      if (p && p.catch) p.catch(function(){});               /* if the browser still blocks it, the controls are right there */
      v.focus();
    };
  }
  var playNow = function(){}, started = false;
  /* Safari only lets a video with sound start from inside the click itself, so there it starts at once */
  var ua = navigator.userAgent, strict = /iP(hone|ad|od)/.test(ua) || (/Safari\//.test(ua) && !/Chrom(e|ium)|Android|Edg\//.test(ua));
  /* the film is 16:9, so if it is still a small pill when it is clicked it grows to full size, eased, and the
     video starts when it lands (expand is filled in below, once the scroll maths exists; it returns true
     when it will call back) */
  var expand = function(){ return false; };
  play.addEventListener("click", function(){
    start();
    /* Same expand-then-play path for mp4 and YouTube; only reduced-motion / Safari
       start immediately so autoplay is not blocked. */
    if (still || strict) { playNow(); if (!still) expand(null); }
    else if (!expand(playNow)) playNow();
  });

  var ctaLink = sec.querySelector("[data-vx-cta]");
  if (ctaLink) ctaLink.addEventListener("click", function(e){
    /* Keep navigation to the booking page — never let the video frame steal the click */
    e.stopPropagation();
    ping("video_cta_click");
  });

  if ("IntersectionObserver" in window) {
    var seen = new IntersectionObserver(function(es){
      if (es[0].isIntersecting) { ping("video_section_view"); seen.disconnect(); }
    }, { threshold: .5 });
    seen.observe(stage);

    /* a video that has scrolled out of sight should not keep playing behind the page */
    var away = new IntersectionObserver(function(es){
      if (!es[0].isIntersecting) {
        if (vid && !vid.paused) vid.pause();
        if (frameEl) ytCommand("pauseVideo");
      }
    }, { threshold: .05 });
    away.observe(stage);
  }

  /* Explicit .vx-yt or reduced-motion: no sticky growth — CSS owns the 16:9 + 10px inset layout.
     YouTube URLs still use scroll-expand unless .vx-yt is set on the section. */
  if (staticYt || still) {
    if (frame) frame.removeAttribute("style");
    if (head) head.removeAttribute("style");
    if (cta) cta.removeAttribute("style");
    if (glow) glow.removeAttribute("style");
    if (cue) cue.removeAttribute("style");
    if (cover) cover.style.transform = "";
    return;
  }

  /* ---- scroll-driven growth ----
     How it is kept smooth:
     · the film is placed with a transform and sized with width/height set straight on the elements that change
       (nothing is written to the stage, so the browser does not re-resolve styles for the whole section);
     · the eased progress follows the scroll position with a critically damped spring that is stepped by real
       elapsed time, so it feels the same at 60, 120 and 144 Hz and a jump in the scroll position glides instead of snapping;
     · positions are snapped to whole device pixels, so the edges stay crisp while it moves;
     · a click on the small film does not use the browser's smooth scroll (its speed depends on the distance);
       it runs its own eased glide, and the video starts when the film has landed.
     Phones / tall narrow screens use normal-flow layout (see CSS) and only drive the film's scale. */
  var OMEGA = 13;         /* spring stiffness: higher follows the scroll more tightly, lower is floatier */
  var d = {}, cur = 0, goal = 0, vel = 0, raf = 0, last = 0, pin = 0, dpr = 1, lastE = -1, g = null;
  var flowMQ = window.matchMedia("(max-width:760px), (max-width:1100px) and (max-aspect-ratio:1/1)");
  var flow = false, opened = false;
  function clamp(v){ return v < 0 ? 0 : (v > 1 ? 1 : v); }
  function lerp(a, b, t){ return a + (b - a) * t; }
  function ease(t){ return t * t * (3 - 2 * t); }
  function easeIO(t){ return t < .5 ? .5 * Math.pow(2 * t, 2.5) : 1 - .5 * Math.pow(2 * (1 - t), 2.5); }   /* in and out, a little quicker off the mark than a cubic */

  function clearInline(){
    frame.removeAttribute("style");
    head.removeAttribute("style");
    cta.removeAttribute("style");
    if (glow) glow.removeAttribute("style");
    if (cue) cue.removeAttribute("style");
    lastE = -1;
  }

  function measure(){
    var wasFlow = flow;
    flow = flowMQ.matches;
    if (flow !== wasFlow) clearInline();
    if (flow) { d = { flow: true, s0: .8, r0: 20, r1: 16 }; return; }
    var vw = stage.clientWidth, vh = stage.clientHeight;
    var narrow = vw < 760;
    var m = narrow ? 8 : 12;                       /* margin left around the film when it is full */
    var headH = head.offsetHeight;
    var area = vh - headH;                         /* room left under the words */
    /* full size is exactly 16:9 so object-fit:cover on the video does not crop top/bottom.
       Fit the largest 16:9 that fits the stage (side margins OK on wide screens). */
    var w1 = Math.min(vw - m * 2, (vh - m * 2) * 16 / 9);
    var h1 = w1 * 9 / 16;
    /* the starting card is always smaller than that, so the film only ever grows;
       on phones it stays 16:9 so height never shrinks while width grows */
    var w0 = w1 * (narrow ? .8 : .82);
    var h0 = narrow ? w0 * 9 / 16 : Math.min(area * .84, w0 * .45, 560);
    pin = parseFloat(getComputedStyle(stage).top) || 0;
    dpr = window.devicePixelRatio || 1;
    d = {
      vw: vw, vh: vh, w0: w0, h0: h0,
      r0: narrow ? 20 : 28,                         /* softly rounded corners at the start, not a pill */
      w1: w1, h1: h1, r1: narrow ? 16 : 22,
      c0: headH + area / 2 + (narrow ? -6 : 4),    /* where the pill's centre sits under the words */
      travel: trackEl.offsetHeight - vh
    };
    frame.style.left = "0px";                       /* from here on the script places the film with a transform */
  }

  function trackTop(){ return trackEl.getBoundingClientRect().top + window.pageYOffset; }   /* the track's place on the page */

  function readGoal(){
    if (d.flow) {
      var vh = window.innerHeight;
      var fr = frame.getBoundingClientRect();
      var c = fr.top + fr.height / 2;
      goal = opened ? 1 : clamp((vh * .9 - c) / (vh * .42));
      return;
    }
    goal = d.travel > 0 ? clamp((pin - trackEl.getBoundingClientRect().top) / d.travel) : 0;
  }

  function snap(v){ return Math.round(v * dpr) / dpr; }

  function paintFlow(e){
    var s = lerp(d.s0, 1, e);
    var fs = frame.style, sh = Math.max(0, 1 - e * 4);
    fs.transform = s > .9995 ? "none" : "scale(" + s.toFixed(4) + ")";
    fs.borderRadius = lerp(d.r0, d.r1, e).toFixed(1) + "px";
    fs.boxShadow = sh > 0
      ? "0 44px 90px -46px rgba(0,150,213," + (.55 * sh).toFixed(3) + "), 0 28px 56px -36px rgba(var(--ink-rgb)," + (.40 * sh).toFixed(3) + ")"
      : "none";
    if (cover) cover.style.transform = "scale(" + (1.06 - .06 * e).toFixed(4) + ")";
    if (glow) glow.style.opacity = (1 - e).toFixed(3);
  }

  function paint(p){
    var e = ease(clamp(p));
    if (Math.abs(e - lastE) < .00005) return;       /* nothing moved, so nothing to write */
    lastE = e;
    if (d.flow) { paintFlow(e); return; }
    var w = snap(lerp(d.w0, d.w1, e)), h = snap(lerp(d.h0, d.h1, e));
    var c = lerp(d.c0, d.vh / 2, e);
    var x = snap((d.vw - w) / 2), t = snap(c - h / 2);
    var fs = frame.style, sh = Math.max(0, 1 - e * 4);

    fs.width = w + "px";
    fs.height = h + "px";
    fs.transform = "translate3d(" + x + "px," + t + "px,0)";
    fs.borderRadius = lerp(d.r0, d.r1, e).toFixed(1) + "px";
    /* the depth shadow belongs to the pill; it is gone by the time the film has grown a quarter of the way */
    fs.boxShadow = sh > 0
      ? "0 44px 90px -46px rgba(0,150,213," + (.55 * sh).toFixed(3) + "), 0 28px 56px -36px rgba(var(--ink-rgb)," + (.40 * sh).toFixed(3) + ")"
      : "none";
    if (cover) cover.style.transform = "scale(" + (1.06 - .06 * e).toFixed(4) + ")";

    var hv = clamp(1 - e * 2.6);
    head.style.opacity = hv.toFixed(3);
    head.style.transform = "translate3d(0," + ((1 - hv) * -34).toFixed(1) + "px,0)";
    if (glow) glow.style.opacity = (1 - e).toFixed(3);
    if (cue) cue.style.opacity = Math.max(0, 1 - e * 5).toFixed(3);

    /* the button strip follows the film; only it (not the whole stage) gets the numbers */
    var cs = cta.style;
    cs.setProperty("--vx-w", w + "px");
    cs.setProperty("--vx-h", h + "px");
    cs.setProperty("--vx-t", t + "px");
  }

  function tick(now){
    raf = 0;
    var dt = last ? Math.min(.05, Math.max(.001, (now - last) / 1000)) : 1 / 60;
    last = now;
    if (g) {
      /* a glide: the page itself is moved along an ease curve, and the film is set straight from it */
      if (!g.t0) g.t0 = now;
      var t = clamp((now - g.t0) / g.dur), y = g.from + (g.to - g.from) * easeIO(t);
      window.scrollTo({ top: y, behavior: "instant" });    /* "instant": the page's own scroll-behavior must not smooth each step */
      goal = d.travel > 0 ? clamp((y - g.base) / d.travel) : 1;
      cur = goal; vel = 0;
      if (t >= 1) { var done = g.done; g = null; if (done) done(); }
    } else {
      /* critically damped spring towards the scroll position (exact solution, so the step size does not matter) */
      var n = cur - goal, tmp = (vel + OMEGA * n) * dt, ex = Math.exp(-OMEGA * dt);
      vel = (vel - OMEGA * tmp) * ex;
      cur = goal + (n + tmp) * ex;
      if (Math.abs(cur - goal) < .0004 && Math.abs(vel) < .004) { cur = goal; vel = 0; }
    }
    paint(cur);
    if (g || cur !== goal || vel) raf = requestAnimationFrame(tick); else last = 0;
  }
  function kick(){ if (!raf) raf = requestAnimationFrame(tick); }

  function settle(){ measure(); readGoal(); cur = goal; vel = 0; lastE = -1; paint(cur); }

  /* click on the small film: glide the page down to where the film is full size (about a second, eased in
     and out), then call back so the video can start. Returns false when there is nothing to grow.
     In flow mode a tap eases the film to full size and starts the video immediately. */
  expand = function(done){
    if (flow) { opened = true; readGoal(); kick(); return false; }
    if (goal > .97 || !d.travel) return false;
    var base = trackTop() - pin;
    g = { from: window.pageYOffset, to: base + d.travel, base: base, t0: 0, done: done || null,
          dur: Math.max(900, Math.min(1500, 650 + Math.abs(base + d.travel - window.pageYOffset) * .5)) };
    if (done) setTimeout(done, g.dur + 700);        /* if the glide is interrupted, the video still starts */
    kick();
    return true;
  };

  /* the visitor takes over: stop gliding at once */
  function release(){ g = null; }
  window.addEventListener("wheel", release, { passive: true });
  window.addEventListener("touchmove", release, { passive: true });
  window.addEventListener("keydown", function(e){
    if (/^(ArrowUp|ArrowDown|PageUp|PageDown|Home|End| )$/.test(e.key)) release();
  });
  window.addEventListener("mousedown", function(e){ if (e.clientX >= document.documentElement.clientWidth) release(); });

  window.addEventListener("scroll", function(){
    if (g) return;
    readGoal();
    kick();
  }, { passive: true });
  window.addEventListener("resize", settle);
  window.addEventListener("load", settle);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(settle);
  if ("ResizeObserver" in window) new ResizeObserver(function(){ if (!g) { measure(); readGoal(); lastE = -1; kick(); } }).observe(document.body);
  settle();
})();
