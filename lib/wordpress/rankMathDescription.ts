import {
  getWordPressSiteUrl,
  WP_CACHE_TAGS,
  WP_REVALIDATE_SECONDS,
} from "./config";
import { decodeEntities } from "./sanitize";

/**
 * Rank Math "Edit Snippet → Description" for headless posts.
 *
 * Prefer official Headless endpoint:
 *   GET /wp-json/rankmath/v1/getHead?url=<wp post url>
 * Fall back to the public WP HTML <meta name="description"> when getHead
 * is unavailable (Headless CMS Support off / 404).
 *
 * IMPORTANT: callers must use ONLY the description string.
 * Never apply robots, canonical, or other head tags from this response —
 * the staging WP site is noindex and its canonical points at Hostinger.
 */

function metaNameContent(html: string, name: string): string {
  const esc = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<meta\\b[^>]*?\\bname=["']${esc}["'][^>]*?\\bcontent=["']([^"']*)["']|<meta\\b[^>]*?\\bcontent=["']([^"']*)["'][^>]*?\\bname=["']${esc}["']`,
    "i"
  );
  const m = html.match(re);
  return decodeEntities((m?.[1] || m?.[2] || "").trim());
}

/** Pull only meta name="description" from Rank Math head HTML. */
export function descriptionFromRankMathHeadHtml(headHtml: string): string {
  if (!headHtml) return "";
  return metaNameContent(headHtml, "description");
}

async function fetchCached(
  url: string,
  slug: string | undefined,
  accept: string
): Promise<Response | null> {
  try {
    const tags: string[] = [WP_CACHE_TAGS.all, WP_CACHE_TAGS.posts];
    if (slug) tags.push(WP_CACHE_TAGS.post(slug));
    const res = await fetch(url, {
      headers: {
        Accept: accept,
        "User-Agent": "TekcroftHeadless/1.0 (+https://www.tekcroft.com)",
      },
      next: {
        revalidate: WP_REVALIDATE_SECONDS,
        tags,
      },
    });
    if (!res.ok) return null;
    return res;
  } catch (err) {
    console.error("[wordpress] Rank Math description fetch failed", url, err);
    return null;
  }
}

/** Official Rank Math headless endpoint — description only. */
export async function fetchRankMathGetHeadDescription(
  wpPostUrl: string,
  slug?: string
): Promise<string> {
  if (!wpPostUrl) return "";
  const site = getWordPressSiteUrl();
  const endpoint = `${site}/wp-json/rankmath/v1/getHead?url=${encodeURIComponent(
    wpPostUrl
  )}`;
  const res = await fetchCached(endpoint, slug, "application/json");
  if (!res) return "";
  try {
    const json = (await res.json()) as { success?: boolean; head?: string };
    if (!json || json.success === false || typeof json.head !== "string") {
      return "";
    }
    return descriptionFromRankMathHeadHtml(json.head);
  } catch {
    return "";
  }
}

/** Public WP HTML fallback — meta name="description" only. */
export async function fetchWpHtmlMetaDescription(
  wpPostUrl: string,
  slug?: string
): Promise<string> {
  if (!wpPostUrl) return "";
  const res = await fetchCached(wpPostUrl, slug, "text/html");
  if (!res) return "";
  const html = await res.text();
  return metaNameContent(html, "description");
}

/**
 * Rank Math snippet description for a post URL.
 * getHead first; then WP HTML meta description. Never returns robots/canonical.
 */
export async function fetchRankMathDescription(
  wpPostUrl: string,
  slug?: string
): Promise<string> {
  const fromApi = await fetchRankMathGetHeadDescription(wpPostUrl, slug);
  if (fromApi) return fromApi;
  return fetchWpHtmlMetaDescription(wpPostUrl, slug);
}
