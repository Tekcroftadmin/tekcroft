import Link from "next/link";
import BlogPagination from "./BlogPagination";
import type { BlogPost } from "@/lib/wordpress/types";

const ARROW = (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2.4"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

const READ_MORE_ARROW = (
  <svg
    width="18"
    height="18"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

function formatListingDate(iso: string): string {
  try {
    const day = (iso || "").slice(0, 10);
    const [y, m, d] = day.split("-").map(Number);
    if (!y || !m || !d) return iso;
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return `${String(d).padStart(2, "0")} ${months[m - 1]}, ${y}`;
  } catch {
    return iso;
  }
}

type BlogListingProps = {
  posts: BlogPost[];
  page: number;
  totalPages: number;
};

export default function BlogListing({
  posts,
  page,
  totalPages,
}: BlogListingProps) {
  return (
    <div className="blog-listing">
      <header className="blog-listing__hero">
        <div className="blog-listing__hero-bg" aria-hidden="true" />
        <div className="wrap">
          <div className="blog-listing__hero-title">
            <h1>Blog</h1>
            <p>
              SEO guides, AI search insights and growth strategies from the
              Tekcroft team.
            </p>
            <div className="blog-listing__crumbs">
              <Link href="/">Home</Link>
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#fff"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M4 12h16M14 6l6 6-6 6" />
              </svg>
              <span aria-current="page">Blog</span>
            </div>
          </div>
        </div>
      </header>

      <main id="main">
        <section className="wrap blog-listing__grid-wrap">
          {!posts.length ? (
            <div className="blog-listing__empty">
              <h2>Insights coming soon</h2>
              <p>
                We are preparing practical articles on SEO, AI search, and
                product development. Meanwhile, explore our services or get in
                touch.
              </p>
              <div className="blog-listing__empty-actions">
                <Link className="btn btn-primary" href="/services/seo-services">
                  View services
                </Link>
                <Link className="btn btn-primary" href="/contact-us">
                  Contact us
                </Link>
              </div>
            </div>
          ) : (
            <>
              <div className="blog-listing__grid">
                {posts.map((post) => (
                  <article key={post.id} className="blog-listing__card">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="blog-listing__cover"
                      aria-label={post.title}
                    >
                      {post.image ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={post.image.src}
                          alt=""
                          width={post.image.width || 800}
                          height={post.image.height || 500}
                        />
                      ) : (
                        <span className="blog-listing__cover-empty" aria-hidden="true" />
                      )}
                    </Link>
                    <div className="blog-listing__card-body">
                      <div className="blog-listing__date">
                        <time dateTime={post.date}>
                          {formatListingDate(post.date)}
                        </time>
                      </div>
                      <h2>
                        <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                      </h2>
                      <div className="blog-listing__card-foot">
                        <Link className="blog-listing__more" href={`/blog/${post.slug}`}>
                          Read More {READ_MORE_ARROW}
                        </Link>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
              <BlogPagination
                page={page}
                totalPages={totalPages}
                basePath="/blog"
              />
            </>
          )}
        </section>

        <div className="blog-listing__cta-band">
          <section className="blog-listing__cta">
            <div className="blog-listing__cta-box">
              <div className="blog-listing__cta-bg" aria-hidden="true" />
              <div className="blog-listing__glass">
                <h2>
                  Ready To Build A Marketing Strategy That <span>Performs?</span>
                </h2>
                <p>
                  Tell us where your business stands today. We&rsquo;ll look at
                  the market, the opportunities, and what should come next.
                </p>
                <div className="blog-listing__actions">
                  <Link className="blog-listing__btn" href="/book-a-free-evaluation">
                    Get Your Free Proposal
                    <span className="blog-listing__btn-ico">{ARROW}</span>
                  </Link>
                  <a className="blog-listing__mail" href="mailto:admin@tekcroft.com">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      aria-hidden="true"
                    >
                      <rect x="3" y="5" width="18" height="14" rx="2" />
                      <path d="M3 7l9 6 9-6" />
                    </svg>
                    admin@tekcroft.com
                  </a>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
