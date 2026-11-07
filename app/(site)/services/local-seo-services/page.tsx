import type { Metadata } from "next";
import Script from "next/script";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import JsonLd from "@/components/JsonLd";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/local-seo-meta.json";
import lcp from "@/lib/local-seo-lcp.json";
import { localSeoServicesSchema } from "@/lib/schema";
import PageBodyEffects from "@/components/PageBodyEffects";
import { readPreparedBody } from "@/lib/compose-site-html";
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
  const html = readPreparedBody("local-seo-body.html");

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
      {/* Body only — shared header/footer stay in SiteShell layout */}
      <div
        className="tekcroft-page"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <PageBodyEffects />
      <Script src={assets.localSeo} strategy="lazyOnload" />
      <JsonLd data={localSeoServicesSchema} />
    </>
  );
}
