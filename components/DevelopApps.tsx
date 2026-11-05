"use client";

import { useEffect } from "react";

/**
 * Wires #develop-apps switcher + Quick comparison highlight
 * (design-file da-script behaviour).
 */
export default function DevelopApps() {
  useEffect(() => {
    const ac = new AbortController();
    const { signal } = ac;
    let wired: HTMLElement | null = null;
    let k = 0;

    function wire() {
      const r = document.getElementById("develop-apps");
      if (!r || r === wired) return;

      const sw = r.querySelector<HTMLElement>(".sw");
      const bs = Array.from(r.querySelectorAll<HTMLElement>(".sw-b"));
      const ps = Array.from(r.querySelectorAll<HTMLElement>(".pn"));
      const pill = r.querySelector<HTMLElement>(".sw-pill");
      const tb = r.querySelector<HTMLElement>(".qt");
      if (!sw || !pill || !tb || !bs.length) return;

      wired = r;
      r.dataset.daWired = "1";

      function pos() {
        const b = bs[k];
        if (!b || !pill) return;
        pill.style.width = b.offsetWidth + "px";
        pill.style.transform = "translateX(" + b.offsetLeft + "px)";
      }

      function set(i: number, focus?: boolean) {
        k = i;
        bs.forEach((b, j) => {
          const on = j === i;
          b.classList.toggle("on", on);
          b.setAttribute("aria-selected", on ? "true" : "false");
          b.tabIndex = on ? 0 : -1;
        });
        ps.forEach((p, j) => {
          const on = j === i;
          p.hidden = !on;
          p.classList.toggle("on", on);
        });
        tb!.setAttribute("data-hl", bs[i].getAttribute("data-col") || "n");
        pos();
        if (focus) bs[i].focus();

        if (sw!.scrollWidth > sw!.clientWidth + 2) {
          const sr = sw!.getBoundingClientRect();
          const br = bs[i].getBoundingClientRect();
          sw!.scrollBy({
            left: br.left - sr.left - (sr.width - br.width) / 2,
            behavior: "smooth",
          });
        }
        const qc = r!.querySelector<HTMLElement>(".qcards");
        const c =
          qc &&
          qc.querySelector<HTMLElement>(
            ".c-" + (bs[i].getAttribute("data-col") || "")
          );
        if (qc && c && qc.scrollWidth > qc.clientWidth) {
          qc.scrollTo({
            left: c.offsetLeft - qc.offsetLeft,
            behavior: "smooth",
          });
        }
      }

      bs.forEach((b, i) => {
        b.addEventListener("click", () => set(i), { signal });
      });

      sw.addEventListener(
        "keydown",
        (e) => {
          if (e.key === "ArrowRight") {
            e.preventDefault();
            set((k + 1) % bs.length, true);
          }
          if (e.key === "ArrowLeft") {
            e.preventDefault();
            set((k + bs.length - 1) % bs.length, true);
          }
        },
        { signal }
      );

      r.querySelectorAll<HTMLElement>(".qm-c.top").forEach((h) => {
        h.setAttribute("tabindex", "0");
        h.addEventListener(
          "click",
          () => {
            const c = (h.className.match(/c-([nxp])/) || [])[1];
            if (c) tb.setAttribute("data-hl", c);
          },
          { signal }
        );
      });

      window.addEventListener("resize", pos, { signal });
      set(0);
      if (document.fonts?.ready) {
        document.fonts.ready.then(pos).catch(() => {});
      }
    }

    wire();
    const root = document.getElementById("tekcroft-root");
    const mo =
      root &&
      new MutationObserver(() => {
        if (!document.getElementById("develop-apps")?.dataset.daWired) {
          wired = null;
          wire();
        }
      });
    mo?.observe(root!, { childList: true, subtree: true });

    return () => {
      ac.abort();
      mo?.disconnect();
      const r = document.getElementById("develop-apps");
      if (r) delete r.dataset.daWired;
      wired = null;
    };
  }, []);

  return null;
}
