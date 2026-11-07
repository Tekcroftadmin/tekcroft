/** Assert bodies have no embedded nav/footer; shared files exist. */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const LIB = path.join(ROOT, "lib");

for (const f of ["site-header.html", "site-footer.html"]) {
  if (!fs.existsSync(path.join(LIB, f))) throw new Error(`missing ${f}`);
}

const skip = new Set(["book-a-free-evaluation-body.html"]);
const bad = [];
for (const name of fs.readdirSync(LIB).filter((n) => n.endsWith("-body.html"))) {
  if (skip.has(name)) continue;
  const html = fs.readFileSync(path.join(LIB, name), "utf8");
  const nav = (html.match(/<nav class="nav"/gi) || []).length;
  const ft = (html.match(/<footer class="ft4"/gi) || []).length;
  if (nav || ft) bad.push(`${name} nav=${nav} ft=${ft}`);
}
if (bad.length) {
  console.error("FAIL embedded chrome:\n" + bad.join("\n"));
  process.exit(1);
}
console.log("ok: shared chrome only; bodies have no nav/footer");
