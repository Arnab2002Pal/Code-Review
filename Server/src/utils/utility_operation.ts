import dotenv from 'dotenv'
import { Queue } from "bullmq"
import { PrismaClient } from "@prisma/client"
import { redisClient } from "../services/redis_config"
import { analysedResult, FileReport, Status_Code, Task_Data, User } from "../interfaces/interface"
import axios from "axios"

dotenv.config()
const client = new PrismaClient()

// QUEUE RELATED FUNCTIONS
/**
 * Creates a new BullMQ queue with the specified name and connection configuration.
 *
 * @param name - The name of the queue.
 * @returns A new BullMQ queue instance.
 *
 * @remarks
 * This function initializes a new queue with the given name and connection configuration.
 * It also sets up an error listener to handle any errors that occur within the queue.
 */
export function createQueue(name: string, config: { host: string, port: number }): Queue {
    const queue = new Queue(name, { connection: config });

    queue.on("error", (error) => {
        console.error(`[${name.toUpperCase()}] An error occurred with the ${name} queue:`, error);
    });

    return queue;
}

// DATABASE-CACHER RELATED FUNCTIONS
export async function initialize_DatabaseCache(id: any, analysedResult: any) {
    try {
        const taskData: Task_Data = {
            userId:"asd",
            taskId: Number(id),
            status: analysedResult.status,
            summary: analysedResult.code_summary.results,
            message: analysedResult.message
        }

        // Execute database and Redis operations concurrently for better performance
        console.log('[STORE-WORKER] Initiallizing insert into DB and Cache');

        const [dbEntry, cacheStatus] = await Promise.all([
            client.taskResult.create({ data: taskData }),
            redisClient.setEx(`cached_job:${id}`, Number(process.env.CACHE_TIMING), JSON.stringify(taskData)),
        ]);

        return {
            id: dbEntry.id,
            taskId: dbEntry.taskId,
            cacheStatus,
        };
    } catch (error) {
        console.error("Error initializing database cache:", error);
        throw new Error("Failed to initialize database cache");
    }

}

export async function cacheData(taskID: number) {
    const data = await client.taskResult.findUnique({
        where: {
            taskId: taskID
        }
    })

    if (!data) {
        throw new Error(`Task is not found with the taskID: ${taskID}`)
    }

    const taskData: Task_Data = {
        userId: "",
        taskId: data.taskId,
        status: data.status,
        summary: data.summary,
        message: data.message || ""
    }

    if (data) {
        await redisClient.setEx(`cached_job:${taskID}`, Number(process.env.CACHE_TIMING), JSON.stringify(taskData))
        return taskData
    } else {
        throw new Error(`Task is not found with the taskID: ${taskID}`)
    }
}

// API RELATED FUNCTIONS
async function processPRComment(full_name: string, pr_number: any, comments_url: string , comment: string, token: string) {
    await axios.post(comments_url,
        {
            body: comment
        },
        {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
                Accept: "application/vnd.github+json"
            }
        }
    )
}

async function processPRFiles(full_name: string, pr_number: any, files: FileReport[], commit_id: string, token: string) {
    let completedFiles = 0;
    for (const file of files) {
        console.log(`[COMMENT-Worker] Processing File: ${file.name}`);

        for (const issue of file.issues) {
            const body = `Issue Type: ${issue.type},
            Description: ${issue.description},
            Suggestion: ${issue.suggestion}`
            try {
                const response = await axios.post(`https://api.github.com/repos/${full_name}/pulls/${pr_number}/comments`, {
                    commit_id: commit_id,
                    body,
                    path: file.name,
                    line: issue.line,
                }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`,
                    }
                })

                if (response.status !== 201) {
                    console.log(`[COMMENT-Worker] Skipping ${file.name} with issue ${issue.line} due to Error Status: ${response.status}`);
                    continue;
                }

            } catch (error:any) {
                console.error(`[COMMENT-Worker] Error processing line ${issue.line} of file: ${file.name} with status error: ${error.status}`);
                continue;
            }
        }
        completedFiles++;
        console.log(`[COMMENT-Worker] Completed processing file: ${completedFiles}/${files.length}. Pausing for 2 seconds...`);
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    console.log("[COMMENT-Worker] All files processed successfully.");
}

export function postAnalysisResult(user: User, data: analysedResult) {
    const { files, summary } = data.results;
    const comment = `${summary.comment},
                Total Files: ${summary.total_files},
                Total Issues: ${summary.total_issues},
                Critical Issues: ${summary.critical_issues}`
    const token = user.github_token;
    try {
        processPRComment(user.full_name, user.pr_number, user.comments_url ,comment, token)
        processPRFiles(user.full_name, user.pr_number, files, user.commit_id, token)

        return {
            status: Status_Code.SUCCESS
        }
    } catch (error) {
        console.log('[COMMENT-Worker]:', error);
        throw error
    }
}

// GENERATE CONTENT WITH RETRY
export async function generateContentWithRetry(model: any, prompt: string, maxRetries = 5, initialWaitTime = 2) {
    let retries = 0;
    let waitTime = initialWaitTime

    while (retries < maxRetries) {
        try {
            const result = await model.generateContent(prompt);
            let parsedSummary = {};
            parsedSummary = JSON.parse(result.response.text());
            return parsedSummary;
        } catch (error: any) {
            if (error.status == 429) {
                retries++;
                console.log(`[AI] Rate limited. Retrying in ${waitTime} seconds...`);
                await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
                waitTime *= 2;
            } else {
                throw error;
            }
        }
    }
    throw new Error("[AI] Max retries exceeded for generateContent.");
}