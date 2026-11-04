import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { aiDevelopmentServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
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
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "ai-development-body.html"),
    "utf8"
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={lcp.preload}
        type="image/webp"
        fetchPriority="high"
      />
      <Homepage html={html} />
      <Script src={assets.aiDevelopment} strategy="afterInteractive" />
      <JsonLd data={aiDevelopmentServicesSchema} />
    </>
  );
}
