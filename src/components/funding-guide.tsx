"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { FUNDING_TYPES, FUNDER_TYPE_TYPICAL_FUNDING, getFundingType, type FundingTypeId } from "@/lib/funding-types";
import { FUNDER_TYPE_OPTIONS } from "@/lib/funder-type";
import { PrimaryButton } from "@/components/ui";

export function FundingGuide() {
  const groupId = useId();
  const [selected, setSelected] = useState<FundingTypeId | "not_sure" | null>(null);

  const selectedInfo = selected && selected !== "not_sure" ? getFundingType(selected) : null;

  return (
    <div className="flex flex-col gap-10">
      <div>
        <h1 className="text-navy text-2xl font-bold">Before you start: a quick funding primer</h1>
        <p className="text-navy/60 text-sm mt-2 max-w-2xl">
          Founda21 isn&apos;t a test of how smart you are, and it&apos;s not trying to catch you out, it&apos;s here to
          help you get honestly ready for investment, and to tell you clearly when you&apos;re not there yet. One
          thing that trips up a lot of founders in Africa is not knowing what kind of funding they actually need,
          or how it works. Two minutes here first will help.
        </p>
      </div>

      <div>
        <h2 className="text-navy font-bold mb-3">Every type of funding, in plain language</h2>
        <div className="flex flex-col gap-3">
          {FUNDING_TYPES.map((f) => (
            <div key={f.id} className="rounded-xl border border-navy/10 p-5">
              <p className="text-navy font-semibold text-sm">{f.name}</p>
              <p className="text-navy/50 text-xs mt-0.5">{f.oneLiner}</p>
              <p className="text-navy/70 text-sm mt-2">{f.howItWorks}</p>
              <div className="grid sm:grid-cols-2 gap-2 mt-3">
                <p className="text-navy/70 text-xs">
                  <span className="font-semibold text-navy">Good for: </span>
                  {f.goodFor}
                </p>
                <p className="text-navy/70 text-xs">
                  <span className="font-semibold text-navy">Watch out for: </span>
                  {f.watchOutFor}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-navy font-bold mb-1">Which kind of funder offers what</h2>
        <p className="text-navy/60 text-sm mb-3">
          Founda21 works with several kinds of funders, knowing which is which helps you understand what a
          conversation with them will actually be about. A specific funder&apos;s programme may differ from this.
        </p>
        <div className="flex flex-col gap-2">
          {FUNDER_TYPE_OPTIONS.map((funderType) => {
            const typical = FUNDER_TYPE_TYPICAL_FUNDING[funderType.value];
            return (
              <div key={funderType.value} className="rounded-xl border border-navy/10 p-4">
                <p className="text-navy font-semibold text-sm">{funderType.label}</p>
                <p className="text-navy/50 text-xs mt-0.5">{funderType.description}</p>
                <p className="text-navy/70 text-xs mt-2">
                  <span className="font-semibold text-navy">Typically offers: </span>
                  {typical.map((id) => getFundingType(id).name).join(", ")}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      <fieldset className="flex flex-col gap-3">
        <legend className="text-navy font-semibold text-sm">What are you hoping to raise right now?</legend>
        <p className="text-navy/60 text-xs -mt-1">
          Choose the type of funding that matches what the funder you&apos;re completing Founda21 for actually
          offers, check &quot;Which kind of funder offers what&quot; above if you&apos;re not sure.
        </p>
        <div className="grid sm:grid-cols-2 gap-2">
          {FUNDING_TYPES.map((f) => (
            <RadioCard
              key={f.id}
              id={`${groupId}-${f.id}`}
              label={f.name}
              sub={f.oneLiner}
              checked={selected === f.id}
              onSelect={() => setSelected(f.id)}
            />
          ))}
          <RadioCard
            id={`${groupId}-not-sure`}
            label="Not sure yet"
            sub="That's fine, read through the options above."
            checked={selected === "not_sure"}
            onSelect={() => setSelected("not_sure")}
          />
        </div>

        {selectedInfo && (
          <div className="rounded-xl border border-emerald/30 bg-emerald/5 p-5 flex flex-col gap-2 mt-2">
            <p className="text-navy font-semibold text-sm">{selectedInfo.name}</p>
            <p className="text-navy/70 text-sm">{selectedInfo.howItWorks}</p>
            <p className="text-navy/70 text-sm">
              <span className="font-semibold text-navy">Good for: </span>
              {selectedInfo.goodFor}
            </p>
            <p className="text-navy/70 text-sm">
              <span className="font-semibold text-navy">Watch out for: </span>
              {selectedInfo.watchOutFor}
            </p>
          </div>
        )}
      </fieldset>

      <Link href="/get-started/founder" className="self-start">
        <PrimaryButton type="button">Continue to sign up →</PrimaryButton>
      </Link>
    </div>
  );
}

function RadioCard({
  id,
  label,
  sub,
  checked,
  onSelect,
}: {
  id: string;
  label: string;
  sub: string;
  checked: boolean;
  onSelect: () => void;
}) {
  return (
    <label
      htmlFor={id}
      className={`flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 cursor-pointer transition-colors ${
        checked ? "border-emerald bg-emerald/5" : "border-navy/15 hover:bg-navy/[0.02]"
      }`}
    >
      <input id={id} type="radio" name="funding-self-assessment" className="hidden" checked={checked} onChange={onSelect} />
      <span className="text-navy text-sm font-semibold">{label}</span>
      <span className="text-navy/60 text-xs">{sub}</span>
    </label>
  );
}
