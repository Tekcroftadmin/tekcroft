import Link from "next/link";
import BlogCard from "./BlogCard";
import BlogPagination from "./BlogPagination";
import type { BlogPost } from "@/lib/wordpress/types";

type BlogListProps = {
  posts: BlogPost[];
  page: number;
  totalPages: number;
  basePath: string;
  emptyTitle?: string;
  emptyBody?: string;
};

export default function BlogList({
  posts,
  page,
  totalPages,
  basePath,
  emptyTitle = "Insights coming soon",
  emptyBody = "We are preparing practical articles on SEO, AI search, and product development. Meanwhile, explore our services or get in touch.",
}: BlogListProps) {
  if (!posts.length) {
    return (
      <div className="blog-empty">
        <h2 className="blog-title" style={{ fontSize: "clamp(1.4rem,3vw,1.9rem)" }}>
          {emptyTitle}
        </h2>
        <p>{emptyBody}</p>
        <div className="blog-actions">
          <Link className="btn btn-primary" href="/services/seo-services">
            View services
          </Link>
          <Link className="btn btn-primary" href="/contact-us">
            Contact us
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="blog-grid">
        {posts.map((post) => (
          <BlogCard key={post.id} post={post} />
        ))}
      </div>
      <BlogPagination page={page} totalPages={totalPages} basePath={basePath} />
    </>
  );
}
