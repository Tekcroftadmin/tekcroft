/**
 * Extract book-a-free-evaluation (2).html → Next.js assets (design locked).
 * Run: node scripts/extract-book-a-free-evaluation.mjs
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { fileURLToPath } from "url";
import sharp from "sharp";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC =
  process.env.TEKCROFT_BOOK_HTML ||
  "C:/Users/Super/Downloads/book-a-free-evaluation (2).html";
const IMG = path.join(ROOT, "public", "images", "book-a-free-evaluation");
fs.mkdirSync(IMG, { recursive: true });

const html = fs.readFileSync(SRC, "utf8");

const cssMatch = html.match(/<style>([\s\S]*?)<\/style>/i);
if (!cssMatch) throw new Error("no style block");
let css = cssMatch[1];

const bodyMatch = html.match(/<body[^>]*>([\s\S]*)<\/body>/i);
if (!bodyMatch) throw new Error("no body");
let body = bodyMatch[1];

/* Pull inline script out of body */
const scriptMatch = body.match(/<script>([\s\S]*?)<\/script>\s*$/i);
if (!scriptMatch) throw new Error("no script");
const js = "/* Book a Free Evaluation */\n" + scriptMatch[1].trim() + "\n";
body = body.replace(/<script>[\s\S]*?<\/script>\s*$/i, "").trim() + "\n";

/* Convert --mark data PNG → webp */
const markMatch = css.match(/--mark:url\("(data:image\/png;base64,[^"]+)"\)/);
if (markMatch) {
  const data = markMatch[1];
  const m = data.match(/^data:image\/png;base64,(.+)$/);
  const raw = Buffer.from(m[1], "base64");
  const buf = await sharp(raw).webp({ quality: 90, effort: 6 }).toBuffer();
  const hash = crypto.createHash("sha256").update(buf).digest("hex").slice(0, 10);
  const name = `book-mark-${hash}.webp`;
  fs.writeFileSync(path.join(IMG, name), buf);
  const href = `/images/book-a-free-evaluation/${name}`;
  css = css.replace(data, href);
  console.log("mark", name, (buf.length / 1024).toFixed(1) + "KB");
}

/* Prefer site font variables from root layout */
css = css.replace(
  /--font-display:'Sora','Inter',sans-serif;/,
  "--font-display:var(--font-sora),'Sora','Inter',sans-serif;"
);
css = css.replace(
  /--font:'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;/,
  "--font:var(--font-inter),'Inter',-apple-system,BlinkMacSystemFont,system-ui,sans-serif;"
);

/* Back to home — subtle pill above the brand (site addition; keep across re-extracts) */
if (!body.includes("class=\"back-home\"")) {
  body = body.replace(
    /(<aside class="info">\s*)/,
    `$1<a class="back-home" href="/">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M15 6l-6 6 6 6"/></svg>
        Back to home
      </a>
      `
  );
}
if (!css.includes(".back-home{")) {
  css = css.replace(
    /\.info\{[^}]+\}/,
    (m) =>
      m +
      `\n.back-home{align-self:flex-start; display:inline-flex; align-items:center; gap:6px; margin:0 0 16px;
  padding:7px 12px 7px 9px; border-radius:100px; border:1px solid var(--line); background:var(--surface);
  color:var(--muted); font-size:13px; font-weight:600; text-decoration:none; transition:.22s var(--ease);}
.back-home svg{width:14px; height:14px; flex:none}
.back-home:hover{color:var(--primary); border-color:var(--primary)}`
  );
}

css =
  `/* Book a Free Evaluation — extracted from book-a-free-evaluation (2).html. Design locked. */\n` +
  css;

fs.writeFileSync(path.join(ROOT, "lib", "book-a-free-evaluation-body.html"), body);
fs.writeFileSync(path.join(ROOT, "app", "book-a-free-evaluation.css"), css);
fs.writeFileSync(path.join(ROOT, "public", "tekcroft-book-a-free-evaluation.js"), js);
fs.writeFileSync(
  path.join(ROOT, "lib", "book-a-free-evaluation-meta.json"),
  JSON.stringify(
    {
      title: "Book a Free Evaluation | Tekcroft",
      description:
        "Book a free 1-hour evaluation with a senior Tekcroft strategist to review your website, SEO, automation and growth.",
      canonical: "https://www.tekcroft.com/book-a-free-evaluation",
    },
    null,
    2
  ) + "\n"
);

console.log("body", body.length, "css", css.length, "js", js.length);
console.log("done");
