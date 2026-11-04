import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { mobileAppDevelopmentServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import { Caveat } from "next/font/google";
import Homepage from "@/components/Homepage";
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
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "mobile-app-development-body.html"),
    "utf8"
  );

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
      <Homepage html={html} />
      <AppJourney />
      <DevelopApps />
      <Script src={assets.mobileAppDevelopment} strategy="afterInteractive" />
      <JsonLd data={mobileAppDevelopmentServicesSchema} />
    </div>
  );
}
