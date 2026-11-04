/**
 * Site-wide image audit/fix:
 * - Convert JPG/PNG (non-favicon) → WebP, update refs
 * - Compress WebP > 80KB (quality ~80–82, no upscale)
 * - Ensure every <img> has alt + title (home hero exact alt)
 *
 * Run: node scripts/fix-all-images.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const PUB = path.join(ROOT, "public");
const BACKUP = path.join(PUB, "_img-backup");
const MAX = 80 * 1024;
const HOME_HERO_ALT =
  "Digital Marketing Company Built for AI-Era Search Growth GoogleAI Overviews ChatGPT Gemini Perplexity";

fs.mkdirSync(BACKUP, { recursive: true });

function walk(d, acc = []) {
  if (!fs.existsSync(d)) return acc;
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) {
      if (["node_modules", ".git", ".next", "_img-backup"].includes(e.name)) continue;
      walk(p, acc);
    } else acc.push(p);
  }
  return acc;
}

function backupFile(abs) {
  const rel = path.relative(PUB, abs);
  const dest = path.join(BACKUP, rel);
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  if (!fs.existsSync(dest)) fs.copyFileSync(abs, dest);
}

async function toWebpUnder80(inputBuf, { maxW = 1600 } = {}) {
  let best = null;
  const widths = [maxW, 1400, 1200, 1100, 1000, 900, 800, 720].filter(
    (w, i, a) => a.indexOf(w) === i && w <= maxW
  );
  for (const w of widths) {
    for (const q of [82, 80, 78, 74, 70, 66, 62, 58, 54, 50, 46, 42]) {
      const buf = await sharp(inputBuf)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = buf; // first fit at this width = highest viable quality
        break;
      }
    }
    if (best) break;
  }
  if (!best) {
    // last resort: aggressive
    best = await sharp(inputBuf)
      .rotate()
      .resize({ width: 640, withoutEnlargement: true })
      .webp({ quality: 40, effort: 6 })
      .toBuffer();
  }
  return best;
}

/* ── 1) Convert non-WebP rasters (excl favicons) ── */
const rasterExt = /\.(jpe?g|png|gif|avif|bmp)$/i;
const skipName = /^(favicon|apple-touch-icon)/i;
const convertMap = new Map(); // old web path → new web path

const rasters = walk(PUB).filter(
  (f) => rasterExt.test(f) && !skipName.test(path.basename(f))
);

for (const abs of rasters) {
  backupFile(abs);
  const raw = fs.readFileSync(abs);
  const meta = await sharp(raw).metadata();
  const maxW = Math.min(meta.width || 1600, 1600);
  const webpBuf = await toWebpUnder80(raw, { maxW });
  const rel = path.relative(PUB, abs).replace(/\\/g, "/");
  const webRel = rel.replace(rasterExt, ".webp");
  const outAbs = path.join(PUB, webRel);
  fs.writeFileSync(outAbs, webpBuf);
  // remove original after successful write
  if (path.resolve(abs) !== path.resolve(outAbs)) fs.unlinkSync(abs);
  convertMap.set("/" + rel, "/" + webRel);
  convertMap.set(rel, webRel);
  console.log(
    "convert",
    rel,
    "→",
    webRel,
    (webpBuf.length / 1024).toFixed(1) + "KB"
  );
}

/* ── 2) Compress oversized WebP ── */
const webps = walk(PUB).filter((f) => /\.webp$/i.test(f));
for (const abs of webps) {
  const size = fs.statSync(abs).size;
  if (size <= MAX) continue;
  backupFile(abs);
  const raw = fs.readFileSync(abs);
  const meta = await sharp(raw).metadata();
  const maxW = Math.min(meta.width || 1600, 1600);
  const out = await toWebpUnder80(raw, { maxW });
  fs.writeFileSync(abs, out);
  console.log(
    "compress",
    path.relative(PUB, abs),
    (size / 1024).toFixed(1) + "→" + (out.length / 1024).toFixed(1) + "KB"
  );
}

/* ── 3) Rewrite references in source files ── */
const textRoots = [
  path.join(ROOT, "lib"),
  path.join(ROOT, "app"),
  path.join(ROOT, "components"),
  path.join(ROOT, "public"),
];
const textExt = /\.(html|css|tsx|ts|js|mjs|json)$/i;

function rewriteText(file) {
  let t = fs.readFileSync(file, "utf8");
  let changed = false;
  for (const [from, to] of convertMap) {
    if (t.includes(from)) {
      t = t.split(from).join(to);
      changed = true;
    }
  }
  if (changed) {
    fs.writeFileSync(file, t);
    console.log("refs", path.relative(ROOT, file));
  }
}

for (const root of textRoots) {
  for (const f of walk(root)) {
    if (!textExt.test(f)) continue;
    if (f.includes("node_modules") || f.includes("_img-backup")) continue;
    // skip lighthouse dumps / huge json audits
    if (/_lh-|_img-inventory|_unused-images|_extracted/.test(f)) continue;
    rewriteText(f);
  }
}

/* ── 4) Alt + title on every <img> in body HTML ── */
const ALT_BY_SRC = {
  "/images/about/about-hc-01-93f9f9a157.webp":
    "Tekcroft team collaborating on technology and digital marketing strategy",
  "/images/aid-hero-62a278e464.webp":
    "AI development team building custom machine learning solutions for business growth",
  "/images/contact-ct-shot-cd2bc2b893.webp":
    "Tekcroft contact workspace — get in touch for SEO, AI and web development",
  "/images/home-hero-1.webp": HOME_HERO_ALT,
  "/images/home-hero-2.webp": HOME_HERO_ALT,
  "/images/home-hero-3.webp": HOME_HERO_ALT,
  "/images/home-hero-4.webp": HOME_HERO_ALT,
  "/images/seo-vx-poster-ca929c0656.webp":
    "Video poster — how Tekcroft turns search traffic into leads",
  "/images/seo-services/seo-svc-img6-c9565b3e71.webp":
    "SEO service illustration showing search visibility growth",
  "/images/seo-services/seo-svc-img7-002d3a99e2.webp":
    "SEO service illustration for content and ranking strategy",
  "/images/ecom-img15-f6eab34835.webp": "Amazon ecommerce platform logo",
  "/images/ecom-img16-e6190bc777.webp": "Ecommerce platform logo",
  "/images/ecom-img17-767cd35d01.webp": "Etsy ecommerce marketplace logo",
  "/images/web-and-app-development/wad-img1-6ef691051f.webp":
    "Web and app development product interface preview",
  "/images/web-and-app-development/wad-tm-01-fffff22467.webp":
    "Custom web application development visual",
  "/images/web-and-app-development/wad-tm-02-94f7c101c6.webp":
    "Mobile and web product design visual",
  "/images/web-and-app-development/wad-tm-03-78c6234db0.webp":
    "Software engineering and product build visual",
  "/images/web-and-app-development/wad-tm-04-98303d83e8.webp":
    "Application architecture and systems visual",
  "/images/web-and-app-development/wad-tm-05-f207a4ecb2.webp":
    "Full-stack web development delivery visual",
  "/images/web-and-app-development/wad-tm-06-4d5ef9c7a5.webp":
    "Product UI and experience design visual",
  "/images/web-and-app-development/wad-tm-07-fda6a66872.webp":
    "Cloud and application infrastructure visual",
  "/images/web-and-app-development/wad-tm-08-002d3a99e2.webp":
    "Ongoing product improvement and support visual",
  "/images/gbp-img2-10cd399e7f.webp":
    "Google Business Profile on a phone next to a map pin",
};

// After jpg→webp conversion, strategist path changes
const STRATEGIST_OLD = "/images/seo-audit/seo-audit-why-strategist-08ee7566c9.jpg";
const STRATEGIST_NEW = "/images/seo-audit/seo-audit-why-strategist-08ee7566c9.webp";
ALT_BY_SRC[STRATEGIST_NEW] =
  "SEO strategist reviewing audit findings and growth opportunities";
ALT_BY_SRC[STRATEGIST_OLD] = ALT_BY_SRC[STRATEGIST_NEW];

function titleFromAlt(alt) {
  if (!alt) return "Tekcroft";
  // keep titles concise
  return alt.length > 90 ? alt.slice(0, 87) + "…" : alt;
}

function describeFromSrc(src) {
  if (!src) return "Tekcroft visual";
  if (ALT_BY_SRC[src]) return ALT_BY_SRC[src];
  const base = path.basename(src).replace(/\.[a-z0-9]+$/i, "");
  const nice = base
    .replace(/[-_]+/g, " ")
    .replace(/\b[a-f0-9]{8,}\b/gi, "")
    .replace(/\s+/g, " ")
    .trim();
  if (/shopify/i.test(nice) || /img1|img7|tech-img3|tech-img7/i.test(src))
    return "Shopify";
  if (/woocommerce/i.test(nice)) return "WooCommerce";
  if (/magento/i.test(nice)) return "Magento";
  if (/bigcommerce/i.test(nice)) return "BigCommerce";
  if (/etsy/i.test(nice)) return "Etsy";
  if (/ebay/i.test(nice)) return "eBay";
  if (/amazon/i.test(nice)) return "Amazon";
  if (/wordpress/i.test(nice) || /tech-img4|tech-img8/i.test(src)) return "WordPress";
  if (/javascript|tech-img5|tech-img9/i.test(src)) return "JavaScript";
  if (nice) return `Tekcroft — ${nice}`;
  return "Tekcroft visual";
}

function fixImgTag(tag) {
  if (/^<img>$/i.test(tag.trim())) {
    // empty placeholder imgs — leave structure, add empty alt + title for a11y
    return `<img alt="" title="Decorative placeholder">`;
  }
  let src = tag.match(/\bsrc=(["'])(.*?)\1/i)?.[2] || "";
  if (src.endsWith(".jpg") || src.endsWith(".jpeg") || src.endsWith(".png")) {
    const web = src.replace(/\.(jpe?g|png)$/i, ".webp");
    if (convertMap.has(src) || fs.existsSync(path.join(PUB, web.replace(/^\//, "")))) {
      tag = tag.replace(src, web);
      src = web;
    }
  }

  const isHomeHero = /\/images\/home-hero-[1-4](-m)?\.webp/.test(src);
  let altM = tag.match(/\balt=(["'])(.*?)\1/i);
  let titleM = tag.match(/\btitle=(["'])(.*?)\1/i);

  let alt = altM ? altM[2] : null;
  let title = titleM ? titleM[2] : null;

  if (isHomeHero) {
    alt = HOME_HERO_ALT;
  } else if (alt === null || alt === "") {
    // keep empty alt only for known decorative posters when we still want a title
    const decorative =
      /vx-poster|aria-hidden="true"/i.test(tag) ||
      /seo-vx-poster/i.test(src);
    if (decorative && alt === "") {
      // keep empty alt
    } else if (alt === null || alt === "") {
      alt = describeFromSrc(src);
    }
  }

  if (!title) title = titleFromAlt(alt || describeFromSrc(src));

  if (altM) {
    tag = tag.replace(/\balt=(["'])(.*?)\1/i, `alt="${alt.replace(/"/g, "&quot;")}"`);
  } else {
    tag = tag.replace(/^<img\b/i, `<img alt="${(alt || "").replace(/"/g, "&quot;")}"`);
  }
  if (titleM) {
    tag = tag.replace(
      /\btitle=(["'])(.*?)\1/i,
      `title="${title.replace(/"/g, "&quot;")}"`
    );
  } else {
    tag = tag.replace(/\/?>$/, ` title="${title.replace(/"/g, "&quot;")}">`);
  }
  return tag;
}

const bodies = walk(path.join(ROOT, "lib")).filter((f) => f.endsWith("-body.html"));
for (const file of bodies) {
  let html = fs.readFileSync(file, "utf8");
  const next = html.replace(/<img\b[^>]*>/gi, (tag) => fixImgTag(tag));
  if (next !== html) {
    fs.writeFileSync(file, next);
    console.log("alt/title", path.basename(file));
  }
}

/* ── verify ── */
let over = 0;
for (const f of walk(PUB).filter((x) => /\.(jpe?g|png|gif|webp|avif)$/i.test(x))) {
  if (skipName.test(path.basename(f))) continue;
  if (/\.(jpe?g|png|gif|avif)$/i.test(f)) {
    console.warn("STILL RASTER", path.relative(PUB, f));
  }
  if (fs.statSync(f).size > MAX) {
    over++;
    console.warn("OVER 80KB", path.relative(PUB, f), (fs.statSync(f).size / 1024).toFixed(1));
  }
}
console.log("over80 remaining", over);
console.log("done");
