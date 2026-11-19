import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBodyEffects from "@/components/PageBodyEffects";
import BlogList from "@/components/blog/BlogList";
import { getPosts, getTagBySlug, getTags } from "@/lib/wordpress";
import {
  BlogBreadcrumbJsonLd,
  blogListingMetadata,
} from "@/lib/wordpress/seo";
import "@/app/blog.css";
import "@/app/footer-lock.css";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const tags = await getTags();
  return tags.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const tag = await getTagBySlug(slug);
  if (!tag) return { title: "Tag not found | Tekcroft" };
  return blogListingMetadata({
    title: `${tag.name} | Tekcroft Blog`,
    description:
      tag.description || `Articles tagged ${tag.name} from Tekcroft.`,
    path: `/blog/tag/${tag.slug}`,
  });
}

export default async function BlogTagPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const page = Math.max(1, Number(sp.page) || 1);
  const tag = await getTagBySlug(slug);
  if (!tag) notFound();

  const list = await getPosts({ page, tagId: tag.id });

  return (
    <>
      <BlogBreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: tag.name, path: `/blog/tag/${tag.slug}` },
        ]}
      />
      <main id="main">
        <section className="sec blog-page" data-ground="white">
          <div className="wrap">
            <header className="blog-head">
              <nav className="blog-crumbs" aria-label="Breadcrumb">
                <Link href="/">Home</Link>
                <span aria-hidden="true">/</span>
                <Link href="/blog">Blog</Link>
                <span aria-hidden="true">/</span>
                <span>{tag.name}</span>
              </nav>
              <p className="blog-kicker">Tag</p>
              <h1 className="blog-title">{tag.name}</h1>
              {tag.description ? (
                <p className="blog-lede">{tag.description}</p>
              ) : (
                <p className="blog-lede">Published articles tagged {tag.name}.</p>
              )}
            </header>
            <BlogList
              posts={list.posts}
              page={list.page}
              totalPages={list.totalPages}
              basePath={`/blog/tag/${tag.slug}`}
              emptyTitle="No articles with this tag yet"
              emptyBody="Check back soon, or browse the full blog."
            />
          </div>
        </section>
      </main>
      <PageBodyEffects />
    </>
  );
}
