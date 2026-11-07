import type { Metadata } from "next";
import Script from "next/script";
import SitePage from "@/components/SitePage";
import { readPreparedBody } from "@/lib/compose-site-html";
import assets from "@/lib/asset-manifest.json";
import "@/app/contact.css";
import "@/app/footer-lock.css";

export const metadata: Metadata = {
  title: "Blog | Tekcroft",
  description:
    "Insights on SEO, AI, and software development from Tekcroft.",
  alternates: { canonical: "https://www.tekcroft.com/blog" },
};

export default function BlogPage() {
  const html = readPreparedBody("blog-body.html");

  return (
    <>
      <SitePage html={html} prepared />
      <Script src={assets.contact} strategy="lazyOnload" />
    </>
  );
}
