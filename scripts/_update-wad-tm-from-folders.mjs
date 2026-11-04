/**
 * Replace "Services We Offer" tm-bg images on web-and-app-development
 * from Downloads/Services folders → WebP ≤80KB with content-matched alt/title.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/web-and-app-development-services-20261104T090844Z-1-001/web-and-app-development-services/Services";
const OUT = path.join(ROOT, "public", "images", "web-and-app-development");
const BODY = path.join(ROOT, "lib", "web-and-app-development-body.html");
const MAX = 80 * 1024;

const PANELS = [
  {
    i: 0,
    folder: "Custom Web Application Development",
    file: "2.jpg",
    alt: "Developer reviewing a custom web application analytics dashboard with charts and data tables on a desktop monitor in a modern office",
    title: "Custom Web Application Development — dashboards and workflows built around your process",
  },
  {
    i: 1,
    folder: "Mobile App Development for iOS and Android",
    file: "2.jpg",
    alt: "iPhone and Android phones side by side showing a polished mobile app dashboard with charts and navigation",
    title: "Mobile App Development for iOS and Android — native apps that feel the same on both platforms",
  },
  {
    i: 2,
    folder: "Custom Software Development",
    file: "2.jpg",
    alt: "Engineer working on custom business software with complex screens and system panels on a large monitor",
    title: "Custom Software Development — internal tools and platforms designed for how your team works",
  },
  {
    i: 3,
    folder: "Website Design and Development",
    file: "2.jpg",
    alt: "Designer and developer reviewing a marketing website layout on a desktop screen in a bright studio",
    title: "Website Design and Development — sites built to convert visitors into leads and customers",
  },
  {
    i: 4,
    folder: "UIUX Design for Web and Mobile Apps",
    file: "2.jpg",
    alt: "Designers collaborating over user journey maps, wireframes, personas, and sticky notes on a studio desk",
    title: "UI/UX Design for Web and Mobile Apps — research, wireframes, and interfaces before build",
  },
  {
    i: 5,
    folder: "API Development and Integrations",
    file: "2.jpg",
    alt: "Developer connecting systems through an API and integrations workspace with code and flow diagrams on screen",
    title: "API Development and Integrations — connect your app to payments, CRMs, and the tools you already use",
  },
  {
    i: 6,
    folder: "MVP Development for Startups",
    file: "2.jpg",
    alt: "Startup team reviewing an MVP product prototype and launch checklist on a laptop in a modern workspace",
    title: "MVP Development for Startups — ship a focused first version fast, then iterate with real users",
  },
  {
    i: 7,
    folder: "App Modernization and Rescue",
    file: "2.jpg",
    alt: "Engineering team modernizing a legacy application on dual monitors with architecture diagrams beside the desk",
    title: "App Modernization and Rescue — rebuild fragile systems into stable, maintainable products",
  },
];

function findDesktop(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder: " + folder);
  const sub = fs
    .readdirSync(dir, { withFileTypes: true })
    .find((d) => d.isDirectory() && /^desktop$/i.test(d.name));
  if (!sub) throw new Error("no Desktop in " + folder);
  return path.join(dir, sub.name);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [w, qStart] of [
    [1400, 72],
    [1200, 68],
    [1100, 62],
    [1024, 56],
    [960, 50],
    [880, 46],
  ]) {
    let lo = 40,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: w,
          height: Math.round((w * 842) / 1400),
          fit: "cover",
          position: "attention",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, w, q, bytes: buf.length };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.bytes < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + srcPath);
  const meta = await sharp(best.buf).metadata();
  const hash = crypto.createHash("sha1").update(best.buf).digest("hex").slice(0, 10);
  return { ...best, meta, hash };
}

function escAttr(s) {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/"/g, "&quot;");
}

fs.mkdirSync(OUT, { recursive: true });

const oldFiles = new Set(
  fs.readdirSync(OUT).filter((n) => /^wad-tm-\d{2}-[a-f0-9]+\.webp$/i.test(n))
);

let html = fs.readFileSync(BODY, "utf8");
const results = [];

for (const p of PANELS) {
  const src = path.join(findDesktop(p.folder), p.file);
  if (!fs.existsSync(src)) throw new Error("missing " + src);
  const { buf, w, q, meta, hash } = await toWebp(src);
  const name = `wad-tm-${String(p.i + 1).padStart(2, "0")}-${hash}.webp`;
  fs.writeFileSync(path.join(OUT, name), buf);
  oldFiles.delete(name);

  const img = `<img src="/images/web-and-app-development/${name}" width="${meta.width}" height="${meta.height}" alt="${escAttr(p.alt)}" title="${escAttr(p.title)}" decoding="async" loading="lazy">`;
  const replacement = `<span class="tm-bg" aria-hidden="true">${img}<span class="tm-veil"></span></span>`;

  const itemRe = new RegExp(
    `(<div class="tm-item[^"]*"[^>]*data-i="${p.i}"[^>]*>)\\s*<span class="tm-bg" aria-hidden="true">[\\s\\S]*?<span class="tm-veil"><\\/span><\\/span>`,
    "m"
  );
  if (!itemRe.test(html)) {
    throw new Error("html match failed for panel " + (p.i + 1));
  }
  html = html.replace(itemRe, `$1${replacement}`);

  results.push({
    i: p.i,
    file: `/images/web-and-app-development/${name}`,
    kb: +(buf.length / 1024).toFixed(1),
    enc: `w${w}q${q}`,
    title: p.title,
  });
  console.log(
    `P${p.i + 1}`,
    name,
    results.at(-1).kb + "KB",
    path.basename(src)
  );
}

for (const f of oldFiles) {
  fs.unlinkSync(path.join(OUT, f));
  console.log("deleted", f);
}

fs.writeFileSync(BODY, html);
console.log("updated body");
console.log(JSON.stringify(results, null, 2));
