import dotenv from 'dotenv'
import { Worker } from "bullmq";
import { analyzePullRequest } from "../ai-agent";
import { PrismaClient } from "@prisma/client";
import { postCommentsQueue, redisConnection, storeResultQueue } from "../redis_config";
dotenv.config()

const client = new PrismaClient()
const mode = process.env.NODE_ENV?.trim()

const fetchWorker = new Worker('code-analysis-queue', async job => {
    const { diff_url, user } = job.data;

    try {        
        const analysedResult = await analyzePullRequest(diff_url)
            
        // If status is false
        if (!analysedResult.status) {
            console.log(`[FETCH-WORKER] Due some error, the worker will try to process it again later.`);
            
            await job.moveToDelayed(Date.now() + 30000);

            const exist = await client.taskResult.findUnique({
                where: { taskId: Number(job.id) }
            })
            
            if (exist) {
                console.log("Task already exists");
                return;
            }
            return {
                status: "pending",
                message: "Analysis not available yet, retrying later.",
                jobId: job.id
            };
        }
        
        const [commentTask, storeTask] = await Promise.all([
            postCommentsQueue.add("post-comment-task", { user, analysedResult }, {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 10000,
                },
                removeOnComplete: true,
                removeOnFail: true
            }),

            storeResultQueue.add("store-result-task", { taskId: job.id, analysedResult }, {
                attempts: 3,
                backoff: {
                    type: "exponential",
                    delay: 10000,
                },
                removeOnComplete: true,
                removeOnFail: true
            })
        ]);

        console.log('[FETCH-WORKER] All processes have been completed.');
        
        return { 
            status: "completed",
            message: "Analysis successful, tasks created.",
            jobId: job.id,
            commentTaskId: commentTask.id,
            storeTaskId: storeTask.id 
        };
    } catch (error) {
        console.error("[FETCH-WORKER] Error processing job:", error);
        throw Error;
    }
}, {
    connection: redisConnection
})

fetchWorker.on("ready", () => {
    console.log(`[FETCH-WORKER] Worker Ready: '${mode}' and Port: ${process.env.REDIS_PORT as unknown as number}`);
});

fetchWorker.on("active", (job) => {
    console.log(`[FETCH-WORKER] Job with ID ${job.id} is active.`);
})

fetchWorker.on("resumed", () => {
    console.log(`[FETCH-WORKER] Job is resumed.`);
})

fetchWorker.on("completed", (job) => {
    console.log(`[FETCH-WORKER] Job with ID ${job.id} completed successfully.`);
});

fetchWorker.on("error", (error) => {
    console.error("[FETCH-WORKER] An error occurred with the worker:", error.message);
});

fetchWorker.on("failed", (job, err) => {
    console.error(`[FETCH-WORKER] Job with ID ${job?.id} failed with error:`, err);
});