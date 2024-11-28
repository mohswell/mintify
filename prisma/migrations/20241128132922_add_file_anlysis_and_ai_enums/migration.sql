/*
  Warnings:

  - You are about to drop the column `analysisResults` on the `FileAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `diff` on the `FileAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `language` on the `FileAnalysis` table. All the data in the column will be lost.
  - You are about to drop the column `previousPath` on the `FileAnalysis` table. All the data in the column will be lost.
  - The `status` column on the `FileAnalysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `fileType` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prNumber` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "FileType" AS ENUM ('JAVASCRIPT', 'TYPESCRIPT', 'MARKDOWN', 'YAML', 'OTHER', 'CSS', 'BASH', 'PYTHON', 'JAVA');

-- CreateEnum
CREATE TYPE "FileStatus" AS ENUM ('PENDING', 'ANALYZED', 'SKIPPED', 'ERROR');

-- CreateEnum
CREATE TYPE "AiAnalysisStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED', 'PARTIAL');

-- AlterTable
ALTER TABLE "FileAnalysis" DROP COLUMN "analysisResults",
DROP COLUMN "diff",
DROP COLUMN "language",
DROP COLUMN "previousPath",
ADD COLUMN     "aiAnalysisResult" TEXT,
ADD COLUMN     "aiAnalysisStatus" "AiAnalysisStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "complexityScore" DOUBLE PRECISION,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fileType" "FileType" NOT NULL,
ADD COLUMN     "performanceIssues" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "prNumber" INTEGER NOT NULL,
ADD COLUMN     "rawDiff" TEXT,
ADD COLUMN     "securityIssues" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "totalChanges" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "analyzedAt" DROP NOT NULL,
ALTER COLUMN "analyzedAt" DROP DEFAULT,
ALTER COLUMN "additions" SET DEFAULT 0,
ALTER COLUMN "deletions" SET DEFAULT 0,
DROP COLUMN "status",
ADD COLUMN     "status" "FileStatus" NOT NULL DEFAULT 'PENDING';

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "fileAnalysis" BIGINT NOT NULL DEFAULT 1;
