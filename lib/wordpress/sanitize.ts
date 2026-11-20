/**
 * Allowlist HTML sanitizer for Gutenberg content.
 * Strips scripts, event handlers, and dangerous URLs without a new dependency.
 */

const ALLOWED_TAGS = new Set([
  "a",
  "abbr",
  "b",
  "blockquote",
  "br",
  "cite",
  "code",
  "del",
  "div",
  "em",
  "figcaption",
  "figure",
  "h1",
  "h2",
  "h3",
  "h4",
  "h5",
  "h6",
  "hr",
  "i",
  "img",
  "li",
  "mark",
  "ol",
  "p",
  "pre",
  "q",
  "s",
  "span",
  "strong",
  "sub",
  "sup",
  "table",
  "tbody",
  "td",
  "tfoot",
  "th",
  "thead",
  "tr",
  "ul",
]);

const ALLOWED_ATTR = new Set([
  "alt",
  "cite",
  "class",
  "colspan",
  "decoding",
  "height",
  "href",
  "id",
  "loading",
  "rel",
  "rowspan",
  "sizes",
  "src",
  "srcset",
  "target",
  "title",
  "width",
]);

function isSafeUrl(value: string): boolean {
  // srcset entries look like: "https://host/img.webp 1024w"
  const v = value.trim().split(/\s+/)[0]?.toLowerCase() || "";
  if (!v) return false;
  if (v.startsWith("#") || v.startsWith("/") || v.startsWith("mailto:") || v.startsWith("tel:")) {
    return true;
  }
  if (v.startsWith("http://") || v.startsWith("https://") || v.startsWith("//")) {
    return true;
  }
  return false;
}

function isSafeSrcset(value: string): boolean {
  const parts = value.split(",").map((p) => p.trim()).filter(Boolean);
  if (!parts.length) return false;
  return parts.every((part) => isSafeUrl(part));
}

function scrubAttrs(tag: string, rawAttrs: string): string {
  const out: string[] = [];
  const re = /([^\s=]+)(?:\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s"'=<>`]+)))?/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rawAttrs))) {
    const name = m[1].toLowerCase();
    if (name.startsWith("on")) continue;
    if (!ALLOWED_ATTR.has(name)) continue;
    const value = m[2] ?? m[3] ?? m[4] ?? "";
    if (name === "srcset") {
      if (!isSafeSrcset(value)) continue;
    } else if (
      (name === "href" || name === "src") &&
      !isSafeUrl(value)
    ) {
      continue;
    }
    if (name === "target") {
      out.push(`target="_blank"`, `rel="noopener noreferrer"`);
      continue;
    }
    if (name === "rel" && tag === "a") {
      out.push(`rel="noopener noreferrer"`);
      continue;
    }
    out.push(`${name}="${value.replace(/"/g, "&quot;")}"`);
  }
  if (tag === "img" && !/\bloading=/.test(out.join(" "))) {
    out.push('loading="lazy"');
  }
  return out.length ? " " + out.join(" ") : "";
}

/** Strip tags/attrs that should never reach the browser from CMS HTML. */
export function sanitizeWpHtml(input: string): string {
  if (!input) return "";
  let html = input
    .replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?>[\s\S]*?<\/style>/gi, "")
    .replace(/<!--[\s\S]*?-->/g, "");

  html = html.replace(/<\/?([a-z0-9]+)(\s[^>]*)?>/gi, (full, tagName: string, attrs = "") => {
    const tag = tagName.toLowerCase();
    const closing = full.startsWith("</");
    if (!ALLOWED_TAGS.has(tag)) return "";
    if (closing) return `</${tag}>`;
    const selfClose = /\/>\s*$/.test(full) || tag === "br" || tag === "hr" || tag === "img";
    const clean = scrubAttrs(tag, attrs || "");
    return selfClose ? `<${tag}${clean} />` : `<${tag}${clean}>`;
  });

  return html;
}

export function stripHtml(input: string): string {
  return (input || "")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, " ")
    .trim();
}

export function decodeEntities(input: string): string {
  return (input || "")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&#x([0-9a-f]+);/gi, (_, n) => String.fromCharCode(parseInt(n, 16)))
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/&nbsp;/gi, " ");
}
