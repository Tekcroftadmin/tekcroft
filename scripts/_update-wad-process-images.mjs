/**
 * Web & App Development #process: encode folder photos to WebP <80KB and
 * wire them into .eg-face as per-step .eg-pic (AID / SEO pattern).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/web-and-app-development-services-20261104T090844Z-1-001/web-and-app-development-services/process section";
const OUT = path.join(ROOT, "public", "images");
const BODY = path.join(ROOT, "lib", "web-and-app-development-body.html");
const CSS = path.join(ROOT, "app", "web-and-app-development.css");
const MAX = 80 * 1024;
const PAGE = "#web-and-app-development-page";

const STEPS = [
  {
    i: 0,
    folder: "Discovery and Written Scope",
    slug: "wad-proc-discovery",
    alt: "Team reviewing project scope documents, Gantt charts, and planning dashboards during discovery",
    title: "Discovery and Written Scope",
  },
  {
    i: 1,
    folder: "UXUI Design and Clickable Prototype",
    slug: "wad-proc-uxui",
    alt: "Designers reviewing mobile app wireframes and a clickable prototype on monitor and tablet",
    title: "UX/UI Design and Clickable Prototype",
  },
  {
    i: 2,
    folder: "Development in Two-Week Sprints",
    slug: "wad-proc-sprints",
    alt: "Developers collaborating on application dashboards and database schema during a two-week sprint",
    title: "Development in Two-Week Sprints",
  },
  {
    i: 3,
    folder: "QA and Launch",
    slug: "wad-proc-qa",
    alt: "QA engineer testing the web app across laptop, tablet, and multiple mobile devices before launch",
    title: "QA and Launch",
  },
  {
    i: 4,
    folder: "Support and Growth",
    slug: "wad-proc-support",
    alt: "Engineer monitoring the live app health dashboard across laptop, tablet, and phone after launch",
    title: "Support and Growth",
  },
];

function pickSrc(folder) {
  const dir = path.join(BASE, folder);
  if (!fs.existsSync(dir)) throw new Error("missing folder " + folder);
  const files = fs
    .readdirSync(dir)
    .filter((n) => /\.(jpe?g|png|webp)$/i.test(n))
    .filter((n) => /^\d+\./i.test(n))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
  if (!files.length) throw new Error("no numbered images in " + dir);
  const preferred = files.find((f) => /^1\./i.test(f));
  return path.join(dir, preferred || files[0]);
}

async function toWebp(srcPath) {
  let best = null;
  for (const [size, qStart] of [
    [720, 72],
    [680, 66],
    [640, 60],
    [600, 54],
    [560, 48],
    [520, 44],
  ]) {
    let lo = 38,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(srcPath)
        .rotate()
        .resize({
          width: size,
          height: size,
          fit: "cover",
          position: "centre",
        })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX) {
        best = { buf, size, q };
        lo = q + 1;
      } else {
        hi = q - 1;
      }
    }
    if (best) break;
  }
  if (!best) throw new Error("could not fit under 80KB: " + srcPath);
  return best;
}

function writeHashed(slug, buf) {
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const dest = path.join(OUT, name);
  fs.writeFileSync(dest, buf);
  for (const f of fs.readdirSync(OUT)) {
    if (f.startsWith(slug + "-") && f.endsWith(".webp") && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
    }
  }
  return { name, href: "/images/" + name, bytes: buf.length };
}

async function main() {
  fs.mkdirSync(OUT, { recursive: true });
  const results = [];
  for (const step of STEPS) {
    const src = pickSrc(step.folder);
    const { buf, size, q } = await toWebp(src);
    const meta = await sharp(buf).metadata();
    const written = writeHashed(step.slug, buf);
    results.push({
      ...step,
      ...written,
      width: meta.width,
      height: meta.height,
      encode: `${size}@q${q}`,
      src: path.basename(src),
    });
    console.log(
      `${step.i} ${step.title}: ${written.name} ${(written.bytes / 1024).toFixed(1)}KB (${size}@q${q} from ${path.basename(src)})`
    );
  }

  let html = fs.readFileSync(BODY, "utf8");
  const pics = results
    .map(
      (r) =>
        `          <span class="eg-pic"><img src="${r.href}" width="${r.width}" height="${r.height}" alt="${r.alt.replace(/"/g, "&quot;")}" title="${r.title.replace(/&/g, "&amp;")}" decoding="async" loading="lazy"></span>`
    )
    .join("\n");

  const faceRe =
    /(<div class="eg-face">)\s*([\s\S]*?)(\s*<\/div>\s*\n\s*<\/div>\s*\n\s*<div class="eg-list">)/;
  if (!faceRe.test(html)) throw new Error("eg-face block not found");

  html = html.replace(faceRe, (_, open, _inner, close) => {
    return `${open}
${pics}
          <span class="eg-lab">The 5-stage process</span>
          <b class="eg-num" aria-hidden="true"><i>01</i><i>02</i><i>03</i><i>04</i><i>05</i></b>
          <span class="eg-rule" aria-hidden="true"></span>
          <span class="eg-of">of five stages</span>
${close}`;
  });
  fs.writeFileSync(BODY, html);
  console.log("body updated");

  let css = fs.readFileSync(CSS, "utf8");
  const marker = "/* WAD #process per-step disc photos */";
  const cssBlock = `
${marker}
${PAGE} #process .eg-face{background:#0A0C0E; isolation:isolate;}
${PAGE} #process .eg-face::before{display:none;}
${PAGE} #process .eg-face::after{z-index:1;}
${PAGE} #process .eg-pic{
  position:absolute; inset:0; z-index:0;
  background:none;
  opacity:0; visibility:hidden;
  transition:opacity .45s var(--ease), visibility 0s linear .45s;
}
${PAGE} #process .eg[data-at="0"] .eg-pic:nth-child(1),
${PAGE} #process .eg[data-at="1"] .eg-pic:nth-child(2),
${PAGE} #process .eg[data-at="2"] .eg-pic:nth-child(3),
${PAGE} #process .eg[data-at="3"] .eg-pic:nth-child(4),
${PAGE} #process .eg[data-at="4"] .eg-pic:nth-child(5),
${PAGE} #process .eg:not([data-at]) .eg-pic:nth-child(1){
  opacity:1; visibility:visible; transition-delay:0s;
}
${PAGE} #process .eg-pic > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
  max-width:none;
}
${PAGE} #process .eg-face > *:not(.eg-pic){position:relative; z-index:2;}
`;

  if (css.includes(marker)) {
    css = css.replace(
      /\/\* WAD #process per-step disc photos \*\/[\s\S]*?(?=\n\/\* |\nhtml body|$)/,
      cssBlock.trim() + "\n"
    );
  } else {
    const anchor = `${PAGE} .eg-face > *{position:relative; z-index:1;}`;
    if (!css.includes(anchor)) throw new Error("eg-face anchor missing: " + anchor);
    css = css.replace(anchor, anchor + "\n" + cssBlock);
  }
  fs.writeFileSync(CSS, css);
  console.log("css updated");
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
