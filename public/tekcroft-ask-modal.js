/*! Tekcroft — shared "Ask a question" FAQ modal
   Opens via [data-ask]. Submits to POST /api/contact → admin@tekcroft.com. */
(function () {
  if (window.__tekcroftAskModal) return;
  window.__tekcroftAskModal = true;

  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var modal = null;
  var lastFocus = null;
  var locked = false;

  var STYLE =
    "#askModal.modal{z-index:260}" +
    "#askModal .modal-frame{--tx:0px;--ty:18px;--cx:0px;--cy:0px;--crad:22px;" +
    "width:min(480px,100%);}" +
    "#askModal.modal.on .modal-frame{transform:translate(0,0)}" +
    "#askModal .modal-x{opacity:1}" +
    "#askModal .modal.on .modal-x,#askModal.modal.on .modal-x{opacity:1}" +
    "#askModal .field textarea{" +
    "grid-area:in;width:100%;min-height:110px;resize:vertical;" +
    "padding:calc(12.5 * var(--u,1px)) calc(15 * var(--u,1px));" +
    "border-radius:calc(12 * var(--u,1px));font-size:calc(14.5 * var(--u,1px));" +
    "font-family:inherit;line-height:1.45;" +
    "background:rgba(255,255,255,.52);border:1.5px solid rgba(255,255,255,.7);" +
    "color:var(--text);backdrop-filter:blur(6px);-webkit-backdrop-filter:blur(6px);" +
    "transition:border-color .2s var(--ease),background .2s var(--ease),box-shadow .2s var(--ease)}" +
    "#askModal .field textarea::placeholder{color:var(--n600)}" +
    "#askModal .field textarea:hover{background:rgba(255,255,255,.68);border-color:#fff}" +
    "#askModal .field textarea:focus{outline:none;background:var(--n0);border-color:var(--primary);" +
    "box-shadow:0 0 0 4px hsl(var(--brand-h) 100% 50% / .20)}" +
    "#askModal .field.good textarea{border-color:hsl(var(--brand-h) 80% 62%)}" +
    "#askModal .field.bad textarea{border-color:var(--primary);border-width:2px;" +
    "box-shadow:0 0 0 4px hsl(var(--brand-h) 100% 50% / .22)}" +
    "html[data-theme=dark] #askModal .field textarea{background:var(--n825);" +
    "border-color:var(--n800);color:#fff}" +
    "html[data-theme=dark] #askModal .field textarea::placeholder{color:var(--n500)}" +
    "html[data-theme=dark] #askModal .field textarea:hover{background:var(--n850);border-color:var(--n700)}" +
    "html[data-theme=dark] #askModal .field textarea:focus{background:var(--n850);border-color:var(--primary)}" +
    "#askModal .ask-status{margin:10px 0 0;font-size:13.5px;line-height:1.45;display:none}" +
    "#askModal .modal-done{display:none;text-align:center;padding:28px 8px 12px}" +
    "#askModal .modal-done.on{display:block}" +
    "#askModal .modal-done .ok{width:56px;height:56px;margin:0 auto 16px;border-radius:50%;" +
    "background:hsl(var(--brand-h) 100% 50% / .14);color:var(--brand-text);" +
    "display:grid;place-items:center}" +
    "#askModal .modal-done .ok svg{width:26px;height:26px}" +
    "#askModal .modal-done b{display:block;font-family:var(--font-display);font-size:1.35rem;" +
    "margin-bottom:8px}" +
    "#askModal .modal-done p{margin:0;color:var(--muted);font-size:14.5px;line-height:1.5}" +
    "html[data-theme=dark] #askModal .modal-done b{color:#fff}" +
    "html[data-theme=dark] #askModal .modal-done p{color:rgba(255,255,255,.82)}" +
    "@media (max-width:560px){" +
    "#askModal .modal-frame{width:100%}" +
    "#askModal .modal-card{padding:28px 20px 20px}" +
    "}";

  var HTML =
    '<div class="modal" id="askModal" role="dialog" aria-modal="true" ' +
    'aria-labelledby="askModalTitle" hidden>' +
    '<div class="modal-veil" data-ask-close></div>' +
    '<div class="modal-frame">' +
    '<div class="modal-card">' +
    '<button class="modal-x" type="button" data-ask-close aria-label="Close">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" ' +
    'stroke-linecap="round" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    "</button>" +
    '<div id="askModalBody">' +
    '<div class="modal-hero"><div>' +
    '<span class="tag modal-eyebrow"><i></i>Ask a question</span>' +
    '<p class="modal-title" id="askModalTitle">Ask a <em>question</em></p>' +
    '<p class="modal-intro">Not on the FAQ list? Send it here and a strategist will reply ' +
    "within one business day.</p>" +
    "</div></div>" +
    '<form class="modal-form" id="askModalForm" novalidate>' +
    '<div class="mf">' +
    '<div class="field" id="ask-wrap-name">' +
    '<label for="ask-name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg> Full name</label>' +
    '<input id="ask-name" name="name" type="text" placeholder="Jane Harper" ' +
    'autocomplete="name" required>' +
    "</div>" +
    '<div class="field" id="ask-wrap-mail">' +
    '<label for="ask-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<rect x="3" y="5.4" width="18" height="13.2" rx="2.4"/>' +
    '<path d="m3.8 7 8.2 5.6L20.2 7"/></svg> Email</label>' +
    '<input id="ask-mail" name="email" type="email" placeholder="you@company.com" ' +
    'autocomplete="email" required>' +
    "</div>" +
    '<div class="field" id="ask-wrap-q">' +
    '<label for="ask-q"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<circle cx="12" cy="12" r="8.2"/><path d="M9.6 9.6a2.5 2.5 0 0 1 4.6 1.2c0 1.5-2.2 2-2.2 3.4"/>' +
    '<circle cx="12" cy="16.6" r=".7" fill="currentColor"/></svg> Your question</label>' +
    '<textarea id="ask-q" name="message" placeholder="What would you like to know?" ' +
    "required></textarea>" +
    "</div>" +
    "</div>" +
    '<input type="text" name="website_url" tabindex="-1" autocomplete="off" ' +
    'aria-hidden="true" ' +
    'style="position:absolute!important;left:-10000px!important;width:1px!important;' +
    'height:1px!important;overflow:hidden!important;opacity:0!important">' +
    '<p class="ask-status" id="askStatus" role="status" aria-live="polite"></p>' +
    '<button class="btn btn-primary btn-lg" type="submit" id="askModalGo">' +
    'Send question <span class="arw">&uarr;</span></button>' +
    '<p class="modal-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    '<path d="M12 3.2 19 6v5.4c0 4.2-2.9 7.6-7 9.4-4.1-1.8-7-5.2-7-9.4V6l7-2.8Z"/>' +
    '<path d="m9.2 12 2 2 3.6-3.9"/></svg> By submitting you agree to our ' +
    '<a href="/privacy">privacy policy</a>.</p>' +
    "</form>" +
    "</div>" +
    '<div class="modal-done" id="askModalDone" role="status">' +
    '<div class="ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" ' +
    'stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round">' +
    '<path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>' +
    "<b>Question received</b>" +
    "<p>A strategist will email you within one business day.</p>" +
    "</div>" +
    "</div></div></div>";

  function ensure() {
    if (modal) return modal;
    if (!document.getElementById("tekcroft-ask-modal-css")) {
      var s = document.createElement("style");
      s.id = "tekcroft-ask-modal-css";
      s.textContent = STYLE;
      document.head.appendChild(s);
    }
    var wrap = document.createElement("div");
    wrap.innerHTML = HTML;
    document.body.appendChild(wrap.firstChild);
    modal = document.getElementById("askModal");
    wire(modal);
    return modal;
  }

  function lockScroll(on) {
    if (on === locked) return;
    locked = on;
    document.documentElement.style.overflow = on ? "hidden" : "";
  }

  function setStatus(kind, text) {
    var el = document.getElementById("askStatus");
    if (!el) return;
    if (!text) {
      el.style.display = "none";
      el.textContent = "";
      return;
    }
    el.style.display = "block";
    el.style.color =
      kind === "error" ? "#b42318" : kind === "ok" ? "#027a48" : "inherit";
    el.textContent = text;
  }

  function reset() {
    var form = document.getElementById("askModalForm");
    var body = document.getElementById("askModalBody");
    var done = document.getElementById("askModalDone");
    var go = document.getElementById("askModalGo");
    if (form) form.reset();
    if (body) body.style.display = "";
    if (done) done.classList.remove("on");
    if (go) {
      go.disabled = false;
      go.removeAttribute("aria-busy");
      if (go.dataset.html) go.innerHTML = go.dataset.html;
    }
    setStatus("", "");
    ["ask-wrap-name", "ask-wrap-mail", "ask-wrap-q"].forEach(function (id) {
      var w = document.getElementById(id);
      if (w) w.classList.remove("bad", "good");
    });
  }

  function openAsk(trigger) {
    var m = ensure();
    lastFocus = trigger || document.activeElement;
    reset();
    m.hidden = false;
    void m.offsetWidth;
    m.classList.add("on");
    lockScroll(true);
    var first = document.getElementById("ask-name");
    if (first) setTimeout(function () { first.focus({ preventScroll: true }); }, 80);
  }

  function closeAsk() {
    if (!modal || modal.hidden) return;
    modal.classList.remove("on");
    lockScroll(false);
    setTimeout(function () {
      if (!modal) return;
      modal.hidden = true;
      reset();
    }, 320);
    if (lastFocus && lastFocus.focus) {
      try { lastFocus.focus({ preventScroll: true }); } catch (_) {}
    }
  }

  function grade(mark) {
    var checks = [
      ["ask-wrap-name", "ask-name", function (v) { return v.trim().length > 1; }],
      ["ask-wrap-mail", "ask-mail", function (v) { return EMAIL.test(v.trim()); }],
      ["ask-wrap-q", "ask-q", function (v) { return v.trim().length > 5; }],
    ];
    var firstBad = null;
    checks.forEach(function (c) {
      var wrap = document.getElementById(c[0]);
      var input = document.getElementById(c[1]);
      if (!wrap || !input) return;
      var ok = c[2](input.value);
      wrap.classList.toggle("good", ok);
      if (mark) {
        wrap.classList.toggle("bad", !ok);
        if (!ok && !firstBad) firstBad = input;
      } else if (ok) {
        wrap.classList.remove("bad");
      }
    });
    return firstBad;
  }

  function wire(m) {
    m.querySelectorAll("[data-ask-close]").forEach(function (el) {
      el.addEventListener("click", closeAsk);
    });

    var form = document.getElementById("askModalForm");
    var go = document.getElementById("askModalGo");
    if (go && !go.dataset.html) go.dataset.html = go.innerHTML;

    ["ask-name", "ask-mail", "ask-q"].forEach(function (id) {
      var el = document.getElementById(id);
      if (!el) return;
      el.addEventListener("input", function () { grade(false); });
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        e.stopPropagation();
        var bad = grade(true);
        if (bad) {
          bad.focus();
          setStatus("error", "Please complete the required fields.");
          return;
        }
        setStatus("", "");

        var nameEl = document.getElementById("ask-name");
        var mailEl = document.getElementById("ask-mail");
        var qEl = document.getElementById("ask-q");
        var hp = form.querySelector('[name="website_url"]');
        var payload = {
          formName: "Ask a question",
          name: nameEl ? nameEl.value.trim() : "",
          email: mailEl ? mailEl.value.trim() : "",
          message: qEl ? qEl.value.trim() : "",
          page: location.pathname,
          source: location.href,
          website_url: hp ? hp.value : "",
        };

        if (go) {
          go.disabled = true;
          go.setAttribute("aria-busy", "true");
          go.textContent = "Sending…";
        }

        fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        })
          .then(function (res) {
            return res.json().then(function (data) {
              if (!res.ok) throw new Error((data && data.error) || "Send failed");
              return data;
            });
          })
          .then(function () {
            var body = document.getElementById("askModalBody");
            var done = document.getElementById("askModalDone");
            if (body) body.style.display = "none";
            if (done) done.classList.add("on");
            if (go) {
              go.disabled = false;
              go.removeAttribute("aria-busy");
              if (go.dataset.html) go.innerHTML = go.dataset.html;
            }
          })
          .catch(function (err) {
            if (go) {
              go.disabled = false;
              go.removeAttribute("aria-busy");
              if (go.dataset.html) go.innerHTML = go.dataset.html;
            }
            setStatus(
              "error",
              (err && err.message) ||
                "We could not send your question. Please try again."
            );
          });
      });
    }
  }

  document.addEventListener(
    "click",
    function (e) {
      var btn = e.target.closest("[data-ask]");
      if (!btn) return;
      e.preventDefault();
      openAsk(btn);
    },
    true
  );

  document.addEventListener("keydown", function (e) {
    if (!modal || modal.hidden) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeAsk();
      return;
    }
    if (e.key !== "Tab") return;
    var f = Array.prototype.slice
      .call(modal.querySelectorAll("button, input, textarea, a[href]"))
      .filter(function (el) {
        return el.offsetParent !== null && !el.disabled;
      });
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
