/*
  Warnings:

  - You are about to drop the column `result` on the `TaskResult` table. All the data in the column will be lost.
  - Changed the type of `taskId` on the `TaskResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `status` on the `TaskResult` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- AlterTable
ALTER TABLE "TaskResult" DROP COLUMN "result",
ADD COLUMN     "message" TEXT,
DROP COLUMN "taskId",
ADD COLUMN     "taskId" INTEGER NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" BOOLEAN NOT NULL;
