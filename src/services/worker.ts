import { Worker } from "bullmq";
import { analyzePullRequest } from "./ai-agent";
import { GitHubPullRequest } from "../interfaces/interface";
import { PrismaClient } from "@prisma/client";
import { redisClient } from "./redis_config";
import { initialize_DatabaseCache } from "../utils/utility_operation";

const client = new PrismaClient()

const worker = new Worker('code-analysis', async job => {
    const { repo_url, pr_number, github_token }: GitHubPullRequest = job.data;

    try {
        const analysedResult = await analyzePullRequest({ repo_url, pr_number, github_token })

        // If status is false
        if (!analysedResult.status) {
            return await client.taskResult.create({
                data: {
                    taskId: Number(job.id),
                    status: analysedResult.status,
                    summary: {},
                    message: analysedResult.message
                }
            })
        }

        return await initialize_DatabaseCache(job, analysedResult)

    } catch (error) {
        console.log("Error at Worker: ", error);

        await redisClient.del(`cached_job:${job.id}`).catch(redisError => {
            console.error("Error rolling back cache:", redisError);
        })

        await client.taskResult.deleteMany({
            where: {
                taskId: Number(job.id)
            }
        }).catch(db_error => {
            console.error("Error rolling back database record:", db_error);
        })

        throw new Error("Both database and caching operations failed");
    }

}, {
    connection: {
        // host: 'localhost',
        host: process.env.REDIS_HOST as string,
        port: process.env.REDIS_PORT as unknown as number || 6379
    }
})

worker.on("ready", () => {
    console.log(`Worker is ready and Redis listening at ${process.env.REDIS_PORT as unknown as number}`);
});

worker.on("active", (job) => {
    console.log(`Job with ID ${job.id} is active.`);
})

worker.on("resumed", () => {
    console.log(`Job is resumed.`);
})

worker.on("completed", (job) => {
    console.log(`Job with ID ${job.id} completed successfully.`);
});

worker.on("error", (error) => {
    console.error("An error occurred with the worker:", error.message);
});


worker.on("failed", (job, err) => {
    console.error(`Job with ID ${job?.id} failed with error:`, err);
});