"use client";

import { useEffect, type ReactNode } from "react";
import assets from "@/lib/asset-manifest.json";
import { stampFooterYear } from "@/lib/stamp-footer-year";

type HomepageProps = {
  html: string;
  /** Skip site-consistency overrides (page ships its own design lock). */
  rawDesign?: boolean;
  /** Marker string inside html; children render between the two halves. */
  slot?: string;
  children?: ReactNode;
};

const mmPromises = new Map<string, Promise<void>>();

function loadScript(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    if (document.querySelector(`script[src="${src}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement("script");
    script.src = src;
    script.async = false;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.body.appendChild(script);
  });
}

function loadMm(): Promise<void> {
  const src = assets.mm;
  // Drop older hashed mm scripts so a stale tab never keeps the previous bundle.
  document.querySelectorAll('script[src*="tekcroft-mm."]').forEach((el) => {
    const current = el.getAttribute("src") || "";
    if (current !== src) el.remove();
  });
  let p = mmPromises.get(src);
  if (!p) {
    p = loadScript(src);
    mmPromises.set(src, p);
  }
  return p;
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
  if (!el || el.childElementCount > 0) return;
  const row = HERO_CLIENTS.map((t) => `<span>${t}</span>`).join("");
  el.innerHTML = row + row;
}

export default function Homepage({
  html,
  rawDesign = false,
  slot,
  children,
}: HomepageProps) {
  useEffect(() => {
    if (rawDesign) {
      document.documentElement.setAttribute("data-design", "raw");
    }
    const abort = new AbortController();
    const root = document.getElementById("tekcroft-root");

    fillHeroMarq();

    // Sticky header plate — every page that uses Homepage (not only home)
    const nav = document.getElementById("nav");
    const syncNavStuck = () => {
      if (!nav) return;
      const booting = document.body.classList.contains("booting");
      nav.classList.toggle("stuck", !booting && window.scrollY > 12);
    };
    syncNavStuck();
    window.addEventListener("scroll", syncNavStuck, {
      passive: true,
      signal: abort.signal,
    });

    // Desktop nav: mark the current page (HighGate-style active pill)
    const path = (location.pathname || "/").replace(/\/+$/, "") || "/";
    root?.querySelectorAll(".nav-links a[href]").forEach((a) => {
      const href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
      if (href === path) a.setAttribute("aria-current", "page");
      else a.removeAttribute("aria-current");
    });
    const mm = document.getElementById("mmTrigger");
    if (mm) {
      const onService =
        path === "/services" || path.startsWith("/services/");
      if (onService) mm.setAttribute("aria-current", "page");
      else mm.removeAttribute("aria-current");
    }

    // Sync open class with server-rendered data-open="true" panels
    root?.querySelectorAll(".faq-a[data-open='true']").forEach((el) => {
      el.classList.add("is-open");
    });

    const unwireFaq = root ? wireFaq(root) : undefined;

    const warm = () => {
      loadMm().catch(console.error);
    };

    const trigger = document.getElementById("mmTrigger");
    const burger = document.querySelector(".js-burger");
    trigger?.addEventListener("pointerenter", warm, {
      once: true,
      signal: abort.signal,
    });
    trigger?.addEventListener("focus", warm, {
      once: true,
      signal: abort.signal,
    });
    burger?.addEventListener("pointerdown", warm, {
      once: true,
      signal: abort.signal,
    });

    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            cb: () => void,
            opts?: { timeout: number }
          ) => number;
        }
      ).requestIdleCallback(warm, { timeout: 2500 });
    } else {
      setTimeout(warm, 1500);
    }

    return () => {
      abort.abort();
      unwireFaq?.();
      if (rawDesign) {
        document.documentElement.removeAttribute("data-design");
      }
    };
  }, [rawDesign]);

  const stamped = stampFooterYear(html);

  if (slot && children != null && stamped.includes(slot)) {
    const at = stamped.indexOf(slot);
    const before = stamped.slice(0, at);
    const after = stamped.slice(at + slot.length);
    return (
      <div id="tekcroft-root" suppressHydrationWarning>
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: before }}
        />
        {children}
        <div
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: after }}
        />
      </div>
    );
  }

  return (
    <div
      id="tekcroft-root"
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: stamped }}
    />
  );
}
