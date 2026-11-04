import fs from "fs";
import path from "path";

const ROOT = process.cwd();

const pages = [
  { dir: "about-us", exportName: "aboutUsSchema" },
  { dir: "contact-us", exportName: "contactUsSchema" },
  { dir: "seo-services", exportName: "seoServicesSchema" },
  { dir: "ecommerce-seo-services", exportName: "ecommerceSeoServicesSchema" },
  { dir: "seo-audit-services", exportName: "seoAuditServicesSchema" },
  { dir: "on-page-seo-services", exportName: "onPageSeoServicesSchema" },
  { dir: "technical-seo-services", exportName: "technicalSeoServicesSchema" },
  { dir: "ai-seo-services", exportName: "aiSeoServicesSchema" },
  { dir: "local-seo-services", exportName: "localSeoServicesSchema" },
  {
    dir: "google-business-profile-optimization-services",
    exportName: "googleBusinessProfileOptimizationServicesSchema",
  },
  { dir: "franchise-seo-services", exportName: "franchiseSeoServicesSchema" },
  { dir: "ai-development-services", exportName: "aiDevelopmentServicesSchema" },
  {
    dir: "ai-chatbot-development-services",
    exportName: "aiChatbotDevelopmentServicesSchema",
  },
  {
    dir: "ai-agent-development-services",
    exportName: "aiAgentDevelopmentServicesSchema",
  },
  {
    dir: "web-design-and-development-services",
    exportName: "webDesignAndDevelopmentServicesSchema",
  },
  {
    dir: "custom-software-development-services",
    exportName: "customSoftwareDevelopmentServicesSchema",
  },
  {
    dir: "mobile-app-development-services",
    exportName: "mobileAppDevelopmentServicesSchema",
  },
];

// Create local-seo-services from on-page-seo-services template
const localDir = path.join(ROOT, "app/(site)/local-seo-services");
if (!fs.existsSync(path.join(localDir, "page.tsx"))) {
  fs.mkdirSync(localDir, { recursive: true });
  const tpl = `import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { localSeoServicesSchema } from "@/lib/schema";
import fs from "fs";
import path from "path";
import Script from "next/script";
import Homepage from "@/components/Homepage";
import assets from "@/lib/asset-manifest.json";
import meta from "@/lib/local-seo-meta.json";
import lcp from "@/lib/local-seo-lcp.json";
import "@/app/local-seo.css";
import "@/app/footer-lock.css";
import "@/app/service-hero-lock.css";
import "@/app/tm-shell-lock.css";

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

export default function LocalSeoServicesPage() {
  const html = fs.readFileSync(
    path.join(process.cwd(), "lib", "local-seo-body.html"),
    "utf8"
  );

  return (
    <>
      <link
        rel="preload"
        as="image"
        href={lcp.preload}
        type="image/webp"
        media={lcp.desktopMedia}
        fetchPriority="high"
      />
      <link
        rel="preload"
        as="image"
        href={lcp.preloadMobile}
        type="image/webp"
        media={lcp.mobileMedia}
        fetchPriority="high"
      />
      <Homepage html={html} />
      <Script src={assets.localSeo} strategy="afterInteractive" />
      <JsonLd data={localSeoServicesSchema} />
    </>
  );
}
`;
  fs.writeFileSync(path.join(localDir, "page.tsx"), tpl);
  console.log("created local-seo-services/page.tsx");
}

for (const { dir, exportName } of pages) {
  const file = path.join(ROOT, "app/(site)", dir, "page.tsx");
  if (!fs.existsSync(file)) {
    console.warn("missing", file);
    continue;
  }
  let src = fs.readFileSync(file, "utf8");
  if (src.includes(`<JsonLd data={${exportName}}`)) {
    console.log("ok", dir);
    continue;
  }
  // Insert before the last </> in the file (closing fragment of return)
  const idx = src.lastIndexOf("</>");
  if (idx === -1) {
    console.warn("no fragment", dir);
    continue;
  }
  src =
    src.slice(0, idx) +
    `      <JsonLd data={${exportName}} />\n` +
    src.slice(idx);
  fs.writeFileSync(file, src);
  console.log("inserted", dir);
}
