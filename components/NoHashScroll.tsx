"use client";

import { useLayoutEffect } from "react";
import { usePathname } from "next/navigation";

declare global {
  interface Window {
    __tekcroftHash?: string;
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

/** Consume a pending/boot hash or the current location hash and scroll to it. */
function consumeHashScroll(behavior: ScrollBehavior) {
  const pending = window.__tekcroftHash;
  if (pending) delete window.__tekcroftHash;

  const id = pending || hashTargetId(window.location.hash);
  if (!id) return;

  stripHashFromUrl();

  const el = findHashTarget(id);
  if (!el) {
    window.scrollTo(0, 0);
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
    }

    const onHashChange = () => {
      if (window.location.hash) consumeHashScroll("smooth");
    };
    window.addEventListener("hashchange", onHashChange);

    const onPageShow = (e: PageTransitionEvent) => {
      if (e.persisted && (window.__tekcroftHash || window.location.hash)) {
        consumeHashScroll("auto");
      }
    };
    window.addEventListener("pageshow", onPageShow);

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
      document.removeEventListener("click", onClick, true);
    };
  }, []);

  useLayoutEffect(() => {
    if (window.__tekcroftHash || window.location.hash) {
      consumeHashScroll("smooth");
    }
  }, [pathname]);

  return null;
}
