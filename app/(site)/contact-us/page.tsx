import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { contactUsSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/contact-meta.json";
import lcp from "@/lib/contact-lcp.json";
import "@/app/contact.css";
import "@/app/footer-lock.css";

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

export default function ContactUsPage() {
  const html = readPreparedBody("contact-body.html");

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
      <Script src={assets.contact} strategy="lazyOnload" />
      <JsonLd data={contactUsSchema} />
    </>
  );
}
