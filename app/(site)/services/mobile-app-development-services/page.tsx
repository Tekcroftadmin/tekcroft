import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { mobileAppDevelopmentServicesSchema } from "@/lib/schema";
import Script from "next/script";
import { Caveat } from "next/font/google";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import AppJourney from "@/components/AppJourney";
import DevelopApps from "@/components/DevelopApps";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/mobile-app-development-meta.json";
import lcp from "@/lib/mobile-app-development-lcp.json";
import "@/app/mobile-app-development.css";
import "@/app/footer-lock.css";
/* Shared service hero shell — same style/design on every /services page */
import "@/app/service-hero-lock.css";
/* Expanding panels shell — shared intro line + centered CTA */
import "@/app/tm-shell-lock.css";
/* Page hero tweaks (form vertical center, no stat divider) — after shared lock */
import "@/app/mobile-app-hero-fix.css";
/* #app-journey — From First Sketch to Long-Term Support (section only) */
import "@/app/app-journey.css";
/* #develop-apps — Develop Apps With Us (section only) */
import "@/app/develop-apps.css";
/* #engagement-models — Our Engagement Models inside #process */
import "@/app/engagement-models.css";

const caveat = Caveat({
  subsets: ["latin"],
  weight: ["700"],
  variable: "--font-caveat",
  display: "swap",
});

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

export default function MobileAppDevelopmentPage() {
  const html = readPreparedBody("mobile-app-development-body.html");

  return (
    <div className={caveat.variable}>
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
      <AppJourney />
      <DevelopApps />
      <Script src={assets.mobileAppDevelopment} strategy="lazyOnload" />
      <JsonLd data={mobileAppDevelopmentServicesSchema} />
    </div>
  );
}
