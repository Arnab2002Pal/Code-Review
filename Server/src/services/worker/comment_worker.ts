import { Worker } from "bullmq";
import { postAnalysisResult } from "../../utils/utility_operation";
import { redisConnection } from "../redis_config";

const mode = process.env.NODE_ENV?.trim()

const commentWorker = new Worker("post-comments-queue", async job => {
    const { user, analysedResult } = job.data    
    try {        
        return postAnalysisResult(user, analysedResult.code_summary)

    } catch (error) {
        console.log("[COMMENT-Worker]:",error);
        throw new Error("[COMMENT-Worker]: Failed to send analysis result")
    }
}, {
    connection: redisConnection
})

commentWorker.on("ready", () => {
    console.log(`[COMMENT-WORKER] Worker Ready: '${mode}' and Port: ${process.env.REDIS_PORT as unknown as number}`);
});

commentWorker.on("active", (job) => {
    console.log(`[COMMENT-WORKER] Job with ID ${job.id} is active.`);
})

commentWorker.on("resumed", () => {
    console.log(`[COMMENT-WORKER] Job is resumed.`);
})

commentWorker.on("completed", (job) => {
    console.log(`[COMMENT-WORKER] Job with ID ${job.id} completed successfully.`);
});

commentWorker.on("error", (error) => {
    console.error("[COMMENT-WORKER] An error occurred with the worker:", error.message);
});


commentWorker.on("failed", (job, err) => {
    console.error(`[COMMENT-WORKER] Job with ID ${job?.id} failed with error:`, err);
});

