/**
 * About Us #how-we-work: encode Map/Decide/Build/Stay photos to WebP <80KB
 * and wire them into .eg-face as per-step .eg-pic (same pattern as WAD/ecommerce).
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const BASE =
  "C:/Users/Super/Downloads/about us-20261104T112627Z-1-001/about us/Process Section";
const OUT = path.join(ROOT, "public", "images", "about");
const BODY = path.join(ROOT, "lib", "about-us-body.html");
const CSS = path.join(ROOT, "app", "about-us.css");
const MAX = 80 * 1024;

const STEPS = [
  {
    i: 0,
    folder: "Map",
    slug: "about-proc-map",
    alt: "Tekcroft team mapping a client process on a whiteboard with sticky notes during a workshop",
    title: "Map — How We Work",
  },
  {
    i: 1,
    folder: "Decide",
    slug: "about-proc-decide",
    alt: "Solution architect presenting Tekcroft system architecture options on a screen during a planning meeting",
    title: "Decide — How We Work",
  },
  {
    i: 2,
    folder: "Build",
    slug: "about-proc-build",
    alt: "Developer building software and dashboards on dual monitors in the Tekcroft engineering studio",
    title: "Build — How We Work",
  },
  {
    i: 3,
    folder: "Stay",
    slug: "about-proc-stay",
    alt: "Tekcroft strategists reviewing KPI charts and performance reports with a client after launch",
    title: "Stay — How We Work",
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
  return { name, href: "/images/about/" + name, bytes: buf.length };
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
        `          <span class="eg-pic"><img src="${r.href}" width="${r.width}" height="${r.height}" alt="${r.alt.replace(/"/g, "&quot;")}" title="${r.title.replace(/"/g, "&quot;")}" decoding="async" loading="lazy"></span>`
    )
    .join("\n");

  const faceRe =
    /<div class="eg-face"[^>]*>\s*[\s\S]*?\s*<\/div>\s*(?=\s*<\/div>\s*\n\s*<div class="eg-list">)/;
  if (!faceRe.test(html)) throw new Error("eg-face block not found in how-we-work");

  html = html.replace(
    faceRe,
    `<div class="eg-face">
${pics}
          <span class="eg-lab">How we work</span>
          <b class="eg-num" aria-hidden="true"><i>01</i><i>02</i><i>03</i><i>04</i></b>
          <span class="eg-rule" aria-hidden="true"></span>
          <span class="eg-of">of four steps</span>
        </div>
`
  );
  fs.writeFileSync(BODY, html);
  console.log("body updated");

  let css = fs.readFileSync(CSS, "utf8");
  const marker = "/* About #how-we-work per-step disc photos */";
  const cssBlock = `
${marker}
#hwww #how-we-work .eg-face,
#how-we-work .eg-face{
  background:#0A0C0E;
  isolation:isolate;
}
#hwww #how-we-work .eg-face::before,
#how-we-work .eg-face::before{display:none;}
#hwww #how-we-work .eg-face::after,
#how-we-work .eg-face::after{
  z-index:1;
  background:
    radial-gradient(54% 55% at 50% 48%, rgba(0,0,0,.42) 0%, transparent 72%),
    linear-gradient(180deg, rgba(0,0,0,.58) 0%, rgba(0,0,0,.48) 42%,
                    rgba(0,0,0,.82) 100%);
}
#hwww #how-we-work .eg-pic,
#how-we-work .eg-pic{
  position:absolute; inset:0; z-index:0;
  background:none;
  opacity:0; visibility:hidden;
  transition:opacity .45s var(--ease), visibility 0s linear .45s;
}
#hwww #how-we-work .eg[data-at="0"] .eg-pic:nth-child(1),
#hwww #how-we-work .eg[data-at="1"] .eg-pic:nth-child(2),
#hwww #how-we-work .eg[data-at="2"] .eg-pic:nth-child(3),
#hwww #how-we-work .eg[data-at="3"] .eg-pic:nth-child(4),
#hwww #how-we-work .eg:not([data-at]) .eg-pic:nth-child(1),
#how-we-work .eg[data-at="0"] .eg-pic:nth-child(1),
#how-we-work .eg[data-at="1"] .eg-pic:nth-child(2),
#how-we-work .eg[data-at="2"] .eg-pic:nth-child(3),
#how-we-work .eg[data-at="3"] .eg-pic:nth-child(4),
#how-we-work .eg:not([data-at]) .eg-pic:nth-child(1){
  opacity:1; visibility:visible; transition-delay:0s;
}
#hwww #how-we-work .eg-pic > img,
#how-we-work .eg-pic > img{
  position:absolute; inset:0; width:100%; height:100%;
  object-fit:cover; object-position:center; display:block;
  max-width:none;
}
#hwww #how-we-work .eg-face > *:not(.eg-pic),
#how-we-work .eg-face > *:not(.eg-pic){position:relative; z-index:2;}
`;

  if (css.includes(marker)) {
    css = css.replace(
      /\/\* About #how-we-work per-step disc photos \*\/[\s\S]*?(?=\n\/\* [A-Z]|\nhtml body|$)/,
      cssBlock.trim() + "\n"
    );
  } else {
    css = css.trimEnd() + "\n" + cssBlock;
  }
  fs.writeFileSync(CSS, css);
  console.log("css updated");
  console.log("done");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
