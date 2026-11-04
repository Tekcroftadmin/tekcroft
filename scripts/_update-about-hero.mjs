import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/1-16dfef3c-b1d5-49ce-9472-a15bc0d7a0b0.jpg";
const OUT_DIR = path.join(ROOT, "public", "images", "about");
const MAX = 80 * 1024;
const PREFIX = "about-hc-01";
const ALT = "Technology and Digital Marketing For Businesses That Want To Grow";

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
  if (new RegExp(`^${PREFIX}-.*\\.webp$`, "i").test(f) && f !== name) {
    fs.unlinkSync(path.join(OUT_DIR, f));
    console.log("deleted", f);
  }
}
fs.writeFileSync(path.join(OUT_DIR, name), out);
const rel = `/images/about/${name}`;
console.log("wrote", rel, `${meta.width}x${meta.height}`, `${(out.length / 1024).toFixed(1)}KB`);

const bodyPath = path.join(ROOT, "lib", "about-us-body.html");
let body = fs.readFileSync(bodyPath, "utf8");
const imgRe =
  /<img src="\/images\/about\/about-hc-01-[a-f0-9]+\.webp" width="\d+" height="\d+" alt="[^"]*" decoding="async" fetchpriority="high" title="[^"]*">/;
if (!imgRe.test(body)) throw new Error("hero img markup not found");
body = body.replace(
  imgRe,
  `<img src="${rel}" width="${meta.width}" height="${meta.height}" alt="${ALT}" decoding="async" fetchpriority="high" title="${ALT}">`
);
fs.writeFileSync(bodyPath, body);

fs.writeFileSync(
  path.join(ROOT, "lib", "about-us-lcp.json"),
  JSON.stringify({ preload: rel }, null, 2) + "\n"
);

const fixPath = path.join(ROOT, "scripts", "fix-all-images.mjs");
let fix = fs.readFileSync(fixPath, "utf8");
if (fix.includes("about-hc-01-93f9f9a157.webp")) {
  fix = fix.replaceAll(
    "/images/about/about-hc-01-93f9f9a157.webp",
    rel
  );
  fs.writeFileSync(fixPath, fix);
  console.log("updated fix-all-images map");
}

console.log("done");
