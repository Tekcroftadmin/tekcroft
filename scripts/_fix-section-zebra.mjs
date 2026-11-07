/**
 * Set data-ground on every content <section> so the band after the hero
 * alternates white → tint → white → tint … across all *-body.html files.
 *
 * CTA outer bands ARE included (only the full-width wrapper is painted;
 * the dark .cta3 card keeps its own look).
 * Photo/dark comparison shells (#fit, .vs) stay special and break the
 * sequence without taking a white/tint paint.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");

function isHero(attrs) {
  const cls = (attrs.match(/\bclass=["']([^"']*)/) || [])[1] || "";
  const id = (attrs.match(/\bid=["']([^"']*)/) || [])[1] || "";
  if (id === "hero-1" || id === "top") return true;
  return /\b(hs|ct-hero|hero)\b/.test(cls) && !/\bct-body\b/.test(cls);
}

function isSpecialShell(attrs) {
  const cls = (attrs.match(/\bclass=["']([^"']*)/) || [])[1] || "";
  const id = (attrs.match(/\bid=["']([^"']*)/) || [])[1] || "";
  // Photo / comparison shells — keep own look (no white/tint on the shell)
  if (id === "fit" || /\bvs\b/.test(cls)) return true;
  return false;
}

function setGround(tag, ground) {
  if (/\bdata-ground=/.test(tag)) {
    return tag.replace(/\bdata-ground=["'][^"']*["']/, `data-ground="${ground}"`);
  }
  // Insert before the closing >
  return tag.replace(/>$/, ` data-ground="${ground}">`);
}

function clearGround(tag) {
  return tag.replace(/\s*data-ground=["'][^"']*["']/, "");
}

const report = [];

for (const file of fs.readdirSync(LIB).filter((f) => f.endsWith("-body.html")).sort()) {
  const fp = path.join(LIB, file);
  let html = fs.readFileSync(fp, "utf8");
  let idx = 0;
  let n = 0;
  const order = [];

  html = html.replace(/<section\b([^>]*)>/gi, (full, attrs) => {
    if (isHero(attrs)) {
      order.push({ role: "hero", ground: "(hero)" });
      return clearGround(full);
    }
    if (isSpecialShell(attrs)) {
      order.push({ role: "special", ground: "(special)" });
      return clearGround(full);
    }
    const ground = n % 2 === 0 ? "white" : "tint";
    n += 1;
    order.push({ role: "content", ground });
    idx += 1;
    return setGround(full, ground);
  });

  fs.writeFileSync(fp, html);
  report.push({ file, order });
  console.log(
    file,
    "→",
    order
      .filter((o) => o.role === "content")
      .map((o) => o.ground)
      .join(", ") || "(no content sections)"
  );
}

fs.writeFileSync(
  path.join(ROOT, "scripts", "_section-zebra-report.json"),
  JSON.stringify(report, null, 2) + "\n"
);
console.log("\nWrote scripts/_section-zebra-report.json");
