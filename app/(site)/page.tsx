import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import JsonLd from "@/components/JsonLd";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/homepage-meta.json";
import { homeSchema } from "@/lib/schema";
/* Shared mobile hero logos/ticker flow (≤900px) — same as /services pages */
import "@/app/service-hero-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: {
    canonical: meta.canonical,
  },
  openGraph: {
    type: "website",
    siteName: "Tekcroft",
    url: "https://www.tekcroft.com/",
    title: meta.title,
    description: meta.description,
    images: [
      {
        url: "https://www.tekcroft.com/og.jpg",
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: meta.title,
    description: meta.description,
    images: ["https://www.tekcroft.com/og.jpg"],
  },
};

export default function HomePage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "homepage-body.html"),
    "utf8"
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/home-hero-1.webp"
        imageSrcSet="/images/home-hero-1-m.webp 720w, /images/home-hero-1.webp 1024w"
        imageSizes="100vw"
        type="image/webp"
        fetchPriority="high"
      />
      <Homepage html={html} />
      {/* afterInteractive: body markup exists; boot can measure nav logo */}
      <Script src={assets.main} strategy="afterInteractive" />
      {/* Below-fold widgets (NSR / AI ecosystem / carousels) — idle load */}
      <Script
        src={assets.homeDefer || "/tekcroft-home-defer.js"}
        strategy="lazyOnload"
      />
      <JsonLd data={homeSchema} />
    </>
  );
}
