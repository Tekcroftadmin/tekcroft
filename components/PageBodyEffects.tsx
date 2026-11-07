"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";

type PageBodyEffectsProps = {
  /** Skip site-consistency overrides (page ships its own design lock). */
  rawDesign?: boolean;
};

function panelFor(btn: Element): HTMLElement | null {
  const id = btn.getAttribute("aria-controls");
  return id ? document.getElementById(id) : null;
}

function wireFaq(root: HTMLElement) {
  // Capture + stopImmediatePropagation so tekcroft-main / tekcroft-mm
  // FAQ listeners (also toggles) cannot cancel open↔close on the homepage.
  const onClick = (e: MouseEvent) => {
    const raw = e.target;
    const t =
      raw instanceof Element
        ? raw
        : raw instanceof Text
          ? raw.parentElement
          : null;
    if (!t) return;
    const btn = t.closest(".faq-q");
    if (!btn || !root.contains(btn)) return;

    const list = btn.closest(".faq-list");
    if (!list) return;

    const panel = panelFor(btn);
    if (!panel) return;

    e.preventDefault();
    e.stopImmediatePropagation();

    const openIndex = Array.from(list.querySelectorAll(".faq-q")).indexOf(btn);
    const willOpen = btn.getAttribute("aria-expanded") !== "true";

    list.querySelectorAll(".faq-q").forEach((b) => {
      b.setAttribute("aria-expanded", "false");
      const p = panelFor(b);
      if (p) {
        p.setAttribute("data-open", "false");
        p.classList.remove("is-open");
      }
    });

    if (willOpen) {
      btn.setAttribute("aria-expanded", "true");
      panel.setAttribute("data-open", "true");
      panel.classList.add("is-open");
      const wrap = list.closest(".faq-wrap");
      if (wrap instanceof HTMLElement) {
        wrap.dataset.at = String(openIndex + 1);
      }
    }
  };

  root.addEventListener("click", onClick, true);
  return () => root.removeEventListener("click", onClick, true);
}

const HERO_CLIENTS = [
  "MedVital",
  "CarePoint",
  "ServiClean",
  "FixMaster",
  "BrightWay",
  "CloudScale",
  "DataDrive",
  "ShopSphere",
  "PeakCart",
  "GrowPilot",
];

function fillHeroMarq() {
  const el = document.getElementById("marqTrack");
  if (!el) return;
  /* One set ≈ ~1.5kpx; 3 sets per half keeps half > 2560px so the strip
     never shows empty space on ultra-wide / high zoom. Loop = -50%. */
  const row = HERO_CLIENTS.map((t) => `<span>${t}</span>`).join("");
  const half = row + row + row;
  el.innerHTML = half + half;
}

/**
 * Tiny client island: FAQ + hero marquee. Page HTML stays server-rendered
 * so soft-nav does not ship a huge HTML string through a client prop.
 */
export default function PageBodyEffects({
  rawDesign = false,
}: PageBodyEffectsProps) {
  const pathname = usePathname();

  useEffect(() => {
    if (rawDesign) {
      document.documentElement.setAttribute("data-design", "raw");
    }
    const root = document.querySelector(".tekcroft-page");
    fillHeroMarq();

    root?.querySelectorAll(".faq-a[data-open='true']").forEach((el) => {
      el.classList.add("is-open");
    });

    const unwireFaq =
      root instanceof HTMLElement ? wireFaq(root) : undefined;

    return () => {
      unwireFaq?.();
      if (rawDesign) {
        document.documentElement.removeAttribute("data-design");
      }
    };
  }, [rawDesign, pathname]);

  return null;
}
