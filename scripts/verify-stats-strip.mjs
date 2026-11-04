import fs from "node:fs";
import path from "node:path";

const root = path.resolve("lib");
const frag = fs.readFileSync(path.join(root, "stats-strip.html"), "utf8").trim();
const norm = (s) => s.replace(/\s+/g, " ").trim();
const fragN = norm(frag);

const files = fs.readdirSync(root).filter((f) => f.endsWith("-body.html"));
const bad = [];

for (const f of files) {
  const h = fs.readFileSync(path.join(root, f), "utf8");
  const m = h.match(/<section\b[^>]*\bid\s*=\s*["']proof-v2["'][^>]*>[\s\S]*?<\/section>/i);
  if (!m) {
    if (/Organic traffic|Client satisfaction|s5-panel|proof-v3/.test(h)) {
      bad.push(`${f}: leftover alt stats`);
    }
    continue;
  }
  if (norm(m[0]) !== fragN) bad.push(`${f}: markup mismatch`);
}

console.log(bad.length ? bad.join("\n") : `all ${files.filter((f)=>fs.readFileSync(path.join(root,f),'utf8').includes('id="proof-v2"')).length} proof-v2 blocks match fragment`);
