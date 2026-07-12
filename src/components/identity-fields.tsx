"use client";

import { useState } from "react";
import { Field, Input } from "@/components/ui";

// System integrity fix 1 — identity anchor. Captures phone + SA ID/passport
// at signup so a duplicate real-world identity is blocked at account
// creation (§ src/lib/actions/founder.ts createFounderInCohort). The raw ID
// number leaves the browser once, over HTTPS, straight into the server
// action that hashes it — never stored client-side beyond this form.
export function IdentityFields() {
  const [idType, setIdType] = useState<"sa_id" | "passport">("sa_id");

  return (
    <>
      <Field label="Phone number">
        <Input name="phoneNumber" type="tel" required placeholder="082 123 4567" />
      </Field>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-semibold text-navy mb-1">Identity document</legend>
        <div className="flex rounded-full border border-navy/15 p-1 text-sm font-semibold w-fit">
          <label
            className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors ${
              idType === "sa_id" ? "bg-navy text-white" : "text-navy/60"
            }`}
          >
            <input
              type="radio"
              name="idType"
              value="sa_id"
              checked={idType === "sa_id"}
              onChange={() => setIdType("sa_id")}
              className="sr-only"
            />
            SA ID
          </label>
          <label
            className={`px-4 py-1.5 rounded-full cursor-pointer transition-colors ${
              idType === "passport" ? "bg-navy text-white" : "text-navy/60"
            }`}
          >
            <input
              type="radio"
              name="idType"
              value="passport"
              checked={idType === "passport"}
              onChange={() => setIdType("passport")}
              className="sr-only"
            />
            Passport
          </label>
        </div>
      </fieldset>

      <Field label={idType === "sa_id" ? "SA ID number" : "Passport number"}>
        <Input
          name="idNumber"
          type="text"
          required
          inputMode={idType === "sa_id" ? "numeric" : "text"}
          maxLength={idType === "sa_id" ? 13 : 20}
          placeholder={idType === "sa_id" ? "13 digits" : "Passport number"}
        />
      </Field>

      <label className="flex items-start gap-2.5 text-xs text-navy/60">
        <input type="checkbox" name="identityConsent" required className="mt-0.5 accent-emerald" />
        <span>
          I consent to Founda21 collecting my {idType === "sa_id" ? "SA ID" : "passport"} number to verify
          my identity and prevent duplicate accounts. Only a one-way hash of this number is stored — the
          number itself is never saved. See our{" "}
          <a href="/privacy" target="_blank" rel="noreferrer" className="underline">
            Privacy Policy
          </a>
          .
        </span>
      </label>
    </>
  );
}
