/**
 * Extract web-and-app-development-services HTML → /web-and-app-development-services
 * Hub page for the former "Web and Software Development" mega-menu pillar.
 * Run: node scripts/extract-web-and-app-development.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_WAD_HTML ||
  "c:\\Users\\Super\\Downloads\\web-and-app-development-services (2).html";
const IMG_DIR = path.join(ROOT, "public", "images", "web-and-app-development");
const PREFIX = "wad";
const SCOPE = "#web-and-app-development-page";

fs.mkdirSync(IMG_DIR, { recursive: true });

const SKIP_STYLE_IDS = new Set([
  "mm-styles",
  "mm-veil-lighter",
  "mm-bottom-copy",
  "mm-core-pills",
  "mm-core-strong",
  "mm-spacing",
  "mm-core-v3",
  "mm-core-fit",
  "mm-current",
  "mm-cta2",
  "foot-styles",
  "foot-lift",
  "foot-final",
]);

const SKIP_SCRIPT_IDS = new Set([
  "mm-script",
  "mm-core-icons",
  "mm-current-js",
]);

function hashBuf(buf) {
  return crypto.createHash("sha1").update(buf).digest("hex").slice(0, 10);
}

async function saveDataUri(dataUri, hint) {
  const m = dataUri.match(/^data:image\/([\w+.-]+);base64,(.+)$/i);
  if (!m) return null;
  const subtype = m[1].toLowerCase();
  const buf = Buffer.from(m[2], "base64");
  const h = hashBuf(buf);
  const safeHint = String(hint || "img")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 40);

  if (subtype.includes("svg")) {
    const file = `${PREFIX}-${safeHint}-${h}.svg`;
    const dest = path.join(IMG_DIR, file);
    if (!fs.existsSync(dest)) fs.writeFileSync(dest, buf);
    return `/images/web-and-app-development/${file}`;
  }

  const maxW = safeHint.includes("hero")
    ? 1920
    : safeHint.includes("shot") ||
        safeHint.includes("cta") ||
        safeHint.includes("faq") ||
        safeHint.includes("tm")
      ? 1400
      : safeHint.startsWith("css") || safeHint.startsWith("img")
        ? 1200
        : 800;
  const file = `${PREFIX}-${safeHint}-${h}.webp`;
  const dest = path.join(IMG_DIR, file);
  if (!fs.existsSync(dest)) {
    let quality = 82;
    let out;
    let width = maxW;
    for (;;) {
      let pipeline = sharp(buf, { failOn: "none" }).rotate();
      const meta = await sharp(buf, { failOn: "none" }).metadata();
      if ((meta.width || width) > width) {
        pipeline = sharp(buf, { failOn: "none" })
          .rotate()
          .resize({ width, withoutEnlargement: true });
      }
      out = await pipeline.webp({ quality, effort: 6 }).toBuffer();
      if (out.length <= 100 * 1024 || quality <= 48) break;
      if (quality > 60) quality -= 6;
      else if (width > 720) {
        width -= 80;
        quality = 72;
      } else quality -= 4;
    }
    fs.writeFileSync(dest, out);
  }
  return `/images/web-and-app-development/${file}`;
}

async function replaceAsync(str, re, fn) {
  const parts = [];
  let last = 0;
  let m;
  const r = new RegExp(
    re.source,
    re.flags.includes("g") ? re.flags : re.flags + "g"
  );
  while ((m = r.exec(str))) {
    parts.push(str.slice(last, m.index));
    parts.push(await fn(m));
    last = m.index + m[0].length;
  }
  parts.push(str.slice(last));
  return parts.join("");
}

function scopeCss(css, scope) {
  const blocks = [];
  let i = 0;
  const n = css.length;

  function skipComment(s, idx) {
    if (s.startsWith("/*", idx)) {
      const end = s.indexOf("*/", idx + 2);
      return end < 0 ? s.length : end + 2;
    }
    return idx;
  }

  while (i < n) {
    while (i < n && /\s/.test(css[i])) i++;
    while (i < n && css.startsWith("/*", i)) {
      const c0 = i;
      i = skipComment(css, i);
      blocks.push(css.slice(c0, i));
      while (i < n && /\s/.test(css[i])) i++;
    }
    if (i >= n) break;

    if (css[i] === "@") {
      const start = i;
      while (i < n && css[i] !== "{") {
        if (css.startsWith("/*", i)) i = skipComment(css, i);
        else i++;
      }
      if (i >= n) break;
      const header = css
        .slice(start, i)
        .replace(/\/\*[\s\S]*?\*\//g, " ")
        .trim();
      let depth = 0;
      const bodyStart = i;
      for (; i < n; i++) {
        if (css.startsWith("/*", i)) {
          i = skipComment(css, i) - 1;
          continue;
        }
        if (css[i] === "{") depth++;
        else if (css[i] === "}") {
          depth--;
          if (depth === 0) {
            i++;
            break;
          }
        }
      }
      const inner = css.slice(bodyStart + 1, i - 1);
      if (/^@(media|supports|layer)\b/i.test(header)) {
        blocks.push(`${header}{\n${scopeCss(inner, scope)}\n}`);
      } else {
        blocks.push(css.slice(start, i));
      }
      continue;
    }

    let selBuf = "";
    while (i < n && css[i] !== "{") {
      if (css.startsWith("/*", i)) {
        const c0 = i;
        i = skipComment(css, i);
        if (!selBuf.trim()) blocks.push(css.slice(c0, i));
        continue;
      }
      selBuf += css[i];
      i++;
    }
    if (i >= n) break;
    const selector = selBuf.trim();
    let depth = 0;
    const bodyStart = i;
    for (; i < n; i++) {
      if (css.startsWith("/*", i)) {
        i = skipComment(css, i) - 1;
        continue;
      }
      if (css[i] === "{") depth++;
      else if (css[i] === "}") {
        depth--;
        if (depth === 0) {
          i++;
          break;
        }
      }
    }
    const body = css.slice(bodyStart, i);
    if (!selector) continue;

    const parts = [];
    let buf = "";
    let paren = 0;
    for (let k = 0; k < selector.length; k++) {
      const ch = selector[k];
      if (ch === "(" || ch === "[") paren++;
      else if (ch === ")" || ch === "]") paren = Math.max(0, paren - 1);
      if (ch === "," && paren === 0) {
        parts.push(buf.trim());
        buf = "";
      } else buf += ch;
    }
    if (buf.trim()) parts.push(buf.trim());

    const scoped = parts
      .filter(Boolean)
      .map((s) => {
        if (s.startsWith("@")) return s;
        if (s === ":root" || s === "html") return scope;
        if (s === "body") return scope;
        if (/^html\[/.test(s)) {
          return s.replace(/^html((?:\[[^\]]*\])*)/, `html$1 ${scope}`);
        }
        if (s.startsWith(scope)) return s;
        return `${scope} ${s}`;
      })
      .join(",\n");
    blocks.push(`${scoped}${body}`);
  }
  return blocks.join("\n\n");
}

console.log("Reading:", SRC);
const html = fs.readFileSync(SRC, "utf8");

const styleRe = /<style([^>]*)>([\s\S]*?)<\/style>/gi;
const styleParts = [];
let sm;
while ((sm = styleRe.exec(html))) {
  const id = (sm[1].match(/\bid=["']([^"']+)["']/) || [])[1] || "";
  if (id && SKIP_STYLE_IDS.has(id)) {
    console.log("skip style", id);
    continue;
  }
    let cssText = sm[2];
  /* tk-styles in source has an extra closing brace before prefers-reduced-motion */
  if (id === "tk-styles") {
    cssText = cssText.replace(
      /(\.tk-items\{padding-left:0; border-left:0; padding-top:16px; border-top:1px solid var\(--border-soft\);\}\s*\}\s*)\}(\s*@media \(prefers-reduced-motion:reduce\))/,
      "$1$2"
    );
  }
  styleParts.push(`/* === ${id || "style"} === */\n${cssText}`);
}

let css =
  `/* Web and App Development Services — scoped under ${SCOPE} */\n` +
  styleParts.join("\n\n");

let namedIdx = 0;
css = await replaceAsync(
  css,
  /(--([a-z0-9-]+))\s*:\s*url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    namedIdx++;
    const prop = m[2] || `var${namedIdx}`;
    const file = await saveDataUri(m[3], prop);
    return `${m[1]}:url("${file}")`;
  }
);

let anon = 0;
css = await replaceAsync(
  css,
  /url\(\s*["']?(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)["']?\s*\)/gi,
  async (m) => {
    anon++;
    const file = await saveDataUri(m[1], `css${anon}`);
    return `url("${file}")`;
  }
);

css = css.replaceAll(
  'url("[B64]")',
  `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8' fill='none'%3E%3Cpath d='M1 1.5 6 6.5l5-5' stroke='%236B7684' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E")`
);

console.log("Scoping CSS…");
css = scopeCss(css, SCOPE);
css += `

/* next/font bridge */
${SCOPE}{
  --font: var(--font-inter), -apple-system, BlinkMacSystemFont, sans-serif;
  --font-display: var(--font-sora), var(--font-inter), sans-serif;
}
${SCOPE} .eh-sprite{
  position:absolute!important;width:0!important;height:0!important;overflow:hidden!important;
}
`;

const outCss = path.join(ROOT, "app", "web-and-app-development.css");
fs.writeFileSync(outCss, css);
console.log("CSS:", outCss, `${(css.length / 1024).toFixed(0)} KB`);

const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("No body");
let body = bodyMatch[1].replace(/<script\b[\s\S]*?<\/script>/gi, "").trim();

let imgN = 0;
body = await replaceAsync(body, /src="(data:image\/[^"]+)"/gi, async (m) => {
  imgN++;
  const file = await saveDataUri(m[1], `img${imgN}`);
  return `src="${file}"`;
});

body = body.replace(
  /<svg class="eh-sprite"/,
  '<svg class="eh-sprite" width="0" height="0" style="position:absolute;width:0;height:0;overflow:hidden"'
);

const NAV_LINKS = `    <div class="nav-links">
      <a href="/">HOME</a>
      <a href="/about-us">ABOUT US</a>
      <button class="mm-trigger" id="mmTrigger" type="button" aria-expanded="false" aria-haspopup="true" aria-controls="mmPanel">SERVICES<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6"/></svg></button>
      <a href="/case-studies">CASE STUDIES</a>
      <a href="/blog">BLOG</a>
      <a href="/contact">CONTACT US</a>
    </div>`;
const MNAV = `  <div class="mnav js-mnav">
    <a href="/">HOME</a>
    <a href="/about-us">ABOUT US</a>
    <div id="mmMobile"></div>
    <a href="/case-studies">CASE STUDIES</a>
    <a href="/blog">BLOG</a>
    <a href="/contact">CONTACT US</a>
    <button class="btn btn-primary" type="button" data-jump>Get a Free Proposal</button>
  </div>`;
body = body.replace(
  /<div class="nav-links">[\s\S]*?<\/div>\s*<div class="nav-right">/,
  `${NAV_LINKS}\n    <div class="nav-right">`
);
body = body.replace(
  /<div class="mnav js-mnav">[\s\S]*?<\/div>\s*(?=<\/div>\s*<\/nav>)/,
  `${MNAV}\n`
);

const siteFooter = fs
  .readFileSync(path.join(ROOT, "lib", "site-footer.html"), "utf8")
  .trim();
body = body.replace(
  /(?:<!--[^\n]*FOOTER[^\n]*-->\s*)?(?:<div class="ftm"[\s\S]*?<\/footer>|<footer class="ft4"[\s\S]*?<\/footer>)/i,
  siteFooter
);

const navChunk = body.match(/^[\s\S]*?<\/nav>\s*/);
if (navChunk) {
  const navHtml = navChunk[0];
  const rest = body.slice(navHtml.length);
  body = `${navHtml}<div id="web-and-app-development-page" class="web-and-app-development-page">\n${rest}\n</div>\n`;
} else {
  body = `<div id="web-and-app-development-page" class="web-and-app-development-page">\n${body}\n</div>\n`;
}

const outHtml = path.join(ROOT, "lib", "web-and-app-development-body.html");
fs.writeFileSync(outHtml, body);
console.log("Body:", outHtml, `${(body.length / 1024).toFixed(0)} KB`);

const scripts = [
  ...html.matchAll(
    /<script(?![^>]*\btype=["']application\/ld\+json)([^>]*)>([\s\S]*?)<\/script>/gi
  ),
].filter((m) => !/\bsrc=/i.test(m[1] || ""));

const bundled = [];
for (let i = 0; i < scripts.length; i++) {
  const m = scripts[i];
  const id = (m[1].match(/\bid=["']([^"']+)["']/) || [])[1] || `block-${i}`;
  if (SKIP_SCRIPT_IDS.has(id)) {
    console.log("skip script", id);
    continue;
  }
  bundled.push(`/* === ${id} === */\n${m[2]}`);
}

let js = bundled.join("\n\n");
let jsImg = 0;
js = await replaceAsync(
  js,
  /"(data:image\/[a-zA-Z0-9+.-]+;base64,[A-Za-z0-9+/=]+)"/g,
  async (m) => {
    jsImg++;
    const file = await saveDataUri(m[1], `js${jsImg}`);
    return `"${file}"`;
  }
);

const outJs = path.join(ROOT, "public", "tekcroft-web-and-app-development.js");
fs.writeFileSync(outJs, js);
console.log("JS:", outJs, `${(js.length / 1024).toFixed(0)} KB`);

const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
const descMatch = html.match(
  /<meta\s+name=["']description["']\s+content=["']([^"']*)["']/i
);
const decodeEntities = (s) =>
  s
    .replace(/&rsquo;/g, "\u2019")
    .replace(/&lsquo;/g, "\u2018")
    .replace(/&rdquo;/g, "\u201D")
    .replace(/&ldquo;/g, "\u201C")
    .replace(/&amp;/g, "&")
    .replace(/&mdash;/g, "\u2014")
    .replace(/&ndash;/g, "\u2013")
    .replace(/&#8209;/g, "\u2011");

fs.writeFileSync(
  path.join(ROOT, "lib", "web-and-app-development-meta.json"),
  JSON.stringify(
    {
      title: titleMatch
        ? decodeEntities(titleMatch[1].trim())
        : "Web and App Development Services | Custom Web & Mobile Apps",
      description: descMatch
        ? decodeEntities(descMatch[1])
        : "Tired of app projects that run over budget? Our web and app development services put cost and timeline in writing before coding. Get a free consultation.",
      canonical: "https://www.tekcroft.com/web-and-app-development-services",
      keywords: "Web and App Development Services",
    },
    null,
    2
  ) + "\n"
);

const heroSrc =
  (body.match(/class="hs-bg"[\s\S]*?<img[^>]+src="([^"]+)"/i) ||
    body.match(/fetchpriority="high"[^>]*src="([^"]+)"/i) ||
    body.match(/src="([^"]+)"[^>]*fetchpriority="high"/i) ||
    [])[1] || "/images/web-and-app-development/wad-hero.webp";

const heroMobile =
  (body.match(
    /class="hs-bg"[\s\S]*?<source[^>]+media="[^"]*max-width[^"]*"[^>]+srcset="([^"]+)"/i
  ) ||
    body.match(/hs-bg[\s\S]*?srcset="([^"]+)"[\s\S]*?max-width/i) ||
    [])[1] || heroSrc;

fs.writeFileSync(
  path.join(ROOT, "lib", "web-and-app-development-lcp.json"),
  JSON.stringify(
    {
      preload: heroSrc,
      preloadMobile: heroMobile,
      mobileMedia: "(max-width:960px)",
      desktopMedia: "(min-width:961px)",
    },
    null,
    2
  ) + "\n"
);

const manifestPath = path.join(ROOT, "lib", "asset-manifest.json");
const manifest = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
manifest.webAndAppDevelopment = "/tekcroft-web-and-app-development.js";
fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + "\n");

console.log("Done.");
console.log("Images dir:", IMG_DIR);
console.log("LCP:", heroSrc);
