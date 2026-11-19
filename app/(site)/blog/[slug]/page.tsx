import type { Metadata } from "next";
import { notFound } from "next/navigation";
import PageBodyEffects from "@/components/PageBodyEffects";
import BlogPostView from "@/components/blog/BlogPostView";
import { getAllPostSlugs, getPostBySlug, getRelatedPosts } from "@/lib/wordpress";
import {
  BlogBreadcrumbJsonLd,
  BlogPostingJsonLd,
  blogPostMetadata,
} from "@/lib/wordpress/seo";
import "@/app/blog-post.css";
import "@/app/footer-lock.css";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const slugs = await getAllPostSlugs();
  return slugs.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);
  if (!post) {
    return { title: "Article not found | Tekcroft" };
  }
  return blogPostMetadata(post);
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  if (slug === "category" || slug === "tag") notFound();

  const post = await getPostBySlug(slug);
  if (!post) notFound();

  const related = await getRelatedPosts(post, 3);

  return (
    <>
      <BlogPostingJsonLd post={post} />
      <BlogBreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ]}
      />
      <main id="main">
        <BlogPostView post={post} related={related} />
      </main>
      <PageBodyEffects />
    </>
  );
}
