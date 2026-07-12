"use client";

import { useId, useState } from "react";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";

export function FunderTypeField({ defaultValue }: { defaultValue?: string }) {
  const name = "funderType";
  const groupId = useId();
  const [selected, setSelected] = useState(defaultValue ?? "");

  return (
    <fieldset className="flex flex-col gap-2">
      <legend className="text-sm font-semibold text-navy mb-1">What kind of funder are you?</legend>
      <p className="text-navy/50 text-xs mb-1">
        This helps us tailor your dashboard and reports to how your programme runs.
      </p>
      <div className="flex flex-col gap-2">
        {FUNDER_TYPE_OPTIONS.map((option) => {
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
