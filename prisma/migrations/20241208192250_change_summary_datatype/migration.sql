/*
  Warnings:

  - Changed the type of `summary` on the `TaskResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaskResult" DROP COLUMN "summary",
ADD COLUMN     "summary" JSONB NOT NULL;
