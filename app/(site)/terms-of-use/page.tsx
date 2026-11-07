import type { Metadata } from "next";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import LegalPageScript from "@/components/LegalPageScript";
import { SITE_URL } from "@/lib/site-url";
import meta from "@/lib/terms-of-use-meta.json";
import "@/app/terms-of-use.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: meta.title,
  description: meta.description,
  alternates: { canonical: meta.canonical },
};

export default function TermsOfUsePage() {
  const html = readPreparedBody("terms-of-use-body.html")
    .split("__SITE_URL__")
    .join(SITE_URL);

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
      <LegalPageScript rootId="terms-of-use" />
    </>
  );
}
