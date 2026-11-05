import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import JsonLd from "@/components/JsonLd";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/local-seo-meta.json";
import lcp from "@/lib/local-seo-lcp.json";
import { localSeoServicesSchema } from "@/lib/schema";
import { stampFooterYear } from "@/lib/stamp-footer-year";
/* Tiny above-the-fold hero paint (LCP) — full page CSS loads deferred */
import "@/app/local-seo-critical.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";
/* Expanding panels shell — shared intro line + centered CTA */
import "@/app/tm-shell-lock.css";
/* #fit Know the difference — page photo as full section background */
import "@/app/fit-vs-bg.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
  openGraph: {
    type: "website",
    siteName: "Tekcroft",
    url: meta.canonical,
    title: meta.title,
    description: meta.description,
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
  },
};

export default function LocalSeoPage() {
  const html = stampFooterYear(
    fs.readFileSync(
      path.join(process.cwd(), "lib", "local-seo-body.html"),
      "utf8"
    )
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={lcp.preload}
        type="image/webp"
        media={lcp.desktopMedia}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={lcp.preloadMobile}
        type="image/webp"
        media={lcp.mobileMedia}
        fetchPriority="high"
      />
      {/* Large page CSS off critical path — hero covered by critical + lock CSS */}
      <DeferredStylesheet href="/css/local-seo.css" />
      {/* Server HTML only — avoid hydrating the full markup tree (TBT) */}
      <div
        id="tekcroft-root"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Script src={assets.localSeo} strategy="lazyOnload" />
      <JsonLd data={localSeoServicesSchema} />
    </>
  );
}
