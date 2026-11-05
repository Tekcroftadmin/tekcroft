/*! Tekcroft — Ask a question modal (#askModal)
   Same fold-open animation as the proposal modal. Trigger: [data-modal="ask"] or [data-ask]. */
(function () {
  if (window.__tekcroftAskModal) return;
  window.__tekcroftAskModal = true;
  if (!window.__tekcroftFormStartedAt) {
    window.__tekcroftFormStartedAt = Date.now();
  }

  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var calm =
    window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  var STYLE =
    /* Scale unit so the 5-field card always fits the viewport — no scrollbar */
    "#askModal.modal{z-index:260;padding:14px;overflow:hidden !important}" +
    "#askModal .modal-frame{" +
    "--u:min(1px,calc(100dvh / 900));" +
    "width:min(calc(720 * var(--u)),100%);padding:calc(10 * var(--u))}" +
    "#askModal .modal-card{" +
    "padding:calc(20 * var(--u)) calc(26 * var(--u)) calc(16 * var(--u));" +
    "max-height:none;overflow:hidden !important}" +
    /* 5th field fade-in (no translateY — that ate the button gap) */
    "@keyframes askQIn{from{opacity:0}to{opacity:1}}" +
    "#askModal.modal.on .mf .field:nth-child(5)," +
    "#askModal.modal.on .mf .field.q{" +
    "animation:askQIn .4s var(--pop,cubic-bezier(.16,1,.3,1)) .5s backwards;" +
    "transform:none !important}" +
    "#askModal .field.q{opacity:1;transform:none;margin:0;padding:0}" +
    "#askModal .modal-card h2{font-size:calc(28 * var(--u));text-transform:uppercase;" +
    "letter-spacing:-.035em;line-height:1.06}" +
    "#askModal .modal-intro{font-size:calc(13 * var(--u));line-height:1.42;" +
    "margin:calc(6 * var(--u)) 0 0}" +
    "#askModal .modal-eyebrow{margin-bottom:calc(8 * var(--u))}" +
    "#askModal .modal-hero{gap:calc(10 * var(--u));align-items:center}" +
    "#askModal .modal-art{justify-self:end;width:100%;max-width:calc(170 * var(--u))}" +
    "#askModal .modal-art svg{width:100%;height:auto;display:block}" +
    "#askModal .modal-form{margin-top:calc(12 * var(--u));" +
    "padding:calc(12 * var(--u));overflow:visible;" +
    "display:flex;flex-direction:column}" +
    /* Always 2 columns — Name|Email, Phone|Service (beats shared 1-col rules) */
    "#askModal .mf{display:grid;grid-template-columns:1fr 1fr !important;" +
    "gap:calc(8 * var(--u)) calc(14 * var(--u));margin:0;flex:0 0 auto}" +
    "#askModal .mf-prog{margin-bottom:calc(8 * var(--u));flex:0 0 auto}" +
    "#askModal .field{gap:5px}" +
    "#askModal .field input,#askModal .field select{" +
    "padding:calc(9 * var(--u)) calc(12 * var(--u))}" +
    /* Clear gap between Your question and Send Question (match reference ~14–16px) */
    "#askModal .modal-form > #askModalGo," +
    "#askModal .modal-card .btn," +
    "#askModal #askModalGo{" +
    "display:flex;width:100%;flex:0 0 auto;" +
    "margin-top:16px !important;margin-bottom:0 !important;" +
    "padding:calc(12 * var(--u)) calc(22 * var(--u))}" +
    /* Hover wipe is ink — keep label + arrow white (override shared .arw ink color) */
    "#askModal #askModalGo:hover,#askModal #askModalGo:focus-visible{color:#fff !important}" +
    "#askModal #askModalGo:hover .arw,#askModal #askModalGo:focus-visible .arw{" +
    "color:#fff !important;background:transparent !important;border-color:#fff !important}" +
    "#askModal .modal-note{margin-top:calc(8 * var(--u));font-size:calc(12 * var(--u));flex:0 0 auto}" +
    "#askModal .modal-x{opacity:1}" +
    "#askModal.modal.on .modal-x{opacity:1}" +
    /* Compact textarea — rows=2, ~50px, resize:vertical */
    "#askModal .field textarea{" +
    "grid-area:in;width:100%;box-sizing:border-box;" +
    "min-height:50px;height:50px;max-height:72px;" +
    "padding:calc(8 * var(--u)) calc(12 * var(--u));" +
    "border-radius:calc(12 * var(--u));" +
    "font-size:calc(14 * var(--u));font-family:inherit;line-height:1.4;" +
    "resize:vertical;overflow:hidden;" +
    "background:rgba(255,255,255,.52);border:1.5px solid rgba(255,255,255,.7);color:var(--text);" +
    "backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
    "transition:border-color .2s var(--ease),background .2s var(--ease),box-shadow .2s var(--ease)}" +
    "#askModal .field textarea::placeholder{color:var(--n600)}" +
    "#askModal .field textarea:hover{background:rgba(255,255,255,.68);border-color:#fff}" +
    "#askModal .field textarea:focus{outline:none;background:var(--n0);border-color:var(--primary);" +
    "box-shadow:0 0 0 3px hsl(var(--brand-h) 100% 50% / .18);overflow-y:auto}" +
    "#askModal .field.good textarea{border-color:hsl(var(--brand-h) 80% 62%)}" +
    "#askModal .field.bad textarea{border-color:var(--primary);border-width:2px;" +
    "box-shadow:0 0 0 3px hsl(var(--brand-h) 100% 50% / .2)}" +
    "html[data-theme=dark] #askModal .field textarea{background:var(--n825);border-color:var(--n800);color:#fff}" +
    "html[data-theme=dark] #askModal .field textarea::placeholder{color:var(--n500)}" +
    "html[data-theme=dark] #askModal .field textarea:hover{background:var(--n850);border-color:var(--n700)}" +
    "html[data-theme=dark] #askModal .field textarea:focus{background:var(--n850);border-color:var(--primary)}" +
    "#askModal #askModalBody.hide{display:none}" +
    "#askModal .modal-done{display:none;text-align:center;padding:calc(20 * var(--u)) calc(8 * var(--u))}" +
    "#askModal .modal-done.on,#askModal .modal-done.show{display:block}" +
    "@media (max-width:620px){" +
    "#askModal.modal{overflow:hidden !important}" +
    "#askModal .modal-hero{grid-template-columns:1fr}" +
    "#askModal .modal-art{display:none}" +
    "#askModal .mf{grid-template-columns:1fr 1fr !important;" +
    "gap:calc(8 * var(--u)) calc(10 * var(--u))}" +
    "#askModal .modal-card h2{font-size:calc(24 * var(--u))}" +
    "#askModal .modal-card{padding:calc(18 * var(--u)) calc(14 * var(--u)) calc(14 * var(--u));" +
    "max-height:none;overflow:hidden !important}" +
    "#askModal .modal-form{margin-top:calc(10 * var(--u));padding:calc(10 * var(--u))}" +
    "#askModal .modal-eyebrow{margin-bottom:calc(6 * var(--u))}" +
    "#askModal #askModalGo{margin-top:16px !important}" +
    "#askModal .field textarea{min-height:48px;height:48px}" +
    "#askModal .field input,#askModal .field select{font-size:16px}" +
    "}" +
    "@media (max-height:700px){" +
    "#askModal .modal-art{display:none}" +
    "#askModal .modal-hero{grid-template-columns:1fr}" +
    "#askModal .modal-intro{display:none}" +
    "#askModal .modal-frame{--u:min(1px,calc(100dvh / 820))}" +
    "#askModal .modal-card{overflow:hidden !important}" +
    "}";

  var HTML =
    '<div class="modal" id="askModal" role="dialog" aria-modal="true" aria-labelledby="askModalTitle" hidden>' +
    '<div class="modal-veil" data-ask-close></div>' +
    '<div class="modal-frame">' +
    '<div class="modal-card">' +
    '<button class="modal-x" type="button" data-ask-close aria-label="Close">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    "</button>" +
    '<div id="askModalBody">' +
    '<div class="modal-hero"><div>' +
    '<span class="tag modal-eyebrow"><i></i>Ask a question</span>' +
    '<h2 id="askModalTitle">Ask us <em>anything</em></h2>' +
    '<p class="modal-intro">Send your question and a specialist will reply within one business day.</p>' +
    "</div>" +
    '<div class="modal-art" aria-hidden="true">' +
    '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg">' +
    '<circle cx="152" cy="82" r="66" fill="hsl(var(--brand-h) 100% 50% / .10)"/>' +
    '<g fill="hsl(var(--brand-h) 100% 50% / .22)">' +
    '<circle cx="26" cy="86" r="2.4"/><circle cx="44" cy="86" r="2.4"/><circle cx="62" cy="86" r="2.4"/>' +
    '<circle cx="26" cy="104" r="2.4"/><circle cx="44" cy="104" r="2.4"/><circle cx="62" cy="104" r="2.4"/>' +
    '<circle cx="26" cy="122" r="2.4"/><circle cx="44" cy="122" r="2.4"/><circle cx="62" cy="122" r="2.4"/>' +
    "</g>" +
    '<g transform="rotate(-6 140 100)">' +
    '<rect x="78" y="40" width="120" height="86" rx="16" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/>' +
    '<path d="M104 126l-6 20 26-12z" fill="var(--surface)" stroke="var(--border)" stroke-width="2" stroke-linejoin="round"/>' +
    '<circle cx="118" cy="83" r="7" fill="#2BB4E8"/><circle cx="140" cy="83" r="7" fill="var(--primary)"/><circle cx="162" cy="83" r="7" fill="#B9DFF0"/>' +
    "</g>" +
    '<g transform="rotate(20 196 132)">' +
    '<rect x="172" y="104" width="52" height="52" rx="15" fill="var(--primary)"/>' +
    '<text x="198" y="140" font-family="Sora, sans-serif" font-size="34" font-weight="800" fill="#fff" text-anchor="middle">?</text>' +
    "</g></svg></div></div>" +
    '<div class="modal-form">' +
    '<div class="mf-prog">' +
    '<span class="mf-prog-bar" aria-hidden="true"><i id="askMfFill"></i></span>' +
    '<span class="mf-prog-n"><b id="askMfAt">0</b> of 5 ready</span>' +
    "</div>" +
    '<div class="mf">' +
    '<div class="field" id="ask-wrap-name">' +
    '<label for="ask-m-name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg> Full name</label>' +
    '<input id="ask-m-name" name="name" type="text" placeholder="Jane Harper" autocomplete="name">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field" id="ask-wrap-mail">' +
    '<label for="ask-m-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><rect x="3" y="5.4" width="18" height="13.2" rx="2.4"/><path d="m3.8 7 8.2 5.6L20.2 7"/></svg> Email</label>' +
    '<input id="ask-m-mail" name="email" type="email" placeholder="you@company.com" autocomplete="email">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field" id="ask-wrap-phone">' +
    '<label for="ask-m-phone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6.2 3.6h3l1.6 4-2 1.4a12 12 0 0 0 6.2 6.2l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.2 5.8a2 2 0 0 1 2-2.2Z"/></svg> Phone</label>' +
    '<input id="ask-m-phone" name="phone" type="tel" placeholder="(555) 018-2245" autocomplete="tel">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field sel" id="ask-wrap-svc">' +
    '<label for="ask-m-svc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3"/></svg> Service</label>' +
    '<select id="ask-m-svc" name="service">' +
    '<option value="">Select a service</option>' +
    '<optgroup label="SEO Services">' +
    "<option>SEO Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Ecommerce SEO Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;SEO Audit Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;On-Page SEO Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Technical SEO Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;AI SEO Services</option>" +
    "</optgroup>" +
    '<optgroup label="Local SEO Services">' +
    "<option>Local SEO Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Google Business Profile Optimization Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Franchise SEO Services</option>" +
    "</optgroup>" +
    '<optgroup label="Web and App Development Services">' +
    "<option>Web and App Development Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Web Design and Development Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Custom Software Development Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;Mobile App Development Services</option>" +
    "</optgroup>" +
    '<optgroup label="Artificial Intelligence Services">' +
    "<option>Artificial Intelligence Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;AI Development Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;AI Chatbot Development Services</option>" +
    "<option>&nbsp;&nbsp;&nbsp;AI Agent Development Services</option>" +
    "</optgroup>" +
    "</select>" +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field q" id="ask-wrap-msg" style="grid-column:1/-1">' +
    '<label for="ask-m-msg"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 15a2 2 0 0 1-2 2H8l-5 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> Your question</label>' +
    '<textarea id="ask-m-msg" name="message" rows="2" placeholder="e.g. Do you work with Shopify stores, and how soon can we start?"></textarea>' +
    "</div>" +
    "</div>" +
    '<input type="text" name="website_url" tabindex="-1" autocomplete="off" aria-hidden="true" ' +
    'style="position:absolute!important;left:-10000px!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important">' +
    '<button class="btn btn-primary btn-lg" type="button" id="askModalGo">' +
    '<span class="btn-label">Send Question</span> <span class="arw">&uarr;</span></button>' +
    '<p class="modal-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3.2 19 6v5.4c0 4.2-2.9 7.6-7 9.4-4.1-1.8-7-5.2-7-9.4V6l7-2.8Z"/>' +
    '<path d="m9.2 12 2 2 3.6-3.9"/></svg> By submitting you agree to our ' +
    '<a href="/privacy">privacy policy</a>.</p>' +
    "</div></div>" +
    '<div class="modal-done" id="askModalDone" role="status">' +
    '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>' +
    "<b>Question received</b>" +
    "<p>A specialist will email you within one business day with an answer.</p>" +
    "</div>" +
    "</div></div></div>";

  var modal = null;
  var frame = null;
  var lastFocus = null;
  var lastTrigger = null;
  var closeTimer = null;
  var modalOpen = false;

  function $(sel, root) {
    return (root || document).querySelector(sel);
  }
  function $$(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function ensure() {
    if (modal) return modal;
    var css = document.getElementById("tekcroft-ask-modal-css");
    if (!css) {
      css = document.createElement("style");
      css.id = "tekcroft-ask-modal-css";
      document.head.appendChild(css);
    }
    css.textContent = STYLE;
    var wrap = document.createElement("div");
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap.firstChild);
    modal = document.getElementById("askModal");
    frame = $(".modal-frame", modal);
    wire();
    return modal;
  }

  function lockScroll(on) {
    var nav = $(".nav");
    var root = document.documentElement;
    if (on) {
      var gap = window.innerWidth - root.clientWidth;
      var pad = gap > 0 ? gap + "px" : "";
      document.body.style.paddingRight = pad;
      if (nav) nav.style.paddingRight = pad;
      document.body.style.overflow = "hidden";
      root.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      if (nav) nav.style.paddingRight = "";
      document.body.style.overflow = "";
      root.style.overflow = "";
    }
  }

  function aimAt(trigger) {
    if (!frame) return;
    var b =
      trigger && trigger.getBoundingClientRect
        ? trigger.getBoundingClientRect()
        : null;
    var rad = 8;
    if (b && b.width && b.height && trigger) {
      rad = parseFloat(getComputedStyle(trigger).borderTopLeftRadius) || 0;
      if (rad < 6) rad = b.height / 2;
      rad = Math.min(rad, b.height / 2);
    }

    frame.style.transition = "none";
    frame.style.transform = "none";
    var f = frame.getBoundingClientRect();

    var bw, bh, dx, dy;
    if (b && b.width && b.height) {
      bw = b.width;
      bh = b.height;
      dx = b.left + bw / 2 - (f.left + f.width / 2);
      dy = b.top + bh / 2 - (f.top + f.height / 2);
    } else {
      bw = Math.min(260, f.width * 0.5);
      bh = 52;
      rad = 8;
      dx = 0;
      dy = 22;
    }

    frame.style.setProperty("--tx", dx.toFixed(1) + "px");
    frame.style.setProperty("--ty", dy.toFixed(1) + "px");
    frame.style.setProperty(
      "--cx",
      Math.max(0, (f.width - bw) / 2).toFixed(1) + "px"
    );
    frame.style.setProperty(
      "--cy",
      Math.max(0, (f.height - bh) / 2).toFixed(1) + "px"
    );
    frame.style.setProperty("--crad", rad.toFixed(1) + "px");
    frame.style.transform = "";
    requestAnimationFrame(function () {
      frame.style.transition = "";
    });
  }

  function spark(trigger) {
    if (calm || !trigger || !trigger.getBoundingClientRect) return;
    var b = trigger.getBoundingClientRect();
    if (!b.width) return;
    var cs = getComputedStyle(trigger);
    var el = document.createElement("span");
    el.className = "pop-spark";
    el.style.left = b.left + "px";
    el.style.top = b.top + "px";
    el.style.width = b.width + "px";
    el.style.height = b.height + "px";
    el.style.borderRadius = cs.borderTopLeftRadius;
    document.body.appendChild(el);
    setTimeout(function () {
      el.remove();
    }, 750);
  }

  function resetForm() {
    var body = document.getElementById("askModalBody");
    var done = document.getElementById("askModalDone");
    var go = document.getElementById("askModalGo");
    if (body) body.classList.remove("hide");
    if (done) {
      done.classList.remove("on");
      done.classList.remove("show");
    }
    ["ask-m-name", "ask-m-mail", "ask-m-phone", "ask-m-svc", "ask-m-msg"].forEach(
      function (id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
      }
    );
    $$(".field", modal).forEach(function (f) {
      f.classList.remove("bad", "good");
    });
    if (go) {
      go.disabled = false;
      go.removeAttribute("aria-busy");
      if (go.dataset.html) go.innerHTML = go.dataset.html;
    }
    updateProg();
  }

  function fieldGood(id, type) {
    var el = document.getElementById(id);
    if (!el) return false;
    var v = el.value.trim();
    if (type === "mail") return EMAIL.test(v);
    if (type === "phone") return v.replace(/\D/g, "").length >= 7;
    return v !== "";
  }

  function updateProg() {
    var fields = [
      ["ask-m-name", "text"],
      ["ask-m-mail", "mail"],
      ["ask-m-phone", "phone"],
      ["ask-m-svc", "text"],
      ["ask-m-msg", "text"],
    ];
    var n = 0;
    fields.forEach(function (f) {
      var ok = fieldGood(f[0], f[1]);
      if (ok) n++;
      var wrap = document.getElementById(f[0]);
      if (wrap) {
        var field = wrap.closest(".field");
        if (field) field.classList.toggle("good", ok);
      }
    });
    var at = document.getElementById("askMfAt");
    var fill = document.getElementById("askMfFill");
    if (at) at.textContent = String(n);
    if (fill) fill.style.width = (n / fields.length) * 100 + "%";
  }

  function openAsk(trigger) {
    ensure();
    if (!modal.hidden && modal.classList.contains("on")) return;
    clearTimeout(closeTimer);
    modalOpen = true;

    var src = trigger;
    var burger = $(".js-burger") || $(".burger");
    if (src && src.closest && src.closest(".mnav") && burger) src = burger;

    var mnav = $(".mnav.open");
    if (mnav) mnav.classList.remove("open");

    lastFocus = trigger || document.activeElement;
    lastTrigger = src && src.offsetParent ? src : null;

    resetForm();

    modal.hidden = false;
    modal.classList.add("arm");
    lockScroll(true);
    aimAt(lastTrigger);
    spark(lastTrigger);
    if (lastTrigger) {
      lastTrigger.classList.remove("fired");
      requestAnimationFrame(function () {
        if (lastTrigger) lastTrigger.classList.add("fired");
      });
    }

    requestAnimationFrame(function () {
      modal.classList.add("on");
      modal.classList.remove("arm");
      var target = document.getElementById("ask-m-name");
      if (target) target.focus({ preventScroll: true });
    });
  }

  function closeAsk() {
    if (!modal || modal.hidden) return;
    if (lastTrigger && lastTrigger.offsetParent) aimAt(lastTrigger);
    modal.classList.remove("on");
    modal.classList.remove("arm");
    modalOpen = false;
    lockScroll(false);
    if (lastTrigger) lastTrigger.classList.remove("fired");
    closeTimer = setTimeout(function () {
      if (!modal) return;
      modal.hidden = true;
      resetForm();
    }, 640);
    if (lastFocus && lastFocus.focus) {
      try {
        lastFocus.focus({ preventScroll: true });
      } catch (_) {}
    }
  }

  function wire() {
    $$("[data-ask-close]", modal).forEach(function (el) {
      el.addEventListener("click", closeAsk);
    });

    [
      "ask-m-name",
      "ask-m-mail",
      "ask-m-phone",
      "ask-m-svc",
      "ask-m-msg",
    ].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", updateProg);
      el.addEventListener("change", updateProg);
    });

    var go = document.getElementById("askModalGo");
    if (go && !go.dataset.html) go.dataset.html = go.innerHTML;

    if (go) {
      go.addEventListener("click", function () {
        var nm = document.getElementById("ask-m-name");
        var em = document.getElementById("ask-m-mail");
        var ph = document.getElementById("ask-m-phone");
        var svc = document.getElementById("ask-m-svc");
        var msg = document.getElementById("ask-m-msg");
        var checks = [
          [nm, fieldGood("ask-m-name", "text")],
          [em, fieldGood("ask-m-mail", "mail")],
          [ph, fieldGood("ask-m-phone", "phone")],
          [svc, fieldGood("ask-m-svc", "text")],
          [msg, fieldGood("ask-m-msg", "text")],
        ];
        var bad = null;
        checks.forEach(function (p) {
          if (!p[0]) return;
          var field = p[0].closest(".field");
          if (field) field.classList.toggle("bad", !p[1]);
          if (!p[1] && !bad) bad = p[0];
        });
        if (bad) {
          bad.focus();
          return;
        }

        var hp = modal.querySelector('[name="website_url"]');
        var payload = {
          formName: "question",
          name: nm.value.trim(),
          email: em.value.trim(),
          phone: ph.value.trim(),
          service: (svc.value || "").replace(/^\u00a0+/, "").trim(),
          message: msg.value.trim(),
          page: location.pathname,
          source: location.href,
          website_url: hp ? hp.value : "",
          startedAt: window.__tekcroftFormStartedAt,
        };

        go.disabled = true;
        go.setAttribute("aria-busy", "true");
        go.textContent = "Sending…";

        fetch("/api/contact", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok)
                throw new Error((data && data.error) || "Send failed");
              return data;
            });
          })
          .then(function () {
            var body = document.getElementById("askModalBody");
            var done = document.getElementById("askModalDone");
            if (body) body.classList.add("hide");
            if (done) {
              done.classList.add("on");
              done.classList.add("show");
            }
            go.disabled = false;
            go.removeAttribute("aria-busy");
            if (go.dataset.html) go.innerHTML = go.dataset.html;
          })
          .catch(function (err) {
            go.disabled = false;
            go.removeAttribute("aria-busy");
            if (go.dataset.html) go.innerHTML = go.dataset.html;
            alert(
              (err && err.message) ||
                "We could not send your question. Please try again."
            );
          });
      });
    }

    updateProg();
  }

  function isAskTrigger(el) {
    if (!el || !el.getAttribute) return false;
    if (el.hasAttribute("data-ask")) return true;
    return el.getAttribute("data-modal") === "ask";
  }

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest
        ? e.target.closest('[data-ask], [data-modal="ask"]')
        : null;
      if (!btn || !isAskTrigger(btn)) return;
      e.preventDefault();
      e.stopImmediatePropagation();
      openAsk(btn);
    },
    true
  );

  document.addEventListener("keydown", function (e) {
    if (!modal || modal.hidden || !modalOpen) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeAsk();
      return;
    }
    if (e.key !== "Tab") return;
    var f = $$("button, input, select, textarea, a[href]", modal).filter(
      function (el) {
        return el.offsetParent !== null && !el.disabled;
      }
    );
    if (!f.length) return;
    var first = f[0];
    var last = f[f.length - 1];
    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  window.tekcroftOpenAsk = openAsk;
})();
