import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Sora } from "next/font/google";
import assets from "@/lib/asset-manifest.json";
import NoHashScroll from "@/components/NoHashScroll";
import JsonLd from "@/components/JsonLd";
import { sitewideSchema } from "@/lib/schema";

/* Self-hosted via next/font — same families/weights, no render-blocking Google CSS */
const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  display: "swap",
  variable: "--font-inter",
  adjustFontFallback: true,
  preload: true,
});

const sora = Sora({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  display: "swap",
  variable: "--font-sora",
  adjustFontFallback: true,
  preload: true,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.tekcroft.com"),
  title: {
    default: "Tekcroft",
    template: "%s",
  },
  icons: {
    icon: [
      { url: "/favicon-light.png", media: "(prefers-color-scheme: light)" },
      { url: "/favicon-dark.png", media: "(prefers-color-scheme: dark)" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0096D5",
  colorScheme: "light dark",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      data-theme="light"
      className={`${inter.variable} ${sora.variable}`}
      suppressHydrationWarning
    >
      <head>
        <meta charSet="utf-8" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        {/* Capture #section before paint, strip it from the URL, stay at top;
            NoHashScroll then smooth-scrolls to the matching element id. */}
        <Script id="no-hash-scroll-boot" strategy="beforeInteractive">
          {`(function(){try{if("scrollRestoration"in history)history.scrollRestoration="manual";var h=location.hash;if(h&&h.length>1){window.__tekcroftHash=decodeURIComponent(h.slice(1));history.replaceState(null,"",location.pathname+location.search)}scrollTo(0,0)}catch(e){}})();`}
        </Script>
        <NoHashScroll />
        <JsonLd data={sitewideSchema} />
        {children}
        <Script src={assets.leadSubmit || "/tekcroft-lead-submit.js"} strategy="afterInteractive" />
        <Script src="/tekcroft-ask-modal.js" strategy="afterInteractive" />
        <Script src={assets.vsHalo} strategy="lazyOnload" />
        <Script src={assets.mm} strategy="lazyOnload" />
        <Script src={assets.pfMarquee || "/tekcroft-pf-marquee.js"} strategy="lazyOnload" />
      </body>
    </html>
  );
}
