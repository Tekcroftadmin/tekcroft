import fs from "fs";
const xml = fs.readFileSync("scripts/_schema-docx/word/document.xml", "utf8");
const start = xml.indexOf("// components/JsonLd.tsx");
const end = xml.indexOf("// app/layout.tsx");
const slice = xml.slice(start, end);
const texts = [...slice.matchAll(/<w:t[^>]*>([\s\S]*?)<\/w:t>/g)].map((m) =>
  m[1]
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
);
console.log(texts.join(""));
