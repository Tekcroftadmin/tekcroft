import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/3-7f84a02f-b5c9-4552-a37b-d5b55c989ad6.jpg";
const OUT_DIR = path.join(ROOT, "public", "images", "about");
const BODY = path.join(ROOT, "lib", "about-us-body.html");
const CSS = path.join(ROOT, "app", "about-us.css");
const MAX = 80 * 1024;
const PREFIX = "about-cta-shot";
const ALT =
  "Business consultant reviewing project timelines and reports while planning growth for a client";
const TITLE = "Let's Talk About Your Business";

const buf = fs.readFileSync(SRC);
const meta0 = await sharp(buf).metadata();
console.log("src", meta0.width, meta0.height, buf.length);

let width = Math.min(1400, meta0.width || 1400);
let quality = 80;
let out;
let meta;

for (;;) {
  out = await sharp(buf, { failOn: "none" })
    .rotate()
    .resize({ width, withoutEnlargement: true })
    .webp({ quality, effort: 6, smartSubsample: true })
    .toBuffer();
  meta = await sharp(out).metadata();
  console.log({ width, quality, kb: +(out.length / 1024).toFixed(1) });
  if (out.length <= MAX) break;
  if (quality > 55) quality -= 6;
  else if (width > 900) {
    width -= 100;
    quality = 76;
  } else if (quality > 40) quality -= 5;
  else throw new Error("still over 80KB");
}

const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
const name = `${PREFIX}-${hash}.webp`;
for (const f of fs.readdirSync(OUT_DIR)) {
  if (
    (new RegExp(`^${PREFIX}-.*\\.webp$`, "i").test(f) ||
      /^about-css-01-.*\.webp$/i.test(f)) &&
    f !== name
  ) {
    // Only delete about-css-01 if nothing else references it after update
    if (/^about-css-01-/i.test(f)) continue;
    fs.unlinkSync(path.join(OUT_DIR, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT_DIR, name), out);
const rel = `/images/about/${name}`;
console.log("wrote", rel, `${meta.width}x${meta.height}`, `${(out.length / 1024).toFixed(1)}KB`);

let html = fs.readFileSync(BODY, "utf8");
const bgRe = /<div class="cta-bg"[^>]*>\s*(?:<img[^>]*>\s*)?<\/div>/;
if (!bgRe.test(html)) throw new Error("cta-bg not found");
html = html.replace(
  bgRe,
  `<div class="cta-bg"><img src="${rel}" width="${meta.width}" height="${meta.height}" alt="${ALT}" title="${TITLE}" decoding="async" loading="lazy"></div>`
);
fs.writeFileSync(BODY, html);
console.log("body updated");

let css = fs.readFileSync(CSS, "utf8");
css = css.replace(
  /--cta-img:url\("\/images\/about\/[^"]+"\);/,
  `--cta-img:url("${rel}");`
);

const marker = "/* About CTA band photo as <img> (alt/title) */";
const cssBlock = `
${marker}
#ctaw .cta-bg{
  background:none !important;
}
#ctaw .cta-bg > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
  max-width:none;
}
`;

if (css.includes(marker)) {
  css = css.replace(
    /\/\* About CTA band photo as <img> \(alt\/title\) \*\/[\s\S]*?(?=\n\/\* [A-Z]|\nhtml body|$)/,
    cssBlock.trim() + "\n"
  );
} else {
  css = css.trimEnd() + "\n" + cssBlock;
}
fs.writeFileSync(CSS, css);

// Remove old about-css-01 if unused
const old = path.join(OUT_DIR, "about-css-01-93f9f9a157.webp");
const stillUsed =
  fs.readFileSync(CSS, "utf8").includes("about-css-01-93f9f9a157") ||
  fs.readFileSync(BODY, "utf8").includes("about-css-01-93f9f9a157");
if (fs.existsSync(old) && !stillUsed) {
  fs.unlinkSync(old);
  console.log("deleted about-css-01-93f9f9a157.webp");
}

console.log("done");
