import { getPublicSiteUrl, getWordPressSiteUrl } from "./config";
import { decodeEntities, sanitizeWpHtml, stripHtml } from "./sanitize";
import type {
  BlogPost,
  BlogSeo,
  BlogTerm,
  WpPost,
  WpRankMath,
  WpTerm,
} from "./types";

function pickTerms(post: WpPost, taxonomy: "category" | "post_tag"): BlogTerm[] {
  const groups = post._embedded?.["wp:term"] || [];
  const flat = groups.flat().filter((t): t is WpTerm => !!t && t.taxonomy === taxonomy);
  return flat.map((t) => ({
    id: t.id,
    name: decodeEntities(t.name),
    slug: t.slug,
    description: t.description ? decodeEntities(t.description) : undefined,
    count: t.count,
  }));
}

function featuredImage(post: WpPost) {
  const media = post._embedded?.["wp:featuredmedia"]?.[0];
  if (!media?.source_url) return undefined;
  const size =
    media.media_details?.sizes?.large ||
    media.media_details?.sizes?.medium_large ||
    media.media_details?.sizes?.full;
  return {
    src: size?.source_url || media.source_url,
    alt: media.alt_text || decodeEntities(post.title?.rendered || ""),
    width: size?.width || media.media_details?.width,
    height: size?.height || media.media_details?.height,
  };
}

function rankMathFromPost(post: WpPost): WpRankMath {
  const meta = post.meta || {};
  const nested = (post.rank_math || meta.rank_math || {}) as WpRankMath;
  return {
    title: nested.title || (typeof meta.rank_math_title === "string" ? meta.rank_math_title : undefined),
    description:
      nested.description ||
      (typeof meta.rank_math_description === "string"
        ? meta.rank_math_description
        : undefined),
    canonical_url: nested.canonical_url,
    robots: nested.robots,
    og_title: nested.og_title,
    og_description: nested.og_description,
    og_image: nested.og_image,
    twitter_title: nested.twitter_title,
    twitter_description: nested.twitter_description,
    twitter_image: nested.twitter_image,
  };
}

/** Rewrite WordPress permalinks to Tekcroft blog URLs — keep media on the WP host. */
export function rewriteContentUrls(html: string): string {
  const wp = getWordPressSiteUrl();
  const site = getPublicSiteUrl();
  if (!html || !wp) return html;

  // Uploads and WP internals must stay on the WordPress domain (not tekcroft.com).
  const keepOnWp = /^(wp-content|wp-admin|wp-includes|wp-json)(\/|$)/i;

  return html.replace(
    new RegExp(`${escapeRegExp(wp)}/([^"'\\s<]+)`, "gi"),
    (full, path: string) => {
      const clean = String(path || "").replace(/\/+$/, "");
      if (!clean) return site;
      if (keepOnWp.test(clean)) {
        return full;
      }
      if (clean.startsWith("category/")) {
        return `${site}/blog/category/${clean.slice("category/".length)}`;
      }
      if (clean.startsWith("tag/")) {
        return `${site}/blog/tag/${clean.slice("tag/".length)}`;
      }
      // Bare post permalink: /{slug}/ → /blog/{slug}
      if (!clean.includes("/")) {
        return `${site}/blog/${clean}`;
      }
      // Unknown multi-segment paths: leave on WordPress rather than inventing a broken URL.
      return full;
    }
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function buildSeo(post: WpPost, title: string, excerptText: string, imageSrc?: string): BlogSeo {
  const rm = rankMathFromPost(post);
  const canonical = `${getPublicSiteUrl()}/blog/${post.slug}`;
  const description =
    stripHtml(rm.description || "") ||
    excerptText ||
    `Read ${title} on Tekcroft.`;
  const seoTitle = stripHtml(rm.title || "") || `${title} | Tekcroft`;
  const ogTitle = stripHtml(rm.og_title || "") || seoTitle;
  const ogDescription = stripHtml(rm.og_description || "") || description;
  const ogImage = rm.og_image || imageSrc;
  const twitterTitle = stripHtml(rm.twitter_title || "") || ogTitle;
  const twitterDescription = stripHtml(rm.twitter_description || "") || ogDescription;
  const twitterImage = rm.twitter_image || ogImage;
  const robots = Array.isArray(rm.robots)
    ? rm.robots.join(", ")
    : typeof rm.robots === "string"
      ? rm.robots
      : undefined;

  return {
    title: seoTitle,
    description,
    canonical,
    robots,
    ogTitle,
    ogDescription,
    ogImage,
    twitterTitle,
    twitterDescription,
    twitterImage,
  };
}

export function mapWpPost(post: WpPost): BlogPost {
  const title = decodeEntities(stripHtml(post.title?.rendered || "Untitled"));
  const excerptHtml = sanitizeWpHtml(post.excerpt?.rendered || "");
  const excerptText = stripHtml(post.excerpt?.rendered || "");
  const contentHtml = rewriteContentUrls(sanitizeWpHtml(post.content?.rendered || ""));
  const image = featuredImage(post);
  const authorEmb = post._embedded?.author?.[0];
  const author = {
    id: authorEmb?.id || post.author || 0,
    name: decodeEntities(authorEmb?.name || "Tekcroft"),
    slug: authorEmb?.slug || "tekcroft",
    description: authorEmb?.description
      ? decodeEntities(authorEmb.description)
      : undefined,
  };

  return {
    id: post.id,
    slug: post.slug,
    title,
    excerptHtml,
    excerptText,
    contentHtml,
    date: post.date,
    modified: post.modified,
    author,
    categories: pickTerms(post, "category"),
    tags: pickTerms(post, "post_tag"),
    image,
    seo: buildSeo(post, title, excerptText, image?.src),
  };
}

export function mapWpTerm(term: WpTerm): BlogTerm {
  return {
    id: term.id,
    name: decodeEntities(term.name),
    slug: term.slug,
    description: term.description ? decodeEntities(term.description) : undefined,
    count: term.count,
  };
}
