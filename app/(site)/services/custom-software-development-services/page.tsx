import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { customSoftwareDevelopmentServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/custom-software-development-meta.json";
import lcp from "@/lib/custom-software-development-lcp.json";
import "@/app/custom-software-development.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";

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

export default function CustomSoftwareDevelopmentServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "custom-software-development-body.html"),
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
      <Script src={assets.customSoftwareDevelopment} strategy="afterInteractive" />
      <JsonLd data={customSoftwareDevelopmentServicesSchema} />
    </>
  );
}
