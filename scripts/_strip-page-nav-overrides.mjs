/**
 * Remove per-page nav typography/layout overrides that fight the shared
 * nav-pill header (causes FOUC / "second header" feel on some pages).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const APP = path.join(ROOT, "app");
const PUBLIC_CSS = path.join(ROOT, "public", "css");

const BLOCK_RE =
  /\n?\.nav-links\{\s*gap:22px\s*!important;\s*text-transform:uppercase;\s*letter-spacing:\.04em;\s*\}\s*\n\.mm-trigger\{\s*text-transform:uppercase;\s*letter-spacing:\.04em;\s*\}\s*\n\.mnav\s*>\s*a,\s*\.mnav\s*\.mm-acc\{\s*text-transform:uppercase;\s*letter-spacing:\.04em;\s*\}\s*\n?/g;

// Optional trailing mnav btn line that sometimes follows
const EXTRA_MNAV_RE =
  /\n?\.mnav\s*\.mm-accp\s*a,\s*\.mnav\s*\.btn\{\s*text-transform:none;\s*letter-spacing:0;\s*\}\s*\n?/g;

function patchFile(file) {
  let src = fs.readFileSync(file, "utf8");
  const before = src;
  src = src.replace(BLOCK_RE, "\n");
  src = src.replace(EXTRA_MNAV_RE, "\n");
  if (src !== before) {
    fs.writeFileSync(file, src);
    return true;
  }
  return false;
}

function walk(dir, out = []) {
  if (!fs.existsSync(dir)) return out;
  for (const ent of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, ent.name);
    if (ent.isDirectory()) walk(p, out);
    else if (ent.name.endsWith(".css")) out.push(p);
  }
  return out;
}

let n = 0;
for (const file of [...walk(APP), ...walk(PUBLIC_CSS)]) {
  if (path.basename(file) === "nav-pill.css") continue;
  if (patchFile(file)) {
    n++;
    console.log("stripped", path.relative(ROOT, file));
  }
}
console.log(`done: ${n} files`);
