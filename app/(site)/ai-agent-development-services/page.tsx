import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { aiAgentDevelopmentServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/ai-agent-development-meta.json";
import lcp from "@/lib/ai-agent-development-lcp.json";
import "@/app/ai-agent-development.css";
import "@/app/ai-agent-acv-head.css";
import "@/app/ai-agent-services-tm.css";
import "@/app/ai-agent-tech-stack.css";
import "@/app/tm-shell-lock.css";
import "@/app/footer-lock.css";
import "@/app/service-hero-lock.css";
/* Last: head + rail overrides for #agent-services */
import "@/app/agent-services-rail-fix.css";

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

export default function AiAgentDevelopmentServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "ai-agent-development-body.html"),
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
      <Script src={assets.aiAgentDevelopment} strategy="afterInteractive" />
      <JsonLd data={aiAgentDevelopmentServicesSchema} />
    </>
  );
}
