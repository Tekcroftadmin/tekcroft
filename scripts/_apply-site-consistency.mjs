/**
 * Append site-consistency.css to the end of every page stylesheet
 * (and tekcroft.css) so it always wins cascade order in Next.js.
 * Also removes fragile double-imports from layout/pages if present.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const MARK = "/* === SITE CONSISTENCY LOCK (do not edit here — edit site-consistency.css) === */";
const lock = fs.readFileSync(path.join(ROOT, "app", "site-consistency.css"), "utf8").trim();

const cssFiles = [
  "app/tekcroft.css",
  "app/on-page-seo.css",
  "app/technical-seo.css",
  "app/seo-audit-services.css",
  "app/local-seo.css",
  "app/ecommerce-seo.css",
  "app/franchise-seo.css",
  "app/google-business-profile-optimization.css",
  "app/mobile-app-development.css",
  "app/web-design-and-development.css",
  "app/web-and-app-development.css",
  "app/custom-software-development.css",
  "app/ai-agent-development.css",
  "app/ai-chatbot-development.css",
  "app/ai-seo.css",
  "app/ai-development.css",
  "app/artificial-intelligence-services.css",
  "app/seo-services.css",
  "app/about-us.css",
  "app/contact.css",
  "app/services.css",
  "app/accessibility.css",
  "app/privacy-policy.css",
  "app/terms-of-use.css",
  "app/sitemap.css",
  "app/book-a-free-evaluation.css",
];

const block = "\n\n" + MARK + "\n" + lock + "\n";
/** Match any prior lock marker (em dash / en dash / hyphen / mojibake). */
const LOCK_RE =
  /\/\* === SITE CONSISTENCY LOCK \(do not edit here . edit site-consistency\.css\) === \*\//;

for (const rel of cssFiles) {
  const fp = path.join(ROOT, rel);
  let css = fs.readFileSync(fp, "utf8");
  const m = LOCK_RE.exec(css);
  if (m) css = css.slice(0, m.index).trimEnd();
  css = css.trimEnd() + block;
  fs.writeFileSync(fp, css);
  console.log("locked", rel);
}

/* Keep layout import of site-consistency AFTER footer-lock (homepage + safety net).
   Strip duplicate page-level imports — page stylesheets already get the lock appended. */
const stripPages = [
  "app/page.tsx",
  "app/contact/page.tsx",
  "app/blog/page.tsx",
  "app/(site)/on-page-seo-services/page.tsx",
  "app/(site)/technical-seo-services/page.tsx",
  "app/(site)/seo-audit-services/page.tsx",
  "app/(site)/local-seo-services/page.tsx",
  "app/(site)/ecommerce-seo-services/page.tsx",
  "app/(site)/franchise-seo-services/page.tsx",
  "app/(site)/google-business-profile-optimization-services/page.tsx",
  "app/(site)/mobile-app-development-services/page.tsx",
  "app/(site)/web-design-and-development-services/page.tsx",
  "app/(site)/custom-software-development-services/page.tsx",
  "app/(site)/ai-agent-development-services/page.tsx",
  "app/(site)/ai-chatbot-development-services/page.tsx",
  "app/(site)/ai-seo-services/page.tsx",
  "app/(site)/ai-development-services/page.tsx",
  "app/(site)/artificial-intelligence-services/page.tsx",
];

for (const rel of stripPages) {
  const fp = path.join(ROOT, rel);
  if (!fs.existsSync(fp)) continue;
  let src = fs.readFileSync(fp, "utf8");
  const next = src
    .replace(/\r?\nimport ["']@\/app\/site-consistency\.css["'];/g, "")
    .replace(/\r?\nimport ["']\.\/site-consistency\.css["'];/g, "");
  if (next !== src) {
    fs.writeFileSync(fp, next);
    console.log("unwired import", rel);
  }
}

/* Ensure layout loads site-consistency last (after footer-lock) */
{
  const fp = path.join(ROOT, "app/layout.tsx");
  let src = fs.readFileSync(fp, "utf8");
  // Drop prior consistency imports + their comment lines, then re-add once after footer-lock
  src = src
    .replace(/\r?\n\/\* Source of truth for type \+ spacing tokens[^*]*\*\/\r?\n/g, "\n")
    .replace(/\r?\nimport ["']\.\/site-consistency\.css["'];/g, "")
    .replace(/\r?\nimport ["']@\/app\/site-consistency\.css["'];/g, "");
  if (src.includes('import "./footer-lock.css";')) {
    src = src.replace(
      'import "./footer-lock.css";',
      'import "./footer-lock.css";\n/* Source of truth for type + spacing tokens; also appended to page CSS via scripts/_apply-site-consistency.mjs */\nimport "./site-consistency.css";'
    );
  } else if (!src.includes("site-consistency.css")) {
    src = src.replace(
      'import "./perf.css";',
      'import "./perf.css";\nimport "./site-consistency.css";'
    );
  }
  fs.writeFileSync(fp, src);
  console.log("wired layout site-consistency last");
}
