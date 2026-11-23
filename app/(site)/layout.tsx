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
import "./../eg-mobile-stack-lock.css";
import "./../hero-marquee-lock.css";
import "./../a11y-lock.css";
import "./../internal-link.css";
import "./../service-hero-lock.css";
import "./../mobile-cta-btn-lock.css";
/* stats-strip / nav-pill / perf are inlined via tekcroft-critical.css */

const criticalCssPath = path.join(
  process.cwd(),
  "app",
  "tekcroft-critical.css"
);
/* Dev: re-read every render so hash-assets / CSS flips aren't stuck behind
   a stale module-scope buffer after `next dev` has been running for hours. */
function readCriticalCss() {
  return fs.readFileSync(criticalCssPath, "utf8");
}
const criticalCssProd = process.env.NODE_ENV === "production"
  ? readCriticalCss()
  : null;

export default function SiteLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headerHtml = readSiteHeader();
  const footerHtml = stampFooterYear(readSiteFooter());
  const criticalCss = criticalCssProd ?? readCriticalCss();

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
