import PageBodyEffects from "@/components/PageBodyEffects";
import BlogListing from "@/components/blog/BlogListing";
import { getPosts } from "@/lib/wordpress";
import { blogListingMetadata } from "@/lib/wordpress/seo";
import "@/app/blog-listing.css";
import "@/app/footer-lock.css";

/** Fallback refresh if on-demand revalidate webhook is misconfigured. */
export const revalidate = 60;

export const metadata = blogListingMetadata({
  title: "Blog | Tekcroft",
  description:
    "Insights on SEO, AI, and software development from Tekcroft.",
  path: "/blog",
});

type BlogPageProps = {
  searchParams?: Promise<{ page?: string }>;
};

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const sp = (await searchParams) || {};
  const page = Math.max(1, Number(sp.page) || 1);
  const list = await getPosts({ page });

  return (
    <>
      <BlogListing
        posts={list.posts}
        page={list.page}
        totalPages={list.totalPages}
      />
      <PageBodyEffects />
    </>
  );
}
