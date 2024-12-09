/*
  Warnings:

  - Added the required column `summary` to the `TaskResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskResult" ADD COLUMN     "summary" TEXT NOT NULL;
