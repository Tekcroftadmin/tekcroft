import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { aiChatbotDevelopmentServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import ChatbotTypesScript from "@/components/ChatbotTypesScript";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/ai-chatbot-development-meta.json";
import lcp from "@/lib/ai-chatbot-development-lcp.json";
import "@/app/ai-chatbot-development.css";
import "@/app/ai-chatbot-services-tm.css";
import "@/app/ai-chatbot-types.css";
import "@/app/tm-shell-lock.css";
import "@/app/footer-lock.css";
import "@/app/service-hero-lock.css";
/* Last: head + rail overrides for #chatbot-services */
import "@/app/chatbot-services-rail-fix.css";

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

export default function AiChatbotDevelopmentServicesPage() {
  const html = readPreparedBody("ai-chatbot-development-body.html");

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
      <ChatbotTypesScript />
      <Script src={assets.aiChatbotDevelopment} strategy="lazyOnload" />
      <JsonLd data={aiChatbotDevelopmentServicesSchema} />
    </>
  );
}
