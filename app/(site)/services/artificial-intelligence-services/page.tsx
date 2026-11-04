import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/artificial-intelligence-services-meta.json";
import lcp from "@/lib/artificial-intelligence-services-lcp.json";
import "@/app/artificial-intelligence-services.css";
import "@/app/footer-lock.css";
/* Must load after site-consistency (layout) so source design wins on this page */
import "@/app/artificial-intelligence-services-unlock.css";
/* Hero + #tech-v4: verbatim source styles + --veil + ax-stage lock (after globals) */
import "@/app/ais-hero-tech.css";
/* Verbatim <style id="ai-tx-styles"> — global (not CSS Module) so @keyframes gx* keep exact names */
import "@/app/ai-tx-styles.css";
/* Shared service hero shell — last so all /services pages match (veil/height/glass) */
import "@/app/service-hero-lock.css";
/* Expanding panels shell — shared intro line + centered CTA */
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

export default function ArtificialIntelligenceServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "artificial-intelligence-services-body.html"),
    "utf8"
  );

  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `document.documentElement.setAttribute('data-design','raw');`,
        }}
      />
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
      <Homepage html={html} rawDesign />
      <Script
        src={assets.artificialIntelligenceServices}
        strategy="afterInteractive"
      />
    </>
  );
}
