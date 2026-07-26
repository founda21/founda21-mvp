// The public marketing domain — used anywhere a URL is meant for someone
// outside the app itself (e.g. printed on the recruitment card), never
// derived from the request origin, which would print "localhost:3000" on
// anything generated in dev. Distinct from siteOrigin() in actions/auth.ts,
// which deliberately DOES use the request origin, because that one builds a
// working auth-callback redirect for whatever environment is actually
// running, not a human-facing brand URL.
export const FOUNDA21_SITE_URL = "https://founda21.com";
