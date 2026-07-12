-- CreateEnum
CREATE TYPE "InstitutionType" AS ENUM ('UNIVERSITY', 'ACCELERATOR', 'INCUBATOR', 'OTHER');

-- CreateEnum
CREATE TYPE "VentureStage" AS ENUM ('IDEA', 'PRE_SEED', 'SEED', 'SERIES_A_PLUS');

-- AlterTable
ALTER TABLE "institutions" ADD COLUMN "institution_type" "InstitutionType";

-- AlterTable
ALTER TABLE "founders" ADD COLUMN "venture_stage" "VentureStage";
