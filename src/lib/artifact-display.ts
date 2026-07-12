// Uploaded-file and link references are embedded as bracketed prefixes inside
// artifactContent by submission.ts (e.g. "[Uploaded file: deck.pptx, stored
// at f1/checkpoint-19/attempt-2.pptx]"). Funders need these pulled back out
// as real download links rather than reading raw bracket text.

export type FileReference = { label: string; storagePath: string };

const FILE_REF_REGEX = /\[Uploaded (?:file|image): (.+?), stored at (.+?)\]/g;
const LINK_REF_REGEX = /\[Link: (.+?)\]/;

export function extractFileReferences(text: string): FileReference[] {
  return Array.from(text.matchAll(FILE_REF_REGEX)).map((match) => ({
    label: match[1],
    storagePath: match[2],
  }));
}

export function extractLinkReference(text: string): string | null {
  return text.match(LINK_REF_REGEX)?.[1] ?? null;
}

export function stripReferences(text: string): string {
  return text
    .replace(FILE_REF_REGEX, "")
    .replace(LINK_REF_REGEX, "")
    .replace(/^[\s\n-]+/, "")
    .trim();
}

// Every link rendered as a clickable <a href> on the funder dashboard comes
// from founder-submitted text (recording link, website, data room link,
// etc.) with no server-side scheme check until now — a founder could submit
// `javascript:...` and have it render as a real link in an institution
// admin's browser. Only allow http(s); anything else renders as plain text.
export function sanitizeUrl(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  try {
    const url = new URL(trimmed);
    if (url.protocol === "http:" || url.protocol === "https:") return trimmed;
  } catch {
    // Not a valid absolute URL.
  }
  return null;
}
