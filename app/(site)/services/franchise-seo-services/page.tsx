import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { franchiseSeoServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import FranchiseWhyChoose from "@/components/FranchiseWhyChoose";
import FranchiseCovers from "@/components/FranchiseCovers";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/franchise-seo-meta.json";
import lcp from "@/lib/franchise-seo-lcp.json";
import "@/app/franchise-seo.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";
/* Expanding panels shell — shared intro line + centered CTA */
import "@/app/tm-shell-lock.css";
/* Pixel-lock: Tekcroft's Franchise SEO Covers (design file) */
import "@/app/franchise-covers-lock.css";

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

export default function FranchiseSeoServicesPage() {
  const html = readPreparedBody("franchise-seo-body.html");

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
      <SitePage html={html} prepared slot="<!--FRANCHISE_WHY_SLOT-->">
        <FranchiseWhyChoose />
      </SitePage>
      <FranchiseCovers />
      <Script src={assets.franchiseSeo} strategy="lazyOnload" />
      <JsonLd data={franchiseSeoServicesSchema} />
    </>
  );
}
