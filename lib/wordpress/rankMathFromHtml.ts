import { WP_CACHE_TAGS, WP_REVALIDATE_SECONDS } from "./config";
import { decodeEntities } from "./sanitize";
import type { WpRankMath } from "./types";

/**
 * When tekcroft-headless.php is not installed, REST has no `rank_math` field.
 * Rank Math still writes the real title/description into the WordPress HTML head —
 * read those so Next.js never invents meta from the post excerpt.
 */
function metaContent(html: string, key: string): string {
  const esc = key.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const re = new RegExp(
    `<meta\\b[^>]*?(?:name|property)=["']${esc}["'][^>]*?\\bcontent=["']([^"']*)["']|<meta\\b[^>]*?\\bcontent=["']([^"']*)["'][^>]*?(?:name|property)=["']${esc}["']`,
    "i"
  );
  const m = html.match(re);
  return decodeEntities((m?.[1] || m?.[2] || "").trim());
}

function documentTitle(html: string): string {
  const m = html.match(/<title[^>]*>([^<]*)<\/title>/i);
  return decodeEntities((m?.[1] || "").trim());
}

export function parseRankMathFromHtml(html: string): WpRankMath | null {
  if (!html) return null;

  const title = documentTitle(html) || metaContent(html, "og:title");
  const description =
    metaContent(html, "description") || metaContent(html, "og:description");
  const ogTitle = metaContent(html, "og:title");
  const ogDescription = metaContent(html, "og:description");
  const ogImage = metaContent(html, "og:image");
  const twitterTitle = metaContent(html, "twitter:title");
  const twitterDescription = metaContent(html, "twitter:description");
  const twitterImage = metaContent(html, "twitter:image");
  const robotsRaw = metaContent(html, "robots");

  if (!title && !description) return null;

  return {
    title: title || undefined,
    description: description || undefined,
    og_title: ogTitle || undefined,
    og_description: ogDescription || undefined,
    og_image: ogImage || undefined,
    twitter_title: twitterTitle || undefined,
    twitter_description: twitterDescription || undefined,
    twitter_image: twitterImage || undefined,
    robots: robotsRaw
      ? robotsRaw.split(",").map((p) => p.trim()).filter(Boolean)
      : undefined,
  };
}

export function postHasRankMath(post: {
  rank_math?: WpRankMath | null;
  meta?: { rank_math_title?: string; rank_math_description?: string } | null;
}): boolean {
  const rm = post.rank_math;
  if (rm && (rm.title || rm.description)) return true;
  const meta = post.meta;
  if (
    meta &&
    (typeof meta.rank_math_title === "string" && meta.rank_math_title.trim() ||
      typeof meta.rank_math_description === "string" &&
        meta.rank_math_description.trim())
  ) {
    return true;
  }
  return false;
}

export async function fetchRankMathFromWpHtml(
  wpPostUrl: string,
  slug?: string
): Promise<WpRankMath | null> {
  if (!wpPostUrl) return null;
  try {
    const tags = [WP_CACHE_TAGS.all, WP_CACHE_TAGS.posts];
    if (slug) tags.push(WP_CACHE_TAGS.post(slug));

    const res = await fetch(wpPostUrl, {
      headers: {
        Accept: "text/html",
        "User-Agent": "TekcroftHeadless/1.0 (+https://www.tekcroft.com)",
      },
      next: {
        revalidate: WP_REVALIDATE_SECONDS,
        tags,
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    return parseRankMathFromHtml(html);
  } catch (err) {
    console.error("[wordpress] Rank Math HTML fetch failed", wpPostUrl, err);
    return null;
  }
}
