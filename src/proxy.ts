import { type NextRequest, NextResponse } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

const CANONICAL_HOST = "founda21.com";

// Only the specific production alias, not every *.vercel.app host — a
// blanket suffix match would also redirect away Vercel's per-branch preview
// deployments, breaking the ability to test a branch before it's live.
const NON_CANONICAL_HOSTS = new Set(["www.founda21.com", "founda21-mvp.vercel.app"]);

export async function proxy(request: NextRequest) {
  const host = request.headers.get("host") ?? "";
  if (NON_CANONICAL_HOSTS.has(host)) {
    const url = new URL(request.url);
    url.protocol = "https:";
    url.host = CANONICAL_HOST;
    return NextResponse.redirect(url, 308);
  }

  return updateSession(request);
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
