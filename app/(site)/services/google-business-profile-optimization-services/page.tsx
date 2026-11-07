import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { googleBusinessProfileOptimizationServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/google-business-profile-optimization-meta.json";
import lcp from "@/lib/google-business-profile-optimization-lcp.json";
import "@/app/google-business-profile-optimization.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";
/* GBP hero spacing only (stats↔CTA gap, tighten after logo ticker) */
import "@/app/google-business-profile-hero-spacing.css";
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

export default function GoogleBusinessProfileOptimizationPage() {
  // BOM stripped inside preparePageBody / readPreparedBody.
  const html = readPreparedBody(
    "google-business-profile-optimization-body.html"
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
      <SitePage html={html} prepared />
      <Script
        src={assets.googleBusinessProfileOptimization}
        strategy="lazyOnload"
      />
      <JsonLd data={googleBusinessProfileOptimizationServicesSchema} />
    </>
  );
}
