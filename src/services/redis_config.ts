import { Queue } from "bullmq";

// Redis connection for BullMQ
export const analyzeQueue = new Queue("code-analysis", {
    connection: {
        host: process.env.REDIS_HOST as string|| "localhost",
        port: process.env.REDIS_PORT as unknown as number || 6379,
    },
});

analyzeQueue.on("error", (error) => {
    console.error("An error occurred with the queue:", error.message);
});

