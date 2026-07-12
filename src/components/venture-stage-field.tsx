"use client";

import { useId, useState } from "react";
import { VENTURE_STAGE_OPTIONS } from "@/lib/venture-stage";

export function VentureStageField({ defaultValue }: { defaultValue?: string }) {
  const name = "ventureStage";
  const groupId = useId();
  const [selected, setSelected] = useState(defaultValue ?? "");

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-navy mb-1">
        What stage is your venture at?
      </legend>
      <p className="text-navy/50 text-xs mb-1">
        This determines which checkpoints you can access right now — Stage 1 needs Idea stage or
        later, Stage 2 needs Pre-seed or later, Stage 3 needs Seed or later. Be honest about where
        you really are; you can update this later as your venture progresses.
      </p>
      <div className="flex flex-col gap-2">
        {VENTURE_STAGE_OPTIONS.map((option) => {
          const inputId = `${groupId}-${option.value}`;
          return (
            <label
              key={option.value}
              htmlFor={inputId}
              className={`flex items-start gap-3 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
                selected === option.value
                  ? "border-emerald bg-emerald/5"
                  : "border-navy/15 hover:bg-navy/[0.02]"
              }`}
            >
              <input
                id={inputId}
                type="radio"
                name={name}
                value={option.value}
                required
                checked={selected === option.value}
                onChange={() => setSelected(option.value)}
                className="mt-1 accent-emerald"
              />
              <span className="flex flex-col">
                <span className="text-navy text-sm font-semibold">{option.label}</span>
                <span className="text-navy/60 text-xs">{option.description}</span>
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
