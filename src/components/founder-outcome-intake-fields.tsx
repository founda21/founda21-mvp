import { Field, Input, Select } from "@/components/ui";
import { CAPITAL_TYPE_OPTIONS } from "@/lib/founder-outcome";
import type { CapitalType } from "@/generated/prisma/enums";

export type OutcomeFieldsInitial = {
  capitalRaisedZar: number;
  capitalType: CapitalType[];
  monthlyRevenueZar: number;
  headcount: number;
  stillOperating: boolean;
  graduatedToSupplier: boolean;
};

// Baseline outcome snapshot, captured at signup and re-polled later (§
// addOutcomeSnapshot) — `initial` prefills from the founder's most recent
// snapshot when re-used for an update rather than the first-ever intake.
// Never read by the scoring engine (§ non-negotiable rule 1).
export function FounderOutcomeIntakeFields({ initial }: { initial?: OutcomeFieldsInitial }) {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-navy mb-1">Current venture snapshot</legend>
      <p className="text-navy/50 text-xs -mt-2">
        A quick baseline for your funder&apos;s reporting, this never affects your checkpoint
        scores.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Capital raised to date (ZAR)">
          <Input name="capitalRaisedZar" type="number" min={0} defaultValue={initial?.capitalRaisedZar ?? 0} required />
        </Field>
        <Field label="Monthly revenue (ZAR)">
          <Input name="monthlyRevenueZar" type="number" min={0} defaultValue={initial?.monthlyRevenueZar ?? 0} required />
        </Field>
      </div>

      <Field label="Type of capital raised (select all that apply)">
        <div className="flex flex-col gap-1.5">
          {CAPITAL_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-navy text-sm">
              <input
                type="checkbox"
                name="capitalType"
                value={option.value}
                defaultChecked={initial?.capitalType.includes(option.value as CapitalType) ?? false}
                className="accent-emerald"
              />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Headcount">
          <Input name="headcount" type="number" min={0} defaultValue={initial?.headcount ?? 0} required />
        </Field>
        <Field label="Still operating?">
          <Select name="stillOperating" defaultValue={initial ? (initial.stillOperating ? "yes" : "no") : "yes"}>
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
      </div>

      <Field label="Graduated to being a paying supplier?">
        <Select name="graduatedToSupplier" defaultValue={initial ? (initial.graduatedToSupplier ? "yes" : "no") : "no"}>
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
    </fieldset>
  );
}
