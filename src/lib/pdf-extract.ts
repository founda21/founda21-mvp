// Must be imported before PDFParse — without it, pdf-parse's canvas/DOMMatrix
// polyfill fails to load on serverless runtimes like Vercel (works fine
// locally on Node's full runtime, breaks in production). See pdf-parse's
// serverless troubleshooting guide.
import "pdf-parse/worker";
import { PDFParse } from "pdf-parse";

export async function extractPdfText(data: Buffer | Uint8Array): Promise<string> {
  const parser = new PDFParse({ data });
  try {
    const result = await parser.getText();
    return result.text.trim();
  } finally {
    await parser.destroy();
  }
}
