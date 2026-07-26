import AdmZip from "adm-zip";
import * as XLSX from "xlsx";
import { extractPdfText } from "@/lib/pdf-extract";

export type ExtractedArtifact =
  | { kind: "text"; text: string }
  | { kind: "image"; mimeType: string; base64: string };

const IMAGE_EXTENSIONS: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  webp: "image/webp",
  gif: "image/gif",
};

// Matches the extensions the upload toolbar's accept= already advertises to
// the browser — that attribute is a UI hint only, not a security boundary,
// so it's enforced again here server-side before the file is extracted or
// stored.
const ALLOWED_UPLOAD_EXTENSIONS = new Set([
  "pdf",
  "ppt",
  "pptx",
  "doc",
  "docx",
  "xlsx",
  "xls",
  "csv",
  ...Object.keys(IMAGE_EXTENSIONS),
]);

const MAX_UPLOAD_BYTES = 15 * 1024 * 1024; // 15MB

export type FileValidationResult = { ok: true } | { ok: false; error: string };

// System integrity fix — server-side upload validation (§ abuse/security
// prevention). Must run before extractFile/uploadArtifactFile: those trust
// their input, this is the actual gate.
export function validateUploadedFile(file: File): FileValidationResult {
  if (file.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: `File is too large (${Math.round(file.size / (1024 * 1024))}MB), max ${MAX_UPLOAD_BYTES / (1024 * 1024)}MB.`,
    };
  }
  if (file.size === 0) {
    return { ok: false, error: "That file is empty." };
  }
  const ext = file.name.toLowerCase().split(".").pop() ?? "";
  if (!ALLOWED_UPLOAD_EXTENSIONS.has(ext)) {
    return {
      ok: false,
      error: `Unsupported file type ".${ext}", allowed: PDF, PPT/PPTX, DOC/DOCX, XLS/XLSX, CSV, or an image (PNG/JPG/WEBP/GIF).`,
    };
  }
  return { ok: true };
}

function stripXmlTags(xml: string): string {
  return xml
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function extractPptxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const slideEntries = zip
    .getEntries()
    .filter((e) => /^ppt\/slides\/slide\d+\.xml$/.test(e.entryName))
    .sort((a, b) => {
      const na = Number(a.entryName.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      const nb = Number(b.entryName.match(/slide(\d+)\.xml/)?.[1] ?? 0);
      return na - nb;
    });

  return slideEntries
    .map((entry, i) => `--- Slide ${i + 1} ---\n${stripXmlTags(entry.getData().toString("utf-8"))}`)
    .join("\n\n");
}

function extractDocxText(buffer: Buffer): string {
  const zip = new AdmZip(buffer);
  const doc = zip.getEntry("word/document.xml");
  if (!doc) return "";
  return stripXmlTags(doc.getData().toString("utf-8"));
}

function extractSpreadsheetText(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  return workbook.SheetNames.map((name) => {
    const sheet = workbook.Sheets[name];
    const csv = XLSX.utils.sheet_to_csv(sheet);
    return `--- Sheet: ${name} ---\n${csv.trim()}`;
  }).join("\n\n");
}

// Dispatches an uploaded file to the right extraction path: text-bearing
// formats (PDF, PPTX, DOCX, XLSX/CSV) get their text pulled out and merged
// into the narrative; images are handed to Gemini directly as multimodal
// input rather than OCR'd, since vision reads screenshots/certificates more
// reliably than a text-extraction pipeline would.
export async function extractFile(file: File): Promise<ExtractedArtifact> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const name = file.name.toLowerCase();
  const ext = name.split(".").pop() ?? "";

  if (file.type.startsWith("image/") || IMAGE_EXTENSIONS[ext]) {
    return {
      kind: "image",
      mimeType: file.type || IMAGE_EXTENSIONS[ext],
      base64: buffer.toString("base64"),
    };
  }

  if (ext === "pdf" || file.type === "application/pdf") {
    return { kind: "text", text: await extractPdfText(buffer) };
  }

  if (ext === "pptx") {
    return { kind: "text", text: extractPptxText(buffer) };
  }

  if (ext === "docx") {
    return { kind: "text", text: extractDocxText(buffer) };
  }

  if (ext === "xlsx" || ext === "xls" || ext === "csv") {
    return { kind: "text", text: extractSpreadsheetText(buffer) };
  }

  // Fallback for plain-text-ish uploads (.txt, .md, unrecognised extension).
  return { kind: "text", text: buffer.toString("utf-8") };
}

export function extensionFor(fileName: string): string {
  const ext = fileName.toLowerCase().split(".").pop();
  return ext ? `.${ext}` : "";
}
