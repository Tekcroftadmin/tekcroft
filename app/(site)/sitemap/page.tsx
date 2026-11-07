import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import meta from "@/lib/sitemap-meta.json";
import "@/app/sitemap.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
};

export default function SitemapPage() {
  const html = readPreparedBody("sitemap-body.html");

  return (
    <>
      <link
        rel="preload"
        as="image"
        href="/images/legal/hero.webp"
        type="image/webp"
        fetchPriority="high"
      />
      <SitePage html={html} prepared />
    </>
  );
}
