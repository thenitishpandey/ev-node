-- CreateEnum
CREATE TYPE "WBSAccessRole" AS ENUM ('VIEWER', 'EDITOR', 'ADMIN');

-- CreateTable
CREATE TABLE "WBS" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sequenceNumber" TEXT NOT NULL,
    "level" INTEGER NOT NULL,
    "description" TEXT,
    "vistaCode" TEXT,
    "cost" DECIMAL(10,2),
    "currency" TEXT,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "projectId" TEXT NOT NULL,
    "parentId" TEXT,

    CONSTRAINT "WBS_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "WBSAccess" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "wbsId" TEXT NOT NULL,
    "role" "WBSAccessRole" NOT NULL DEFAULT 'VIEWER',
    "isInherited" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WBSAccess_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "WBS_projectId_idx" ON "WBS"("projectId");

-- CreateIndex
CREATE INDEX "WBS_parentId_idx" ON "WBS"("parentId");

-- CreateIndex
CREATE INDEX "WBS_sequenceNumber_idx" ON "WBS"("sequenceNumber");

-- CreateIndex
CREATE INDEX "WBSAccess_userId_idx" ON "WBSAccess"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "WBSAccess_wbsId_userId_key" ON "WBSAccess"("wbsId", "userId");

-- AddForeignKey
ALTER TABLE "WBS" ADD CONSTRAINT "WBS_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBS" ADD CONSTRAINT "WBS_parentId_fkey" FOREIGN KEY ("parentId") REFERENCES "WBS"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSAccess" ADD CONSTRAINT "WBSAccess_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WBSAccess" ADD CONSTRAINT "WBSAccess_wbsId_fkey" FOREIGN KEY ("wbsId") REFERENCES "WBS"("id") ON DELETE CASCADE ON UPDATE CASCADE;
