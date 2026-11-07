import fs from "fs";
import path from "path";

const LIB = path.join(process.cwd(), "lib");

function loadChrome(fileName: string): string {
  return fs.readFileSync(path.join(LIB, fileName), "utf8").trimEnd();
}

let HEADER = loadChrome("site-header.html");
let FOOTER = loadChrome("site-footer.html");

const NAV_BLOCK_RE =
  /(?:<!--[^\n]*NAV[^\n]*-->\s*)?<nav class="nav"[\s\S]*?<\/nav>\s*/i;
const FOOTER_RE =
  /(?:<!--[^\n]*FOOTER[^\n]*-->\s*)?(?:<div class="ftm"[\s\S]*?<\/footer>|<footer class="ft4"[\s\S]*?<\/footer>)/i;

/** Pull leading homepage boot block (nested divs) if present. */
function extractLeadingBoot(html: string): { boot: string; rest: string } {
  let s = html;
  let prefix = "";
  const comments = s.match(/^(?:<!--[\s\S]*?-->\s*)+/);
  if (comments) {
    prefix = comments[0];
    s = s.slice(comments[0].length);
  }

  if (
    !/^<div\b[^>]*\bclass=(["'])[^"']*\bboot\b[^"']*\1/i.test(s) &&
    !/^<div class="boot"\b/i.test(s)
  ) {
    return { boot: "", rest: html };
  }

  const openEnd = s.indexOf(">") + 1;
  let depth = 1;
  const re = /<\/?div\b[^>]*>/gi;
  re.lastIndex = openEnd;
  let m: RegExpExecArray | null;
  let end = openEnd;
  while ((m = re.exec(s))) {
    if (/^<\//.test(m[0])) depth -= 1;
    else depth += 1;
    end = m.index + m[0].length;
    if (depth === 0) break;
  }
  const trail = s.slice(end).match(/^\s*/)?.[0] ?? "";
  return {
    boot: prefix + s.slice(0, end) + trail,
    rest: s.slice(end + trail.length),
  };
}

/**
 * Page body only: strip any embedded nav/footer, keep homepage boot.
 * Header/footer live in SiteShell (layout) so they do not remount on navigate.
 */
export function preparePageBody(bodyHtml: string): string {
  let html = bodyHtml;
  if (html.charCodeAt(0) === 0xfeff) html = html.slice(1);

  const { boot, rest } = extractLeadingBoot(html);
  html = rest.replace(NAV_BLOCK_RE, "").replace(FOOTER_RE, "");

  return `${boot}${html.trim()}\n`;
}

/** Full document chrome — only for routes outside (site) layout (e.g. 404). */
export function composeSiteHtml(bodyHtml: string): string {
  return `${HEADER}\n\n${preparePageBody(bodyHtml)}\n${FOOTER}\n`;
}

export function readSiteHeader(): string {
  if (process.env.NODE_ENV !== "production") {
    HEADER = loadChrome("site-header.html");
  }
  return HEADER + "\n";
}

export function readSiteFooter(): string {
  if (process.env.NODE_ENV !== "production") {
    FOOTER = loadChrome("site-footer.html");
  }
  return FOOTER + "\n";
}

/** Module-cache prepared page bodies — same content, no per-request FS+regex. */
const BODY_CACHE = new Map<string, string>();

export function readPreparedBody(fileName: string): string {
  // Always re-read in dev so HTML content edits show without a server restart.
  if (process.env.NODE_ENV !== "production") {
    return preparePageBody(
      fs.readFileSync(path.join(LIB, fileName), "utf8")
    );
  }
  let html = BODY_CACHE.get(fileName);
  if (html == null) {
    html = preparePageBody(
      fs.readFileSync(path.join(LIB, fileName), "utf8")
    );
    BODY_CACHE.set(fileName, html);
  }
  return html;
}
