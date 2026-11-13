/* Home-page invite popup — lazy-loaded, mounted only when shown.
   Soft opacity/transform open; session once via tc_invite. */
(function () {
  "use strict";

  var KEY = "tc_invite";
  var SHOT = "/images/shot-2.webp";
  var OPEN_MS = 280;
  var CLOSE_MS = 260;
  var calm =
    typeof matchMedia === "function" &&
    matchMedia("(prefers-reduced-motion: reduce)").matches;

  var modal = null;
  var lastFocus = null;
  var closeTimer = null;
  var prepared = false;
  var open = false;

  function seen() {
    try {
      return sessionStorage.getItem(KEY) === "1";
    } catch (err) {
      return false;
    }
  }
  function markSeen() {
    try {
      sessionStorage.setItem(KEY, "1");
    } catch (err) {}
  }

  function preloadShot() {
    return new Promise(function (resolve) {
      var img = new Image();
      img.decoding = "async";
      img.src = SHOT;
      var done = function () {
        resolve();
      };
      if (typeof img.decode === "function") {
        img.decode().then(done).catch(done);
      } else {
        img.onload = done;
        img.onerror = done;
      }
    });
  }

  var HTML =
    '<div class="modal soft-invite" id="modal" role="dialog" aria-modal="true" aria-labelledby="modalTitle" hidden>' +
    '<div class="modal-veil" data-close></div>' +
    '<div class="modal-frame">' +
    '<div class="modal-card">' +
    '<button class="modal-x" type="button" data-close aria-label="Close">' +
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>' +
    "</button>" +
    '<div id="modalBody">' +
    '<div class="modal-hero">' +
    "<div>" +
    '<p class="modal-title" id="modalTitle">Get your <em>free proposal</em></p>' +
    '<p class="modal-intro">Tell us where your business stands today. We&rsquo;ll look at the ' +
    "market, the opportunities, and what should come next.</p>" +
    "</div>" +
    '<div class="modal-art" aria-hidden="true">' +
    '<svg viewBox="0 0 240 200" xmlns="http://www.w3.org/2000/svg" width="200" height="167">' +
    '<circle cx="152" cy="82" r="66" fill="hsl(var(--brand-h) 100% 50% / .10)"/>' +
    '<g fill="hsl(var(--brand-h) 100% 50% / .22)">' +
    '<circle cx="26" cy="86" r="2.4"/><circle cx="44" cy="86" r="2.4"/><circle cx="62" cy="86" r="2.4"/>' +
    '<circle cx="26" cy="104" r="2.4"/><circle cx="44" cy="104" r="2.4"/><circle cx="62" cy="104" r="2.4"/>' +
    '<circle cx="26" cy="122" r="2.4"/><circle cx="44" cy="122" r="2.4"/><circle cx="62" cy="122" r="2.4"/>' +
    "</g>" +
    '<g transform="rotate(-6 140 100)">' +
    '<rect x="82" y="34" width="116" height="146" rx="10" fill="var(--surface)" stroke="var(--border)" stroke-width="2"/>' +
    '<rect x="94" y="26" width="92" height="126" rx="7" fill="var(--bg)" stroke="var(--border)" stroke-width="2"/>' +
    '<rect x="122" y="16" width="36" height="20" rx="6" fill="var(--primary)"/>' +
    '<text x="112" y="56" font-family="Sora, sans-serif" font-size="13" font-weight="800" letter-spacing="1.4" fill="var(--text)">PROPOSAL</text>' +
    "<g>" +
    '<circle cx="112" cy="76" r="7" fill="var(--primary)"/>' +
    '<path d="m109 76 2.2 2.2 4-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="126" y="72" width="50" height="4" rx="2" fill="var(--border)"/>' +
    '<circle cx="112" cy="98" r="7" fill="var(--primary)"/>' +
    '<path d="m109 98 2.2 2.2 4-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="126" y="94" width="38" height="4" rx="2" fill="var(--border)"/>' +
    '<circle cx="112" cy="120" r="7" fill="var(--primary)"/>' +
    '<path d="m109 120 2.2 2.2 4-4.4" stroke="#fff" stroke-width="1.8" fill="none" stroke-linecap="round" stroke-linejoin="round"/>' +
    '<rect x="126" y="116" width="44" height="4" rx="2" fill="var(--border)"/>' +
    "</g></g>" +
    '<g transform="rotate(26 196 118)">' +
    '<rect x="190" y="70" width="13" height="86" rx="6" fill="var(--primary)"/>' +
    '<path d="M190 150h13l-6.5 14z" fill="hsl(var(--brand-h) 100% 33%)"/>' +
    "</g></svg></div></div>" +
    '<div class="modal-form">' +
    '<div class="mf-prog">' +
    '<span class="mf-prog-bar" aria-hidden="true"><i id="mfFill"></i></span>' +
    '<span class="mf-prog-n"><b id="mfAt">0</b> of 4 ready</span>' +
    "</div>" +
    '<div class="mf">' +
    '<div class="field" id="wrap-name">' +
    '<label for="m-name"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="8" r="3.6"/><path d="M4.8 20a7.2 7.2 0 0 1 14.4 0"/></svg> Full name</label>' +
    '<input id="m-name" type="text" placeholder="Jane Harper" autocomplete="name">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field" id="wrap-mail">' +
    '<label for="m-mail"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5.4" width="18" height="13.2" rx="2.4"/><path d="m3.8 7 8.2 5.6L20.2 7"/></svg> Email</label>' +
    '<input id="m-mail" type="email" placeholder="you@company.com" autocomplete="email">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field" id="wrap-phone">' +
    '<label for="m-phone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M6.2 3.6h3l1.6 4-2 1.4a12 12 0 0 0 6.2 6.2l1.4-2 4 1.6v3a2 2 0 0 1-2.2 2A16.6 16.6 0 0 1 4.2 5.8a2 2 0 0 1 2-2.2Z"/></svg> Phone</label>' +
    '<input id="m-phone" type="tel" placeholder="(555) 018-2245" autocomplete="tel">' +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div>" +
    '<div class="field sel" id="wrap-svc">' +
    '<label for="m-svc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="8.2"/><circle cx="12" cy="12" r="3"/></svg> Service</label>' +
    '<select id="m-svc">' +
    '<option value="">Select a service</option>' +
    "<option>SEO Services</option>" +
    "<option>Artificial Intelligence Services</option>" +
    "<option>Web and App Development Services</option>" +
    "<option>Digital Marketing</option>" +
    "<option>All of the above</option>" +
    "<option>Not sure yet</option>" +
    "</select>" +
    '<span class="field-ok" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.6 4.5L19 7.5"/></svg></span>' +
    "</div></div>" +
    '<button class="btn btn-primary btn-lg" type="button" id="modalGo">' +
    '<span class="btn-label">Get Your Free Proposal</span> <span class="arw">&uarr;</span></button>' +
    '<p class="modal-note"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round"><path d="M12 3.2 19 6v5.4c0 4.2-2.9 7.6-7 9.4-4.1-1.8-7-5.2-7-9.4V6l7-2.8Z"/><path d="m9.2 12 2 2 3.6-3.9"/></svg> By submitting you agree to our <a href="/privacy-policy">privacy policy</a>.</p>' +
    "</div></div>" +
    '<div class="modal-done" id="modalDone" role="status">' +
    '<div class="ok"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"><path d="m5 12.5 4.5 4.5L19 7.5"/></svg></div>' +
    "<b>Request received</b>" +
    "<p>A strategist will email you within one business day to confirm what they can access.</p>" +
    "</div></div></div></div>";

  function lockScroll(on) {
    var nav = document.getElementById("nav");
    if (on) {
      var gap = window.innerWidth - document.documentElement.clientWidth;
      var pad = gap > 0 ? gap + "px" : "";
      document.body.style.paddingRight = pad;
      if (nav) nav.style.paddingRight = pad;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.paddingRight = "";
      if (nav) nav.style.paddingRight = "";
      document.body.style.overflow = "";
    }
  }

  function focusables() {
    return Array.prototype.slice
      .call(
        modal.querySelectorAll(
          'button, input, select, a[href], [tabindex]:not([tabindex="-1"])'
        )
      )
      .filter(function (el) {
        return el.offsetParent !== null && !el.disabled;
      });
  }

  function onKey(e) {
    if (!open || !modal) return;
    if (e.key === "Escape") {
      e.preventDefault();
      closeModal();
      return;
    }
    if (e.key !== "Tab") return;
    var f = focusables();
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
  }

  /* Ink wipe sits under .btn > *; bare text is covered on hover. */
  function wrapModalGoLabel() {
    var go = modal && modal.querySelector("#modalGo");
    if (!go || go.querySelector(".btn-label")) return;
    Array.prototype.slice.call(go.childNodes).forEach(function (node) {
      if (node.nodeType !== 3) return;
      var text = node.nodeValue.replace(/\s+/g, " ").trim();
      if (!text) return;
      var label = document.createElement("span");
      label.className = "btn-label";
      label.textContent = text;
      go.replaceChild(label, node);
    });
  }

  function wireUi() {
    wrapModalGoLabel();
    Array.prototype.forEach.call(
      modal.querySelectorAll("[data-close]"),
      function (el) {
        el.addEventListener("click", closeModal);
      }
    );
    document.addEventListener("keydown", onKey);

    /* Local progress meter (lead-submit owns the real submit) */
    var checks = [
      ["#wrap-name", "#m-name", function (v) { return v.trim().length > 1; }],
      [
        "#wrap-mail",
        "#m-mail",
        function (v) {
          return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
        },
      ],
      [
        "#wrap-phone",
        "#m-phone",
        function (v) {
          return v.replace(/\D/g, "").length >= 7;
        },
      ],
      ["#wrap-svc", "#m-svc", function (v) { return v !== ""; }],
    ];
    var mfFill = modal.querySelector("#mfFill");
    var mfAt = modal.querySelector("#mfAt");
    function grade() {
      var done = 0;
      checks.forEach(function (c) {
        var wrap = modal.querySelector(c[0]);
        var input = modal.querySelector(c[1]);
        if (!wrap || !input) return;
        var ok = c[2](input.value);
        wrap.classList.toggle("good", ok);
        if (ok) {
          done++;
          wrap.classList.remove("bad");
        }
      });
      if (mfFill) mfFill.style.width = (done / checks.length) * 100 + "%";
      if (mfAt) mfAt.textContent = String(done);
    }
    Array.prototype.forEach.call(
      modal.querySelectorAll(".field input, .field select"),
      function (el) {
        el.addEventListener("input", grade);
        el.addEventListener("change", grade);
      }
    );
    grade();

    if (typeof window.__tekcroftWireLeadModal === "function") {
      window.__tekcroftWireLeadModal();
    }
  }

  function mount() {
    if (modal) {
      wrapModalGoLabel();
      return modal;
    }
    var existing = document.getElementById("modal");
    if (existing) {
      modal = existing;
      modal.classList.add("soft-invite");
      wrapModalGoLabel();
      return modal;
    }
    var wrap = document.createElement("div");
    wrap.innerHTML = HTML;
    modal = wrap.firstChild;
    document.body.appendChild(modal);
    wireUi();
    return modal;
  }

  function prepare() {
    if (prepared) return Promise.resolve();
    prepared = true;
    return preloadShot();
  }

  function openModal() {
    if (open) return Promise.resolve();
    markSeen();
    mount();
    return prepare().then(function () {
      if (open) return;
      clearTimeout(closeTimer);
      lastFocus = document.activeElement;
      var body = document.getElementById("modalBody");
      var done = document.getElementById("modalDone");
      if (body) body.style.display = "";
      if (done) done.classList.remove("on");

      modal.hidden = false;
      lockScroll(true);
      open = true;

      /* Double rAF so the browser paints the closed state first */
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          if (calm) {
            modal.classList.add("on", "no-motion");
          } else {
            modal.classList.add("on");
          }
          var closeBtn = modal.querySelector(".modal-x");
          if (closeBtn) closeBtn.focus({ preventScroll: true });
        });
      });
    });
  }

  function closeModal() {
    if (!modal || modal.hidden) return;
    markSeen();
    modal.classList.remove("on");
    open = false;
    lockScroll(false);
    var wait = calm ? 0 : CLOSE_MS;
    closeTimer = setTimeout(function () {
      modal.hidden = true;
      var body = document.getElementById("modalBody");
      var done = document.getElementById("modalDone");
      if (body) body.style.display = "";
      if (done) done.classList.remove("on");
    }, wait);
    if (lastFocus && lastFocus.focus) {
      try {
        lastFocus.focus({ preventScroll: true });
      } catch (err) {}
    }
  }

  window.TekcroftHomeInvite = {
    prepare: prepare,
    show: openModal,
    close: closeModal,
    seen: seen,
  };
  window.__tekcroftHomeInviteReady = true;
})();
