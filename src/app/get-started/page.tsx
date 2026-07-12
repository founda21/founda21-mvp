import { redirect } from "next/navigation";

// The Founder/Funder chooser now lives on the landing page itself (§ spec
// §4 — B2B landing with two equal-weight CTAs). Kept as a redirect rather
// than deleted so any existing bookmarks/links to /get-started still land
// somewhere sensible.
export default function GetStartedPage() {
  redirect("/");
}
