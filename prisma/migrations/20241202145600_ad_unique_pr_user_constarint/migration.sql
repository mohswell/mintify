/*
  Warnings:

  - A unique constraint covering the columns `[prNumber,userId]` on the table `PullRequest` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_prNumber_userId_key" ON "PullRequest"("prNumber", "userId");
