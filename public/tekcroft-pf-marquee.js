/* Shared infinite marquee for PLATFORM sections only (.sec.pf#platforms + .pf-orbit).
   Industries (#industries) keep their own page scripts. Builds enough duplicated
   card sets for a seamless -50% transform loop on viewports ≥768px.
   Drops copies on mobile / reduced-motion. */
(function () {
  "use strict";
  if (window.__tekcroftPfMarquee) return;
  window.__tekcroftPfMarquee = true;

  var desktop = window.matchMedia("(min-width: 768px)");
  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)");

  function tracks() {
    var list = [];
    var secs = document.querySelectorAll(".sec.pf#platforms");
    for (var i = 0; i < secs.length; i++) {
      if (!secs[i].querySelector(".pf-orbit")) continue;
      var track = secs[i].querySelector(".pf-track");
      if (track) list.push(track);
    }
    return list;
  }

  function seedsOf(track) {
    var seeded = track.querySelectorAll(":scope > [data-pf-seed]");
    if (seeded.length) {
      return Array.prototype.slice.call(seeded);
    }
    var kids = Array.prototype.slice.call(track.children).filter(function (el) {
      return !el.hasAttribute("data-copy");
    });
    kids.forEach(function (el) {
      el.setAttribute("data-pf-seed", "");
    });
    return kids;
  }

  function dropCopies(track) {
    Array.prototype.slice
      .call(track.querySelectorAll(":scope > [data-copy]"))
      .forEach(function (el) {
        el.remove();
      });
    /* Also strip any leftover non-seed children (from older page scripts). */
    var seeds = seedsOf(track);
    Array.prototype.slice.call(track.children).forEach(function (el) {
      if (!el.hasAttribute("data-pf-seed")) el.remove();
    });
    seeds.forEach(function (el) {
      if (!el.parentNode) track.appendChild(el);
    });
  }

  function defocus(root) {
    root.setAttribute("tabindex", "-1");
    Array.prototype.slice
      .call(root.querySelectorAll("a,button,input,select,textarea,[tabindex]"))
      .forEach(function (el) {
        el.setAttribute("tabindex", "-1");
        if (el.tagName === "A") {
          el.setAttribute("aria-hidden", "true");
          el.addEventListener(
            "click",
            function (e) {
              e.preventDefault();
              e.stopPropagation();
            },
            true
          );
        }
      });
  }

  function addSet(track, seeds) {
    seeds.forEach(function (card) {
      var copy = card.cloneNode(true);
      copy.classList.remove("rv", "in");
      copy.removeAttribute("style");
      copy.removeAttribute("data-pf-seed");
      copy.setAttribute("aria-hidden", "true");
      copy.setAttribute("data-copy", "");
      defocus(copy);
      track.appendChild(copy);
    });
  }

  function syncTrack(track) {
    var seeds = seedsOf(track);
    if (!seeds.length) return;

    dropCopies(track);
    seeds = seedsOf(track);

    if (!desktop.matches || reduce.matches) return;

    var need = Math.max(window.innerWidth, 2560) * 2;
    var sets = 1;
    addSet(track, seeds);
    sets = 2;

    var guard = 0;
    while (track.scrollWidth < need && guard < 12) {
      addSet(track, seeds);
      sets++;
      guard++;
    }
    /* Keep an even set count so translateX(-50% - gap/2) lands on a seam. */
    if (sets % 2 === 1) addSet(track, seeds);
  }

  function syncAll() {
    tracks().forEach(syncTrack);
  }

  function onChange() {
    syncAll();
  }

  syncAll();
  if (desktop.addEventListener) desktop.addEventListener("change", onChange);
  else desktop.addListener(onChange);
  if (reduce.addEventListener) reduce.addEventListener("change", onChange);
  else reduce.addListener(onChange);

  window.addEventListener("load", syncAll);
  /* Page scripts (lazyOnload) may add/drop copies after us — rebuild once more. */
  setTimeout(syncAll, 0);
  setTimeout(syncAll, 400);
})();
