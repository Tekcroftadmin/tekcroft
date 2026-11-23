import DeferredStylesheet from "@/components/DeferredStylesheet";
/* Local SEO: full chrome CSS (stable LCP) + defer only the huge page sheet */
import "./../tekcroft.css";
import "./../responsive.css";
import "./../perf.css";
import "./../footer-lock.css";
import "./../site-consistency.css";
import "./../mobile-menu.css";
import "./../stats-strip.css";
import "./../pf-mode-lock.css";
import "./../pf-center-and-cards-lock.css";
import "./../a11y-lock.css";
import "./../nav-pill.css";

export default function LocalSeoLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <>
      <DeferredStylesheet href="/css/local-seo.css" />
      {children}
    </>
  );
}
