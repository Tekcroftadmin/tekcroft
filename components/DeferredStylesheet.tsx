"use client";

import { useEffect, useRef } from "react";

/**
 * Non-blocking stylesheet download (media=print), flip to all as soon as
 * the file is ready — do not idle-delay (that late style+font apply steals LCP).
 *
 * The inline loader mutates media before React hydrates, so suppressHydrationWarning
 * is required on the link (print in React tree vs all in the live DOM).
 * Client onLoad + useEffect + pageshow cover remounts (e.g. Back from booking)
 * where the inline script often does not re-run.
 */
export default function DeferredStylesheet({ href }: { href: string }) {
  const safe = JSON.stringify(href);
  const linkRef = useRef<HTMLLinkElement | null>(null);

  useEffect(() => {
    const activate = () => {
      const l =
        linkRef.current ||
        document.querySelector(`link[data-deferred-css="${href}"]`);
      if (l instanceof HTMLLinkElement) l.media = "all";
    };
    /* Sync when sheet is already in memory (soft remount / cache). */
    activate();
    const onPageShow = () => activate();
    window.addEventListener("pageshow", onPageShow);
    return () => window.removeEventListener("pageshow", onPageShow);
  }, [href]);

  return (
    <>
      <link
        ref={linkRef}
        rel="stylesheet"
        href={href}
        media="print"
        data-deferred-css={href}
        suppressHydrationWarning
        onLoad={(e) => {
          e.currentTarget.media = "all";
        }}
      />
      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){var h=${safe};var l=document.querySelector('link[data-deferred-css=\"'+h+'\"]');if(!l)return;var go=function(){l.media='all'};if(l.addEventListener)l.addEventListener('load',go);if(l.sheet)go();})();`,
        }}
      />
    </>
  );
}
