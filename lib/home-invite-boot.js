/* Inline boot for Home invite — kept tiny; loads tekcroft-home-invite.js lazily. */
(function () {
  var KEY = "tc_invite";
  /* Invite script URL injected below at render time */
  var SRC = __HOME_INVITE_SRC__;
  if (!SRC) return;
  try {
    if (sessionStorage.getItem(KEY) === "1") return;
  } catch (e) {}

  var loadPromise = null;
  var triggered = false;
  var ticking = false;

  function load() {
    if (loadPromise) return loadPromise;
    loadPromise = new Promise(function (resolve, reject) {
      if (window.TekcroftHomeInvite) {
        resolve(window.TekcroftHomeInvite);
        return;
      }
      var s = document.createElement("script");
      s.src = SRC;
      s.async = true;
      s.onload = function () {
        resolve(window.TekcroftHomeInvite);
      };
      s.onerror = reject;
      document.body.appendChild(s);
    });
    return loadPromise;
  }

  function preload() {
    load()
      .then(function (api) {
        if (api && api.prepare) return api.prepare();
      })
      .catch(function () {});
  }

  function fire() {
    if (triggered) return;
    triggered = true;
    window.removeEventListener("scroll", onScroll);
    load()
      .then(function (api) {
        if (api && api.show) return api.show();
      })
      .catch(function () {});
  }

  function depthOk() {
    var max = document.documentElement.scrollHeight - window.innerHeight;
    return max > 0 && window.scrollY / max >= 0.4;
  }

  function onScroll() {
    if (!loadPromise) preload();
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(function () {
      ticking = false;
      if (!triggered && depthOk()) fire();
    });
  }

  window.addEventListener("scroll", onScroll, { passive: true });

  /* Idle preload only after load, with a soft timeout — keeps it off first paint/LCP */
  function armIdle() {
    var ric = window.requestIdleCallback
      ? function (cb) {
          return window.requestIdleCallback(cb, { timeout: 6000 });
        }
      : function (cb) {
          return setTimeout(cb, 4000);
        };
    ric(function () {
      if (!triggered) preload();
    });
  }
  if (document.readyState === "complete") armIdle();
  else window.addEventListener("load", armIdle, { once: true });
})();
