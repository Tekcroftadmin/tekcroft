/**
 * Extract About Us page from about-us-hero-variants-25 HTML → Next.js assets.
 * Defaults: Hero C (#hero-1) + What we do H (#what-we-do-h) + RP H (Business map · fit).
 * What we do ships H only (A/B/G dropped). In-page RP segment switcher kept.
 * Typography stays site tokens (--font / --font-display = Inter / Sora).
 *
 * Run: node scripts/extract-about-us.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_ABOUT_HTML ||
  "C:/Users/Super/Downloads/about-us-hero-variants-25.html";
const IMG = path.join(ROOT, "public", "images");
const PREFIX = "about";
const MAX_BYTES = 80 * 1024;

fs.mkdirSync(IMG, { recursive: true });
fs.mkdirSync(path.join(IMG, "about"), { recursive: true });

const html = fs.readFileSync(SRC, "utf8");

function styleById(id) {
  return (
    html.match(
      new RegExp(`<style[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/style>`, "i")
    )?.[1] || ""
  );
}

function scriptById(id) {
  return (
    html.match(
      new RegExp(`<script[^>]*id=["']${id}["'][^>]*>([\\s\\S]*?)<\\/script>`, "i")
    )?.[1] || ""
  );
}

function extractById(tag, id) {
  const openRe = new RegExp(`<${tag}\\b[^>]*id=["']${id}["'][^>]*>`, "i");
  const m = openRe.exec(html);
  if (!m) return "";
  let i = m.index + m[0].length;
  let depth = 1;
  const openTag = new RegExp(`<${tag}\\b`, "gi");
  const closeTag = new RegExp(`</${tag}>`, "gi");
  while (depth > 0 && i < html.length) {
    openTag.lastIndex = i;
    closeTag.lastIndex = i;
    const o = openTag.exec(html);
    const c = closeTag.exec(html);
    if (!c) break;
    if (o && o.index < c.index) {
      depth++;
      i = o.index + 1;
    } else {
      depth--;
      i = c.index + c[0].length;
      if (depth === 0) return html.slice(m.index, i);
    }
  }
  return "";
}

function sectionById(id) {
  return extractById("section", id);
}

async function dataToWebp(dataUrl, slug) {
  const m = dataUrl.match(/^data:(image\/[a-zA-Z0-9.+-]+);base64,(.+)$/);
  if (!m) throw new Error("bad data url for " + slug);
  const raw = Buffer.from(m[2], "base64");
  let best = null;
  for (const [w, qStart] of [
    [1600, 72],
    [1400, 68],
    [1200, 62],
    [1100, 56],
    [960, 50],
    [880, 46],
  ]) {
    let lo = 36,
      hi = qStart;
    while (lo <= hi) {
      const q = Math.floor((lo + hi) / 2);
      const buf = await sharp(raw)
        .rotate()
        .resize({ width: w, withoutEnlargement: true })
        .webp({ quality: q, effort: 6, smartSubsample: true })
        .toBuffer();
      if (buf.length <= MAX_BYTES) {
        best = { buf, w, q };
        lo = q + 1;
      } else hi = q - 1;
    }
    if (best && best.buf.length < 70 * 1024) break;
  }
  if (!best) throw new Error("could not fit " + slug);
  const hash = crypto.createHash("sha256").update(best.buf).digest("hex").slice(0, 10);
  const name = `${slug}-${hash}.webp`;
  const outPath = path.join(IMG, "about", name);
  fs.writeFileSync(outPath, best.buf);
  const meta = await sharp(best.buf).metadata();
  console.log(
    "img",
    name,
    (best.buf.length / 1024).toFixed(1) + "KB",
    `${meta.width}x${meta.height}`
  );
  return {
    href: `/images/about/${name}`,
    width: meta.width,
    height: meta.height,
    bytes: best.buf.length,
  };
}

async function replaceDataImages(chunk, slugBase) {
  let out = chunk;
  let n = 0;
  const re = /(?:src|url)\((['"]?)(data:image\/[^)"']+)\1\)|src="(data:image\/[^"]+)"/gi;
  const hits = [];
  let m;
  while ((m = re.exec(chunk))) {
    const data = m[2] || m[3];
    if (!data || data.length < 100) continue;
    hits.push(data);
  }
  const unique = [...new Set(hits)];
  for (const data of unique) {
    n += 1;
    const saved = await dataToWebp(data, `${slugBase}-${String(n).padStart(2, "0")}`);
    out = out.split(data).join(saved.href);
  }
  return { html: out, lcp: n ? null : null, first: null, count: n };
}

/* ── CSS (page-specific; site chrome already in tekcroft.css) ── */
const STYLE_IDS = [
  "hs-styles",
  "hero-copy-styles",
  "hs-form-theme",
  "ai-hero-points",
  "about-styles",
  "a3-styles",
  "ad-styles",
  "eg-styles",
  "rhythm-styles",
];

let css = `/* About Us — extracted from about-us-hero-variants-25. Design locked.
   Fonts: inherit site --font (Inter) / --font-display (Sora). */\n`;

for (const id of STYLE_IDS) {
  const block = styleById(id);
  if (!block) {
    console.warn("missing style", id);
    continue;
  }
  css += `\n/* === ${id} === */\n${block}\n`;
}

/* Orphan mobile gutter for What we do H (lives beside the section in source) */
const orphanStyles = [...html.matchAll(/<style(?![^>]*\bid=)[^>]*>([\s\S]*?)<\/style>/gi)].map(
  (m) => m[1]
);
for (const block of orphanStyles) {
  if (/#what-we-do-h\.does/.test(block)) {
    css += `\n/* === what-we-do-h mobile gutter === */\n${block}\n`;
  }
}

/* why-exact scoped theme (was inline in the HTML) */
const whyDiv = extractById("div", "why-exact");
const whyStyle = whyDiv.match(/<style[^>]*>([\s\S]*?)<\/style>/i)?.[1] || "";
if (whyStyle) css += `\n/* === why-exact === */\n${whyStyle}\n`;

/* Variant switchers stay visible; section rhythm matches site --sec-y */
css += `
section[hidden]{display:none !important;}
.ppl-variant[hidden],
.rp-variant[hidden]{display:none !important;}

/* ── Site section rhythm lock (match other pages) ───────────────────── */
:root{
  --sec-y:clamp(56px,5.4vw,84px);
  --sec-y-tight:clamp(36px,4vw,56px);
  --sec-y-feat:clamp(64px,6vw,88px);
}
#hwww,
#hwww .sec,
#rpw,
#pplw,
#wgw,
#ctaw,
#wwb,
#why-exact{
  --sec-y:clamp(56px,5.4vw,84px);
}
#what-we-do.bt,
#what-we-do-b.tw,
#what-we-do-g.wtl,
#what-we-do-h.does,
#what-we-do.sec,
#what-we-do-b.sec,
#what-we-do-g.sec,
#what-we-do-h.sec,
#why-exact .wx-why,
.wx-why,
#wwb .built,
section.built,
#rpw .rp,
#rp.rp,
#hwww .sec,
#how-we-work.sec,
#ppl-sec.pplx,
#wgw .wg,
#wg.wg,
#ctaw .cta,
#cta.cta{
  padding-block:var(--sec-y) !important;
  min-height:0 !important;
}
#rpw .rp,
#wgw .wg,
#ctaw .cta,
#hwww .sec,
#ppl-sec.pplx,
#why-exact .wx-why,
#wwb .built{
  padding-inline:24px;
}
@media (max-width:720px){
  #rpw .rp,
  #wgw .wg,
  #ctaw .cta,
  #hwww .sec,
  #ppl-sec.pplx,
  #why-exact .wx-why,
  #wwb .built{
    padding-inline:20px;
  }
}
`;

function ensureHidden(chunk, hide) {
  if (!hide) return chunk;
  if (/\bhidden\b/.test(chunk.slice(0, chunk.indexOf(">")))) return chunk;
  return chunk.replace(/^(<[a-z][^>]*?)>/i, "$1 hidden>");
}

function ensureAlt(chunk, alt, title) {
  return chunk.replace(
    /(<img\b)([^>]*?)(src="\/images\/about\/[^"]+")([^>]*)>/gi,
    (full, a, pre, src, post) => {
      if (/alt=/.test(full)) return full;
      return `${a}${pre}${src} width="1600" height="900" alt="${alt}" title="${title}" decoding="async"${post}>`;
    }
  );
}

/* ── Body sections ── */
let heroC = sectionById("hero-1");
let wwdH = sectionById("what-we-do-h");
let why = whyDiv.replace(/<style[^>]*>[\s\S]*?<\/style>/i, "");
let built = extractById("div", "wwb");
let rp = extractById("div", "rpw") || sectionById("rp-sec");
let hww = extractById("div", "hwww") || sectionById("how-we-work");
let ppl = extractById("div", "pplw") || sectionById("ppl-sec");
let wg = extractById("div", "wgw") || sectionById("wg");
let cta = extractById("div", "ctaw") || sectionById("cta");

if (!heroC) throw new Error("missing hero-1");
if (!wwdH) throw new Error("missing what-we-do-h");
if (!why || !built || !rp || !hww || !ppl || !wg || !cta) {
  throw new Error(
    `missing section(s): why=${!!why} built=${!!built} rp=${!!rp} hww=${!!hww} ppl=${!!ppl} wg=${!!wg} cta=${!!cta}`
  );
}

heroC = ensureAlt(
  (await replaceDataImages(heroC, "about-hc")).html,
  "Tekcroft team at work — technology and digital marketing for growing businesses",
  "About Tekcroft"
);
/* LCP: mark first img in default hero */
heroC = heroC.replace(
  /(<img\b[^>]*src="\/images\/about\/[^"]+"[^>]*?)>/i,
  (full) =>
    /fetchpriority=/i.test(full)
      ? full
      : full.replace(/>$/, ' fetchpriority="high">')
);

wwdH = (await replaceDataImages(wwdH, "about-wwdh")).html;
why = (await replaceDataImages(why, "about-why")).html;
built = (await replaceDataImages(built, "about-built")).html;
rp = (await replaceDataImages(rp, "about-rp")).html;
/* Drop Rich Picture Mapping board / Rich picture / App window (A/B/C) */
rp = rp
  .replace(/\s*<button type="button" data-rv="a">Mapping board<\/button>\s*/i, "\n      ")
  .replace(/\s*<button type="button" data-rv="b">Rich picture<\/button>\s*/i, "\n      ")
  .replace(/\s*<button type="button" data-rv="c">App window<\/button>\s*/i, "\n      ");
for (const letter of ["a", "b", "c"]) {
  const marker = `class="rp-variant" data-rv="${letter}"`;
  const start = rp.indexOf(marker);
  if (start < 0) continue;
  const openStart = rp.lastIndexOf("<div", start);
  let i = rp.indexOf(">", openStart) + 1;
  let depth = 1;
  const openTag = /<div\b/gi;
  const closeTag = /<\/div>/gi;
  while (depth > 0 && i < rp.length) {
    openTag.lastIndex = i;
    closeTag.lastIndex = i;
    const o = openTag.exec(rp);
    const c = closeTag.exec(rp);
    if (!c) break;
    if (o && o.index < c.index) {
      depth++;
      i = o.index + 1;
    } else {
      depth--;
      i = c.index + c[0].length;
    }
  }
  let from = openStart;
  const before = rp.slice(Math.max(0, openStart - 120), openStart);
  const comment = before.match(/<!--[\s\S]*?-->\s*$/);
  if (comment) from = openStart - comment[0].length;
  rp = rp.slice(0, from) + rp.slice(i);
}
hww = (await replaceDataImages(hww, "about-hww")).html;
ppl = (await replaceDataImages(ppl, "about-ppl")).html;
/* Keep People Timeline only — drop Split (A) + Cards (B) review variants */
ppl = ppl
  .replace(/<div class="ppl-switch">[\s\S]*?<\/div>\s*<\/div>\s*/i, "")
  .replace(
    /<!--\s*=====\s*Variant A[\s\S]*?<!--\s*=====\s*Variant C[^\n]*-->\s*<div class="ppl-variant" data-pv="c">\s*/i,
    ""
  )
  .replace(/\s*<\/div>\s*(?=<\/section>)/i, "\n\n");
wg = (await replaceDataImages(wg, "about-wg")).html;
cta = (await replaceDataImages(cta, "about-cta")).html;

/* Also rewrite any remaining data: URLs inside CSS */
async function rewriteCssData(cssText) {
  let out = cssText;
  const urls = [...cssText.matchAll(/url\(["']?(data:image\/[^)"']+)["']?\)/gi)].map(
    (m) => m[1]
  );
  let i = 0;
  for (const data of [...new Set(urls)]) {
    if (data.length < 200) continue;
    i += 1;
    const saved = await dataToWebp(data, `about-css-${String(i).padStart(2, "0")}`);
    out = out.split(data).join(saved.href);
  }
  return out;
}
css = await rewriteCssData(css);

/* ── Shell from an existing page body ── */
const shellSrc = path.join(ROOT, "lib", "contact-body.html");
const shell = fs.readFileSync(shellSrc, "utf8");
const nav = shell.match(/<nav class="nav"[\s\S]*?<\/nav>/i)?.[0];
const mmEnd = shell.indexOf("</nav>");
const afterNav = shell.slice(mmEnd);
const footer = afterNav.match(/<footer[\s\S]*$/i)?.[0];
if (!nav || !footer) throw new Error("could not split contact shell");

const main = `<main id="main">
${heroC}

${wwdH}

${why}

${built}

${rp}

${hww}

${ppl}

${wg}

${cta}
</main>`;

const body = `${nav}

${main}

${footer}
`;

fs.writeFileSync(path.join(ROOT, "lib", "about-us-body.html"), body);
fs.writeFileSync(path.join(ROOT, "app", "about-us.css"), css);

/* Shared site chrome: theme, btn labels, sticky white nav on scroll, burger */
const chromeScript = `(function(){
  "use strict";
  var $  = function(s, r){ return (r || document).querySelector(s); };
  var $$ = function(s, r){ return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var root = document.documentElement;
  $$(".js-theme").forEach(function(btn){
    btn.addEventListener("click", function(){
      root.setAttribute("data-theme",
        root.getAttribute("data-theme") === "dark" ? "light" : "dark");
      btn.classList.toggle("spin");
    });
  });
  $$(".btn").forEach(function(btn){
    if (btn.querySelector(".btn-label")) return;
    Array.prototype.slice.call(btn.childNodes).forEach(function(node){
      if (node.nodeType !== 3) return;
      var text = node.nodeValue.replace(/\\s+/g, " ").trim();
      if (!text) return;
      var label = document.createElement("span");
      label.className = "btn-label";
      label.textContent = text;
      btn.replaceChild(label, node);
    });
  });
  var nav = $("#nav"), burger = $(".js-burger"), mnav = $(".js-mnav");
  function navHeight(){
    if (!nav) return;
    var __bar = nav.querySelector(".nav-in");
    var __cs = getComputedStyle(nav);
    var __h = (__bar ? __bar.offsetHeight : 64)
      + (parseFloat(__cs.paddingTop) || 0)
      + (parseFloat(__cs.paddingBottom) || 0);
    root.style.setProperty("--nav-h", Math.round(__h) + "px");
  }
  navHeight();
  window.addEventListener("resize", navHeight);
  var queued = false;
  function onScroll(){
    queued = false;
    if (nav) nav.classList.toggle("stuck", window.scrollY > 12);
  }
  window.addEventListener("scroll", function(){
    if (queued) return;
    queued = true;
    requestAnimationFrame(onScroll);
  }, { passive:true });
  onScroll();
  function closeMenu(){
    if (!mnav) return;
    mnav.classList.remove("open");
    if (burger){
      burger.classList.remove("open");
      burger.setAttribute("aria-expanded", "false");
    }
  }
  if (burger && mnav){
    burger.addEventListener("click", function(){
      var open = mnav.classList.toggle("open");
      burger.classList.toggle("open", open);
      burger.setAttribute("aria-expanded", open ? "true" : "false");
    });
    mnav.addEventListener("click", function(e){
      if (e.target.closest(".mm-acc")) return;
      if (e.target.closest("a[href],[data-jump]")) closeMenu();
    });
  }
  $$("[data-jump]").forEach(function(el){
    el.addEventListener("click", function(){
      var form = $(".hs:not([hidden]) form[data-lead]") || $("form[data-lead]") || $("#cta");
      if (!form) return;
      closeMenu();
      form.scrollIntoView({ behavior:"smooth", block:"center" });
    });
  });
})();`;

const jsParts = [
  chromeScript,
  scriptById("wh-script"),
  scriptById("wwb-script"),
  /* Rich Picture switcher only — Mapping board / Rich picture / App window removed */
  `(function(){
  var sw=document.getElementById('rp-switch');
  if(sw){
    sw.addEventListener('click',function(e){
      var b=e.target.closest('button'); if(!b) return;
      var v=b.dataset.rv;
      [].forEach.call(document.querySelectorAll('.rp-variant'),function(el){ el.hidden=el.dataset.rv!==v; });
      [].forEach.call(sw.querySelectorAll('button'),function(x){ x.classList.toggle('on',x===b); });
    });
  }
})();`,
  scriptById("rp-fj-script"),
  scriptById("rpk-script"),
  scriptById("rpm-script"),
  scriptById("hww-script"),
  /* People Timeline only (Split/Cards removed) */
  `(function(){
  var cc=document.getElementById('people-c');
  if(cc){ new IntersectionObserver(function(es,o){es.forEach(function(e){if(e.isIntersecting){cc.classList.add('sp-seen');o.disconnect();}});},{threshold:.2}).observe(cc); }
})();`,
  scriptById("wg-script"),
  scriptById("cta-script"),
  scriptById("walk-script"),
].filter(Boolean);

const js =
  "/* About Us page interactions */\n" +
  jsParts.map((p) => p.trim()).join("\n\n") +
  "\n";

fs.writeFileSync(path.join(ROOT, "public", "tekcroft-about-us.js"), js);

/* LCP preload = first about hero image */
const lcpHref =
  heroC.match(/src="(\/images\/about\/[^"]+)"/)?.[1] ||
  "/images/about/about-hero-01.webp";
fs.writeFileSync(
  path.join(ROOT, "lib", "about-us-lcp.json"),
  JSON.stringify({ preload: lcpHref }, null, 2) + "\n"
);

fs.writeFileSync(
  path.join(ROOT, "lib", "about-us-meta.json"),
  JSON.stringify(
    {
      title: "About Tekcroft | Technology, Marketing & Automation",
      description:
        "Tekcroft builds technology and digital marketing for businesses that want to grow — software, automation, AI, SEO and paid media under one plan.",
      canonical: "https://tekcroft.com/about-us",
      keywords:
        "about Tekcroft, digital marketing company, AI development agency, SEO agency",
    },
    null,
    2
  ) + "\n"
);

console.log("wrote lib/about-us-body.html", body.length);
console.log("wrote app/about-us.css", css.length);
console.log("wrote public/tekcroft-about-us.js", js.length);
console.log("lcp", lcpHref);
console.log("sections", {
  hero: !!heroC,
  wwdH: !!wwdH,
  why: !!why,
  built: !!built,
  rp: !!rp,
  hww: !!hww,
  ppl: !!ppl,
  wg: !!wg,
  cta: !!cta,
});
console.log("done");
