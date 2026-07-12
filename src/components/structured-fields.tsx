import { Field, Input, Textarea } from "@/components/ui";
import type {
  RecordingProof,
  OnlinePresenceProof,
  UnitEconomicsProof,
  DataRoomProof,
} from "@/lib/structured-proof";

export function RecordingFields({ prev }: { prev: RecordingProof | null }) {
  return (
    <>
      <Field label="Recording link (video or voice, e.g. YouTube/Loom, unlisted is fine)">
        <Input
          name="recordingLink"
          type="url"
          required
          defaultValue={prev?.recordingLink ?? ""}
          placeholder="https://…"
        />
      </Field>
      <Field label="Written statement">
        <Textarea
          name="statement"
          required
          rows={8}
          defaultValue={prev?.statement ?? ""}
          placeholder="Why are you personally positioned to solve this problem — your background, lived experience, or unique insight?"
        />
      </Field>
    </>
  );
}

export function OnlinePresenceFields({ prev }: { prev: OnlinePresenceProof | null }) {
  return (
    <>
      <Field label="Website URL">
        <Input name="website" type="url" required defaultValue={prev?.website ?? ""} placeholder="https://…" />
      </Field>
      <Field label="Social media links (one per line)">
        <Textarea
          name="social"
          rows={3}
          defaultValue={prev?.social ?? ""}
          placeholder={"https://instagram.com/…\nhttps://twitter.com/…"}
        />
      </Field>
      <Field label="Trust signal evidence links (reviews, press mentions — one per line)">
        <Textarea
          name="trustSignals"
          rows={3}
          defaultValue={prev?.trustSignals ?? ""}
          placeholder={"https://reviews.example.com/… \nhttps://news.example.com/…"}
        />
      </Field>
    </>
  );
}

export function UnitEconomicsFields({ prev }: { prev: UnitEconomicsProof | null }) {
  return (
    <>
      <div className="grid sm:grid-cols-2 gap-4">
        <Field label="CAC — customer acquisition cost (ZAR)">
          <Input name="cac" type="number" step="0.01" min={0} required defaultValue={prev?.cac ?? ""} />
        </Field>
        <Field label="LTV — lifetime value (ZAR)">
          <Input name="ltv" type="number" step="0.01" min={0} required defaultValue={prev?.ltv ?? ""} />
        </Field>
        <Field label="Gross margin (%)">
          <Input
            name="grossMarginPct"
            type="number"
            step="0.1"
            min={0}
            max={100}
            required
            defaultValue={prev?.grossMarginPct ?? ""}
          />
        </Field>
        <Field label="Contribution margin (%)">
          <Input
            name="contributionMarginPct"
            type="number"
            step="0.1"
            min={0}
            max={100}
            required
            defaultValue={prev?.contributionMarginPct ?? ""}
          />
        </Field>
      </div>
      <Field label="Methodology — how were these calculated?">
        <Textarea
          name="methodology"
          required
          rows={6}
          defaultValue={prev?.methodology ?? ""}
          placeholder="Show the underlying assumptions and calculation, not just the final numbers."
        />
      </Field>
    </>
  );
}

export function DataRoomFields({ prev }: { prev: DataRoomProof | null }) {
  return (
    <>
      <Field label="Data room link (Google Drive, Notion, etc. — must be accessible to a reviewer)">
        <Input
          name="dataRoomLink"
          type="url"
          required
          defaultValue={prev?.dataRoomLink ?? ""}
          placeholder="https://…"
        />
      </Field>
      <Field label="Narrative — cap table, board structure, what's in the data room">
        <Textarea
          name="dataRoomNarrative"
          required
          rows={8}
          defaultValue={prev?.narrative ?? ""}
        />
      </Field>
    </>
  );
}
