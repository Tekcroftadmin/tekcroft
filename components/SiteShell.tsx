"use client";

import { memo, useEffect, useRef, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import assets from "@/lib/asset-manifest.json";

type SiteShellProps = {
  headerHtml: string;
  footerHtml: string;
  children: ReactNode;
};

const mmPromises = new Map<string, Promise<void>>();
const prefetchedRoutes = new Set<string>();

/** Warm these routes so About → services feels instant. */
const IDLE_PREFETCH = [
  "/services",
  "/services/seo-services",
  "/services/local-seo-services",
  "/services/artificial-intelligence-services",
  "/services/web-and-app-development-services",
  "/services/web-design-and-development-services",
  "/services/ecommerce-seo-services",
  "/services/technical-seo-services",
  "/services/on-page-seo-services",
  "/services/seo-audit-services",
  "/services/franchise-seo-services",
  "/services/google-business-profile-optimization-services",
  "/services/custom-software-development-services",
  "/services/mobile-app-development-services",
  "/services/ai-seo-services",
  "/services/ai-development-services",
  "/services/ai-chatbot-development-services",
  "/services/ai-agent-development-services",
  "/about-us",
  "/contact-us",
];

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

function syncAriaCurrent(pathname: string) {
  const path = (pathname || "/").replace(/\/+$/, "") || "/";
  document.querySelectorAll(".nav-links a[href]").forEach((a) => {
    const href = (a.getAttribute("href") || "").replace(/\/+$/, "") || "/";
    if (href === path) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
  const mm = document.getElementById("mmTrigger");
  if (mm) {
    const onService = path === "/services" || path.startsWith("/services/");
    if (onService) mm.setAttribute("aria-current", "page");
    else mm.removeAttribute("aria-current");
  }
}

function isInternalPath(href: string): boolean {
  if (!href) return false;
  if (
    href.startsWith("http") ||
    href.startsWith("mailto:") ||
    href.startsWith("tel:") ||
    href.startsWith("#") ||
    href.startsWith("javascript:")
  ) {
    return false;
  }
  return href.startsWith("/");
}

function pathOnly(href: string): string {
  const q = href.indexOf("?");
  const h = href.indexOf("#");
  let end = href.length;
  if (q >= 0) end = Math.min(end, q);
  if (h >= 0) end = Math.min(end, h);
  return href.slice(0, end) || "/";
}

/** Never re-render — keeps header/footer DOM stable across route changes. */
const StaticChrome = memo(
  function StaticChrome({
    html,
    attr,
  }: {
    html: string;
    attr: "data-site-header" | "data-site-footer";
  }) {
    return (
      <div
        {...{ [attr]: "" }}
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
    );
  },
  () => true
);

/**
 * Persistent site chrome: one header + one footer that survive App Router
 * navigations. Only {children} (page body) remounts — no header jolt.
 */
export default function SiteShell({
  headerHtml,
  footerHtml,
  children,
}: SiteShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  /** First mount may be a hard load of `/` — leave homepage boot to main.js. */
  const isFirstPathEffect = useRef(true);

  useEffect(() => {
    const abort = new AbortController();
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

    const prefetch = (href: string) => {
      const path = pathOnly(href);
      if (!isInternalPath(path) || prefetchedRoutes.has(path)) return;
      const here = (window.location.pathname || "/").replace(/\/+$/, "") || "/";
      const dest = path.replace(/\/+$/, "") || "/";
      if (dest === here) return;
      prefetchedRoutes.add(path);
      try {
        router.prefetch(path);
      } catch {
        /* ignore */
      }
    };

    // Soft-navigate internal links so SiteShell/header/footer stay mounted.
    const onClick = (e: MouseEvent) => {
      if (e.defaultPrevented || e.button !== 0) return;
      if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const el = e.target;
      if (!(el instanceof Element)) return;
      const a = el.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (!a.closest("#tekcroft-root")) return;
      if (a.target === "_blank" || a.hasAttribute("download")) return;
      const href = a.getAttribute("href") || "";
      if (!isInternalPath(href)) return;
      e.preventDefault();
      prefetch(href);
      router.push(pathOnly(href));
    };

    // Hover/focus prefetch — About → service clicks open from warm cache.
    const onIntent = (e: Event) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const a = el.closest("a[href]");
      if (!(a instanceof HTMLAnchorElement)) return;
      if (!a.closest("#tekcroft-root")) return;
      const href = a.getAttribute("href") || "";
      if (!isInternalPath(href)) return;
      prefetch(href);
    };

    document.addEventListener("click", onClick, { signal: abort.signal });
    document.addEventListener("pointerenter", onIntent, {
      capture: true,
      signal: abort.signal,
    });
    document.addEventListener("focusin", onIntent, { signal: abort.signal });

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

    const idlePrefetch = () => {
      for (const path of IDLE_PREFETCH) prefetch(path);
    };

    if ("requestIdleCallback" in window) {
      (
        window as Window & {
          requestIdleCallback: (
            cb: () => void,
            opts?: { timeout: number }
          ) => number;
        }
      ).requestIdleCallback(
        () => {
          warm();
          idlePrefetch();
        },
        { timeout: 1800 }
      );
    } else {
      setTimeout(() => {
        warm();
        idlePrefetch();
      }, 800);
    }

    return () => abort.abort();
  }, [router]);

  useEffect(() => {
    syncAriaCurrent(pathname || "/");
    // Services mega menu highlight/preview — re-sync on every soft-nav.
    const syncMm = (
      window as Window & { __tekcroftSyncMm?: () => void }
    ).__tekcroftSyncMm;
    if (typeof syncMm === "function") syncMm();
    // Soft-nav: start at top of the new page (hash links excluded above).
    window.scrollTo(0, 0);

    // Homepage #boot is in the body HTML. Soft-nav remounts it, but
    // tekcroft-main.js does not re-run — without dismissing, the black
    // curtain stays until a hard refresh.
    if (isFirstPathEffect.current) {
      isFirstPathEffect.current = false;
      return;
    }
    const boot = document.getElementById("boot");
    if (boot) {
      boot.classList.add("done");
      document.body.classList.remove("booting");
      document.getElementById("top")?.classList.add("play");
    }
  }, [pathname]);

  return (
    <div id="tekcroft-root" suppressHydrationWarning>
      <StaticChrome html={headerHtml} attr="data-site-header" />
      {children}
      <StaticChrome html={footerHtml} attr="data-site-footer" />
    </div>
  );
}
