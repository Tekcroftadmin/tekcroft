import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { aiDevelopmentServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/ai-development-meta.json";
import lcp from "@/lib/ai-development-lcp.json";
import "@/app/ai-development.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";
/* Expanding panels shell — smooth open + shared CTA layout */
import "@/app/tm-shell-lock.css";

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

export default function AiDevelopmentServicesPage() {
  const html = readPreparedBody("ai-development-body.html");

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={lcp.preload}
        type="image/webp"
        fetchPriority="high"
      />
      <SitePage html={html} prepared />
      <Script src={assets.aiDevelopment} strategy="lazyOnload" />
      <JsonLd data={aiDevelopmentServicesSchema} />
    </>
  );
}
