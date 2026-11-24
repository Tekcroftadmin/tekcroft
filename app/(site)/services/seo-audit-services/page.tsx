import fs from "fs";
import path from "path";
import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import { seoAuditServicesSchema } from "@/lib/schema";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/seo-audit-services-meta.json";
import lcp from "@/lib/seo-audit-services-lcp.json";
/* Hero lock already loaded by (site)/layout — do not re-import (extra chunks).
   Tiny page ATF CSS is inlined below so it never becomes a blocking chunk. */

const auditCriticalPath = path.join(
  process.cwd(),
  "app",
  "seo-audit-critical.css"
);
const auditLedePath = path.join(process.cwd(), "app", "seo-audit-hero-lede.css");
function readCss(filePath: string) {
  try {
    return fs.readFileSync(filePath, "utf8");
  } catch {
    return "";
  }
}
const auditAtfCss =
  process.env.NODE_ENV === "production"
    ? `${readCss(auditCriticalPath)}\n${readCss(auditLedePath)}`
    : null;

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

export default function SeoAuditServicesPage() {
  const html = readPreparedBody("seo-audit-services-body.html");
  const atfCss =
    auditAtfCss ??
    `${readCss(auditCriticalPath)}\n${readCss(auditLedePath)}`;

  return (
    <>
      <style
        data-seo-audit-atf=""
        dangerouslySetInnerHTML={{ __html: atfCss }}
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
      {/* Full page CSS off critical path */}
      <DeferredStylesheet href="/css/seo-audit-services.css" />
      <SitePage html={html} prepared />
      <Script src={assets.seoAuditServices} strategy="lazyOnload" />
      <JsonLd data={seoAuditServicesSchema} />
    </>
  );
}
