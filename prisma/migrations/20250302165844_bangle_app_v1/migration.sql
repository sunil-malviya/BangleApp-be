-- CreateEnum
CREATE TYPE "OrganizationType" AS ENUM ('MANUFACTURER', 'KARIGAR', 'AGENT', 'PIPEMAKER');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT,
    "mobile" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "status" "Status" NOT NULL DEFAULT 'ACTIVE',
    "image" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Organization" (
    "id" TEXT NOT NULL,
    "orgName" TEXT NOT NULL,
    "orgMobile" TEXT NOT NULL,
    "orgEmail" TEXT,
    "orgPincode" TEXT NOT NULL,
    "orgCity" TEXT NOT NULL,
    "orgState" TEXT NOT NULL,
    "orgAddress" TEXT NOT NULL,
    "orgType" "OrganizationType" NOT NULL,
    "orgStatus" "Status" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "orgGST" TEXT,
    "orgPAN" TEXT,
    "orgCIN" TEXT,
    "orgTAN" TEXT,
    "orgLogo" TEXT,
    "orgWebsite" TEXT,
    "orgAbout" TEXT,
    "userId" TEXT NOT NULL,

    CONSTRAINT "Organization_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_mobile_key" ON "User"("mobile");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_orgMobile_key" ON "Organization"("orgMobile");

-- CreateIndex
CREATE UNIQUE INDEX "Organization_userId_key" ON "Organization"("userId");

-- AddForeignKey
ALTER TABLE "Organization" ADD CONSTRAINT "Organization_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
