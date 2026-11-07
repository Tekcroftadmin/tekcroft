import fs from "fs";
import path from "path";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import SiteShell from "@/components/SiteShell";
import { readSiteFooter, readSiteHeader } from "@/lib/compose-site-html";
import { stampFooterYear } from "@/lib/stamp-footer-year";
/* Locks that are not folded into tekcroft-critical.css */
import "./../responsive.css";
import "./../footer-lock.css";
import "./../site-consistency.css";
import "./../mobile-menu.css";
import "./../vs-halo-lock.css";
import "./../pf-mode-lock.css";
import "./../pf-center-and-cards-lock.css";
import "./../hero-marquee-lock.css";
import "./../a11y-lock.css";
import "./../internal-link.css";
import "./../service-hero-lock.css";
import "./../mobile-cta-btn-lock.css";
/* stats-strip / nav-pill / perf are inlined via tekcroft-critical.css */

const criticalCss = fs.readFileSync(
  path.join(process.cwd(), "app", "tekcroft-critical.css"),
  "utf8"
);

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerHtml = readSiteHeader();
  const footerHtml = stampFooterYear(readSiteFooter());

  return (
    <>
      <style
        data-tekcroft-critical=""
        dangerouslySetInnerHTML={{ __html: criticalCss }}
      />
      <DeferredStylesheet href="/css/tekcroft-defer.css" />
      <SiteShell headerHtml={headerHtml} footerHtml={footerHtml}>
        {children}
      </SiteShell>
    </>
  );
}
