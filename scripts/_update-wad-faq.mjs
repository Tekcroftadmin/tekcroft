import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "web-and-app-development");
const CSS = path.join(ROOT, "app", "web-and-app-development.css");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/2-5203b812-a7c2-4975-8222-42e4915f3ff6.jpg";
const MAX = 80 * 1024;

fs.mkdirSync(OUT, { recursive: true });
const buf = fs.readFileSync(SRC);
let width = 720;
let quality = 78;
let out;
let meta;

for (;;) {
  out = await sharp(buf, { failOn: "none" })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  meta = await sharp(out).metadata();
  if (out.length <= MAX) break;
  if (quality > 55) quality -= 4;
  else if (width > 480) {
    width -= 40;
    quality = 72;
  } else if (quality > 40) quality -= 4;
  else break;
}
if (out.length > MAX) throw new Error("still over 80KB: " + out.length);

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `wad-faq-shot-${hash}.webp`;
for (const f of fs.readdirSync(OUT)) {
  if (/^wad-faq-shot-.*\.webp$/i.test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT, name), out);
const href = `/images/web-and-app-development/${name}`;
console.log({
  href,
  kb: +(out.length / 1024).toFixed(1),
  q: quality,
  w: meta.width,
  h: meta.height,
});

let css = fs.readFileSync(CSS, "utf8");
const re =
  /#web-and-app-development-page\{\s*--faq-shot:url\("\/images\/web-and-app-development\/wad-faq-shot-[a-f0-9]+\.webp"\);\s*\}/;
if (!re.test(css)) throw new Error("faq-shot declaration not found");
css = css.replace(
  re,
  `#web-and-app-development-page{ --faq-shot:url("${href}"); }`
);
fs.writeFileSync(CSS, css);
console.log("css updated");
console.log("done");
