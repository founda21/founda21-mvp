import { Wordmark } from "@/components/wordmark";
import { FixedBackLink } from "@/components/back-link";
import { FundingGuide } from "@/components/funding-guide";

export default function FundingGuidePage() {
  return (
    <div className="min-h-screen flex flex-col items-center px-6 py-12 gap-8">
      <FixedBackLink href="/" label="Home" />
      <Wordmark className="text-2xl" />
      <div className="w-full max-w-2xl">
        <FundingGuide />
      </div>
    </div>
  );
}
