/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  /* Modern browserslist in package.json — avoid shipping legacy polyfills */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    /* Critters: inline above-the-fold CSS, defer the rest (LCP/FCP) */
    optimizeCss: true,
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async redirects() {
    return [
      /* Short legacy aliases → root service slugs */
      {
        source: "/services/ecommerce-seo",
        destination: "/ecommerce-seo-services",
        permanent: true,
      },
      {
        source: "/services/on-page-seo",
        destination: "/on-page-seo-services",
        permanent: true,
      },
      {
        source: "/services/technical-seo",
        destination: "/technical-seo-services",
        permanent: true,
      },
      {
        source: "/services/local-seo",
        destination: "/local-seo-services",
        permanent: true,
      },
      {
        source: "/services/google-business-profile-optimization",
        destination: "/google-business-profile-optimization-services",
        permanent: true,
      },
      {
        source: "/services/franchise-seo",
        destination: "/franchise-seo-services",
        permanent: true,
      },
      {
        source: "/services/web-and-app-development",
        destination: "/web-and-app-development-services",
        permanent: true,
      },
      {
        source: "/services/web-design-and-development",
        destination: "/web-design-and-development-services",
        permanent: true,
      },
      {
        source: "/services/software-development-services",
        destination: "/custom-software-development-services",
        permanent: true,
      },
      {
        source: "/services/mobile-app-development",
        destination: "/mobile-app-development-services",
        permanent: true,
      },
      /* Bare /services → home (no hash URLs) */
      {
        source: "/services",
        destination: "/",
        permanent: true,
      },
      /* /services/<slug> → /<slug> (SEO permanent redirect) */
      {
        source: "/services/:slug*",
        destination: "/:slug*",
        permanent: true,
      },
      /* TEMP: pages not built yet — remove when /case-studies, /contact-us ship */
      {
        source: "/case-studies",
        destination: "/",
        permanent: false,
      },
      {
        source: "/contact-us",
        destination: "/contact",
        permanent: false,
      },
    ];
  },
  async headers() {
    const immutable = [
      {
        key: "Cache-Control",
        value: "public, max-age=31536000, immutable",
      },
    ];
    const headers = [
      { source: "/images/:path*", headers: immutable },
      { source: "/tekcroft-main.:hash.js", headers: immutable },
      { source: "/tekcroft-mm.:hash.js", headers: immutable },
      { source: "/tekcroft-vs-halo.:hash.js", headers: immutable },
      { source: "/tekcroft-contact.:hash.js", headers: immutable },
      { source: "/tekcroft-about-us.:hash.js", headers: immutable },
      { source: "/tekcroft-ecommerce-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-seo-audit-services.:hash.js", headers: immutable },
      { source: "/tekcroft-technical-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-local-seo.:hash.js", headers: immutable },
      { source: "/tekcroft-on-page-seo.:hash.js", headers: immutable },
      {
        source: "/tekcroft-google-business-profile-optimization.:hash.js",
        headers: immutable,
      },
      {
        source: "/tekcroft-mobile-app-development.:hash.js",
        headers: immutable,
      },
      {
        source: "/tekcroft-artificial-intelligence-services.:hash.js",
        headers: immutable,
      },
      {
        source: "/:path*",
        headers: [{ key: "X-Content-Type-Options", value: "nosniff" }],
      },
    ];
    // Never pin /_next/static in dev — immutable headers freeze stale Turbopack chunks.
    if (process.env.NODE_ENV === "production") {
      headers.splice(-1, 0, {
        source: "/_next/static/:path*",
        headers: immutable,
      });
    }
    return headers;
  },
};

module.exports = nextConfig;
