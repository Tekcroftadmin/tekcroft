import fs from "fs";

let css = fs.readFileSync("scripts/_journey-extract/mj-styles.css", "utf8");
css = css.replace(
  /'Caveat',cursive/g,
  "var(--font-caveat), 'Caveat', cursive"
);
fs.writeFileSync(
  "app/app-journey.css",
  "/* App journey section — From First Sketch to Long-Term Support */\n" + css
);
console.log("wrote app/app-journey.css", {
  chars: css.length,
  hasStage: css.includes("#app-journey .sb-stage"),
});
