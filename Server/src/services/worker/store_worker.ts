import { Worker } from "bullmq";
import { initialize_DatabaseCache } from "../../utils/utility_operation";
import { redisClient, redisConnection } from "../redis_config";
import { PrismaClient } from "@prisma/client";

const mode = process.env.NODE_ENV?.trim()
const client = new PrismaClient()

const storeWorker = new Worker('store-result-queue', async (job) => {
    const { userId, taskId, analysedResult } = job.data;
    console.log("Inside store-result-queue");
    
    try {
        return initialize_DatabaseCache(userId, taskId, analysedResult)
    } catch (error) {
        console.log("[STORE-WORKER] Error at Worker: ", error);

        await redisClient.del(`cached_job:${job.id}`).catch(redisError => {
            console.error("[STORE-WORKER] Error rolling back cache:", redisError);
        })

        await client.taskResult.deleteMany({
            where: {
                taskId: Number(job.id)
            }
        }).catch(db_error => {
            console.error("[DB] Error rolling back database record:", db_error);
        })

        throw new Error("[DB-WORKER] Both database and caching operations failed");
    }
}, {
    connection: redisConnection
})

storeWorker.on("ready", () => {
    console.log(`[STORE-WORKER] Worker Ready: '${mode}' and Port: ${process.env.REDIS_PORT as unknown as number}`);
});

storeWorker.on("active", (job) => {
    console.log(`[STORE-WORKER] Job with ID ${job.id} is active.`);
})

storeWorker.on("resumed", () => {
    console.log(`[STORE-WORKER] Job is resumed.`);
})

storeWorker.on("completed", (job) => {
    console.log(`[STORE-WORKER] Job with ID ${job.id} completed successfully.`);
});

storeWorker.on("error", (error) => {
    console.error("[STORE-WORKER] An error occurred with the worker:", error.message);
});


storeWorker.on("failed", (job, err) => {
    console.error(`[STORE-WORKER] Job with ID ${job?.id} failed with error:`, err);
});
