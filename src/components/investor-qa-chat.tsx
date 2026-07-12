"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getNextInvestorQuestion, finalizeQASession } from "@/lib/actions/qa-session";
import { QA_SESSION_TURN_COUNT, type QATurn } from "@/lib/scoring/interviewer-prompt";
import { PrimaryButton, SecondaryButton, Textarea, ErrorBanner } from "@/components/ui";
import { ProgressOverlay } from "@/components/scoring-overlay";

export function InvestorQAChat() {
  const router = useRouter();
  const [turns, setTurns] = useState<QATurn[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState<string | null>(null);
  const [draft, setDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadingLabel, setLoadingLabel] = useState("");
  const [finalizing, setFinalizing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [started, setStarted] = useState(false);

  async function handleStart() {
    setError(null);
    setLoading(true);
    setLoadingLabel("The investor is preparing the first question…");
    try {
      const question = await getNextInvestorQuestion([]);
      setCurrentQuestion(question);
      setStarted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Couldn't start the session. Try again.");
    } finally {
      setLoading(false);
    }
  }

  async function handleSend() {
    if (!currentQuestion || !draft.trim()) return;
    setError(null);
    const newTurns = [...turns, { question: currentQuestion, answer: draft.trim() }];
    setTurns(newTurns);
    setDraft("");
    setCurrentQuestion(null);

    if (newTurns.length < QA_SESSION_TURN_COUNT) {
      setLoading(true);
      setLoadingLabel("The investor is following up…");
      try {
        const question = await getNextInvestorQuestion(newTurns);
        setCurrentQuestion(question);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Couldn't get the next question. Try again.");
      } finally {
        setLoading(false);
      }
      return;
    }

    setFinalizing(true);
    try {
      const result = await finalizeQASession(newTurns);
      if (!result.ok) {
        setError(result.error);
        setFinalizing(false);
        return;
      }
      router.push("/founder/checkpoint/21?submitted=1");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Scoring failed. Try again.");
      setFinalizing(false);
    }
  }

  if (!started) {
    return (
      <div className="flex flex-col gap-4">
        <ErrorBanner message={error ?? undefined} />
        <p className="text-navy/70 text-sm">
          This checkpoint is a live Q&amp;A, not a document upload. An AI playing a South African
          investor will ask you {QA_SESSION_TURN_COUNT} hard questions, one at a time, grounded in
          your own prior checkpoint submissions. Answer as you would in a real meeting — the full
          exchange gets scored at the end.
        </p>
        <PrimaryButton type="button" onClick={handleStart} disabled={loading} className="self-start">
          {loading ? "Preparing…" : "Start the Q&A session"}
        </PrimaryButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <ProgressOverlay active={finalizing} label="Scoring your full Q&A session…" />
      <ErrorBanner message={error ?? undefined} />

      <div className="flex flex-col gap-3">
        {turns.map((turn, i) => (
          <div key={i} className="flex flex-col gap-2">
            <ChatBubble speaker="Investor" text={turn.question} />
            <ChatBubble speaker="You" text={turn.answer} align="right" />
          </div>
        ))}
        {currentQuestion && <ChatBubble speaker="Investor" text={currentQuestion} />}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-navy/50 text-sm">
          <span
            aria-hidden
            className="h-4 w-4 rounded-full border-2 border-navy/20 border-t-emerald animate-spin"
          />
          {loadingLabel}
        </div>
      )}

      {currentQuestion && !loading && (
        <div className="flex flex-col gap-3">
          <Textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            rows={4}
            placeholder="Answer as you would in a real investor meeting…"
          />
          <div className="flex gap-3">
            <PrimaryButton type="button" onClick={handleSend} disabled={!draft.trim()}>
              {turns.length + 1 < QA_SESSION_TURN_COUNT ? "Send answer" : "Send final answer & get scored"}
            </PrimaryButton>
            <SecondaryButton type="button" onClick={() => setDraft("")}>
              Clear
            </SecondaryButton>
          </div>
          <p className="text-navy/40 text-xs">
            Question {turns.length + 1} of {QA_SESSION_TURN_COUNT}
          </p>
        </div>
      )}
    </div>
  );
}

function ChatBubble({
  speaker,
  text,
  align = "left",
}: {
  speaker: string;
  text: string;
  align?: "left" | "right";
}) {
  return (
    <div className={`flex flex-col gap-1 max-w-[85%] ${align === "right" ? "self-end items-end" : "self-start"}`}>
      <span className="text-navy/40 text-xs font-semibold uppercase tracking-wide">{speaker}</span>
      <div
        className={`rounded-2xl px-4 py-2.5 text-sm ${
          align === "right" ? "bg-emerald/10 text-navy" : "bg-navy/5 text-navy"
        }`}
      >
        {text}
      </div>
    </div>
  );
}
