/**
 * Replace every under-hero <section class="sec tb" id="proof"> with the
 * shared #proof-v2.st markup. Keeps each page's own figures/captions.
 * Homepage: insert the default strip right after </header> if missing.
 */
import fs from "fs";
import path from "path";

const lib = path.join("c:/Tekcroft/lib");

/** @typedef {{ num: string, sign: string, caption: string }} Item */

const DEFAULT = [
  { num: "180", sign: "%", caption: "Organic traffic growth" },
  { num: "24", sign: "h", caption: "Response time" },
  { num: "20", sign: "+", caption: "Expert Team Members" },
  { num: "98", sign: "%", caption: "Client satisfaction" },
];

function escapeHtml(s) {
  return String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** @param {Item[]} items */
function render(items) {
  const cells = items
    .map(
      (it) =>
        `<div class="st-c"><b><span>${escapeHtml(it.num)}</span><em>${escapeHtml(it.sign)}</em></b><p>${escapeHtml(it.caption)}</p></div>`
    )
    .join("");
  return `<section class="sec st" id="proof-v2">
  <div class="wrap"><div class="st-row rv">${cells}</div></div>
</section>`;
}

function parseOldBlock(block) {
  /** @type {Item[]} */
  const figs = [];
  const re =
    /<div class="tb-fig"[^>]*>[\s\S]*?<b([^>]*)>([\s\S]*?)<\/b>[\s\S]*?<span class="tb-cap">([\s\S]*?)<\/span>/g;
  let x;
  while ((x = re.exec(block))) {
    const attrs = x[1];
    const inner = x[2];
    const caption = x[3].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    const count = (attrs.match(/data-count="([^"]*)"/) || [])[1];
    const suffix = (attrs.match(/data-suffix="([^"]*)"/) || [])[1];
    let num;
    let sign;
    if (count != null) {
      num = count;
      sign = suffix || "";
    } else {
      const text = inner.replace(/<[^>]+>/g, "").replace(/\s+/g, "").trim();
      const m = text.match(/^(\d+(?:\.\d+)?)(.+)$/);
      if (m) {
        num = m[1];
        sign = m[2];
      } else {
        num = text;
        sign = "";
      }
    }
    figs.push({ num, sign, caption });
  }
  return figs.length === 4 ? figs : null;
}

const files = fs.readdirSync(lib).filter((f) => f.endsWith("-body.html"));
let replaced = 0;
let insertedHome = 0;

for (const f of files) {
  const p = path.join(lib, f);
  let html = fs.readFileSync(p, "utf8");

  // Already migrated?
  if (html.includes('id="proof-v2"')) {
    // Still remove any leftover old proof if both exist
    const cleaned = html.replace(
      /<!--[\s\S]*?-->\s*<section class="sec tb" id="proof"[^>]*>[\s\S]*?<\/section>\s*/g,
      ""
    ).replace(
      /<section class="sec tb" id="proof"[^>]*>[\s\S]*?<\/section>\s*/g,
      ""
    );
    if (cleaned !== html) {
      fs.writeFileSync(p, cleaned);
      console.log("cleaned leftover old proof:", f);
    }
    continue;
  }

  const proofRe = /<section class="sec tb" id="proof"[^>]*>[\s\S]*?<\/section>/;
  const m = html.match(proofRe);
  if (m) {
    const items = parseOldBlock(m[0]) || DEFAULT;
    // Drop a preceding HTML comment block that documents the old trust bar
    let start = m.index;
    const before = html.slice(Math.max(0, start - 1200), start);
    const commentMatch = before.match(/<!--[\s\S]*$/);
    if (commentMatch && /TRUST BAR|DUMMY FIGURES|stats layout|PROOF/i.test(commentMatch[0])) {
      start = start - commentMatch[0].length;
      // trim trailing whitespace already in match; also eat blank lines before comment
      while (start > 0 && /[ \t]/.test(html[start - 1])) start--;
      if (html[start - 1] === "\n") start--;
      if (html[start - 1] === "\r") start--;
    }
    const end = m.index + m[0].length;
    html = html.slice(0, start) + "\n" + render(items) + "\n" + html.slice(end);
    fs.writeFileSync(p, html);
    replaced++;
    console.log("replaced", f, items.map((i) => i.num + i.sign).join(" | "));
    continue;
  }

  // Homepage: insert default strip after hero </header>
  if (f === "homepage-body.html") {
    const headerClose = html.indexOf("</header>");
    if (headerClose === -1) {
      console.warn("homepage: no </header>");
      continue;
    }
    const insertAt = headerClose + "</header>".length;
    html =
      html.slice(0, insertAt) +
      "\n\n" +
      render(DEFAULT) +
      "\n" +
      html.slice(insertAt);
    fs.writeFileSync(p, html);
    insertedHome++;
    console.log("inserted homepage default stats strip");
  }
}

console.log({ replaced, insertedHome });
