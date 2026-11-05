/*! Tekcroft lead forms → POST /api/contact
   Capture-phase submit handler for form[data-lead], booking #form, and homepage modal. */
(function () {
  if (window.__tekcroftLeadSubmit) return;
  window.__tekcroftLeadSubmit = true;
  if (!window.__tekcroftFormStartedAt) {
    window.__tekcroftFormStartedAt = Date.now();
  }

  var EMAIL = /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i;
  var RULES = {
    name: function (v) {
      return v.length >= 2 ? "" : "Please tell us your name.";
    },
    email: function (v) {
      return !v
        ? "Please add an email we can reply to."
        : EMAIL.test(v)
          ? ""
          : "That email does not look right.";
    },
    phone: function (v) {
      return v.replace(/\D/g, "").length >= 7
        ? ""
        : "Please add a number we can reach you on.";
    },
    service: function (v) {
      return v ? "" : "Pick the service you are after.";
    },
  };

  function ensureHoneypot(form) {
    if (form.querySelector('[name="website_url"]')) return;
    var hp = document.createElement("input");
    hp.type = "text";
    hp.name = "website_url";
    hp.tabIndex = -1;
    hp.autocomplete = "off";
    hp.setAttribute("aria-hidden", "true");
    hp.style.cssText =
      "position:absolute!important;left:-10000px!important;top:auto!important;width:1px!important;height:1px!important;overflow:hidden!important;opacity:0!important;pointer-events:none!important";
    form.appendChild(hp);
  }

  function ensureStatus(form) {
    var el = form.querySelector("[data-lead-status]");
    if (el) return el;
    el = document.createElement("p");
    el.setAttribute("data-lead-status", "");
    el.setAttribute("role", "status");
    el.setAttribute("aria-live", "polite");
    el.style.cssText =
      "margin:12px 0 0;font-size:13.5px;line-height:1.45;display:none";
    var btn = form.querySelector('button[type="submit"]');
    if (btn && btn.parentNode) {
      if (btn.nextSibling) btn.parentNode.insertBefore(el, btn.nextSibling);
      else btn.parentNode.appendChild(el);
    } else {
      form.appendChild(el);
    }
    return el;
  }

  function setStatus(form, kind, text) {
    var el = ensureStatus(form);
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

  function setLoading(form, on) {
    var btn = form.querySelector('button[type="submit"]');
    if (!btn) return;
    if (on) {
      if (!btn.dataset.html) btn.dataset.html = btn.innerHTML;
      btn.disabled = true;
      btn.setAttribute("aria-busy", "true");
      btn.textContent = "Sending…";
    } else {
      btn.disabled = false;
      btn.removeAttribute("aria-busy");
      if (btn.dataset.html) btn.innerHTML = btn.dataset.html;
    }
  }

  function checkHsField(el) {
    var key = el.dataset.rule;
    var box = el.closest(".hs-field");
    if (!box) return true;
    var msg = RULES[key] ? RULES[key](el.value.trim()) : "";
    box.setAttribute("data-bad", msg ? "true" : "false");
    el.setAttribute("aria-invalid", msg ? "true" : "false");
    var err = box.querySelector(".hs-err");
    if (err) err.textContent = msg;
    return !msg;
  }

  function validateLeadForm(form) {
    var ruled = Array.prototype.slice.call(
      form.querySelectorAll("[data-rule]")
    );
    if (ruled.length) {
      var bad = null;
      ruled.forEach(function (el) {
        if (!checkHsField(el) && !bad) bad = el;
      });
      if (bad) {
        bad.focus();
        return false;
      }
      return true;
    }

    // Contact / generic required fields
    var required = Array.prototype.slice.call(
      form.querySelectorAll("[required]")
    );
    for (var i = 0; i < required.length; i++) {
      var el = required[i];
      var v = (el.value || "").trim();
      if (!v || (el.type === "email" && !EMAIL.test(v))) {
        el.focus();
        setStatus(
          form,
          "error",
          el.type === "email"
            ? "Please add a valid email we can reply to."
            : "Please complete the required fields."
        );
        return false;
      }
    }
    return true;
  }

  function collectFields(form) {
    var data = {};
    Array.prototype.slice
      .call(form.querySelectorAll("input, select, textarea"))
      .forEach(function (el) {
        if (!el.name || el.type === "submit" || el.type === "button") return;
        if (el.type === "checkbox" || el.type === "radio") {
          if (el.checked) data[el.name] = el.value;
          return;
        }
        data[el.name] = el.value;
      });
    return data;
  }

  function formLabel(form) {
    if (form.id === "form" && document.getElementById("sumDate")) {
      return "booking request";
    }
    if (form.classList.contains("ct-form")) return "contact form";
    var title = form.querySelector(".hs-form-title");
    if (title && title.textContent.trim()) {
      return title.textContent.trim();
    }
    return "lead form";
  }

  function bookingPayload(form) {
    var nm = document.getElementById("nm");
    var em = document.getElementById("em");
    var ph = document.getElementById("ph");
    var cm = document.getElementById("cm");
    var sv = document.getElementById("service");
    var msg = document.getElementById("msg");
    var sumDate = document.getElementById("sumDate");
    var sumTime = document.getElementById("sumTime");
    return {
      formName: "booking request",
      name: nm ? nm.value : "",
      email: em ? em.value : "",
      phone: ph ? ph.value : "",
      company: cm ? cm.value : "",
      service: sv ? sv.value : "",
      message: msg ? msg.value : "",
      date: sumDate ? sumDate.textContent.trim() : "",
      time: sumTime ? sumTime.textContent.trim() : "",
      page: location.pathname,
      website_url: (form.querySelector('[name="website_url"]') || {}).value || "",
      startedAt: window.__tekcroftFormStartedAt,
    };
  }

  function validateBooking(form) {
    var nm = document.getElementById("nm");
    var em = document.getElementById("em");
    var sv = document.getElementById("service");
    var sumDate = document.getElementById("sumDate");
    if (!sumDate || !sumDate.textContent.trim()) {
      setStatus(form, "error", "Please choose a date and time first.");
      return false;
    }
    if (!nm || !nm.value.trim()) {
      nm && nm.focus();
      setStatus(form, "error", "Please tell us your name.");
      return false;
    }
    if (!em || !em.checkValidity() || !EMAIL.test(em.value.trim())) {
      em && em.focus();
      setStatus(form, "error", "Please add a valid email we can reply to.");
      return false;
    }
    if (!sv || !sv.value) {
      sv && sv.focus();
      setStatus(form, "error", "Please select a service.");
      return false;
    }
    return true;
  }

  function showBookingSuccess(payload) {
    var dDate = document.getElementById("dDate");
    var dTime = document.getElementById("dTime");
    var s1 = document.getElementById("s1");
    var s2 = document.getElementById("s2");
    var p1 = document.getElementById("pane1");
    var p2 = document.getElementById("pane2");
    var p3 = document.getElementById("pane3");
    if (dDate) dDate.textContent = payload.date || "";
    if (dTime) dTime.textContent = payload.time || "";
    if (s2) {
      s2.classList.remove("on");
      s2.classList.add("done");
    }
    if (s1) s1.classList.add("done");
    [p1, p2, p3].forEach(function (p) {
      if (p) p.classList.toggle("show", p === p3);
    });
  }

  function showContactSuccess(form) {
    form.setAttribute("data-sent", "true");
    setStatus(
      form,
      "ok",
      "Thanks — we received your message and will reply within one business day."
    );
    var btn = form.querySelector('button[type="submit"]');
    if (btn) {
      btn.disabled = true;
      btn.setAttribute("aria-busy", "false");
      if (!btn.dataset.html) btn.dataset.html = btn.innerHTML;
      btn.textContent = "Message sent";
    }
  }

  async function send(payload) {
    var res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    var data = null;
    try {
      data = await res.json();
    } catch (_) {}
    if (!res.ok) {
      var err = (data && data.error) || "We could not send your message. Please try again.";
      throw new Error(err);
    }
    return data;
  }

  async function handleLead(form) {
    ensureHoneypot(form);
    setStatus(form, "", "");
    if (!validateLeadForm(form)) return;

    var fields = collectFields(form);
    var payload = Object.assign({}, fields, {
      formName: formLabel(form),
      page: location.pathname + location.search,
      source: location.href,
      name: fields.name || "",
      email: fields.email || "",
      phone: fields.phone || "",
      company: fields.company || "",
      website: fields.website || "",
      service: fields.service || fields.topic || "",
      message: fields.message || "",
      startedAt: window.__tekcroftFormStartedAt,
    });

    setLoading(form, true);
    try {
      await send(payload);
      if (form.classList.contains("hs-form")) {
        form.setAttribute("data-sent", "true");
        form.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (form.classList.contains("ct-form")) {
        showContactSuccess(form);
      } else {
        form.setAttribute("data-sent", "true");
        setStatus(form, "ok", "Thanks — we got your details and will be in touch soon.");
      }
    } catch (err) {
      setLoading(form, false);
      setStatus(
        form,
        "error",
        (err && err.message) ||
          "We could not send your message. Please try again."
      );
    }
  }

  async function handleBooking(form) {
    ensureHoneypot(form);
    setStatus(form, "", "");
    if (!validateBooking(form)) return;
    var payload = bookingPayload(form);
    setLoading(form, true);
    try {
      await send(payload);
      showBookingSuccess(payload);
    } catch (err) {
      setLoading(form, false);
      setStatus(
        form,
        "error",
        (err && err.message) ||
          "We could not book that session. Please try again."
      );
    }
  }

  function isBookingForm(form) {
    return form.id === "form" && !!document.getElementById("sumDate");
  }

  document.addEventListener(
    "submit",
    function (e) {
      var form = e.target;
      if (!(form instanceof HTMLFormElement)) return;
      if (form.hasAttribute("data-lead")) {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleLead(form);
        return;
      }
      if (isBookingForm(form)) {
        e.preventDefault();
        e.stopImmediatePropagation();
        handleBooking(form);
      }
    },
    true
  );

  /* Homepage modal CTA (button, not a form submit) */
  function wireModal() {
    var mGo = document.getElementById("modalGo");
    var modal = document.getElementById("leadModal") || document.querySelector(".lead-modal");
    if (!mGo || mGo.dataset.tekcroftWired) return;
    mGo.dataset.tekcroftWired = "1";

    mGo.addEventListener(
      "click",
      function (e) {
        var nameEl = document.getElementById("m-name");
        var mailEl = document.getElementById("m-mail");
        var phoneEl = document.getElementById("m-phone");
        var svcEl = document.getElementById("m-svc");
        if (!nameEl || !mailEl) return;

        e.preventDefault();
        e.stopImmediatePropagation();

        var checks = [
          ["#wrap-name", "#m-name", function (v) { return v.trim().length > 1; }],
          ["#wrap-mail", "#m-mail", function (v) { return EMAIL.test(v.trim()); }],
          ["#wrap-phone", "#m-phone", function (v) { return v.replace(/\D/g, "").length >= 7; }],
          ["#wrap-svc", "#m-svc", function (v) { return v !== ""; }],
        ];
        var firstBad = null;
        checks.forEach(function (c) {
          var wrap = document.querySelector(c[0]);
          var input = document.querySelector(c[1]);
          if (!wrap || !input) return;
          var ok = c[2](input.value);
          wrap.classList.toggle("good", ok);
          if (ok) wrap.classList.remove("bad");
          else {
            wrap.classList.add("bad");
            if (!firstBad) firstBad = input;
          }
        });
        if (firstBad) {
          firstBad.focus();
          return;
        }

        var hp =
          (modal && modal.querySelector('[name="website_url"]')) ||
          null;
        if (!hp && modal) {
          ensureHoneypot(modal);
          hp = modal.querySelector('[name="website_url"]');
        }

        var payload = {
          formName: "Get a Free Proposal",
          name: nameEl.value,
          email: mailEl.value,
          phone: phoneEl ? phoneEl.value : "",
          service: svcEl ? svcEl.value : "",
          page: location.pathname,
          source: location.href,
          website_url: hp ? hp.value : "",
          startedAt: window.__tekcroftFormStartedAt,
        };

        mGo.classList.add("sending");
        mGo.disabled = true;
        send(payload)
          .then(function () {
            mGo.classList.remove("sending");
            var body = document.getElementById("modalBody");
            var done = document.getElementById("modalDone");
            if (body) body.style.display = "none";
            if (done) done.classList.add("on");
          })
          .catch(function (err) {
            mGo.classList.remove("sending");
            mGo.disabled = false;
            alert(
              (err && err.message) ||
                "We could not send your message. Please try again."
            );
          });
      },
      true
    );
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", wireModal);
  } else {
    wireModal();
  }
  // Modal may mount after page scripts; retry briefly
  setTimeout(wireModal, 800);
  setTimeout(wireModal, 2000);
})();
