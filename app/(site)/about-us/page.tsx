import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { aboutUsSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/about-us-meta.json";
import lcp from "@/lib/about-us-lcp.json";
import "@/app/about-us.css";
import "@/app/footer-lock.css";

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

export default function AboutUsPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "about-us-body.html"),
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
      <Script src={assets.aboutUs} strategy="afterInteractive" />
      <JsonLd data={aboutUsSchema} />
    </>
  );
}
