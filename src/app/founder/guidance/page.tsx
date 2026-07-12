import { requireFounder } from "@/lib/auth";
import { FounderTabs } from "@/components/founder-tabs";
import { GuidanceBrowser } from "@/components/guidance-browser";
import { ventureStageLabel } from "@/lib/venture-stage";

export default async function GuidancePage() {
  const { founder } = await requireFounder();

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-8">
      <div>
        <h1 className="text-navy text-2xl font-bold">{founder.ventureName}</h1>
        <p className="text-navy/60 text-sm mt-1">
          {founder.fullName} · {founder.ventureType} · {ventureStageLabel(founder.ventureStage)}
        </p>
      </div>

      <FounderTabs active="/founder/guidance" />

      <div>
        <h2 className="text-navy font-bold">Ask for guidance</h2>
        <p className="text-navy/60 text-sm mt-1">
          Everything about how checkpoints work and what each one needs — search or browse below.
        </p>
      </div>

      <GuidanceBrowser />
    </div>
  );
}
