import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requireApprovedInstitutionAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CohortCard } from "@/components/pdf/cohort-card";
import { FOUNDA21_SITE_URL } from "@/lib/site";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cohortId: string }> },
) {
  const { cohortId } = await params;
  const { institution } = await requireApprovedInstitutionAdmin();

  // The card can only be generated once the institution has agreed to
  // display it for Founda21's own marketing purposes (§ consentToMarketingCard).
  if (!institution.marketingCardConsentedAt) {
    return NextResponse.json({ error: "Agreement required before downloading the card." }, { status: 403 });
  }

  const cohort = await prisma.cohort.findUnique({ where: { id: cohortId } });
  if (!cohort || cohort.institutionId !== institution.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    CohortCard({
      institutionName: institution.name,
      inviteCode: cohort.inviteCode,
      siteUrl: FOUNDA21_SITE_URL,
    }),
  );

  const filename = `${cohort.name.replace(/[^a-z0-9]+/gi, "-").toLowerCase()}-founda21-card.pdf`;

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
