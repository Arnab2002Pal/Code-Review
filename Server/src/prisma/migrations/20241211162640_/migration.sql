-- CreateTable
CREATE TABLE "TaskResult" (
    "id" TEXT NOT NULL,
    "taskId" INTEGER NOT NULL,
    "status" BOOLEAN NOT NULL,
    "summary" JSONB NOT NULL,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TaskResult_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaskResult_taskId_key" ON "TaskResult"("taskId");
