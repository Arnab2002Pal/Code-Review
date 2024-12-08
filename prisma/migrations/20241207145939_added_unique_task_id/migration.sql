/*
  Warnings:

  - A unique constraint covering the columns `[taskId]` on the table `TaskResult` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_taskId_key" ON "TaskResult"("taskId");
