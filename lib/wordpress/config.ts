/** WordPress + public site URL helpers (server-only values stay off the client). */

const trimSlash = (value: string) => value.replace(/\/+$/, "");

export function getWordPressApiUrl(): string {
  const raw =
    process.env.WORDPRESS_API_URL ||
    "https://comic-peachpuff-ibis-64.hostingersite.com/wp-json/wp/v2";
  return trimSlash(raw);
}

export function getWordPressSiteUrl(): string {
  const raw =
    process.env.WORDPRESS_SITE_URL ||
    "https://comic-peachpuff-ibis-64.hostingersite.com";
  return trimSlash(raw);
}

/** Public Tekcroft origin used for blog canonicals and sitemaps. */
export function getPublicSiteUrl(): string {
  const raw =
    process.env.NEXT_PUBLIC_SITE_URL || "https://www.tekcroft.com";
  return trimSlash(raw);
}

/** Fallback ISR when the WordPress webhook cannot clear cache (seconds). */
export const WP_REVALIDATE_SECONDS = 60;
export const WP_POSTS_PER_PAGE = 9;

export const WP_CACHE_TAGS = {
  all: "wordpress",
  posts: "wordpress-posts",
  categories: "wordpress-categories",
  tags: "wordpress-tags",
  post: (slug: string) => `wordpress-post-${slug}`,
  category: (slug: string) => `wordpress-category-${slug}`,
  tag: (slug: string) => `wordpress-tag-${slug}`,
} as const;
