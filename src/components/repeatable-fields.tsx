"use client";

import { useState } from "react";
import { Field, Input, Textarea, SecondaryButton } from "@/components/ui";
import type { TeamMember, TeamProof, Milestone, RoadmapProof } from "@/lib/structured-proof";

export function TeamFields({ prev }: { prev: TeamProof | null }) {
  const [members, setMembers] = useState<TeamMember[]>(
    prev?.members?.length ? prev.members : [{ name: "", role: "", linkedin: "" }],
  );

  function update(i: number, field: keyof TeamMember, value: string) {
    setMembers((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="teamJson" value={JSON.stringify(members)} />
      <p className="text-navy text-sm font-semibold">Team members (name, role, LinkedIn profile)</p>
      {members.map((m, i) => (
        <div key={i} className="grid sm:grid-cols-[1fr_1fr_1.5fr_auto] gap-2 items-center">
          <Input
            value={m.name}
            onChange={(e) => update(i, "name", e.target.value)}
            placeholder="Name"
          />
          <Input
            value={m.role}
            onChange={(e) => update(i, "role", e.target.value)}
            placeholder="Role"
          />
          <Input
            value={m.linkedin}
            onChange={(e) => update(i, "linkedin", e.target.value)}
            type="url"
            placeholder="LinkedIn URL"
          />
          <SecondaryButton
            type="button"
            className="px-3 py-2 text-xs"
            onClick={() => setMembers((m) => m.filter((_, idx) => idx !== i))}
            disabled={members.length <= 1}
          >
            Remove
          </SecondaryButton>
        </div>
      ))}
      <SecondaryButton
        type="button"
        className="self-start px-4 py-2 text-xs"
        onClick={() => setMembers((m) => [...m, { name: "", role: "", linkedin: "" }])}
      >
        + Add team member
      </SecondaryButton>
      <Field label="Gaps & advisors — be honest about what's missing">
        <Textarea name="teamGaps" rows={4} defaultValue={prev?.gaps ?? ""} />
      </Field>
    </div>
  );
}

export function RoadmapFields({ prev }: { prev: RoadmapProof | null }) {
  const [milestones, setMilestones] = useState<Milestone[]>(
    prev?.milestones?.length ? prev.milestones : [{ title: "", date: "", owner: "" }],
  );

  function update(i: number, field: keyof Milestone, value: string) {
    setMilestones((m) => m.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));
  }

  return (
    <div className="flex flex-col gap-3">
      <input type="hidden" name="milestonesJson" value={JSON.stringify(milestones)} />
      <p className="text-navy text-sm font-semibold">Milestones (3–6 concrete, dated, owned)</p>
      {milestones.map((m, i) => (
        <div key={i} className="grid sm:grid-cols-[2fr_1fr_1fr_auto] gap-2 items-center">
          <Input
            value={m.title}
            onChange={(e) => update(i, "title", e.target.value)}
            placeholder="Milestone"
          />
          <Input value={m.date} onChange={(e) => update(i, "date", e.target.value)} type="date" />
          <Input
            value={m.owner}
            onChange={(e) => update(i, "owner", e.target.value)}
            placeholder="Owner"
          />
          <SecondaryButton
            type="button"
            className="px-3 py-2 text-xs"
            onClick={() => setMilestones((m) => m.filter((_, idx) => idx !== i))}
            disabled={milestones.length <= 1}
          >
            Remove
          </SecondaryButton>
        </div>
      ))}
      <SecondaryButton
        type="button"
        className="self-start px-4 py-2 text-xs"
        onClick={() => setMilestones((m) => [...m, { title: "", date: "", owner: "" }])}
      >
        + Add milestone
      </SecondaryButton>
    </div>
  );
}
