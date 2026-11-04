/**
 * Re-encode home-hero WebPs at quality ~72–78, same dimensions.
 * Keeps mobile (-m) + desktop pairs used by the existing srcset.
 */
import fs from "fs";
import path from "path";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const dir = path.join(ROOT, "public", "images");

const FILES = [
  "home-hero-1.webp",
  "home-hero-1-m.webp",
  "home-hero-2.webp",
  "home-hero-2-m.webp",
  "home-hero-3.webp",
  "home-hero-3-m.webp",
  "home-hero-4.webp",
  "home-hero-4-m.webp",
];

async function opt(name) {
  const src = path.join(dir, name);
  if (!fs.existsSync(src)) {
    console.warn("skip missing", name);
    return;
  }
  const buf = fs.readFileSync(src);
  const meta = await sharp(buf).metadata();
  let best = null;

  for (let q = 78; q >= 72; q -= 2) {
    const out = await sharp(buf)
      .rotate()
      .webp({ quality: q, effort: 6, smartSubsample: true })
      .toBuffer();
    const outMeta = await sharp(out).metadata();
    if (outMeta.width !== meta.width || outMeta.height !== meta.height) {
      throw new Error(`${name}: dimension changed at q${q}`);
    }
    if (!best || out.length < best.bytes) {
      best = { out, q, bytes: out.length };
    }
    /* Prefer the first quality that shrinks; stop once we have a solid win */
    if (out.length < buf.length * 0.92) break;
  }

  if (!best) throw new Error("failed " + name);
  if (best.bytes >= buf.length) {
    console.log(
      `${name}: keep ${(buf.length / 1024).toFixed(1)} KB (re-encode not smaller)`
    );
    return;
  }
  fs.writeFileSync(src, best.out);
  console.log(
    `${name}: ${(buf.length / 1024).toFixed(1)} → ${(best.bytes / 1024).toFixed(1)} KB ` +
      `q${best.q} (${meta.width}x${meta.height})`
  );
}

for (const f of FILES) await opt(f);
console.log("done");
