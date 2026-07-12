import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { requireFounder } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getCheckpoint, getProofMode, STAGE_MIN_VENTURE_STAGE } from "@/lib/checkpoints";
import { canAccessCheckpoint, checkpointLockReason } from "@/lib/stage-gating";
import { ventureStageLabel } from "@/lib/venture-stage";
import { parseTractionSubmission } from "@/lib/traction";
import { parseStructuredProof } from "@/lib/structured-proof";
import type {
  RecordingProof,
  OnlinePresenceProof,
  TeamProof,
  UnitEconomicsProof,
  RoadmapProof,
  DataRoomProof,
} from "@/lib/structured-proof";
import { submitArtifact } from "@/lib/actions/submission";
import { Field, Input, Textarea, ErrorBanner, InfoBanner, Badge } from "@/components/ui";
import { BackLink } from "@/components/back-link";
import { ScoringSubmitButton } from "@/components/submit-button";
import { ScoringOverlay } from "@/components/scoring-overlay";
import { SubmissionToolbar } from "@/components/submission-toolbar";
import { InvestorQAChat } from "@/components/investor-qa-chat";
import {
  RecordingFields,
  OnlinePresenceFields,
  UnitEconomicsFields,
  DataRoomFields,
} from "@/components/structured-fields";
import { TeamFields, RoadmapFields } from "@/components/repeatable-fields";
import type { ScoringOutput } from "@/lib/scoring/schema";
import type { QATurn } from "@/lib/scoring/interviewer-prompt";

const QA_CHECKPOINT_ID = 21;
const TRACTION_CHECKPOINT_ID = 11;

export default async function CheckpointPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ error?: string; submitted?: string }>;
}) {
  const { id } = await params;
  const checkpointId = Number(id);
  const { error, submitted } = await searchParams;
  const { founder } = await requireFounder();

  let checkpoint;
  try {
    checkpoint = getCheckpoint(checkpointId);
  } catch {
    notFound();
  }

  if (!canAccessCheckpoint(founder, checkpointId)) {
    const reason = checkpointLockReason(founder, checkpointId);
    const message =
      reason === "venture-stage"
        ? `This checkpoint needs a venture stage of ${ventureStageLabel(STAGE_MIN_VENTURE_STAGE[checkpoint.stage])} or later — update your stage on your home page once you're there.`
        : "That checkpoint isn't unlocked yet.";
    redirect("/founder?error=" + encodeURIComponent(message));
  }

  const submissions = await prisma.submission.findMany({
    where: { founderId: founder.id, checkpointId },
    orderBy: { attemptNumber: "desc" },
    include: { score: true },
  });
  const latest = submissions[0];
  const latestOutput = latest?.score?.dimensionsJson as ScoringOutput | undefined;

  const prevTraction =
    checkpointId === TRACTION_CHECKPOINT_ID && latest ? parseTractionSubmission(latest.artifactContent) : null;
  const prevNarrative = checkpointId === TRACTION_CHECKPOINT_ID ? prevTraction?.narrative ?? "" : latest?.artifactContent ?? "";
  const proofMode = getProofMode(checkpointId);
  const prevStructured = latest?.artifactContent;

  let qaTranscript: QATurn[] | null = null;
  if (checkpointId === QA_CHECKPOINT_ID && latest) {
    try {
      qaTranscript = (JSON.parse(latest.artifactContent).turns as QATurn[]) ?? null;
    } catch {
      qaTranscript = null;
    }
  }

  const boundSubmit = submitArtifact.bind(null, checkpointId);

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <BackLink href="/founder" label="Back to your checkpoints" />
      <div>
        <p className="text-emerald text-xs font-semibold uppercase tracking-wide">Stage {checkpoint.stage}</p>
        <h1 className="text-navy text-2xl font-bold">
          CP{checkpoint.id} · {checkpoint.name}
        </h1>
        <p className="text-navy/60 text-sm mt-1">{checkpoint.focus}</p>
        <p className="text-navy/40 text-xs mt-1">SA thread: {checkpoint.saThread}</p>
        <p className="text-navy/40 text-xs">Required artifact: {checkpoint.artifactType}</p>
      </div>

      <div className="rounded-xl border border-navy/10 bg-navy/[0.03] p-5">
        <p className="text-navy text-sm font-semibold mb-1.5">What&apos;s required for this checkpoint</p>
        <p className="text-navy/70 text-sm">{checkpoint.requirement}</p>
        <p className="text-navy/40 text-xs mt-3">
          Curious how this actually gets assessed? See{" "}
          <Link href="/founder/how-it-works" className="underline hover:text-navy/60">
            how Founda21 works
          </Link>
          .
        </p>
      </div>

      <ErrorBanner message={error} />
      {submitted && <InfoBanner message="Submitted and scored — see your result below." />}

      {latest && latestOutput && (
        <section className="flex flex-col gap-4 rounded-xl border border-navy/10 p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-navy/50 text-xs">Attempt {latest.attemptNumber}</p>
              <p className="text-navy text-3xl font-bold">{latestOutput.checkpoint_score} / 100</p>
            </div>
            <Badge tone={latestOutput.passed ? "success" : "warning"}>
              {latestOutput.passed ? `Passed (≥ ${checkpoint.passThreshold})` : `Below threshold (${checkpoint.passThreshold})`}
            </Badge>
          </div>

          <p className="text-navy/80 text-sm">{latestOutput.summary}</p>

          <div className="grid sm:grid-cols-2 gap-4">
            {latestOutput.dimensions.map((d) => (
              <div key={d.dimension} className="rounded-lg bg-navy/[0.03] p-4">
                <div className="flex items-center justify-between">
                  <p className="text-navy font-semibold text-sm">{d.dimension}</p>
                  <p className="text-navy/60 text-sm">
                    {d.score}/20 · {d.band}
                  </p>
                </div>
                <p className="text-navy/70 text-xs mt-2">{d.reasoning}</p>
                <p className="text-emerald text-xs mt-2 font-semibold">→ {d.improvement_guidance}</p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-emerald/30 bg-emerald/5 p-4">
            <p className="text-navy font-semibold text-sm">Top priority fix</p>
            <p className="text-navy/70 text-sm mt-1">{latestOutput.top_priority_fix}</p>
          </div>

          {qaTranscript && (
            <div className="flex flex-col gap-3 pt-2 border-t border-navy/10">
              <p className="text-navy font-semibold text-sm">Transcript</p>
              {qaTranscript.map((turn, i) => (
                <div key={i} className="flex flex-col gap-1">
                  <p className="text-navy/50 text-xs font-semibold uppercase">Q{i + 1}: Investor</p>
                  <p className="text-navy/80 text-sm">{turn.question}</p>
                  <p className="text-navy/50 text-xs font-semibold uppercase mt-1">You</p>
                  <p className="text-navy/70 text-sm">{turn.answer}</p>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section className="flex flex-col gap-4">
        <h2 className="text-navy font-bold">
          {checkpointId === QA_CHECKPOINT_ID
            ? latest
              ? "Try the Q&A again"
              : "Start your Q&A session"
            : latest
              ? "Resubmit your artifact"
              : "Submit your artifact"}
        </h2>
        {checkpointId === QA_CHECKPOINT_ID ? (
          <InvestorQAChat />
        ) : (
          <form action={boundSubmit} className="flex flex-col gap-4">
            {checkpointId === TRACTION_CHECKPOINT_ID ? (
              <TractionFields ventureType={founder.ventureType} prevTraction={prevTraction} prevNarrative={prevNarrative} />
            ) : proofMode === "structured" ? (
              <StructuredFieldsFor checkpointId={checkpointId} prevStructured={prevStructured} />
            ) : (
              <>
                {proofMode === "file-required" && (
                  <InfoBanner message="This checkpoint requires an uploaded document — use the Upload file button below. A written description alone won't pass." />
                )}
                <Field label="Written response">
                  <Textarea
                    name="narrative"
                    rows={10}
                    defaultValue={prevNarrative}
                    placeholder="Write your response here. Use the buttons below to attach a PDF or a link instead of (or alongside) this."
                  />
                </Field>
              </>
            )}
            <div className="flex items-center justify-between gap-4 flex-wrap pt-2 border-t border-navy/10">
              <SubmissionToolbar />
              <ScoringSubmitButton idleLabel={latest ? "Resubmit for scoring" : "Submit for scoring"} />
            </div>
            <ScoringOverlay />
          </form>
        )}
      </section>
    </div>
  );
}

function StructuredFieldsFor({
  checkpointId,
  prevStructured,
}: {
  checkpointId: number;
  prevStructured?: string;
}) {
  switch (checkpointId) {
    case 7:
      return <RecordingFields prev={parseStructuredProof<RecordingProof>(prevStructured)} />;
    case 10:
      return <OnlinePresenceFields prev={parseStructuredProof<OnlinePresenceProof>(prevStructured)} />;
    case 12:
      return <TeamFields prev={parseStructuredProof<TeamProof>(prevStructured)} />;
    case 14:
      return <UnitEconomicsFields prev={parseStructuredProof<UnitEconomicsProof>(prevStructured)} />;
    case 18:
      return <RoadmapFields prev={parseStructuredProof<RoadmapProof>(prevStructured)} />;
    case 20:
      return <DataRoomFields prev={parseStructuredProof<DataRoomProof>(prevStructured)} />;
    default:
      return null;
  }
}

function TractionFields({
  ventureType,
  prevTraction,
  prevNarrative,
}: {
  ventureType: string;
  prevTraction: ReturnType<typeof parseTractionSubmission>;
  prevNarrative: string;
}) {
  return (
    <>
      {ventureType === "B2C" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Total signups">
            <Input name="signups" type="number" min={0} required defaultValue={prevTraction?.b2c?.signups ?? ""} />
          </Field>
          <Field label="Monthly active users (MAU)">
            <Input name="mau" type="number" min={0} required defaultValue={prevTraction?.b2c?.mau ?? ""} />
          </Field>
        </div>
      )}
      {ventureType === "B2B" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Pilots running">
            <Input name="pilots" type="number" min={0} required defaultValue={prevTraction?.b2b?.pilots ?? ""} />
          </Field>
          <Field label="Paying clients">
            <Input
              name="payingClients"
              type="number"
              min={0}
              required
              defaultValue={prevTraction?.b2b?.payingClients ?? ""}
            />
          </Field>
        </div>
      )}
      {ventureType === "HARDWARE" && (
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Units shipped / deployed">
            <Input
              name="unitsShipped"
              type="number"
              min={0}
              defaultValue={prevTraction?.hardware?.unitsShipped ?? ""}
            />
          </Field>
          <Field label="Other traction notes">
            <Input name="hardwareNotes" type="text" defaultValue={prevTraction?.hardware?.notes ?? ""} />
          </Field>
        </div>
      )}
      <Field label="Evidence link — analytics dashboard, LOI, invoice, payment processor stats, public counter, etc.">
        <Input
          name="evidenceLink"
          type="url"
          required
          defaultValue={prevTraction?.evidenceLink ?? ""}
          placeholder="https://…"
        />
      </Field>
      <Field label="Narrative">
        <Textarea
          name="narrative"
          required
          rows={6}
          defaultValue={prevNarrative}
          placeholder="Describe the evidence behind these numbers — how they were measured, verifiable sources, context."
        />
      </Field>
    </>
  );
}
