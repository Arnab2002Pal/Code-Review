import { Request, Response } from "express";
import { Queue } from "bullmq";
// import { Github_PR } from "../interface";

// Redis connection for BullMQ
const analyzeQueue = new Queue("code-analysis", {
    connection: {
        host: "localhost",
        port: 6379,
    },
});

const analyzePR = async (req: Request, res: Response) => {
    const { repo_url, pr_number } = req.body;
    
    // Need to remove later
    const github_token = process.env.GITHUB_FINEGRAINED_TOKEN

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
            task
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

export { analyzePR };
