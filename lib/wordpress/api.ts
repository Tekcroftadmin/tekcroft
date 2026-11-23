import {
  getWordPressApiUrl,
  WP_CACHE_TAGS,
  WP_POSTS_PER_PAGE,
  WP_REVALIDATE_SECONDS,
} from "./config";
import { mapWpPost, mapWpTerm } from "./map";
import { fetchRankMathDescription } from "./rankMathDescription";
import type { BlogListResult, BlogPost, BlogTerm, WpPost, WpTerm } from "./types";

function existingRankMathDescription(post: WpPost): string {
  const nested = post.rank_math?.description;
  if (typeof nested === "string" && nested.trim()) return nested.trim();
  const meta = post.meta?.rank_math_description;
  if (typeof meta === "string" && meta.trim()) return meta.trim();
  return "";
}

/**
 * Attach Rank Math Edit-Snippet description only.
 * Never copies robots/canonical/title from WP head (staging is noindex).
 */
async function withRankMathDescription(post: WpPost): Promise<WpPost> {
  if (existingRankMathDescription(post)) return post;
  const description = await fetchRankMathDescription(post.link, post.slug);
  if (!description) return post;
  return {
    ...post,
    rank_math: {
      ...(post.rank_math || {}),
      description,
    },
  };
}

type FetchOpts = {
  tags?: string[];
  revalidate?: number | false;
};

async function wpFetch<T>(
  path: string,
  opts: FetchOpts = {}
): Promise<{ data: T; headers: Headers }> {
  const base = getWordPressApiUrl();
  const url = path.startsWith("http") ? path : `${base}${path.startsWith("/") ? "" : "/"}${path}`;

  const res = await fetch(url, {
    headers: { Accept: "application/json" },
    next: {
      revalidate: opts.revalidate === false ? undefined : opts.revalidate ?? WP_REVALIDATE_SECONDS,
      tags: opts.tags ?? [WP_CACHE_TAGS.all],
    },
    ...(opts.revalidate === false ? { cache: "no-store" as const } : {}),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`WordPress API ${res.status} for ${url}: ${text.slice(0, 200)}`);
  }

  const data = (await res.json()) as T;
  return { data, headers: res.headers };
}

function withEmbed(params: URLSearchParams) {
  params.set("_embed", "1");
  params.set("status", "publish");
  return params;
}

export async function getPosts(options: {
  page?: number;
  perPage?: number;
  categoryId?: number;
  tagId?: number;
  search?: string;
} = {}): Promise<BlogListResult> {
  const page = Math.max(1, options.page || 1);
  const perPage = options.perPage || WP_POSTS_PER_PAGE;
  const params = withEmbed(new URLSearchParams());
  params.set("page", String(page));
  params.set("per_page", String(perPage));
  if (options.categoryId) params.set("categories", String(options.categoryId));
  if (options.tagId) params.set("tags", String(options.tagId));
  if (options.search) params.set("search", options.search);

  try {
    const { data, headers } = await wpFetch<WpPost[]>(`/posts?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.posts],
    });
    const total = Number(headers.get("X-WP-Total") || data.length || 0);
    const totalPages = Number(headers.get("X-WP-TotalPages") || 1);
    return {
      posts: (data || []).filter((p) => p.status === "publish").map(mapWpPost),
      total,
      totalPages,
      page,
      perPage,
    };
  } catch (err) {
    console.error("[wordpress] getPosts failed", err);
    return { posts: [], total: 0, totalPages: 0, page, perPage };
  }
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  if (!slug) return null;
  const params = withEmbed(new URLSearchParams());
  params.set("slug", slug);
  try {
    const { data } = await wpFetch<WpPost[]>(`/posts?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.posts, WP_CACHE_TAGS.post(slug)],
    });
    const post = (data || []).find((p) => p.status === "publish" && p.slug === slug);
    if (!post) return null;
    return mapWpPost(await withRankMathDescription(post));
  } catch (err) {
    console.error("[wordpress] getPostBySlug failed", err);
    return null;
  }
}

export async function getAllPostSlugs(): Promise<{ slug: string; modified: string }[]> {
  const slugs: { slug: string; modified: string }[] = [];
  let page = 1;
  let totalPages = 1;
  try {
    do {
      const params = new URLSearchParams({
        status: "publish",
        per_page: "100",
        page: String(page),
        _fields: "slug,modified,status",
      });
      const { data, headers } = await wpFetch<Pick<WpPost, "slug" | "modified" | "status">[]>(
        `/posts?${params}`,
        { tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.posts] }
      );
      totalPages = Number(headers.get("X-WP-TotalPages") || 1);
      for (const p of data || []) {
        if (p.status === "publish" && p.slug) {
          slugs.push({ slug: p.slug, modified: p.modified });
        }
      }
      page += 1;
    } while (page <= totalPages);
  } catch (err) {
    console.error("[wordpress] getAllPostSlugs failed", err);
  }
  return slugs;
}

export async function getCategories(): Promise<BlogTerm[]> {
  try {
    const params = new URLSearchParams({
      per_page: "100",
      hide_empty: "true",
    });
    const { data } = await wpFetch<WpTerm[]>(`/categories?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.categories],
    });
    return (data || []).map(mapWpTerm);
  } catch (err) {
    console.error("[wordpress] getCategories failed", err);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<BlogTerm | null> {
  try {
    const params = new URLSearchParams({ slug, per_page: "1" });
    const { data } = await wpFetch<WpTerm[]>(`/categories?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.categories, WP_CACHE_TAGS.category(slug)],
    });
    return data?.[0] ? mapWpTerm(data[0]) : null;
  } catch (err) {
    console.error("[wordpress] getCategoryBySlug failed", err);
    return null;
  }
}

export async function getTags(): Promise<BlogTerm[]> {
  try {
    const params = new URLSearchParams({
      per_page: "100",
      hide_empty: "true",
    });
    const { data } = await wpFetch<WpTerm[]>(`/tags?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.tags],
    });
    return (data || []).map(mapWpTerm);
  } catch (err) {
    console.error("[wordpress] getTags failed", err);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<BlogTerm | null> {
  try {
    const params = new URLSearchParams({ slug, per_page: "1" });
    const { data } = await wpFetch<WpTerm[]>(`/tags?${params}`, {
      tags: [WP_CACHE_TAGS.all, WP_CACHE_TAGS.tags, WP_CACHE_TAGS.tag(slug)],
    });
    return data?.[0] ? mapWpTerm(data[0]) : null;
  } catch (err) {
    console.error("[wordpress] getTagBySlug failed", err);
    return null;
  }
}

export async function getRelatedPosts(
  post: BlogPost,
  limit = 3
): Promise<BlogPost[]> {
  const categoryId = post.categories[0]?.id;
  if (!categoryId) {
    const latest = await getPosts({ perPage: limit + 1 });
    return latest.posts.filter((p) => p.slug !== post.slug).slice(0, limit);
  }
  const list = await getPosts({ perPage: limit + 1, categoryId });
  return list.posts.filter((p) => p.slug !== post.slug).slice(0, limit);
}
