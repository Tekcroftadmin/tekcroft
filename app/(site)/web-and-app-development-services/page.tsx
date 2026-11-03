import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/web-and-app-development-meta.json";
import lcp from "@/lib/web-and-app-development-lcp.json";
import "@/app/web-and-app-development.css";
import "@/app/footer-lock.css";
import "@/app/service-hero-lock.css";
import "@/app/tm-shell-lock.css";
import "@/app/why-section-fix.css";

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

export default function WebAndAppDevelopmentServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "web-and-app-development-body.html"),
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
      <Script src={assets.webAndAppDevelopment} strategy="afterInteractive" />
    </>
  );
}
