import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";
import { requirePlatformAdmin } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { CohortCard } from "@/components/pdf/cohort-card";
import { FOUNDA21_SITE_URL } from "@/lib/site";

// Platform-admin ops preview — no marketing-consent gate here, that
// agreement belongs to the institution itself, not internal review.
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ cohortId: string }> },
) {
  const { cohortId } = await params;
  await requirePlatformAdmin();

  const cohort = await prisma.cohort.findUnique({
    where: { id: cohortId },
    include: { institution: true },
  });
  if (!cohort) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const buffer = await renderToBuffer(
    CohortCard({
      institutionName: cohort.institution.name,
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
