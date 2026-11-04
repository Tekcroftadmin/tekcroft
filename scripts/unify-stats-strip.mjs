import fs from "node:fs";
import path from "node:path";

const root = path.resolve("lib");
const fragment = fs.readFileSync(path.join(root, "stats-strip.html"), "utf8").trim();

const files = fs.readdirSync(root).filter((f) => f.endsWith("-body.html"));

// Match #proof-v2 section (any attributes / inner markup)
const proofV2 =
  /<section\b[^>]*\bid\s*=\s*["']proof-v2["'][^>]*>[\s\S]*?<\/section>/i;

// AIS alternate: #proof-v3 with s5-panel stats
const proofV3 =
  /<section\b[^>]*\bid\s*=\s*["']proof-v3["'][^>]*>[\s\S]*?<\/section>/i;

// Also catch orphan s5-panel stats blocks that aren't already proof-v2
const s5Only =
  /<section\b[^>]*\bclass\s*=\s*["'][^"']*\bs5\b[^"']*["'][^>]*>\s*<div class="wrap">\s*<div class="s5-panel">[\s\S]*?<\/div>\s*<\/div>\s*<\/section>/i;

let updated = 0;
for (const file of files) {
  const fp = path.join(root, file);
  let html = fs.readFileSync(fp, "utf8");
  const before = html;

  if (proofV2.test(html)) {
    html = html.replace(proofV2, fragment);
  } else if (proofV3.test(html)) {
    html = html.replace(proofV3, fragment);
  } else if (s5Only.test(html)) {
    html = html.replace(s5Only, fragment);
  } else {
    continue;
  }

  if (html !== before) {
    fs.writeFileSync(fp, html);
    updated++;
    console.log("updated", file);
  }
}

console.log("done,", updated, "files");
