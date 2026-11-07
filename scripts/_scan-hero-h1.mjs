import fs from "fs";
import path from "path";

const files = fs
  .readdirSync("lib")
  .filter((f) => f.endsWith("-body.html"))
  .filter((f) =>
    /seo|franchise|google-business|ecommerce|web-|custom-software|mobile-app|artificial|ai-/.test(
      f
    )
  )
  .sort();

for (const f of files) {
  const html = fs.readFileSync(path.join("lib", f), "utf8");
  const m = html.match(/<h1 class="hs-h1"[^>]*>([\s\S]*?)<\/h1>/);
  if (!m) {
    console.log(f + ": NO H1");
    continue;
  }
  const h = m[1];
  const issues = [];
  if (/<br\s*\/?>/i.test(h)) issues.push("br");
  if (/&nbsp;/.test(h)) issues.push("nbsp");
  if (/\n/.test(h.trim())) issues.push("newline");
  if (/hs-h1-keep/.test(h)) issues.push("hs-h1-keep");
  if (/  +/.test(h.replace(/\n/g, " "))) issues.push("dblspace");
  console.log(
    f + ":",
    issues.length ? issues.join(",") : "ok",
    "|",
    h.replace(/\s+/g, " ").trim().slice(0, 110)
  );
}
