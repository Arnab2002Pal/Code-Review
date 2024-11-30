import { Worker } from "bullmq";
import { analyzePullRequest } from "./ai-agent";
import { GitHubPullRequest } from "../interface";

const worker = new Worker('code-analysis', async job =>{
    try {
        const { repo_url, pr_number, github_token }: GitHubPullRequest = job.data;
        const analysedResult = await analyzePullRequest({repo_url, pr_number, github_token})

    } catch (error) {
        
    }

}, { connection: { host: 'localhost', port: 6379 } })

