import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
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
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "seo-services-body.html"),
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
      <Script src={assets.seoServices} strategy="afterInteractive" />
      <Script src="/tekcroft-ecommerce-seo-vx.js" strategy="afterInteractive" />
    </>
  );
}
