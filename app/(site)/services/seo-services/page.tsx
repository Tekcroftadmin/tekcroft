import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { seoServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/seo-services-meta.json";
import lcp from "@/lib/seo-services-lcp.json";
import "@/app/seo-services.css";
import "@/app/tm-shell-lock.css";
import "@/app/footer-lock.css";
import "@/app/service-hero-lock.css";
/* Video CTA (#watch) — same scroll-expand player as ecommerce-seo */
import "@/app/ecommerce-seo-vx.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  keywords: meta.keywords,
  alternates: { canonical: meta.canonical },
  openGraph: {
    type: "website",
    siteName: "TekCroft",
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

export default function SeoServicesPage() {
  const html = readPreparedBody("seo-services-body.html");

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
      <Script src={assets.seoServices} strategy="lazyOnload" />
      <Script src="/tekcroft-ecommerce-seo-vx.js" strategy="lazyOnload" />
      <JsonLd data={seoServicesSchema} />
    </>
  );
}
