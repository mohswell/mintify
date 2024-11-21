-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'MODERATOR', 'GUEST');

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "aiModelVersion" TEXT,
ADD COLUMN     "aiUserToken" TEXT,
ADD COLUMN     "githubRepositoryUrl" TEXT,
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "maxRequestsPerDay" INTEGER DEFAULT 10,
ADD COLUMN     "phone" TEXT,
ADD COLUMN     "registrationDate" TIMESTAMP(3),
ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';
