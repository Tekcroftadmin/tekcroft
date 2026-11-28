import fs from "fs";
import path from "path";
import DeferredStylesheet from "@/components/DeferredStylesheet";
import SiteShell from "@/components/SiteShell";
import { readSiteFooter, readSiteHeader } from "@/lib/compose-site-html";
import { stampFooterYear } from "@/lib/stamp-footer-year";
/* All site lock CSS is deferred via /css/site-locks-defer.css so homepage
   (and other pages) are not blocked by 5+ Next CSS chunks. ATF hero geometry
   for #top.hero is pinned in tekcroft-critical (perf.css). */
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
      {/* One deferred bundle instead of many blocking Next CSS chunks */}
      <DeferredStylesheet href="/css/site-locks-defer.css" />
      <SiteShell headerHtml={headerHtml} footerHtml={footerHtml}>
        {children}
      </SiteShell>
    </>
  );
}
