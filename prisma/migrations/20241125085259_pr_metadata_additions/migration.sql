/*
  Warnings:

  - Added the required column `authorName` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorUsername` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `committerEmail` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `committerName` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additions` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletions` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `status` to the `FileAnalysis` table without a default value. This is not possible if the table is not empty.
  - Added the required column `additions` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorAvatar` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `authorUsername` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseRepository` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `changedFiles` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `comments` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `deletions` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headRepository` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "authorName" TEXT NOT NULL,
ADD COLUMN     "authorUsername" TEXT NOT NULL,
ADD COLUMN     "committerEmail" TEXT NOT NULL,
ADD COLUMN     "committerName" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FileAnalysis" ADD COLUMN     "additions" INTEGER NOT NULL,
ADD COLUMN     "deletions" INTEGER NOT NULL,
ADD COLUMN     "language" TEXT,
ADD COLUMN     "previousPath" TEXT,
ADD COLUMN     "status" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "additions" INTEGER NOT NULL,
ADD COLUMN     "authorAvatar" TEXT NOT NULL,
ADD COLUMN     "authorUsername" TEXT NOT NULL,
ADD COLUMN     "baseRepository" TEXT NOT NULL,
ADD COLUMN     "changedFiles" INTEGER NOT NULL,
ADD COLUMN     "closedAt" TIMESTAMP(3),
ADD COLUMN     "comments" INTEGER NOT NULL,
ADD COLUMN     "deletions" INTEGER NOT NULL,
ADD COLUMN     "headRepository" TEXT NOT NULL,
ADD COLUMN     "isDraft" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "labels" TEXT[],
ADD COLUMN     "mergeable" BOOLEAN,
ADD COLUMN     "mergedAt" TIMESTAMP(3),
ADD COLUMN     "reviewers" TEXT[];

-- CreateTable
CREATE TABLE "CommitStats" (
    "id" BIGSERIAL NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changedFiles" INTEGER NOT NULL,
    "commitId" BIGINT NOT NULL,

    CONSTRAINT "CommitStats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CommitStats_commitId_key" ON "CommitStats"("commitId");

-- AddForeignKey
ALTER TABLE "CommitStats" ADD CONSTRAINT "CommitStats_commitId_fkey" FOREIGN KEY ("commitId") REFERENCES "Commit"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
