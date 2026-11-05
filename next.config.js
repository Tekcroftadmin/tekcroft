/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: false,
  poweredByHeader: false,
  /* Modern browserslist in package.json — avoid shipping legacy polyfills */
  compiler: {
    removeConsole: process.env.NODE_ENV === "production" ? { exclude: ["error"] } : false,
  },
  experimental: {
    /* Critical CSS is manually inlined in (site)/layout; Critters off to avoid double-processing */
    optimizeCss: false,
  },
  images: {
    formats: ["image/webp", "image/avif"],
  },
  async redirects() {
    return [
      /* Legacy short privacy URL → canonical privacy policy */
      {
        source: "/privacy",
        destination: "/privacy-policy",
        permanent: true,
      },
      /* Old root service URLs → /services/<slug> */
      {
        source: "/google-business-profile-optimization-services",
        destination: "/services/google-business-profile-optimization-services",
        permanent: true,
      },
      {
        source: "/custom-software-development-services",
        destination: "/services/custom-software-development-services",
        permanent: true,
      },
      {
        source: "/web-design-and-development-services",
        destination: "/services/web-design-and-development-services",
        permanent: true,
      },
      {
        source: "/web-and-app-development-services",
        destination: "/services/web-and-app-development-services",
        permanent: true,
      },
      {
        source: "/artificial-intelligence-services",
        destination: "/services/artificial-intelligence-services",
        permanent: true,
      },
      {
        source: "/ai-chatbot-development-services",
        destination: "/services/ai-chatbot-development-services",
        permanent: true,
      },
      {
        source: "/mobile-app-development-services",
        destination: "/services/mobile-app-development-services",
        permanent: true,
      },
      {
        source: "/ai-agent-development-services",
        destination: "/services/ai-agent-development-services",
        permanent: true,
      },
      {
        source: "/ai-development-services",
        destination: "/services/ai-development-services",
        permanent: true,
      },
      {
        source: "/franchise-seo-services",
        destination: "/services/franchise-seo-services",
        permanent: true,
      },
      {
        source: "/ecommerce-seo-services",
        destination: "/services/ecommerce-seo-services",
        permanent: true,
      },
      {
        source: "/technical-seo-services",
        destination: "/services/technical-seo-services",
        permanent: true,
      },
      {
        source: "/on-page-seo-services",
        destination: "/services/on-page-seo-services",
        permanent: true,
      },
      {
        source: "/seo-audit-services",
        destination: "/services/seo-audit-services",
        permanent: true,
      },
      {
        source: "/local-seo-services",
        destination: "/services/local-seo-services",
        permanent: true,
      },
      {
        source: "/ai-seo-services",
        destination: "/services/ai-seo-services",
        permanent: true,
      },
      {
        source: "/seo-services",
        destination: "/services/seo-services",
        permanent: true,
      },
      /* Short legacy aliases → prefixed service slugs */
      {
        source: "/services/ecommerce-seo",
        destination: "/services/ecommerce-seo-services",
        permanent: true,
      },
      {
        source: "/services/on-page-seo",
        destination: "/services/on-page-seo-services",
        permanent: true,
      },
      {
        source: "/services/technical-seo",
        destination: "/services/technical-seo-services",
        permanent: true,
      },
      {
        source: "/services/local-seo",
        destination: "/services/local-seo-services",
        permanent: true,
      },
      {
        source: "/services/google-business-profile-optimization",
        destination: "/services/google-business-profile-optimization-services",
        permanent: true,
      },
      {
        source: "/services/franchise-seo",
        destination: "/services/franchise-seo-services",
        permanent: true,
      },
      {
        source: "/services/web-and-app-development",
        destination: "/services/web-and-app-development-services",
        permanent: true,
      },
      {
        source: "/services/web-design-and-development",
        destination: "/services/web-design-and-development-services",
        permanent: true,
      },
      {
        source: "/services/software-development-services",
        destination: "/services/custom-software-development-services",
        permanent: true,
      },
      {
        source: "/services/mobile-app-development",
        destination: "/services/mobile-app-development-services",
        permanent: true,
      },
      /* TEMP: /case-studies not built yet */
      {
        source: "/case-studies",
        destination: "/",
        permanent: false,
      },
      {
        source: "/contact",
        destination: "/contact-us",
        permanent: true,
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
      { source: "/tekcroft-home-defer.:hash.js", headers: immutable },
      { source: "/tekcroft-mm.:hash.js", headers: immutable },
      { source: "/tekcroft-vs-halo.:hash.js", headers: immutable },
      { source: "/tekcroft-contact.:hash.js", headers: immutable },
      { source: "/tekcroft-about-us.:hash.js", headers: immutable },
      { source: "/tekcroft-book-a-free-evaluation.:hash.js", headers: immutable },
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
