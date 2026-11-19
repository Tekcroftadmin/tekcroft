import Link from "next/link";
import BlogCard from "./BlogCard";
import { formatBlogDate } from "@/lib/wordpress/seo";
import type { BlogPost } from "@/lib/wordpress/types";

type BlogArticleProps = {
  post: BlogPost;
  related?: BlogPost[];
};

export default function BlogArticle({ post, related = [] }: BlogArticleProps) {
  return (
    <article>
      <header className="blog-article-hero">
        <nav className="blog-crumbs" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true">/</span>
          <Link href="/blog">Blog</Link>
          <span aria-hidden="true">/</span>
          <span>{post.title}</span>
        </nav>
        <p className="blog-kicker">Tekcroft Blog</p>
        <h1 className="blog-title">{post.title}</h1>
        <div className="blog-article-meta">
          <span>By {post.author.name}</span>
          <time dateTime={post.date}>Published {formatBlogDate(post.date)}</time>
          {post.modified && post.modified !== post.date ? (
            <time dateTime={post.modified}>
              Updated {formatBlogDate(post.modified)}
            </time>
          ) : null}
          {post.categories.map((c) => (
            <Link key={c.id} href={`/blog/category/${c.slug}`}>
              {c.name}
            </Link>
          ))}
        </div>
      </header>

      {post.image ? (
        <div className="blog-featured">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={post.image.src}
            alt={post.image.alt || post.title}
            width={post.image.width || 1200}
            height={post.image.height || 675}
          />
        </div>
      ) : null}

      <div
        className="blog-content"
        dangerouslySetInnerHTML={{ __html: post.contentHtml }}
      />

      {(post.categories.length > 0 || post.tags.length > 0) && (
        <div className="blog-tax">
          {post.categories.length > 0 ? (
            <div className="blog-tax-row">
              <span className="blog-tax-label">Categories</span>
              {post.categories.map((c) => (
                <Link key={c.id} className="blog-chip" href={`/blog/category/${c.slug}`}>
                  {c.name}
                </Link>
              ))}
            </div>
          ) : null}
          {post.tags.length > 0 ? (
            <div className="blog-tax-row">
              <span className="blog-tax-label">Tags</span>
              {post.tags.map((t) => (
                <Link key={t.id} className="blog-chip" href={`/blog/tag/${t.slug}`}>
                  {t.name}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      )}

      {related.length > 0 ? (
        <section className="blog-related" aria-label="Related articles">
          <h2>Related articles</h2>
          <div className="blog-grid">
            {related.map((p) => (
              <BlogCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : null}
    </article>
  );
}
