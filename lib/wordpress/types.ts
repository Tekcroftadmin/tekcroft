export type WpRendered = {
  rendered: string;
  protected?: boolean;
};

export type WpTerm = {
  id: number;
  name: string;
  slug: string;
  taxonomy?: string;
  count?: number;
  description?: string;
};

export type WpAuthor = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  url?: string;
  avatar_urls?: Record<string, string>;
};

export type WpMedia = {
  id: number;
  source_url?: string;
  alt_text?: string;
  media_details?: {
    width?: number;
    height?: number;
    sizes?: Record<
      string,
      { source_url?: string; width?: number; height?: number }
    >;
  };
};

export type WpRankMath = {
  title?: string;
  description?: string;
  focus_keyword?: string;
  canonical_url?: string;
  robots?: string[] | string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
};

export type WpPost = {
  id: number;
  date: string;
  date_gmt?: string;
  modified: string;
  modified_gmt?: string;
  slug: string;
  status: string;
  link: string;
  title: WpRendered;
  content: WpRendered;
  excerpt: WpRendered;
  author: number;
  featured_media: number;
  categories: number[];
  tags: number[];
  meta?: Record<string, unknown> & {
    rank_math?: WpRankMath;
    rank_math_title?: string;
    rank_math_description?: string;
    rank_math_focus_keyword?: string;
  };
  rank_math?: WpRankMath;
  _embedded?: {
    author?: WpAuthor[];
    "wp:featuredmedia"?: WpMedia[];
    "wp:term"?: WpTerm[][];
  };
};

export type BlogImage = {
  src: string;
  alt: string;
  width?: number;
  height?: number;
};

export type BlogTerm = {
  id: number;
  name: string;
  slug: string;
  description?: string;
  count?: number;
};

export type BlogSeo = {
  title: string;
  description: string;
  canonical: string;
  robots?: string;
  focusKeyword?: string;
  ogTitle: string;
  ogDescription: string;
  ogImage?: string;
  twitterTitle: string;
  twitterDescription: string;
  twitterImage?: string;
};

export type BlogFaq = {
  question: string;
  answerHtml: string;
};

export type BlogPost = {
  id: number;
  slug: string;
  title: string;
  excerptHtml: string;
  excerptText: string;
  /** Article body HTML with FAQ block removed (FAQs live in `faqs`). */
  contentHtml: string;
  /** FAQ accordion items parsed from the WordPress post content. */
  faqs: BlogFaq[];
  /** FAQ section heading from the WordPress post (e.g. "FAQs"). */
  faqHeading: string;
  date: string;
  modified: string;
  author: BlogTerm & { description?: string };
  categories: BlogTerm[];
  tags: BlogTerm[];
  image?: BlogImage;
  seo: BlogSeo;
};

export type BlogListResult = {
  posts: BlogPost[];
  total: number;
  totalPages: number;
  page: number;
  perPage: number;
};
