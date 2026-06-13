-- AlterTable
ALTER TABLE "urls" ADD COLUMN     "domain" TEXT,
ADD COLUMN     "safety_score" INTEGER NOT NULL DEFAULT 100,
ADD COLUMN     "safety_status" TEXT NOT NULL DEFAULT 'Safe';
