import { Queue } from "bullmq";
import { createClient } from "redis";

// Redis connection for BullMQ
export const analyzeQueue = new Queue("code-analysis", {
    connection: {
        // host: "localhost",
        host: process.env.REDIS_HOST as string || "localhost",
        port: process.env.REDIS_PORT as unknown as number || 6379,
    },
});

// Redis connection for caching
export const redisClient = createClient({
    // url: "redis://localhost:6379",
    url: `redis://${process.env.REDIS_HOST}:6379`,
})

// Connect to Redis
redisClient.connect();

redisClient.on('connect', () => {
    console.log('Redis client connected successfully');
});

// Listen for errors to handle connection issues
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

analyzeQueue.on("error", (error) => {
    console.error("An error occurred with the queue:", error);
});

