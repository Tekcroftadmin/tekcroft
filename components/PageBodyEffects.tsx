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

/** Soft-nav remounts HTML — re-wrap buttons + reveal before paint when possible. */
function pageInit() {
  const wrapButtons = () => {
    document.querySelectorAll(".btn").forEach((btn) => {
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
  };

  const softNav = document.documentElement.classList.contains("js-ready");
  wrapButtons();

  /* Soft-nav: mark every .rv/.eg-card visible BEFORE paint. First load keeps
     entrance animation via tekcroft-rv.js (js-ready then observe). */
  if (softNav) {
    document.querySelectorAll(".rv").forEach((el) => {
      el.classList.add("in");
      if (!(el instanceof HTMLElement)) return;
      /* Always pin — Chromium can keep used opacity at 0 after soft-nav. */
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
    });
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
  } else {
    document.documentElement.classList.add("js-ready");
    const vh = window.innerHeight || 0;
    document.querySelectorAll(".rv").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top < vh + 40 && r.bottom > -40) el.classList.add("in");
    });
  }

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
    document.querySelectorAll(".rv").forEach((el) => {
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
    });
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
    pageInit();
  }, [pathname]);

  useEffect(() => {
    if (rawDesign) {
      document.documentElement.setAttribute("data-design", "raw");
    }
    const root = document.querySelector(".tekcroft-page");
    fillHeroMarq();
    pageInit();

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
