import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { onPageSeoServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/on-page-seo-meta.json";
import lcp from "@/lib/on-page-seo-lcp.json";
import "@/app/on-page-seo.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
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

export default function OnPageSeoPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "on-page-seo-body.html"),
    "utf8"
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
      <Homepage html={html} />
      <Script src={assets.onPageSeo} strategy="afterInteractive" />
      <JsonLd data={onPageSeoServicesSchema} />
    </>
  );
}
