import Link from "next/link";
import { formatBlogDate } from "@/lib/wordpress/seo";
import type { BlogPost } from "@/lib/wordpress/types";

export default function BlogCard({ post }: { post: BlogPost }) {
  const category = post.categories[0];
  return (
    <article className="blog-card">
      <Link href={`/blog/${post.slug}`} className="blog-card-media" aria-hidden={!post.image}>
        {post.image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.image.src}
            alt=""
            width={post.image.width || 800}
            height={post.image.height || 500}
          />
        ) : (
          <span aria-hidden="true" />
        )}
      </Link>
      <div className="blog-card-body">
        <div className="blog-card-meta">
          {category ? (
            <Link className="blog-card-cat" href={`/blog/category/${category.slug}`}>
              {category.name}
            </Link>
          ) : null}
          <time dateTime={post.date}>{formatBlogDate(post.date)}</time>
        </div>
        <h2>
          <Link href={`/blog/${post.slug}`}>{post.title}</Link>
        </h2>
        {post.excerptText ? <p>{post.excerptText}</p> : null}
        <Link className="blog-card-more" href={`/blog/${post.slug}`}>
          Read article →
        </Link>
      </div>
    </article>
  );
}
