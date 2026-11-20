import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import PageBodyEffects from "@/components/PageBodyEffects";
import BlogList from "@/components/blog/BlogList";
import { getCategories, getCategoryBySlug, getPosts } from "@/lib/wordpress";
import {
  BlogBreadcrumbJsonLd,
  blogListingMetadata,
} from "@/lib/wordpress/seo";
import "@/app/blog.css";
import "@/app/footer-lock.css";

/** Fallback refresh if on-demand revalidate webhook is misconfigured. */
export const revalidate = 60;

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ page?: string }>;
};

export async function generateStaticParams() {
  const cats = await getCategories();
  return cats.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = await getCategoryBySlug(slug);
  if (!category) return { title: "Category not found | Tekcroft" };
  return blogListingMetadata({
    title: `${category.name} | Tekcroft Blog`,
    description:
      category.description ||
      `Articles in the ${category.name} category from Tekcroft.`,
    path: `/blog/category/${category.slug}`,
  });
}

export default async function BlogCategoryPage({
  params,
  searchParams,
}: PageProps) {
  const { slug } = await params;
  const sp = (await searchParams) || {};
  const page = Math.max(1, Number(sp.page) || 1);
  const category = await getCategoryBySlug(slug);
  if (!category) notFound();

  const list = await getPosts({ page, categoryId: category.id });

  return (
    <>
      <BlogBreadcrumbJsonLd
        items={[
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: category.name, path: `/blog/category/${category.slug}` },
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
                <span>{category.name}</span>
              </nav>
              <p className="blog-kicker">Category</p>
              <h1 className="blog-title">{category.name}</h1>
              {category.description ? (
                <p className="blog-lede">{category.description}</p>
              ) : (
                <p className="blog-lede">
                  Published articles in {category.name}.
                </p>
              )}
            </header>
            <BlogList
              posts={list.posts}
              page={list.page}
              totalPages={list.totalPages}
              basePath={`/blog/category/${category.slug}`}
              emptyTitle="No articles in this category yet"
              emptyBody="Check back soon, or browse the full blog."
            />
          </div>
        </section>
      </main>
      <PageBodyEffects />
    </>
  );
}
