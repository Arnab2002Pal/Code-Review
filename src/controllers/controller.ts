import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { GitHubPullRequest } from "../interface";
import { analyzeQueue } from "../services/redis_config";

const client = new PrismaClient()


const analyzePR = async (req: Request, res: Response) => {
    const { repo_url, pr_number, github_token }: GitHubPullRequest = req.body;

    if (!repo_url || !pr_number || !github_token) {
        res.status(400).json({
            success: false,
            message: "Missing required fields",
        });
        return
    }

    try {
        const task = await analyzeQueue.add("analysis-pr", { repo_url, pr_number, github_token });

        if (!task) {
            res.status(500).json({
                success: false,
                message: "Failed to add task to queue",
            });
            return
        }

        res.status(200).json({
            success: true,
            message: "Task added to queue successfully",
            task_id: task.id
        });
        return

    } catch (error: any) {
        res.status(500).json({
            success: false,
            message: "An error occurred while processing the request",
            error: error.message,
        });
        return
    }
};

const taskStatus = async (req: Request, res: Response) => {
    try {
        const taskId :string = req.params.task_id;
        const job = await analyzeQueue.getJob(taskId);

        if (!job) {
            return res.status(404).json({
                success: false,
                message: "Task not found. Please check the task ID and try again.",
            });
        }

        const state = await job.getState();

        switch (state) {
            case "waiting":
            case "delayed":
                return res.status(200).json({
                    success: true,
                    task_id: taskId,
                    message: "Your task has been added to the queue and is awaiting processing.",
                });

            case "active":
                return res.status(200).json({
                    success: true,
                    task_id: taskId,
                    message: "Your task is currently being processed.",
                });

            case "completed":
                if (job.returnvalue === null) {
                    return res.status(200).json({
                        success: false,
                        task_id: taskId,
                        message: "Your task has completed but there was no result to return.",
                    });
                }

                return res.status(200).json({
                    success: true,
                    task_id: taskId,
                    file_name: job.returnvalue.file_name,
                    message: job.returnvalue.message,
                });

            case "failed":
                return res.status(200).json({
                    success: false,
                    task_id: taskId,
                    message: job.failedReason || "Your task has failed to process. Please try again.",
                });

            default:
                return res.status(500).json({
                    success: false,
                    task_id: taskId,
                    message: "An unknown error occurred while checking the task status.",
                });
        }
    } catch (error) {
        console.error("Error checking task status:", error);

        return res.status(500).json({
            success: false,
            message: "An error occurred while checking the task status. Please try again later.",
        });
    }
};

const resultPR = async (req: Request, res: Response) => {
    const { task_id } = req.params
    try {
        const task = await client.taskResult.findUnique({
            where: {
                taskId: Number(task_id)
            }
        })

        if (!task) {
            return res.status(404).json({
                success: false,
                message: "Task not found. Please check the task ID and try again."
            })
        }

        if (!task.status) {
            return res.status(400).json({
                success: false,
                message: `Task failed. ${task.message}.`
            })
        } else {
            return res.status(200).json({
                success: true,
                file_name: task.file_name,
                message: task.message
            })

        }

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while retrieving the task result. Please try again later."
        })
    }
}

export {
    analyzePR,
    taskStatus,
    resultPR
};
