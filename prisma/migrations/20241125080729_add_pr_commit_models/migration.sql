/*
  Warnings:

  - Added the required column `authorEmail` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `date` to the `Commit` table without a default value. This is not possible if the table is not empty.
  - Added the required column `author` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `url` to the `PullRequest` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Commit" ADD COLUMN     "authorEmail" TEXT NOT NULL,
ADD COLUMN     "date" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "PullRequest" ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "baseBranch" TEXT NOT NULL,
ADD COLUMN     "headBranch" TEXT NOT NULL,
ADD COLUMN     "url" TEXT NOT NULL;
