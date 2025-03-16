/*
  Warnings:

  - Added the required column `repository` to the `TaskResult` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "TaskResult" ADD COLUMN     "repository" TEXT NOT NULL;
