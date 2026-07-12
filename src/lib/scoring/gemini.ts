import { GoogleGenerativeAI, Part } from "@google/generative-ai";

// Configurable LLM provider behind one scoring service (§6) — Gemini is the
// only implementation for now, called at temperature <= 0.1.
const MODEL_NAME = process.env.GEMINI_MODEL ?? "gemini-2.5-flash";

// Without an explicit timeout, a hung connection (as opposed to a clean
// 503 rejection) blocks the entire call indefinitely — scoreOnce's retry
// loop in scoring/index.ts never even gets a chance to retry, because the
// promise it's awaiting just never settles.
const REQUEST_TIMEOUT_MS = 45000;

// The SDK's own `{ timeout }` option (passed below too, as defense in
// depth) aborts via AbortController — but that only reliably cancels the
// request phase. Observed in practice: a request can get past that phase
// (connection established, headers received) and then stall mid-response
// body, past 45s, with the SDK's abort never firing because there's nothing
// left for it to abort. This wraps the whole call in an independent
// Promise.race so our code moves on regardless of what the stuck request
// does afterwards — we can't force-cancel a stalled body read, but we can
// stop waiting on it.
class GeminiTimeoutError extends Error {}

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout>;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new GeminiTimeoutError(`Gemini call timed out after ${ms}ms`)), ms);
  });
  return Promise.race([promise, timeout]).finally(() => clearTimeout(timer));
}

export type ImageAttachment = { mimeType: string; base64: string };

function buildParts(userContent: string, images?: ImageAttachment[]): Part[] {
  const parts: Part[] = [{ text: userContent }];
  for (const image of images ?? []) {
    parts.push({ inlineData: { mimeType: image.mimeType, data: image.base64 } });
  }
  return parts;
}

export async function callGemini(
  systemPrompt: string,
  userContent: string,
  images?: ImageAttachment[],
): Promise<{ raw: unknown; modelVersion: string }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  const result = await withTimeout(
    model.generateContent(buildParts(userContent, images), { timeout: REQUEST_TIMEOUT_MS }),
    REQUEST_TIMEOUT_MS,
  );
  const text = result.response.text();
  const raw = JSON.parse(text);

  return { raw, modelVersion: MODEL_NAME };
}

// Plain-text variant used for the CP21 live investor Q&A, where the model
// generates one conversational question rather than a structured score.
export async function callGeminiText(systemPrompt: string, userContent: string): Promise<string> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    systemInstruction: systemPrompt,
    generationConfig: { temperature: 0.2 },
  });

  const result = await withTimeout(model.generateContent(userContent, { timeout: REQUEST_TIMEOUT_MS }), REQUEST_TIMEOUT_MS);
  return result.response.text().trim();
}
