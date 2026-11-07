import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "lib");
const files = fs.readdirSync(dir).filter((f) => f.endsWith("-body.html"));
let total = 0;
const titles = [];

for (const f of files) {
  const filePath = path.join(dir, f);
  let html = fs.readFileSync(filePath, "utf8");
  const before = html;

  html = html.replace(
    /<button\s+type="button"\s+class="(pf-card[^"]*)"([^>]*)>/g,
    (_m, cls, rest) => {
      rest = rest
        .replace(/\s*data-scroll="[^"]*"/g, "")
        .replace(/\s*data-jump\b/g, "")
        .replace(/\s+/g, " ")
        .trim();
      return `<article class="${cls}"${rest ? ` ${rest}` : ""}>`;
    }
  );

  if (html === before) continue;

  let out = "";
  let i = 0;
  while (i < html.length) {
    const open = html.indexOf('<article class="pf-card', i);
    if (open < 0) {
      out += html.slice(i);
      break;
    }
    out += html.slice(i, open);
    const closeBtn = html.indexOf("</button>", open);
    const closeArt = html.indexOf("</article>", open);
    if (closeBtn >= 0 && (closeArt < 0 || closeBtn < closeArt)) {
      const block = html.slice(open, closeBtn);
      const titleMatch = block.match(/<h3[^>]*>([\s\S]*?)<\/h3>/i);
      const title = titleMatch
        ? titleMatch[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
        : "(untitled)";
      titles.push({ page: f, title });
      out += block + "</article>";
      i = closeBtn + "</button>".length;
      total++;
    } else {
      out += html.slice(open, open + 24);
      i = open + 24;
    }
  }

  fs.writeFileSync(filePath, out);
  console.log("updated", f);
}

console.log("converted cards", total);
for (const t of titles) console.log(`- ${t.page}: ${t.title}`);
