import fs from "fs";
import path from "path";
import crypto from "crypto";
import sharp from "sharp";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public", "images", "web-and-app-development");
const CSS = path.join(ROOT, "app", "web-and-app-development.css");
const MAX = 80 * 1024;
const DESK_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/3-027bd14d-a7cf-4bc5-82ef-bc75feafb351.jpg";
const MOB_SRC =
  "C:/Users/Super/.cursor/projects/c-Tekcroft/assets/2-02d31921-0b0f-427e-bdcc-2c0516d70537.jpg";

fs.mkdirSync(OUT, { recursive: true });

async function encode(srcPath, { maxW, maxH = null, cover = false }) {
  const buf = fs.readFileSync(srcPath);
  const pipeline = sharp(buf, { failOn: "none" });
  let width = maxW;
  let quality = 82;
  let out;
  let meta;

  for (;;) {
    let img = pipeline.clone().rotate();
    if (cover && maxW && maxH) {
      img = img.resize({
        width: maxW,
        height: maxH,
        fit: "cover",
        position: "centre",
      });
    } else {
      img = img.resize({ width, withoutEnlargement: true });
    }
    out = await img
      .webp({ quality, effort: 6, smartSubsample: true })
      .toBuffer();
    meta = await sharp(out).metadata();
    if (out.length <= MAX) break;
    if (quality > 55) quality -= 6;
    else if (!cover && width > 720) {
      width -= 80;
      quality = 78;
    } else if (quality > 40) quality -= 5;
    else break;
  }
  if (out.length > MAX) {
    throw new Error(`still over 80KB: ${(out.length / 1024).toFixed(1)}KB`);
  }
  return { out, meta, quality };
}

function writeNamed(prefix, { out, meta, quality }) {
  const hash = crypto.createHash("sha1").update(out).digest("hex").slice(0, 10);
  const name = `${prefix}-${hash}.webp`;
  for (const f of fs.readdirSync(OUT)) {
    if (new RegExp(`^${prefix}-.*\\.webp$`, "i").test(f) && f !== name) {
      fs.unlinkSync(path.join(OUT, f));
      console.log("deleted", f);
    }
  }
  fs.writeFileSync(path.join(OUT, name), out);
  return {
    file: `/images/web-and-app-development/${name}`,
    kb: +(out.length / 1024).toFixed(1),
    q: quality,
    w: meta.width,
    h: meta.height,
  };
}

const desk = writeNamed(
  "wad-cta-shot",
  await encode(DESK_SRC, { maxW: 1400 })
);
console.log("desk", desk);

const mob = writeNamed(
  "wad-cta-shot-m",
  await encode(MOB_SRC, { maxW: 900, maxH: 1200, cover: true })
);
console.log("mob", mob);

let css = fs.readFileSync(CSS, "utf8");

// Token on the page root
css = css.replace(
  /--cta-shot:url\("\/images\/web-and-app-development\/wad-cta-shot-[a-f0-9]+\.webp"\);/g,
  `--cta-shot:url("${desk.file}");`
);

const marker = "/* WAD CTA band photo — desktop landscape / mobile portrait */";
const ctaBlock = `${marker}
#web-and-app-development-page #contact.cta{
  --cta-shot:url("${desk.file}");
}
@media (max-width:960px){
  #web-and-app-development-page #contact.cta{
    --cta-shot:url("${mob.file}");
  }
}
`;

if (css.includes(marker)) {
  css = css.replace(
    /\/\* WAD CTA band photo — desktop landscape \/ mobile portrait \*\/[\s\S]*?(?=\n#web-and-app-development-page #contact\.cta > \.wrap\{)/,
    ctaBlock
  );
} else {
  // Replace the single-shot block above .wrap rules
  const single =
    /\/\* Match shared CTA band[\s\S]*?#web-and-app-development-page #contact\.cta\{\s*--cta-shot:url\("[^"]+"\);\s*\}\s*/;
  if (!single.test(css)) {
    throw new Error("CTA --cta-shot block not found");
  }
  css = css.replace(
    single,
    `/* Match shared CTA band (tekcroft.css / other service pages): page photo + wrap padding */\n${ctaBlock}`
  );
}

fs.writeFileSync(CSS, css);
console.log("css updated");

fs.writeFileSync(
  path.join(ROOT, "scripts", "_wad-cta-map.json"),
  JSON.stringify({ "wad-cta-shot": desk, "wad-cta-shot-m": mob }, null, 2) +
    "\n"
);
console.log("done");
