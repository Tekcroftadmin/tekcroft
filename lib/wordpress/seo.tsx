import type { Metadata } from "next";
import JsonLd from "@/components/JsonLd";
import { getPublicSiteUrl } from "./config";
import type { BlogPost, BlogTerm } from "./types";

export function blogPostMetadata(post: BlogPost): Metadata {
  const robots = post.seo.robots
    ? Object.fromEntries(
        post.seo.robots.split(",").map((part) => {
          const p = part.trim().toLowerCase();
          if (p === "noindex") return ["index", false];
          if (p === "nofollow") return ["follow", false];
          return [p, true];
        })
      )
    : { index: true, follow: true };

  return {
    // Absolute so layout default "Tekcroft" never replaces a Rank Math title.
    title: post.seo.title
      ? { absolute: post.seo.title }
      : { absolute: "Tekcroft" },
    description: post.seo.description || undefined,
    alternates: { canonical: post.seo.canonical },
    robots,
    openGraph: {
      type: "article",
      siteName: "Tekcroft",
      url: post.seo.canonical,
      title: post.seo.ogTitle || undefined,
      description: post.seo.ogDescription || undefined,
      publishedTime: post.date,
      modifiedTime: post.modified,
      images: post.seo.ogImage ? [{ url: post.seo.ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: post.seo.twitterTitle || undefined,
      description: post.seo.twitterDescription || undefined,
      images: post.seo.twitterImage ? [post.seo.twitterImage] : undefined,
    },
  };
}

export function blogListingMetadata(opts: {
  title: string;
  description: string;
  path: string;
}): Metadata {
  const url = `${getPublicSiteUrl()}${opts.path}`;
  return {
    title: opts.title,
    description: opts.description,
    alternates: { canonical: url },
    openGraph: {
      type: "website",
      siteName: "Tekcroft",
      url,
      title: opts.title,
      description: opts.description,
    },
    twitter: {
      card: "summary_large_image",
      title: opts.title,
      description: opts.description,
    },
  };
}

export function BlogPostingJsonLd({ post }: { post: BlogPost }) {
  const site = getPublicSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    description: post.seo.description,
    datePublished: post.date,
    dateModified: post.modified,
    mainEntityOfPage: post.seo.canonical,
    url: post.seo.canonical,
    image: post.image?.src ? [post.image.src] : undefined,
    author: {
      "@type": "Person",
      name: post.author.name,
    },
    publisher: {
      "@type": "Organization",
      name: "Tekcroft",
      url: site,
      logo: {
        "@type": "ImageObject",
        url: `${site}/logo.png`,
      },
    },
    articleSection: post.categories.map((c) => c.name),
    keywords: post.tags.map((t) => t.name).join(", ") || undefined,
  };
  return <JsonLd data={data} />;
}

export function BlogBreadcrumbJsonLd({
  items,
}: {
  items: { name: string; path: string }[];
}) {
  const site = getPublicSiteUrl();
  const data = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: item.name,
      item: `${site}${item.path}`,
    })),
  };
  return <JsonLd data={data} />;
}

export function formatBlogDate(iso: string): string {
  try {
    const day = (iso || "").slice(0, 10);
    const [y, m, d] = day.split("-").map(Number);
    if (!y || !m || !d) return iso;
    return new Intl.DateTimeFormat("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    }).format(new Date(Date.UTC(y, m - 1, d)));
  } catch {
    return iso;
  }
}

export function termLabel(term: BlogTerm): string {
  return term.name;
}
