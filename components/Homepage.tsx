"use client";

import type { ReactNode } from "react";
import PageBodyEffects from "@/components/PageBodyEffects";

type HomepageProps = {
  html: string;
  /** Skip site-consistency overrides (page ships its own design lock). */
  rawDesign?: boolean;
  /** Marker string inside html; children render between the two halves. */
  slot?: string;
  children?: ReactNode;
};

/**
 * Client body injector — only for routes outside SitePage (e.g. 404).
 * Prefer SitePage for (site) routes so soft-nav stays fast.
 */
export default function Homepage({
  html,
  rawDesign = false,
  slot,
  children,
}: HomepageProps) {
  if (slot && children != null && html.includes(slot)) {
    const at = html.indexOf(slot);
    const before = html.slice(0, at);
    const after = html.slice(at + slot.length);
    return (
      <>
        <div className="tekcroft-page" suppressHydrationWarning>
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
        <PageBodyEffects rawDesign={rawDesign} />
      </>
    );
  }

  return (
    <>
      <div
        className="tekcroft-page"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PageBodyEffects rawDesign={rawDesign} />
    </>
  );
}
