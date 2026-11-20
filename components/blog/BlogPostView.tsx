import Link from "next/link";
import BlogPostEffects from "./BlogPostEffects";
import { accentTitleHtml, prepareArticleContent } from "./processArticle";
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

const READ_MORE = (
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

function shareUrls(canonical: string, title: string) {
  const url = encodeURIComponent(canonical);
  const text = encodeURIComponent(title);
  return {
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
    x: `https://twitter.com/intent/tweet?url=${url}&text=${text}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${url}`,
    copy: canonical,
  };
}

type BlogPostViewProps = {
  post: BlogPost;
  related?: BlogPost[];
};

export default function BlogPostView({
  post,
  related = [],
}: BlogPostViewProps) {
  // Body HTML already has FAQs removed in mapWpPost; only TOC/tables here.
  // FAQ Q&A always comes from the WordPress post (`post.faqs`).
  const focusKeyword = post.seo.focusKeyword;
  const { html, toc } = prepareArticleContent(post.contentHtml, focusKeyword);
  const titleHtml = accentTitleHtml(post.title, focusKeyword);
  const faqs = post.faqs || [];
  const faqHeading = post.faqHeading || "FAQs";
  const share = shareUrls(post.seo.canonical, post.title);
  const relatedThree = related.slice(0, 3);

  return (
    <div className="blog-post-page">
      <div className="blog-post-page__progress" aria-hidden="true" />

      <div className="blog-post-page__layout">
        <article className="blog-post-page__post" id="article">
          <h1
            className="blog-post-page__title"
            dangerouslySetInnerHTML={{ __html: titleHtml }}
          />

          {post.image ? (
            <div className="blog-post-page__hero-img">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={post.image.src}
                alt={post.image.alt || post.title}
                width={post.image.width || 1200}
                height={post.image.height || 675}
              />
            </div>
          ) : (
            <div
              className="blog-post-page__hero-img blog-post-page__hero-img--empty"
              role="img"
              aria-label=""
            />
          )}

          <div className="blog-post-page__inner">
            <div
              className="blog-post-page__body"
              dangerouslySetInnerHTML={{ __html: html }}
            />

            {faqs.length > 0 ? (
              <section
                className="blog-post-page__faq-wrap"
                aria-label={faqHeading}
                id="faqs"
              >
                <h2 id="faqs-heading">{faqHeading}</h2>
                <div className="blog-post-page__faq faq">
                  {faqs.map((item, i) => (
                    <details key={i} open={i === 0 || undefined}>
                      <summary>{item.question}</summary>
                      <div
                        className="ans"
                        dangerouslySetInnerHTML={{ __html: item.answerHtml }}
                      />
                    </details>
                  ))}
                </div>
              </section>
            ) : null}

            <div className="blog-post-page__share">
              <span>Share this article</span>
              <a
                href={share.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zM3 9.75h4v11.25H3zM9.5 9.75h3.8v1.6h.06c.53-1 1.82-2.05 3.75-2.05 4 0 4.74 2.63 4.74 6.05V21h-4v-5.1c0-1.22-.02-2.78-1.7-2.78-1.7 0-1.96 1.33-1.96 2.69V21h-4z" />
                </svg>
              </a>
              <a
                href={share.x}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on X"
              >
                <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M17.8 3h3.1l-6.8 7.7L22 21h-6.2l-4.9-6.3L5.3 21H2.2l7.3-8.3L2 3h6.4l4.4 5.8zm-1.1 16.2h1.7L7.4 4.7H5.6z" />
                </svg>
              </a>
              <a
                href={share.facebook}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                  <path d="M13.5 21v-8h2.7l.4-3.2h-3.1V7.8c0-.9.3-1.5 1.6-1.5h1.7V3.4c-.3 0-1.3-.1-2.5-.1-2.5 0-4.1 1.5-4.1 4.2v2.3H7.5V13h2.7v8z" />
                </svg>
              </a>
              <a href={share.copy} aria-label="Copy link">
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
                  <path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1" />
                </svg>
              </a>
            </div>
          </div>
        </article>

        <aside aria-label="Article sidebar">
          <div className="blog-post-page__side">
            {toc.length > 0 ? (
              <nav className="blog-post-page__toc" aria-label="On this page">
                <h3>On this page</h3>
                <ol className="blog-post-page__toc-list">
                  {toc.map((item) => (
                    <li key={item.id}>
                      <a href={`#${item.id}`}>{item.text}</a>
                    </li>
                  ))}
                  {faqs.length > 0 ? (
                    <li>
                      <a href="#faqs">{faqHeading}</a>
                    </li>
                  ) : null}
                </ol>
              </nav>
            ) : null}

            <div className="blog-post-page__help">
              <h3>Want help with your SEO?</h3>
              <p>Tell us about your business and we will send a free proposal.</p>
              <Link className="blog-post-page__btn-sm" href="/book-a-free-evaluation">
                Get a Free Proposal
                <span className="blog-post-page__ico">{ARROW}</span>
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {relatedThree.length > 0 ? (
        <div className="blog-post-page__band">
          <section className="blog-post-page__related wrap">
            <h2>Related Articles</h2>
            <div className="blog-post-page__grid">
              {relatedThree.map((p) => (
                <article key={p.id} className="blog-post-page__card">
                  <Link
                    className="blog-post-page__cover"
                    href={`/blog/${p.slug}`}
                    aria-label={p.title}
                  >
                    {p.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={p.image.src}
                        alt=""
                        width={p.image.width || 800}
                        height={p.image.height || 500}
                      />
                    ) : (
                      <span className="blog-post-page__cover-empty" aria-hidden="true" />
                    )}
                  </Link>
                  <div className="blog-post-page__card-body">
                    <div className="blog-post-page__date">
                      <time dateTime={p.date}>{formatListingDate(p.date)}</time>
                    </div>
                    <h3>
                      <Link href={`/blog/${p.slug}`}>{p.title}</Link>
                    </h3>
                    <div className="blog-post-page__card-foot">
                      <Link className="blog-post-page__more" href={`/blog/${p.slug}`}>
                        Read More {READ_MORE}
                      </Link>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </section>
        </div>
      ) : null}

      <div className="blog-post-page__cta-band">
        <section className="blog-post-page__cta">
          <div className="blog-post-page__cta-box">
            <div className="blog-post-page__cta-bg" aria-hidden="true" />
            <div className="blog-post-page__glass">
              <h2>
                Ready To Build A Marketing Strategy That <span>Performs?</span>
              </h2>
              <p>
                Tell us where your business stands today. We&rsquo;ll look at the
                market, the opportunities, and what should come next.
              </p>
              <div className="blog-post-page__actions">
                <Link
                  className="blog-post-page__btn-lg"
                  href="/book-a-free-evaluation"
                >
                  Get Your Free Proposal
                  <span className="blog-post-page__ico">{ARROW}</span>
                </Link>
                <a
                  className="blog-post-page__mail"
                  href="mailto:admin@tekcroft.com"
                >
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

      <BlogPostEffects />
    </div>
  );
}
