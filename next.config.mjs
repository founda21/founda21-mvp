const isDev = process.env.NODE_ENV === "development";

// Supabase's browser client (supabase-js) talks directly to this host for
// auth/session calls, so it must be explicitly allowed in connect-src.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";

// Static (non-nonce) CSP, deliberately — nonce-based CSP forces every page
// to render dynamically (no static generation, no CDN caching), which
// directly conflicts with keeping the site fast. 'unsafe-inline' for
// script/style is the standard, common trade every static-friendly Next.js
// CSP makes; everything else here (frame-ancestors, form-action, base-uri,
// object-src, connect-src allowlist) still blocks the bulk of real attack
// classes (clickjacking, exfiltration to arbitrary hosts, base-tag/form
// hijacking, plugin-based injection).
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data:;
  font-src 'self';
  connect-src 'self' ${supabaseUrl} https://*.ingest.sentry.io https://*.sentry.io;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`
  .replace(/\s{2,}/g, " ")
  .trim();

/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["pdf-parse", "pdfjs-dist", "@napi-rs/canvas"],
  async redirects() {
    return [
      // §5 positioning brief — /methodology moved to /provenance, same
      // content, updated terminology.
      { source: "/methodology", destination: "/provenance", permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: cspHeader },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
          },
          ...(isDev
            ? []
            : [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]),
        ],
      },
    ];
  },
};

// No-op wrapper without SENTRY_DSN — avoids invoking the Sentry build
// plugin (source-map upload, etc.) at all until Sentry is actually
// configured, so an unconfigured Sentry never affects the build.
export default process.env.SENTRY_DSN
  ? (await import("@sentry/nextjs")).withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: !process.env.CI,
    })
  : nextConfig;
