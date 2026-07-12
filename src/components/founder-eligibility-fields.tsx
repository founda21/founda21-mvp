import { Field, Input, Select } from "@/components/ui";
import { ANNUAL_TURNOVER_BAND_OPTIONS, ENTITY_TYPE_OPTIONS } from "@/lib/founder-eligibility";

// Routing/reporting only — ownership %, turnover, entity type. Never read by
// the scoring engine (§ non-negotiable rule 1). Plain fields, not a marketing
// moment, since this is intake for B-BBEE/ESD reporting purposes.
export function FounderEligibilityFields() {
  return (
    <fieldset className="flex flex-col gap-4">
      <legend className="text-sm font-semibold text-navy mb-1">
        Ownership &amp; entity details
      </legend>
      <p className="text-navy/50 text-xs -mt-2">
        Used only for funder eligibility reporting (e.g. B-BBEE/ESD) — never seen by the AI
        scoring engine and never affects your checkpoint scores.
      </p>

      <div className="grid grid-cols-2 gap-4">
        <Field label="Black ownership %">
          <Input name="blackOwnershipPct" type="number" min={0} max={100} required placeholder="0–100" />
        </Field>
        <Field label="Black women ownership %">
          <Input name="blackWomenOwnershipPct" type="number" min={0} max={100} required placeholder="0–100" />
        </Field>
      </div>

      <Field label="Annual turnover">
        <Select name="annualTurnoverBand" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {ANNUAL_TURNOVER_BAND_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="Entity type">
        <Select name="entityType" required defaultValue="">
          <option value="" disabled>
            Select one
          </option>
          {ENTITY_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </Field>

      <Field label="CIPC registration number (optional)">
        <Input name="cipcNumber" type="text" placeholder="e.g. 2024/123456/07" />
      </Field>
    </fieldset>
  );
}
