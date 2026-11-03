import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
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
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "ai-chatbot-development-body.html"),
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
      <ChatbotTypesScript />
      <Script src={assets.aiChatbotDevelopment} strategy="afterInteractive" />
    </>
  );
}
