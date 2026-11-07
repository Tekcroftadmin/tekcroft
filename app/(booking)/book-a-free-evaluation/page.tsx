import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/book-a-free-evaluation-meta.json";
import "@/app/book-a-free-evaluation.css";

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

export default function BookAFreeEvaluationPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "book-a-free-evaluation-body.html"),
    "utf8"
  );

  return (
    <>
      <div
        id="tekcroft-book"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <Script src={assets.bookAFreeEvaluation} strategy="lazyOnload" />
    </>
  );
}
