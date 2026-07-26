-- Records explicit acknowledgement of the Founda21 Standard Provenance &
-- Methodology Statement (§ /methodology) at signup. Nullable — existing
-- accounts have nothing to backfill; every new signup sets it going forward.
ALTER TABLE "institutions" ADD COLUMN "provenance_acknowledged_at" TIMESTAMP(3);
ALTER TABLE "founders" ADD COLUMN "provenance_acknowledged_at" TIMESTAMP(3);
