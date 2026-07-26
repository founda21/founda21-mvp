"use client";

import { useState } from "react";
import { PrimaryButton } from "@/components/ui";
import { consentToMarketingCard } from "@/lib/actions/institution";

// Downloading the card is also the institution's one-time agreement to
// display it — "in partnership with Founda21" — as part of Founda21's own
// marketing, not just a convenience download. Gated by a checkbox the first
// time; consented is true forever after (§ institution.marketingCardConsentedAt).
export function DownloadCardButton({
  cohortId,
  downloadHref,
  consented,
  readOnly,
}: {
  cohortId: string;
  downloadHref: string;
  consented: boolean;
  readOnly: boolean;
}) {
  const [agreed, setAgreed] = useState(false);

  if (readOnly || consented) {
    return (
      <a
        href={downloadHref}
        className="inline-flex rounded-full bg-emerald text-white px-5 py-2 text-sm font-semibold hover:opacity-90 transition-opacity"
      >
        Download card
      </a>
    );
  }

  return (
    <form action={consentToMarketingCard} className="flex flex-col gap-2 items-start">
      <input type="hidden" name="cohortId" value={cohortId} />
      <label className="flex items-start gap-2 text-xs text-navy/70 max-w-sm">
        <input
          type="checkbox"
          name="agree"
          value="yes"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-0.5 accent-emerald"
        />
        <span>
          I agree to display this card as part of our active recruitment materials, in partnership
          with Founda21, for Founda21&apos;s marketing purposes.
        </span>
      </label>
      <PrimaryButton type="submit" disabled={!agreed} className="text-sm px-5 py-2">
        Agree &amp; download card
      </PrimaryButton>
    </form>
  );
}
