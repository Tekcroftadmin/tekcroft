"use client";

import { useEffect, useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

type PageBodyEffectsProps = {
  /** Skip site-consistency overrides (page ships its own design lock). */
  rawDesign?: boolean;
};

declare global {
  interface Window {
    __tekcroftPageInit?: () => void;
    __tekcroftRevealRefresh?: () => void;
    __tekcroftEgScrollRefresh?: () => void;
  }
}

function wrapButtons(scope?: ParentNode) {
  (scope || document).querySelectorAll(".btn").forEach((btn) => {
    if (btn.querySelector(".btn-label")) return;
    Array.from(btn.childNodes).forEach((node) => {
      if (node.nodeType !== Node.TEXT_NODE) return;
      const text = (node.nodeValue || "").replace(/\s+/g, " ").trim();
      if (!text) return;
      const label = document.createElement("span");
      label.className = "btn-label";
      label.textContent = text;
      btn.replaceChild(label, node);
    });
  });
}

function pinRvVisible(el: Element) {
  el.classList.add("in");
  if (!(el instanceof HTMLElement)) return;
  el.style.setProperty("transition", "none", "important");
  el.style.setProperty("opacity", "1", "important");
  el.style.setProperty("transform", "none", "important");
  requestAnimationFrame(() => {
    try {
      el.style.removeProperty("transition");
    } catch {
      /* ignore */
    }
  });
}

function forceAllVisible() {
  document.querySelectorAll(".rv").forEach(pinRvVisible);
  document.querySelectorAll(".eg-sec .eg-card").forEach((el) => {
    el.classList.add("seen");
    if (el instanceof HTMLElement) {
      el.style.removeProperty("opacity");
      el.style.removeProperty("transform");
      el.style.removeProperty("visibility");
    }
  });
  document.querySelectorAll(".eg-sec .eg").forEach((pw) => {
    if (!(pw instanceof HTMLElement)) return;
    if (pw.querySelector(".eg-card.on")) return;
    const first = pw.querySelector(".eg-card, .walk-step");
    first?.classList.add("on");
    if (!pw.getAttribute("data-at")) pw.setAttribute("data-at", "0");
  });
}

/**
 * Soft-nav: sync reveal before paint.
 * First load: only mark ATF .rv — defer button wrap / full force / nav events
 * so we do not stack long main-thread tasks (TBT).
 */
function pageInit(opts?: { softNav?: boolean; heavy?: boolean }) {
  const softNav =
    opts?.softNav ?? document.documentElement.classList.contains("js-ready");
  const heavy = opts?.heavy ?? softNav;

  if (softNav) {
    forceAllVisible();
    if (heavy) wrapButtons();
  } else {
    document.documentElement.classList.add("js-ready");
    const vh = window.innerHeight || 0;
    document.querySelectorAll(".rv").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh + 40 && r.bottom > -40) el.classList.add("in");
    });
  }

  if (!heavy) return;

  try {
    window.dispatchEvent(new Event("tekcroft:nav"));
  } catch {
    /* ignore */
  }
  window.__tekcroftPageInit?.();
  window.__tekcroftRevealRefresh?.();
  window.__tekcroftEgScrollRefresh?.();

  window.setTimeout(() => {
    wrapButtons();
    forceAllVisible();
  }, 400);
}

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
  /* Two copies = seamless -50% loop without 60 DOM nodes (PSI DOM size). */
  const row = HERO_CLIENTS.map((t) => `<span>${t}</span>`).join("");
  el.innerHTML = row + row;
}

/**
 * Tiny client island: FAQ + hero marquee + soft-nav page init.
 * Page HTML stays server-rendered so soft-nav does not ship a huge
 * HTML string through a client prop.
 */
export default function PageBodyEffects({
  rawDesign = false,
}: PageBodyEffectsProps) {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const softNav = document.documentElement.classList.contains("js-ready");
    /* Soft-nav needs sync heavy init; first load stays light for TBT. */
    pageInit({ softNav, heavy: softNav });
  }, [pathname]);

  useEffect(() => {
    if (rawDesign) {
      document.documentElement.setAttribute("data-design", "raw");
    }
    const root = document.querySelector(".tekcroft-page");

    root?.querySelectorAll(".faq-a[data-open='true']").forEach((el) => {
      el.classList.add("is-open");
    });
    const unwireFaq =
      root instanceof HTMLElement ? wireFaq(root) : undefined;

    /* Yield past first paint — marquee + remaining reveals/buttons. */
    const runIdle = () => {
      fillHeroMarq();
      pageInit({ softNav: true, heavy: true });
    };
    let idleId = 0;
    let timeoutId = 0;
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    if (typeof w.requestIdleCallback === "function") {
      idleId = w.requestIdleCallback(runIdle, { timeout: 1200 });
    } else {
      timeoutId = window.setTimeout(runIdle, 200);
    }

    return () => {
      unwireFaq?.();
      if (idleId && w.cancelIdleCallback) w.cancelIdleCallback(idleId);
      if (timeoutId) window.clearTimeout(timeoutId);
      if (rawDesign) {
        document.documentElement.removeAttribute("data-design");
      }
    };
  }, [rawDesign, pathname]);

  return null;
}
