-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "SortOrder" AS ENUM ('ASC', 'DESC');

-- CreateEnum
CREATE TYPE "ColumnType" AS ENUM ('TEXT', 'NUMBER', 'SELECT', 'DATE', 'MULTI_SELECT', 'CHECKBOX');

-- CreateTable
CREATE TABLE "Sheet" (
    "id" TEXT NOT NULL,
    "sheetName" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "visibility" "Visibility" NOT NULL DEFAULT 'PRIVATE',
    "metadata" JSONB NOT NULL DEFAULT '{}',
    "hiddenColumns" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Sheet_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Column" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "ColumnType" NOT NULL,
    "options" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "editable" BOOLEAN NOT NULL DEFAULT true,
    "sortable" BOOLEAN NOT NULL DEFAULT true,
    "sort" "SortOrder",
    "width" INTEGER,
    "minWidth" INTEGER,
    "maxWidth" INTEGER,
    "resizable" BOOLEAN NOT NULL DEFAULT true,
    "align" TEXT NOT NULL DEFAULT 'left',
    "defaultSortOrder" "SortOrder",
    "formatOptions" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Column_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Row" (
    "id" TEXT NOT NULL,
    "sheetId" TEXT NOT NULL,
    "cells" JSONB NOT NULL,
    "customStyles" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Row_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Column_sheetId_idx" ON "Column"("sheetId");

-- CreateIndex
CREATE INDEX "Row_sheetId_idx" ON "Row"("sheetId");

-- AddForeignKey
ALTER TABLE "Column" ADD CONSTRAINT "Column_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Row" ADD CONSTRAINT "Row_sheetId_fkey" FOREIGN KEY ("sheetId") REFERENCES "Sheet"("id") ON DELETE CASCADE ON UPDATE CASCADE;
