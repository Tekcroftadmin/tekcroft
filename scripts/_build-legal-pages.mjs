import fs from "fs";
import path from "path";
import sharp from "sharp";

const ROOT = process.cwd();
const EXTRACT = path.join(ROOT, "scripts", "_legal-extract");
const PUBLIC_LEGAL = path.join(ROOT, "public", "images", "legal");
const LIB = path.join(ROOT, "lib");
const APP = path.join(ROOT, "app");

/** Canonical public site origin (trailing slash). */
export const SITE_URL = "https://www.tekcroft.com/";

const pages = [
  {
    key: "privacy-policy",
    title: "Privacy Policy | Tekcroft",
    description:
      "How Tekcroft collects, uses, discloses, and protects information when you visit our website or interact with our online services.",
    hasScript: true,
    rootId: "privacy-policy",
  },
  {
    key: "terms-of-use",
    title: "Terms of Use | Tekcroft",
    description:
      "Terms governing your use of the Tekcroft website and related online services.",
    hasScript: true,
    rootId: "terms-of-use",
  },
  {
    key: "accessibility",
    title: "Accessibility Statement | Tekcroft",
    description:
      "Tekcroft’s accessibility statement, how we approach digital access, and how to contact us about barriers.",
    hasScript: true,
    rootId: "accessibility",
  },
  {
    key: "sitemap",
    title: "Sitemap | Tekcroft",
    description: "A directory of public pages on the Tekcroft website.",
    hasScript: false,
    rootId: "sitemap",
  },
];

function extractHero(mainHtml) {
  const m = mainHtml.match(
    /style="--hero:url\(data:image\/jpeg;base64,([A-Za-z0-9+/=]+)\)"/
  );
  if (!m) throw new Error("hero base64 not found");
  return Buffer.from(m[1], "base64");
}

function replaceHero(mainHtml) {
  return mainHtml.replace(
    /style="--hero:url\(data:image\/jpeg;base64,[A-Za-z0-9+/=]+\)"/,
    'style="--hero:url(/images/legal/hero.webp)"'
  );
}

/** Keep visible URL identical; pages re-apply SITE_URL from config at render. */
function stampSiteUrl(html) {
  return html
    .split("https://tekcroft-roan.vercel.app/")
    .join("__SITE_URL__")
    .split("https://www.tekcroft.com/")
    .join("__SITE_URL__");
}

function fixSitemapHrefs(html) {
  // Site route is /contact (not /contact-us). Link text unchanged.
  return html.replaceAll('href="/contact-us"', 'href="/contact"');
}

function updateFooterLegalNav(html) {
  return html.replace(
    /<nav><a href="\/privacy(?:-policy)?">Privacy [Pp]olicy<\/a><a href="\/sitemap(?:\.xml)?">Sitemap<\/a><\/nav>/g,
    '<nav><a href="/privacy-policy">Privacy Policy</a><a href="/terms-of-use">Terms of Use</a><a href="/accessibility">Accessibility</a><a href="/sitemap">Sitemap</a></nav>'
  );
}

function getChrome() {
  const shellPath = path.join(LIB, "mobile-app-development-body.html");
  const html = fs.readFileSync(shellPath, "utf8");
  const navEnd = html.indexOf("</nav>");
  if (navEnd < 0) throw new Error("nav missing");
  const nav = html.slice(0, navEnd + "</nav>".length);

  const ftm = html.indexOf('<div class="ftm"');
  const footerStart = html.indexOf('<footer class="ft4"');
  const footerEnd = html.indexOf("</footer>");
  if (footerStart < 0 || footerEnd < 0) throw new Error("footer missing");
  // Include marquee strip above footer when present (site chrome)
  const chromeStart = ftm >= 0 && ftm < footerStart ? ftm : footerStart;
  const footer = html.slice(chromeStart, footerEnd + "</footer>".length);
  return { nav, footer, source: shellPath };
}

// --- hero.webp ---
fs.mkdirSync(PUBLIC_LEGAL, { recursive: true });
const privacyMainRaw = fs.readFileSync(
  path.join(EXTRACT, "privacy-policy-main.html"),
  "utf8"
);
const heroBuf = extractHero(privacyMainRaw);
let webp = await sharp(heroBuf)
  .rotate()
  .resize({ width: 1920, withoutEnlargement: true })
  .webp({ quality: 78, effort: 6 })
  .toBuffer();
// Keep under ~200KB for LCP; not constrained to 80KB (that was journey only)
if (webp.length > 250 * 1024) {
  webp = await sharp(heroBuf)
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .webp({ quality: 68, effort: 6 })
    .toBuffer();
}
fs.writeFileSync(path.join(PUBLIC_LEGAL, "hero.webp"), webp);
console.log("hero.webp", (webp.length / 1024).toFixed(1) + "KB");

// site-url.ts
fs.writeFileSync(
  path.join(LIB, "site-url.ts"),
  `/** Public site origin with trailing slash. Change once for legal pages and any copy that shows the live URL. */\nexport const SITE_URL = ${JSON.stringify(SITE_URL)} as const;\n`
);

const chrome = getChrome();
console.log("chrome from", chrome.source);

// Update footer legal links in all existing body HTML files
{
  const files = fs
    .readdirSync(LIB)
    .filter((f) => f.endsWith(".html"));
  let n = 0;
  for (const f of files) {
    const p = path.join(LIB, f);
    const html = fs.readFileSync(p, "utf8");
    const next = updateFooterLegalNav(html);
    if (next !== html) {
      fs.writeFileSync(p, next);
      n++;
    }
  }
  console.log("updated footer legal links in", n, "html files");
}

const footer = updateFooterLegalNav(chrome.footer);

for (const page of pages) {
  let main = fs.readFileSync(path.join(EXTRACT, `${page.key}-main.html`), "utf8");
  main = replaceHero(main);
  main = stampSiteUrl(main);
  if (page.key === "sitemap") main = fixSitemapHrefs(main);

  const css = fs.readFileSync(path.join(EXTRACT, `${page.key}-styles.css`), "utf8");
  fs.writeFileSync(path.join(APP, `${page.key}.css`), css);

  const body = `${chrome.nav}\n\n${main}\n\n${footer}\n`;
  fs.writeFileSync(path.join(LIB, `${page.key}-body.html`), body);

  // meta json for pages
  fs.writeFileSync(
    path.join(LIB, `${page.key}-meta.json`),
    JSON.stringify(
      {
        title: page.title,
        description: page.description,
        canonical: `https://www.tekcroft.com/${page.key}`,
        rootId: page.rootId,
        hasScript: page.hasScript,
      },
      null,
      2
    ) + "\n"
  );

  console.log("built", page.key);
}

console.log("OK");
