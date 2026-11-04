import fs from "fs";
import path from "path";

const dir = path.join(process.cwd(), "lib");
let total = 0;
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith("-body.html")) continue;
  const file = path.join(dir, f);
  let s = fs.readFileSync(file, "utf8");
  const before = (s.match(/href="\/contact"/g) || []).length;
  if (!before) continue;
  s = s.replaceAll('href="/contact"', 'href="/contact-us"');
  fs.writeFileSync(file, s);
  total += before;
  console.log(f, before);
}
console.log("total", total);
