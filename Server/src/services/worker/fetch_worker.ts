import dotenv from 'dotenv'
import { Worker } from "bullmq";
import { analyzePullRequest } from "../ai-agent";
import { PrismaClient } from "@prisma/client";
import { postCommentsQueue, redisConnection, storeResultQueue } from "../redis_config";
import { waitForCompletion } from '../../utils/utility_operation';
import { ProgressStatus, StatusCode, WaitingType } from '../../interfaces/interface';
dotenv.config()

const client = new PrismaClient()
const mode = process.env.NODE_ENV?.trim()

const fetchWorker = new Worker('code-analysis-queue', async job => {
    const { diff_url, userInfo } = job.data;
    
    try {
        console.log("Db query");
        const userExists = await client.user.findFirst({
            where: {
                githubUsername: userInfo.github_username,
                githubId: userInfo.github_id
            }
        })

        if(!userExists) {
            console.log("[FETCH-WORKER] User not found. Skipping analysis.");
            return;
        }
                
        await client.taskResult.create({
            data: {
                userId: userExists.id,
                taskId: Number(job.id!),
                status: ProgressStatus.PENDING,
                summary: {},
                message: "Analysis started."
            }
        })
        
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
        
        const postComment = await postCommentsQueue.add("post-comment-task", { userInfo, analysedResult }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 10000,
            },
            removeOnComplete: true,
            removeOnFail: true
        })

        console.log("[FETCH-WORKER] Waiting till commenting is finished.");
        await waitForCompletion(postComment.id, WaitingType.COMMENT)

        const storeResult = await storeResultQueue.add("store-result-task", { userId: userInfo.userId, taskId: job.id, analysedResult }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 10000,
            },
            removeOnComplete: {
                age: 2000
            },
            removeOnFail: true
        })
        
        console.log("[FETCH-WORKER] Waiting till storing DB is updated.");
        await waitForCompletion(postComment.id, WaitingType.STORE)

        console.log('[FETCH-WORKER] All processes have been completed.');
        
        return {
            status: StatusCode.SUCCESS,
            message: "Analysis successful, tasks created.",
            jobId: job.id,
            postCommentTaskId: postComment.id,
            storeTaskId: storeResult.id
        }
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