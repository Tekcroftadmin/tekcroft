import type { ReactNode } from "react";
import PageBodyEffects from "@/components/PageBodyEffects";
import { preparePageBody } from "@/lib/compose-site-html";

type SitePageProps = {
  html: string;
  /** Skip site-consistency overrides (page ships its own design lock). */
  rawDesign?: boolean;
  /** Marker string inside html; children render between the two halves. */
  slot?: string;
  children?: ReactNode;
  /**
   * When true, `html` is already preparePageBody'd (e.g. from readPreparedBody).
   * Default false keeps older callers safe.
   */
  prepared?: boolean;
};

/**
 * Server-rendered page body. Shared header/footer live in SiteShell.
 * HTML is NOT passed through a client component prop (that bloated soft-nav).
 */
export default function SitePage({
  html,
  rawDesign = false,
  slot,
  children,
  prepared = false,
}: SitePageProps) {
  const body = prepared ? html : preparePageBody(html);

  if (slot && children != null && body.includes(slot)) {
    const at = body.indexOf(slot);
    const before = body.slice(0, at);
    const after = body.slice(at + slot.length);
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
        dangerouslySetInnerHTML={{ __html: body }}
      />
      <PageBodyEffects rawDesign={rawDesign} />
    </>
  );
}
