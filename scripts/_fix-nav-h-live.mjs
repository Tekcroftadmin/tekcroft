import fs from "fs";
import path from "path";

const dir = "public";
const files = fs.readdirSync(dir).filter(
  (f) => /^tekcroft-.*\.js$/.test(f) && !/\.[a-f0-9]{10}\.js$/.test(f)
);

const broken =
  'style.setProperty("--nav-h", Math.round(__h);root.style.setProperty("--nav-h-live", Math.round(__h) + "px")';
const fixed =
  'style.setProperty("--nav-h", Math.round(__h) + "px");root.style.setProperty("--nav-h-live", Math.round(__h) + "px")';

const broken2 =
  'if (nav) root.style.setProperty("--nav-h", nav.offsetHeight + "px");root.style.setProperty("--nav-h-live", nav.offsetHeight + "px");';
const fixed2 =
  'if (nav){ root.style.setProperty("--nav-h", nav.offsetHeight + "px");root.style.setProperty("--nav-h-live", nav.offsetHeight + "px"); }';

for (const f of files) {
  const p = path.join(dir, f);
  let s = fs.readFileSync(p, "utf8");
  let n = s;
  if (n.includes(broken)) n = n.split(broken).join(fixed);
  if (n.includes(broken2)) n = n.split(broken2).join(fixed2);
  if (n !== s) {
    fs.writeFileSync(p, n);
    console.log("fixed", f);
  }
}
