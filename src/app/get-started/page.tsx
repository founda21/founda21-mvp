import { redirect } from "next/navigation";

// The public "get started" entry point is founder-only now (§ positioning
// brief §4 site map) — institutions arrive through / and /institutions'
// "Request an assessment" form instead of a chooser here. The real passcode
// form lives at /get-started/founder and is untouched.
export default function GetStartedPage() {
  redirect("/get-started/founder");
}
