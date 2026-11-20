"use client";

import { useEffect } from "react";

/**
 * Progress bar, TOC scroll-spy, and single-open FAQ accordion.
 * Scoped to `.blog-post-page` only.
 */
export default function BlogPostEffects() {
  useEffect(() => {
    const root = document.querySelector(".blog-post-page");
    if (!root) return;

    // Light-band article page: keep header logo/links readable (not white-on-tint).
    const nav = document.getElementById("nav");
    nav?.classList.add("on-light");

    const bar = root.querySelector<HTMLElement>(".blog-post-page__progress");
    const art = root.querySelector<HTMLElement>("#article");
    const links = Array.from(
      root.querySelectorAll<HTMLAnchorElement>(".blog-post-page__toc a")
    );
    const heads = links.map((a) => {
      const id = (a.getAttribute("href") || "").slice(1);
      return id ? document.getElementById(id) : null;
    });

    function update() {
      if (!bar || !art) return;
      const r = art.getBoundingClientRect();
      const total = r.height - window.innerHeight * 0.6;
      const p = Math.min(
        1,
        Math.max(0, (-r.top + window.innerHeight * 0.3) / Math.max(total, 1))
      );
      bar.style.width = `${p * 100}%`;

      let cur = 0;
      heads.forEach((h, i) => {
        if (h && h.getBoundingClientRect().top < window.innerHeight * 0.35) {
          cur = i;
        }
      });
      links.forEach((a, i) => a.classList.toggle("on", i === cur));
    }

    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    update();

    const items = Array.from(
      root.querySelectorAll<HTMLDetailsElement>(".blog-post-page__faq details")
    );
    const reduce =
      typeof matchMedia === "function" &&
      matchMedia("(prefers-reduced-motion: reduce)").matches;
    const EASE = "cubic-bezier(.4,0,.2,1)";
    const MS = 320;

    type Animating = HTMLDetailsElement & {
      _a?: Animation | null;
    };

    function finish(d: Animating) {
      d.style.height = "";
      d.style.overflow = "";
      d.classList.remove("closing");
      d._a = null;
    }

    function open(d: Animating) {
      if (d._a) d._a.cancel();
      const sum = d.querySelector("summary");
      const ans = d.querySelector<HTMLElement>(".ans");
      if (!sum || !ans) {
        d.open = true;
        return;
      }
      const from = d.offsetHeight;
      d.open = true;
      if (reduce) return;
      const to = sum.offsetHeight + ans.offsetHeight;
      d.style.overflow = "hidden";
      d._a = d.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration: MS, easing: EASE }
      );
      ans.animate(
        { opacity: [0, 1], transform: ["translateY(-6px)", "none"] },
        { duration: MS, easing: EASE }
      );
      d._a.onfinish = () => finish(d);
      d._a.oncancel = () => finish(d);
    }

    function close(d: Animating) {
      if (d._a) d._a.cancel();
      if (reduce) {
        d.open = false;
        return;
      }
      const sum = d.querySelector("summary");
      if (!sum) {
        d.open = false;
        return;
      }
      const from = d.offsetHeight;
      const to = sum.offsetHeight;
      d.classList.add("closing");
      d.style.overflow = "hidden";
      d._a = d.animate(
        { height: [`${from}px`, `${to}px`] },
        { duration: MS, easing: EASE }
      );
      d._a.onfinish = () => {
        d.open = false;
        finish(d);
      };
      d._a.oncancel = () => finish(d);
    }

    const onSummaryClick = (e: Event) => {
      e.preventDefault();
      const summary = e.currentTarget as HTMLElement;
      const d = summary.parentElement as Animating | null;
      if (!d || d.tagName !== "DETAILS") return;
      const isOpen = d.open && !d.classList.contains("closing");
      if (isOpen) {
        close(d);
      } else {
        items.forEach((o) => {
          const od = o as Animating;
          if (od !== d && od.open && !od.classList.contains("closing")) {
            close(od);
          }
        });
        open(d);
      }
    };

    items.forEach((d) => {
      const sum = d.querySelector("summary");
      sum?.addEventListener("click", onSummaryClick);
    });

    return () => {
      nav?.classList.remove("on-light");
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
      items.forEach((d) => {
        d.querySelector("summary")?.removeEventListener(
          "click",
          onSummaryClick
        );
      });
    };
  }, []);

  return null;
}
