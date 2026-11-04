import fs from "fs";
import path from "path";

const ROOT = process.cwd();

/** @type {{ dir: string, exportName: string }[]} */
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

function ensureImports(src, exportName) {
  let out = src;
  if (!out.includes('from "@/components/JsonLd"')) {
    out = out.replace(
      /^import type \{ Metadata \} from "next";/m,
      'import type { Metadata } from "next";\nimport JsonLd from "@/components/JsonLd";'
    );
  }
  if (!out.includes(`{ ${exportName} }`)) {
    // After other lib imports
    if (out.includes('from "@/lib/schema"')) {
      out = out.replace(
        /import \{([^}]+)\} from "@\/lib\/schema";/,
        (m, inner) => {
          if (inner.includes(exportName)) return m;
          return `import { ${inner.trim().replace(/,$/, "")}, ${exportName} } from "@/lib/schema";`;
        }
      );
    } else {
      out = out.replace(
        /^import type \{ Metadata \} from "next";\nimport JsonLd from "@\/components\/JsonLd";/m,
        `import type { Metadata } from "next";\nimport JsonLd from "@/components/JsonLd";\nimport { ${exportName} } from "@/lib/schema";`
      );
    }
  }
  return out;
}

function ensureJsonLd(src, exportName) {
  if (src.includes(`<JsonLd data={${exportName}}`)) return src;
  // Insert before closing fragment
  return src.replace(
    /(\s*)<\/>\s*\n\s*\};\s*$/,
    `\n      <JsonLd data={${exportName}} />\n$1</>\n  );\n}`
  );
}

// Create contact-us page from contact page
const contactSrc = fs.readFileSync(
  path.join(ROOT, "app/(site)/contact/page.tsx"),
  "utf8"
);
const contactUsDir = path.join(ROOT, "app/(site)/contact-us");
fs.mkdirSync(contactUsDir, { recursive: true });
let contactUs = contactSrc
  .replace("export default function ContactPage", "export default function ContactUsPage")
  .replace('canonical: meta.canonical', 'canonical: "https://www.tekcroft.com/contact-us"')
  .replace('url: meta.canonical', 'url: "https://www.tekcroft.com/contact-us"');
contactUs = ensureImports(contactUs, "contactUsSchema");
contactUs = ensureJsonLd(contactUs, "contactUsSchema");
fs.writeFileSync(path.join(contactUsDir, "page.tsx"), contactUs);
console.log("wrote contact-us/page.tsx");

for (const { dir, exportName } of pages) {
  if (dir === "contact-us") continue; // already done
  const file = path.join(ROOT, "app/(site)", dir, "page.tsx");
  if (!fs.existsSync(file)) {
    console.warn("missing", file);
    continue;
  }
  let src = fs.readFileSync(file, "utf8");
  src = ensureImports(src, exportName);
  src = ensureJsonLd(src, exportName);
  fs.writeFileSync(file, src);
  console.log("wired", dir);
}

/* Update next.config redirects: /contact → /contact-us */
const cfgPath = path.join(ROOT, "next.config.js");
let cfg = fs.readFileSync(cfgPath, "utf8");
if (cfg.includes('source: "/contact-us"')) {
  cfg = cfg.replace(
    /\{\s*source: "\/contact-us",\s*destination: "\/contact",\s*permanent: false,\s*\}/,
    `{
        source: "/contact",
        destination: "/contact-us",
        permanent: true,
      }`
  );
  fs.writeFileSync(cfgPath, cfg);
  console.log("updated contact redirect → /contact-us");
}
