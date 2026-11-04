/**
 * Align each service page meta.description with the Service schema description
 * so visible/meta copy matches schema word-for-word without editing schema.ts.
 */
import fs from "fs";
import path from "path";
import { createRequire } from "module";

// schema.ts uses `as const` — parse exports via a quick extract
const schemaSrc = fs.readFileSync(path.join(process.cwd(), "lib/schema.ts"), "utf8");

function extractExport(name) {
  const re = new RegExp(
    `export const ${name} = (\\{[\\s\\S]*?\\n\\}) as const;`,
    "m"
  );
  const m = schemaSrc.match(re);
  if (!m) throw new Error("missing " + name);
  return Function(`"use strict"; return (${m[1]})`)();
}

const map = [
  ["seoServicesSchema", "seo-services-meta.json"],
  ["ecommerceSeoServicesSchema", "ecommerce-seo-meta.json"],
  ["seoAuditServicesSchema", "seo-audit-services-meta.json"],
  ["onPageSeoServicesSchema", "on-page-seo-meta.json"],
  ["technicalSeoServicesSchema", "technical-seo-meta.json"],
  ["aiSeoServicesSchema", "ai-seo-meta.json"],
  ["localSeoServicesSchema", "local-seo-meta.json"],
  [
    "googleBusinessProfileOptimizationServicesSchema",
    "google-business-profile-optimization-meta.json",
  ],
  ["franchiseSeoServicesSchema", "franchise-seo-meta.json"],
  ["aiDevelopmentServicesSchema", "ai-development-meta.json"],
  ["aiChatbotDevelopmentServicesSchema", "ai-chatbot-development-meta.json"],
  ["aiAgentDevelopmentServicesSchema", "ai-agent-development-meta.json"],
  [
    "webDesignAndDevelopmentServicesSchema",
    "web-design-and-development-meta.json",
  ],
  [
    "customSoftwareDevelopmentServicesSchema",
    "custom-software-development-meta.json",
  ],
  ["mobileAppDevelopmentServicesSchema", "mobile-app-development-meta.json"],
];

for (const [exp, metaFile] of map) {
  const schema = extractExport(exp);
  const service = schema["@graph"].find((n) => n["@type"] === "Service");
  const webpage = schema["@graph"].find((n) => n["@type"] === "WebPage");
  const file = path.join(process.cwd(), "lib", metaFile);
  if (!fs.existsSync(file)) {
    console.warn("missing meta", metaFile);
    continue;
  }
  const meta = JSON.parse(fs.readFileSync(file, "utf8"));
  const desc = service?.description || webpage?.description;
  if (!desc) {
    console.warn("no desc", exp);
    continue;
  }
  if (meta.description === desc) {
    console.log("ok", metaFile);
    continue;
  }
  console.log("update", metaFile);
  console.log("  was:", meta.description.slice(0, 80) + "...");
  console.log("  now:", desc.slice(0, 80) + "...");
  meta.description = desc;
  fs.writeFileSync(file, JSON.stringify(meta, null, 2) + "\n");
}
