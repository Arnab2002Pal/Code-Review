import { Request, Response } from "express";
import { PrismaClient } from "@prisma/client";
import { ProgressStatus, StatusCode, User } from "../interfaces/interface";
import { fetchQueue, redisClient } from "../services/redis_config";
import { cacheData } from "../utils/utility_operation";

const client = new PrismaClient()

const testRoute = async (req: Request, res: Response) => {
    return res.status(StatusCode.SUCCESS).json({
        success: true,
        message: "API endpoint is working correctly"
    })
}

const newUser = async (req: Request, res: Response) => {
    try {
        const { email, github } = req.body;
        const user = await client.user.findFirst({
            where: {
                email
            }
        })
        if (user) {
            return res.status(StatusCode.BAD_REQUEST).json({
                success: false,
                message: "User already exists"
            })
        }

        const newUser = await client.user.create({
            data: {
                email,
                githubUsername: github.username,
                githubId: github.id,
                githubToken: github.token

            }
        })
        if (!newUser) {
            res.status(StatusCode.INTERNAL_ERROR).json({
                success: false,
                message: "Failed to create new user. Please try again later."
            })
            return;
        }
        res.status(StatusCode.SUCCESS).json({
            success: true,
            user: newUser
        })
        return
    } catch (error) {
        res.status(StatusCode.BAD_REQUEST).json({
            success: false,
            message: "An error occurred while creating new user. Please try again later."
        })
        return;
    }
}

const getUser = async (req: Request, res: Response) => {
    const {email} = req.params;

    try {
        const user = await client.user.findUnique({
            where: {
                email
            }
        })

        if(!user){
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "User not found"
            })
            return
        }

        const userTask = await client.taskResult.findMany({
            where: {
                userId: user.id
            }
        })

        if(!userTask){
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                userId: user.id,
                userTask: [],
                message: "No tasks found for this user"
            })
            return;
        }
        res.status(StatusCode.SUCCESS).json({
            success: true,
            userId: user.id,
            repository: userTask,
        })
        return;
        
    } catch (error) {
        res.status(StatusCode.INTERNAL_ERROR).json({
            success: false,
            message: "An error occurred while fetching user. Please try again later."
        })
        return;
    }
}

const checkToken = async (req: Request, res: Response) => {
    try {
        const email = req.query.email as string;

        if (!email) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "Email is required"
            })
            return
        }

        const existUser = await client.user.findUnique({
            where: {
                email
            }
        });

        if (!existUser) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "User not found"
            })
            return
        }
        const isTokenPresent = existUser.githubToken ? true : false

        if (isTokenPresent) {
            res.status(StatusCode.SUCCESS).json({
                success: true,
                message: "Token is present"
            })
        } else {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "Token is not present"
            })
        }

    } catch (error) {
        res.status(StatusCode.INTERNAL_ERROR).json({
            success: false,
            message: "An error occurred while checking the token. Please try again later."
        })
    }
}

const analyzePR = async (req: Request, res: Response) => {
    try {                
        const { action, number: pr_number, pull_request, repository } = req.body;

        // only 'opened' PR events are processed
        if (action !== "opened") return res.sendStatus(204);
        const userExist = await client.user.findFirst({
            where: {
                AND: [
                    { githubId: pull_request.user.id },
                    { githubUsername: pull_request.user.login }
                ]
            }
        });
        if (!userExist) {
            res.status(StatusCode.NOT_FOUND).json({
                success: false,
                message: "No token Found!"
            });
            return
        }
        const { diff_url, head, comments_url, user } = pull_request;
        const { name, full_name } = repository
        const {login, id } = user;

        // Add Repo Name to Database
        const userInfo: User = {
            userId: userExist.id,
            repository: name,
            full_name,
            pr_number,
            commit_id: head.sha,
            comments_url,
            github_token: userExist.githubToken,
            github_username: login,
            github_id: id
        };

        res.status(StatusCode.SUCCESS).json({
            message: "Webhook received successfully"
        });

        const task = await fetchQueue.add("fetch-diff-task", { diff_url, userInfo }, {
            attempts: 3,
            backoff: {
                type: "exponential",
                delay: 5000,
            },
            removeOnComplete: true,
            removeOnFail: true
        });

        if (!task) {
            res.status(StatusCode.INTERNAL_ERROR).json({
                success: false,
                message: "Failed to add task to queue",
            });
            return
        }

        return;
    } catch (error: any) {
        console.error("Error processing webhook:", error);
        res.status(StatusCode.INTERNAL_ERROR).json({
            message: "Webhook Failed"
        });
        return
    }
};

/**
 * This function retrieves the status of a task based on the provided user ID.
 * It checks the task in the database and the corresponding job in the queue.
 *
 * @param {Request} req - The Express request object containing the user ID in the request parameters.
 * @param {Response} res - The Express response object to send the status response.
 *
 * @returns {Promise<Response>} - A Promise that resolves to an Express response object.
 *
 * @throws Will throw an error if the task or job cannot be found or if an error occurs during processing.
 */
const taskStatus = async (req: Request, res: Response) => {
    try {
        const taskId: string = req.params.taskID;
        console.log("taskStatus: 1-----",taskId);
        
        const task = await client.taskResult.findUnique({
            where:{
                id: taskId
            }
        })

        console.log("taskStatus: 2-----", task);

        if(!task) {
            return res.status(StatusCode.NOT_FOUND).json({
                success: false,
                status: ProgressStatus.FAILED,
                message: "Task not found. Please check the task ID and try again.",
            });
        }

        const taskID = task.taskId

        if (task.status === ProgressStatus.COMPLETED) {
            return res.status(StatusCode.SUCCESS).json({
                success: true,
                status: ProgressStatus.COMPLETED,
                task_id: taskID,
                message: "Task completed successfully.",
            });
        }
        const fetchjob = await fetchQueue.getJob(String(taskID));

        // If the job is not found and no data exists in the database, return a 404 error
        if (!fetchjob) {
            return res.status(StatusCode.NOT_FOUND).json({
                success: false,
                status: ProgressStatus.EMPTY,
                message: "Retry again! Not found in Cache.",
            });
        }

        let state: string | null = null;

        // If the job exists, get its state
        if (fetchjob) {
            state = await fetchjob.getState();
        }

        switch (state) {
            case "waiting":
            case "delayed":
                return res.status(StatusCode.SUCCESS).json({
                    success: true,
                    status: ProgressStatus.DELAYED,
                    task_id: taskID,
                    message: "Your task has been added to the queue and is awaiting processing.",
                });

            case "active":
                return res.status(StatusCode.SUCCESS).json({
                    success: true,
                    status: ProgressStatus.ACTIVE,
                    task_id: taskID,
                    message: "Your task is currently being processed.",
                });

            case "failed":
                return res.status(StatusCode.SUCCESS).json({
                    success: false,
                    status: ProgressStatus.FAILED,
                    task_id: taskID,
                    message: fetchjob?.failedReason || "Your task has failed to process. Please try again.",
                });

            default:
                // If state is null or unknown, provide a fallback
                if (!task) {
                    return res.status(StatusCode.SUCCESS).json({
                        success: false,
                        status: ProgressStatus.FAILED,
                        task_id: taskID,
                        message: "Task completed, but no result found in the database.",
                    });
                }
        }
    } catch (error) {
        console.error("Error checking task status:", error);

        return res.status(StatusCode.INTERNAL_ERROR).json({
            success: false,
            status: ProgressStatus.FAILED,
            message: "An error occurred while checking the task status. Please try again later.",
        });
    }
};

const resultPR = async (req: Request, res: Response) => {
    const { userID } = req.params
    try {
        const task = await client.taskResult.findFirst({
            where: {
                userId: userID
            }
        })

        if(!task) {
            return res.status(StatusCode.NOT_FOUND).json({
                success: false,
                status: ProgressStatus.FAILED,
                message: "Task not found. Please check the task ID and try again.",
            });
        }

        const cache = await redisClient.get(`cached_job:${task.id}`)

        if (cache) {
            const parsedCache = JSON.parse(cache);
            return res.status(StatusCode.SUCCESS).json({
                success: true,
                type: "cached",
                task_id: parsedCache.taskId,
                summary: parsedCache.summary,
                message: parsedCache.message,
            });
        }

        const renewCache = await cacheData(task.id);

        // Send the response to the user after caching
        return res.status(StatusCode.SUCCESS).json({
            success: true,
            type: "database",
            task_id: renewCache.taskId,
            summary: renewCache.summary,
            message: renewCache.message,
        });
    } catch (error) {
        console.error("[SERVER] Error occured:",error);
        return res.status(StatusCode.INTERNAL_ERROR).json({
            success: false,
            message: "An error occurred while retrieving the task result. Please try again later."
        })
    }
}

export {
    testRoute,
    newUser,
    getUser,
    checkToken,
    analyzePR,
    taskStatus,
    resultPR
};
