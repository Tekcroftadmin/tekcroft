/**
 * Point every site page at SitePage (shared header/footer compose).
 * Leaves booking page alone. Special-cases local-seo (no Homepage).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app");

function walk(dir, out = []) {
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name === "page.tsx" || ent.name === "not-found.tsx") out.push(p);
  }
  return out;
}

const files = walk(APP);
let changed = 0;

for (const file of files) {
  const rel = path.relative(ROOT, file).replace(/\\/g, "/");
  if (rel.includes("(booking)/")) {
    console.log("skip booking", rel);
    continue;
  }

  let src = fs.readFileSync(file, "utf8");
  const before = src;

  if (rel.includes("local-seo-services/page.tsx")) {
    if (!src.includes("composeSiteHtml")) {
      if (src.includes('from "@/lib/stamp-footer-year"')) {
        src = src.replace(
          'import { stampFooterYear } from "@/lib/stamp-footer-year";',
          'import { composeSiteHtml } from "@/lib/compose-site-html";\nimport { stampFooterYear } from "@/lib/stamp-footer-year";'
        );
      } else {
        src = src.replace(
          'import { localSeoServicesSchema } from "@/lib/schema";',
          'import { localSeoServicesSchema } from "@/lib/schema";\nimport { composeSiteHtml } from "@/lib/compose-site-html";\nimport { stampFooterYear } from "@/lib/stamp-footer-year";'
        );
      }
      src = src.replace(
        /const html = stampFooterYear\(\s*fs\.readFileSync\(\s*path\.join\(process\.cwd\(\), "lib", "local-seo-body\.html"\),\s*"utf8"\s*\)\s*\);/,
        `const html = stampFooterYear(
    composeSiteHtml(
      fs.readFileSync(
        path.join(process.cwd(), "lib", "local-seo-body.html"),
        "utf8"
      )
    )
  );`
      );
    }
  } else if (src.includes("@/components/Homepage")) {
    src = src.replace(
      /import Homepage from "@\/components\/Homepage";/,
      'import SitePage from "@/components/SitePage";'
    );
    src = src.replace(/<Homepage\b/g, "<SitePage");
    src = src.replace(/<\/Homepage>/g, "</SitePage>");
  }

  if (src !== before) {
    fs.writeFileSync(file, src);
    changed++;
    console.log("updated", rel);
  } else {
    console.log("no change", rel);
  }
}

console.log(`done: ${changed} files`);
