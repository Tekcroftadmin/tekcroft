/* Shared comparison-table halo: pin .vs-halo to th.c-us on every .vs-stage */
(function () {
  "use strict";

  var MQ = "(max-width:900px)";
  var PAD = 14;

  function syncStage(stage) {
    var table = stage.querySelector("table.vs-table, table.st-table, table");
    var hold = stage.closest ? stage.closest(".vs-hold") : null;
    /* Prefer stage child (scrolls with columns); fall back to card child */
    var halo =
      stage.querySelector(":scope > .vs-halo") ||
      (hold && hold.querySelector(":scope > .vs-halo"));
    var us = table && table.querySelector("thead th.c-us");
    if (!table || !halo || !us) return;

    /* #stack keeps the pop-out highlight on mobile/tablet too */
    var keepMobile = !!(stage.closest && stage.closest("#stack"));
    if (window.matchMedia(MQ).matches && !keepMobile) {
      halo.style.left = "";
      halo.style.width = "";
      halo.style.top = "";
      halo.style.bottom = "";
      halo.style.height = "";
      halo.style.right = "";
      return;
    }

    /* Absolute coords relative to the halo's positioned parent (stage or hold). */
    var box = halo.parentElement === hold ? hold : stage;
    var sr = box.getBoundingClientRect();
    var ur = us.getBoundingClientRect();
    if (!sr.width || !ur.width) return;

    halo.style.left = ur.left - sr.left + "px";
    halo.style.width = ur.width + "px";
    halo.style.right = "auto";
    halo.style.top = -PAD + "px";
    halo.style.bottom = -PAD + "px";
    halo.style.height = "auto";
  }

  function syncAll() {
    var stages = document.querySelectorAll(".vs-stage");
    for (var i = 0; i < stages.length; i++) syncStage(stages[i]);
  }

  var t = null;
  function schedule() {
    clearTimeout(t);
    t = setTimeout(syncAll, 40);
  }

  function boot() {
    syncAll();

    if (typeof ResizeObserver !== "undefined") {
      var stages = document.querySelectorAll(".vs-stage");
      for (var i = 0; i < stages.length; i++) {
        var ro = new ResizeObserver(schedule);
        ro.observe(stages[i]);
        var table = stages[i].querySelector("table");
        if (table) ro.observe(table);
        var hold = stages[i].closest && stages[i].closest(".vs-hold");
        if (hold) ro.observe(hold);
      }
    }

    window.addEventListener("resize", schedule);
    window.addEventListener("load", schedule);
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(schedule).catch(function () {});
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
  /* Soft-nav remounts .vs-stage nodes — re-measure after page swap */
  window.addEventListener("tekcroft:nav", schedule);
})();
