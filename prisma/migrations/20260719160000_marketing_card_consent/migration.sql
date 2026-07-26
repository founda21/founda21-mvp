-- One-time agreement to display the co-branded recruitment card as part of
-- Founda21's own marketing (§ marketingCardConsentedAt). Nullable — set the
-- first time an institution downloads the card, never re-asked after.
ALTER TABLE "institutions" ADD COLUMN "marketing_card_consented_at" TIMESTAMP(3);
