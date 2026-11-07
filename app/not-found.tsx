import type { Metadata } from "next";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import SiteShell from "@/components/SiteShell";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import assets from "@/lib/asset-manifest.json";
import {
  preparePageBody,
  readSiteFooter,
  readSiteHeader,
} from "@/lib/compose-site-html";
import { stampFooterYear } from "@/lib/stamp-footer-year";

/* Same chrome CSS stack as (site)/layout — root not-found is outside that layout */
import "./responsive.css";
import "./footer-lock.css";
import "./site-consistency.css";
import "./mobile-menu.css";
import "./vs-halo-lock.css";
import "./pf-mode-lock.css";
import "./a11y-lock.css";
import "./internal-link.css";
import "./not-found.css";

const criticalCss = fs.readFileSync(
  path.join(process.cwd(), "app", "tekcroft-critical.css"),
  "utf8"
);

export const metadata: Metadata = {
  title: "404 — Tekcroft",
  description:
    "The page you are looking for moved, changed, or never existed. Head home or explore Tekcroft services.",
  robots: { index: false, follow: true },
};

export default function NotFound() {
  const html = preparePageBody(
    fs.readFileSync(
      path.join(process.cwd(), "lib", "not-found-body.html"),
      "utf8"
    )
  );

  return (
    <>
      <style
        data-tekcroft-critical=""
        dangerouslySetInnerHTML={{ __html: criticalCss }}
      />
      <DeferredStylesheet href="/css/tekcroft-defer.css" />
      <SiteShell
        headerHtml={readSiteHeader()}
        footerHtml={stampFooterYear(readSiteFooter())}
      >
        <Homepage html={html} />
      </SiteShell>
      <Script src={assets.notFound} strategy="afterInteractive" />
    </>
  );
}
