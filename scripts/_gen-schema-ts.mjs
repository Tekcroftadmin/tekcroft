import fs from "fs";

const blocks = JSON.parse(fs.readFileSync("scripts/_schema-jsons.json", "utf8"));

const names = [
  null,
  null,
  null,
  null,
  null,
  null,
  "sitewideSchema",
  "homeSchema",
  "aboutUsSchema",
  "contactUsSchema",
  "seoServicesSchema",
  "ecommerceSeoServicesSchema",
  "seoAuditServicesSchema",
  "onPageSeoServicesSchema",
  "technicalSeoServicesSchema",
  "aiSeoServicesSchema",
  "localSeoServicesSchema",
  "googleBusinessProfileOptimizationServicesSchema",
  "franchiseSeoServicesSchema",
  "aiDevelopmentServicesSchema",
  "aiChatbotDevelopmentServicesSchema",
  "aiAgentDevelopmentServicesSchema",
  "webDesignAndDevelopmentServicesSchema",
  "customSoftwareDevelopmentServicesSchema",
  "mobileAppDevelopmentServicesSchema",
  // 25 is FAQ template — skip
];

const lines = [
  "/**",
  " * JSON-LD schema objects from Tekcroft-Schema-Final.docx.",
  " * Values are copied from the document; do not reshape @id links.",
  " */",
  "",
];

for (let i = 6; i <= 24; i++) {
  const name = names[i];
  const raw = blocks[i];
  // Validate parse
  JSON.parse(raw);
  // Export as const with `as const` would change typing — use plain object
  // Preserve JSON via JSON.parse(JSON.stringify) from the raw string so
  // TypeScript gets a proper object, while keeping exact values.
  const pretty = JSON.stringify(JSON.parse(raw), null, 2);
  // User asked byte-for-byte — prefer embedding the exact minified-ish raw
  // as a parsed object. Using JSON.parse on a template string of the raw
  // preserves all values exactly.
  lines.push(`export const ${name} = ${pretty} as const;`, "");
}

fs.writeFileSync("lib/schema.ts", lines.join("\n"), "utf8");
console.log("wrote lib/schema.ts with", 24 - 6 + 1, "exports");
