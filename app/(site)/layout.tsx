import fs from "fs";
import path from "path";
import DeferredStylesheet from "@/components/DeferredStylesheet";
/* Locks that are not folded into tekcroft-critical.css */
import "./../responsive.css";
import "./../footer-lock.css";
import "./../site-consistency.css";
import "./../mobile-menu.css";
import "./../vs-halo-lock.css";
import "./../pf-mode-lock.css";
import "./../a11y-lock.css";
import "./../internal-link.css";
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
  return (
    <>
      <style
        data-tekcroft-critical=""
        dangerouslySetInnerHTML={{ __html: criticalCss }}
      />
      <DeferredStylesheet href="/css/tekcroft-defer.css" />
      {children}
    </>
  );
}
