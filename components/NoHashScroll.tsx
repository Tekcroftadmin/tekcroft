"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __tekcroftHash?: string;
    __tekcroftMeasureNavH?: () => void;
    __tekcroftCloseMnav?: (opts?: { skipRestore?: boolean }) => void;
    __tekcroftPageInit?: () => void;
  }
}

function stripHashFromUrl() {
  if (!window.location.hash) return false;
  history.replaceState(
    null,
    "",
    window.location.pathname + window.location.search
  );
  return true;
}

function hashTargetId(hash: string): string {
  if (!hash || hash === "#") return "";
  try {
    return decodeURIComponent(hash.replace(/^#/, "")).trim();
  } catch {
    return hash.replace(/^#/, "").trim();
  }
}

function findHashTarget(id: string): HTMLElement | null {
  if (!id) return null;
  try {
    return document.getElementById(id);
  } catch {
    return null;
  }
}

function scrollToSection(el: HTMLElement, behavior: ScrollBehavior) {
  el.scrollIntoView({ behavior, block: "start" });
}

/** Drop leftover menu / modal body locks that leave a blank white band. */
function clearBodyLockStyles() {
  const b = document.body;
  const h = document.documentElement;
  b.style.position = "";
  b.style.top = "";
  b.style.left = "";
  b.style.right = "";
  b.style.overflow = "";
  b.style.paddingRight = "";
  b.style.width = "";
  b.style.height = "";
  h.style.overflow = "";
  h.style.height = "";
  h.style.position = "";
  b.classList.remove("menu-open", "no-scroll", "mnav-open", "nav-open");
  h.classList.remove("menu-open", "no-scroll", "mnav-open", "nav-open");
}

/** Soft-nav remounts #boot — dismiss so it cannot sit as a blank curtain. */
function dismissBoot() {
  const boot = document.getElementById("boot");
  if (boot && !document.body.classList.contains("booting")) {
    boot.classList.add("done");
  }
  document.body.classList.remove("booting");
}

/**
 * Force every .rv visible. Soft-nav remounts nodes under html.js-ready
 * without .in; Chromium can leave opacity stuck at 0 even with .in
 * (blank white #proof-v2 strip — only the mid hairline shows).
 * Always pin inline opacity — do not trust getComputedStyle mid-transition.
 */
function forceRevealsVisible() {
  document.querySelectorAll(".rv").forEach((el) => {
    el.classList.add("in");
    if (!(el instanceof HTMLElement)) return;
    try {
      el.style.setProperty("transition", "none", "important");
      el.style.setProperty("opacity", "1", "important");
      el.style.setProperty("transform", "none", "important");
      el.style.removeProperty("visibility");
      /* Re-enable transitions on next frame so later scroll reveals still animate. */
      requestAnimationFrame(() => {
        try {
          el.style.removeProperty("transition");
        } catch {
          /* ignore */
        }
      });
    } catch {
      /* ignore */
    }
  });
}

/** Keep fixed nav plate in sync after we force scroll (back / soft-nav). */
function syncNavPlate() {
  const nav = document.getElementById("nav");
  if (!nav) return;
  const y =
    window.scrollY ||
    document.documentElement.scrollTop ||
    document.body.scrollTop ||
    0;
  const booting = document.body.classList.contains("booting");
  nav.classList.toggle("stuck", !booting && y > 12);
  try {
    window.__tekcroftMeasureNavH?.();
  } catch {
    /* ignore */
  }
  window.dispatchEvent(new Event("scroll"));
}

function pinScrollTop() {
  try {
    window.scrollTo(0, 0);
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    const se = document.scrollingElement;
    if (se) se.scrollTop = 0;
  } catch {
    /* ignore */
  }
}

/**
 * history.scrollRestoration is manual, but mobile Chrome still applies a
 * late restore after popstate — and mnav unlock used to scroll to savedY.
 * Pin top + clear chrome, then re-pin for a few frames to win the race.
 */
function resetScrollTop() {
  clearBodyLockStyles();
  try {
    window.__tekcroftCloseMnav?.({ skipRestore: true });
  } catch {
    /* ignore */
  }
  dismissBoot();
  pinScrollTop();
  forceRevealsVisible();
  syncNavPlate();

  const delays = [0, 16, 50, 100, 200, 400];
  delays.forEach((ms) => {
    window.setTimeout(() => {
      if (window.__tekcroftHash || window.location.hash) return;
      pinScrollTop();
      forceRevealsVisible();
      syncNavPlate();
    }, ms);
  });
}

/** Consume a pending/boot hash or the current location hash and scroll to it. */
function consumeHashScroll(behavior: ScrollBehavior) {
  const pending = window.__tekcroftHash;
  if (pending) delete window.__tekcroftHash;

  const id = pending || hashTargetId(window.location.hash);
  if (!id) return;

  stripHashFromUrl();

  const el = findHashTarget(id);
  if (!el) {
    resetScrollTop();
    return;
  }

  /* Wait a frame so layout (nav, images) has settled before measuring. */
  requestAnimationFrame(() => {
    scrollToSection(el, behavior);
    requestAnimationFrame(() => scrollToSection(el, behavior));
  });
}

function isNavigationalHashHref(href: string | null): boolean {
  if (!href) return false;
  if (href === "#") return true;
  if (href.startsWith("#") && href.length > 1) return true;
  if (href.startsWith("/#")) return true;
  try {
    const u = new URL(href, window.location.href);
    return (
      u.origin === window.location.origin &&
      Boolean(u.hash) &&
      !href.startsWith("mailto:") &&
      !href.startsWith("tel:")
    );
  } catch {
    return false;
  }
}

/**
 * Hash links that target a real section id smooth-scroll there (and the
 * hash is cleared from the URL). Unknown hashes are stripped without a jump.
 */
export default function NoHashScroll() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    try {
      if ("scrollRestoration" in window.history) {
        window.history.scrollRestoration = "manual";
      }
    } catch {
      /* ignore */
    }

    /* Landing with #section (or boot-captured __tekcroftHash). */
    if (window.__tekcroftHash || window.location.hash) {
      consumeHashScroll("smooth");
    } else {
      resetScrollTop();
    }

    const onHashChange = () => {
      if (window.location.hash) consumeHashScroll("smooth");
    };
    window.addEventListener("hashchange", onHashChange);

    /* bfcache / browser back: always re-pin to top unless a hash target remains. */
    const onPageShow = (e: PageTransitionEvent) => {
      if (window.__tekcroftHash || window.location.hash) {
        consumeHashScroll(e.persisted ? "auto" : "smooth");
        return;
      }
      resetScrollTop();
    };
    window.addEventListener("pageshow", onPageShow);

    const onPopState = () => {
      if (window.__tekcroftHash || window.location.hash) {
        consumeHashScroll("auto");
        return;
      }
      resetScrollTop();
    };
    window.addEventListener("popstate", onPopState);

    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const t = e.target;
      if (!(t instanceof Element)) return;
      const a = t.closest("a[href]");
      if (!a || !document.documentElement.contains(a)) return;
      const href = a.getAttribute("href");
      if (!isNavigationalHashHref(href)) return;

      e.preventDefault();

      try {
        const u = new URL(href!, window.location.href);
        const id = hashTargetId(u.hash);
        const samePage =
          u.pathname === window.location.pathname &&
          u.search === window.location.search;

        if (!samePage) {
          /* Keep the hash so the destination page can scroll to it. */
          window.location.assign(u.pathname + u.search + (id ? `#${id}` : ""));
          return;
        }

        if (!id) return;

        const el = findHashTarget(id);
        if (!el) return;

        stripHashFromUrl();
        scrollToSection(el, "smooth");
      } catch {
        /* ignore */
      }
    };
    document.addEventListener("click", onClick, true);

    return () => {
      window.removeEventListener("hashchange", onHashChange);
      window.removeEventListener("pageshow", onPageShow);
      window.removeEventListener("popstate", onPopState);
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.__tekcroftHash || window.location.hash) {
      consumeHashScroll("smooth");
    } else {
      /* Soft-nav between pages: pin to top so fixed nav is not mid-hero. */
      resetScrollTop();
    }
    /* Soft-nav / back-forward: re-init reveals + button labels. */
    try {
      window.dispatchEvent(new Event("tekcroft:nav"));
      window.__tekcroftPageInit?.();
    } catch {
      /* ignore */
    }
  }, [pathname]);

  return null;
}
