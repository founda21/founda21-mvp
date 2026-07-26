import * as Sentry from "@sentry/nextjs";

// Inlined rather than split into sentry.server.config.ts/sentry.edge.config.ts
// (Sentry's usual pattern) — Turbopack dev mode fails to resolve the dynamic
// import() of sibling files from within this specially-compiled
// instrumentation bundle, even though `next build` handles it fine. Inlining
// avoids the dynamic import entirely; behavior is identical either way.
export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs" || process.env.NEXT_RUNTIME === "edge") {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
    });
  }
}

export const onRequestError = Sentry.captureRequestError;
