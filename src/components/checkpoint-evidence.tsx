import { getProofMode } from "@/lib/checkpoints";
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
import type { QATurn } from "@/lib/scoring/interviewer-prompt";
import { extractFileReferences, extractLinkReference, stripReferences, sanitizeUrl } from "@/lib/artifact-display";
import { getSignedArtifactUrl } from "@/lib/artifact-storage";

const QA_CHECKPOINT_ID = 21;
const TRACTION_CHECKPOINT_ID = 11;

function ExternalLink({ href, children }: { href: string; children?: React.ReactNode }) {
  const safeHref = sanitizeUrl(href);
  if (!safeHref) {
    // Not a valid http(s) URL (e.g. a javascript: URI, or just malformed) —
    // show the raw text rather than rendering a clickable, executable link.
    return href ? <span className="text-navy/60 text-sm break-all">{children ?? href}</span> : null;
  }
  return (
    <a
      href={safeHref}
      target="_blank"
      rel="noreferrer"
      className="text-emerald text-sm font-medium hover:underline break-all"
    >
      {children ?? safeHref}
    </a>
  );
}

async function FileAttachments({ text, founderId }: { text: string; founderId: string }) {
  // artifactContent is founder-authored free text — a founder could type a
  // fake "[Uploaded file: x, stored at <otherFounderId>/...]" string to try
  // to get a signed URL generated for someone else's private file. Only
  // resolve references that fall under this founder's own storage prefix.
  const refs = extractFileReferences(text).filter((r) => r.storagePath.startsWith(`${founderId}/`));
  if (!refs.length) return null;
  const withUrls = await Promise.all(
    refs.map(async (r) => ({ ...r, url: await getSignedArtifactUrl(r.storagePath) })),
  );
  return (
    <div className="flex flex-wrap gap-2">
      {withUrls.map((r, i) =>
        r.url ? (
          <a
            key={i}
            href={r.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 rounded-full bg-navy/10 text-navy text-xs font-semibold px-3 py-1.5 hover:bg-navy/15"
          >
            📎 {r.label}
          </a>
        ) : (
          <span key={i} className="text-navy/60 text-xs">
            📎 {r.label} (file unavailable)
          </span>
        ),
      )}
    </div>
  );
}

function LinkChip({ text }: { text: string }) {
  const link = extractLinkReference(text);
  if (!link) return null;
  return (
    <div className="text-sm">
      <span className="text-navy/50 mr-1.5">🔗</span>
      <ExternalLink href={link}>{link}</ExternalLink>
    </div>
  );
}

export async function CheckpointEvidence({
  checkpointId,
  artifactContent,
  founderId,
}: {
  checkpointId: number;
  artifactContent: string;
  founderId: string;
}) {
  if (checkpointId === QA_CHECKPOINT_ID) {
    let turns: QATurn[] = [];
    try {
      turns = JSON.parse(artifactContent).turns ?? [];
    } catch {
      turns = [];
    }
    return (
      <div className="flex flex-col gap-3">
        {turns.map((turn, i) => (
          <div key={i} className="flex flex-col gap-1">
            <p className="text-navy/50 text-xs font-semibold uppercase">Q{i + 1}: Investor</p>
            <p className="text-navy/80 text-sm">{turn.question}</p>
            <p className="text-navy/50 text-xs font-semibold uppercase mt-1">Founder</p>
            <p className="text-navy/70 text-sm">{turn.answer}</p>
          </div>
        ))}
      </div>
    );
  }

  if (checkpointId === TRACTION_CHECKPOINT_ID) {
    const data = parseTractionSubmission(artifactContent);
    return (
      <div className="flex flex-col gap-3">
        {data?.b2c && (
          <div className="flex gap-6 text-sm">
            <p><span className="text-navy/50">Signups:</span> <span className="font-semibold text-navy">{data.b2c.signups}</span></p>
            <p><span className="text-navy/50">MAU:</span> <span className="font-semibold text-navy">{data.b2c.mau}</span></p>
          </div>
        )}
        {data?.b2b && (
          <div className="flex gap-6 text-sm">
            <p><span className="text-navy/50">Pilots:</span> <span className="font-semibold text-navy">{data.b2b.pilots}</span></p>
            <p><span className="text-navy/50">Paying clients:</span> <span className="font-semibold text-navy">{data.b2b.payingClients}</span></p>
          </div>
        )}
        {data?.hardware && (
          <div className="flex gap-6 text-sm">
            <p><span className="text-navy/50">Units shipped:</span> <span className="font-semibold text-navy">{data.hardware.unitsShipped ?? 0}</span></p>
            {data.hardware.notes && <p className="text-navy/70">{data.hardware.notes}</p>}
          </div>
        )}
        {data?.evidenceLink && (
          <div className="text-sm">
            <span className="text-navy/50 mr-1.5">Evidence:</span>
            <ExternalLink href={data.evidenceLink} />
          </div>
        )}
        {data?.narrative && (
          <>
            <LinkChip text={data.narrative} />
            <FileAttachments text={data.narrative} founderId={founderId} />
            <p className="text-navy/80 text-sm whitespace-pre-wrap">{stripReferences(data.narrative)}</p>
          </>
        )}
      </div>
    );
  }

  const proofMode = getProofMode(checkpointId);

  if (proofMode === "structured") {
    switch (checkpointId) {
      case 7: {
        const data = parseStructuredProof<RecordingProof>(artifactContent);
        return (
          <div className="flex flex-col gap-3">
            {data?.recordingLink && (
              <div className="text-sm">
                <span className="text-navy/50 mr-1.5">Recording:</span>
                <ExternalLink href={data.recordingLink} />
              </div>
            )}
            <p className="text-navy/80 text-sm whitespace-pre-wrap">{data?.statement}</p>
          </div>
        );
      }
      case 10: {
        const data = parseStructuredProof<OnlinePresenceProof>(artifactContent);
        return (
          <div className="flex flex-col gap-3">
            {data?.website && (
              <div className="text-sm">
                <span className="text-navy/50 mr-1.5">Website:</span>
                <ExternalLink href={data.website} />
              </div>
            )}
            {data?.social && (
              <div className="flex flex-col gap-1">
                <p className="text-navy/50 text-xs font-semibold uppercase">Social</p>
                {data.social.split("\n").filter(Boolean).map((url, i) => (
                  <ExternalLink key={i} href={url.trim()} />
                ))}
              </div>
            )}
            {data?.trustSignals && (
              <div className="flex flex-col gap-1">
                <p className="text-navy/50 text-xs font-semibold uppercase">Trust signals</p>
                {data.trustSignals.split("\n").filter(Boolean).map((url, i) => (
                  <ExternalLink key={i} href={url.trim()} />
                ))}
              </div>
            )}
          </div>
        );
      }
      case 12: {
        const data = parseStructuredProof<TeamProof>(artifactContent);
        return (
          <div className="flex flex-col gap-3">
            {data?.members?.length ? (
              <div className="flex flex-col gap-2">
                {data.members.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 text-sm">
                    <span className="font-semibold text-navy">{m.name}</span>
                    <span className="text-navy/60">{m.role}</span>
                    {m.linkedin && <ExternalLink href={m.linkedin}>LinkedIn</ExternalLink>}
                  </div>
                ))}
              </div>
            ) : null}
            {data?.gaps && <p className="text-navy/70 text-sm whitespace-pre-wrap">{data.gaps}</p>}
          </div>
        );
      }
      case 14: {
        const data = parseStructuredProof<UnitEconomicsProof>(artifactContent);
        return (
          <div className="flex flex-col gap-3">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              <p><span className="text-navy/50 block text-xs">CAC</span> <span className="font-semibold text-navy">R{data?.cac}</span></p>
              <p><span className="text-navy/50 block text-xs">LTV</span> <span className="font-semibold text-navy">R{data?.ltv}</span></p>
              <p><span className="text-navy/50 block text-xs">Gross margin</span> <span className="font-semibold text-navy">{data?.grossMarginPct}%</span></p>
              <p><span className="text-navy/50 block text-xs">Contribution margin</span> <span className="font-semibold text-navy">{data?.contributionMarginPct}%</span></p>
            </div>
            {data?.methodology && <p className="text-navy/70 text-sm whitespace-pre-wrap">{data.methodology}</p>}
          </div>
        );
      }
      case 18: {
        const data = parseStructuredProof<RoadmapProof>(artifactContent);
        return (
          <div className="flex flex-col gap-2">
            {data?.milestones?.map((m, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="text-navy/50 font-mono text-xs">{m.date}</span>
                <span className="font-semibold text-navy">{m.title}</span>
                <span className="text-navy/60">({m.owner})</span>
              </div>
            ))}
          </div>
        );
      }
      case 20: {
        const data = parseStructuredProof<DataRoomProof>(artifactContent);
        return (
          <div className="flex flex-col gap-3">
            {data?.dataRoomLink && (
              <div className="text-sm">
                <span className="text-navy/50 mr-1.5">Data room:</span>
                <ExternalLink href={data.dataRoomLink} />
              </div>
            )}
            <p className="text-navy/80 text-sm whitespace-pre-wrap">{data?.narrative}</p>
          </div>
        );
      }
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <LinkChip text={artifactContent} />
      <FileAttachments text={artifactContent} founderId={founderId} />
      <p className="text-navy/80 text-sm whitespace-pre-wrap">{stripReferences(artifactContent)}</p>
    </div>
  );
}
