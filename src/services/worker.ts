import { Worker } from "bullmq";
import { analyzePullRequest } from "./ai-agent";
import { GitHubPullRequest } from "../interface";
import { PrismaClient } from "@prisma/client";

const client = new PrismaClient()

const worker = new Worker('code-analysis', async job => {
    try {
        console.log("-----WORKER START-----");
        
        const { repo_url, pr_number, github_token }: GitHubPullRequest = job.data;

        const analysedResult = await analyzePullRequest({ repo_url, pr_number, github_token })

        if (!analysedResult.status) {
            return await client.taskResult.create({
                data: {
                    taskId: Number(job.id),
                    status: analysedResult.status,
                    file_name: analysedResult.file_name,
                    message: analysedResult.message
                }
            })
        }

        return await client.taskResult.create({
            data: {
                taskId: Number(job.id),
                status: analysedResult.status,
                file_name: analysedResult.file_name,
                message: analysedResult.message
            }
        })

    } catch (error) {
        console.log("Error at Worker: ", error);
        return await client.taskResult.create({
            data: {
                taskId: Number(job.id),
                status: false,
                file_name: null,
                message: "Worker error: " + error
            }
        })
    }

}, { connection: { host: 'localhost', port: process.env.REDIS_PORT as unknown as number || 6379 } })

worker.on("ready", () => {
    console.log(`Worker is ready and Redis listening at ${process.env.REDIS_PORT as unknown as number}`);
});

worker.on("active", (job)=>{
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