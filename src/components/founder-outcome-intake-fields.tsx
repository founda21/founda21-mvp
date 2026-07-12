import { Field, Input, Select } from "@/components/ui";
import { CAPITAL_TYPE_OPTIONS } from "@/lib/founder-outcome";

// Baseline outcome snapshot, captured at signup and re-polled at T+6/T+12
// later. Never read by the scoring engine (§ non-negotiable rule 1).
export function FounderOutcomeIntakeFields() {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-navy mb-1">Current venture snapshot</legend>
      <p className="text-navy/50 text-xs -mt-2">
        A quick baseline for your funder&apos;s reporting — this never affects your checkpoint
        scores.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Capital raised to date (ZAR)">
          <Input name="capitalRaisedZar" type="number" min={0} defaultValue={0} required />
        </Field>
        <Field label="Monthly revenue (ZAR)">
          <Input name="monthlyRevenueZar" type="number" min={0} defaultValue={0} required />
        </Field>
      </div>

      <Field label="Type of capital raised (select all that apply)">
        <div className="flex flex-col gap-1.5">
          {CAPITAL_TYPE_OPTIONS.map((option) => (
            <label key={option.value} className="flex items-center gap-2 text-navy text-sm">
              <input type="checkbox" name="capitalType" value={option.value} className="accent-emerald" />
              {option.label}
            </label>
          ))}
        </div>
      </Field>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Headcount">
          <Input name="headcount" type="number" min={0} defaultValue={0} required />
        </Field>
        <Field label="Still operating?">
          <Select name="stillOperating" defaultValue="yes">
            <option value="yes">Yes</option>
            <option value="no">No</option>
          </Select>
        </Field>
      </div>

      <Field label="Graduated to being a paying supplier?">
        <Select name="graduatedToSupplier" defaultValue="no">
          <option value="no">No</option>
          <option value="yes">Yes</option>
        </Select>
      </Field>
    </fieldset>
  );
}
