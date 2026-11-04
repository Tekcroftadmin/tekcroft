import fs from "fs";
import path from "path";

const pages = [
  ["about-us", "aboutUsSchema"],
  ["seo-services", "seoServicesSchema"],
  ["ecommerce-seo-services", "ecommerceSeoServicesSchema"],
  ["seo-audit-services", "seoAuditServicesSchema"],
  ["on-page-seo-services", "onPageSeoServicesSchema"],
  ["technical-seo-services", "technicalSeoServicesSchema"],
  ["ai-seo-services", "aiSeoServicesSchema"],
  ["local-seo-services", "localSeoServicesSchema"],
  [
    "google-business-profile-optimization-services",
    "googleBusinessProfileOptimizationServicesSchema",
  ],
  ["franchise-seo-services", "franchiseSeoServicesSchema"],
  ["ai-development-services", "aiDevelopmentServicesSchema"],
  ["ai-chatbot-development-services", "aiChatbotDevelopmentServicesSchema"],
  ["ai-agent-development-services", "aiAgentDevelopmentServicesSchema"],
  [
    "web-design-and-development-services",
    "webDesignAndDevelopmentServicesSchema",
  ],
  [
    "custom-software-development-services",
    "customSoftwareDevelopmentServicesSchema",
  ],
];

for (const [dir, exportName] of pages) {
  const file = path.join(process.cwd(), "app/(site)", dir, "page.tsx");
  let s = fs.readFileSync(file, "utf8");
  const re =
    /\n[ \t]*<JsonLd data=\{\w+\} \/>\n[ \t]*<\/>\n[ \t]*\);\n\}\n?$/;
  if (!re.test(s)) {
    console.warn("pattern miss", dir, JSON.stringify(s.slice(-80)));
    continue;
  }
  s = s.replace(
    re,
    `\n      <JsonLd data={${exportName}} />\n    </>\n  );\n}\n`
  );
  fs.writeFileSync(file, s);
  console.log("normalized", dir);
}
