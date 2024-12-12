import { Queue } from "bullmq";
import { createClient } from "redis";

const mode = process.env.NODE_ENV?.trim()
const devUrl = "redis://localhost:6379"
const prodUrl = `redis://${process.env.REDIS_HOST}:6379`

// Redis connection for BullMQ
export const analyzeQueue = new Queue("code-analysis", {
    connection: {
        host: mode === 'Production' ? process.env.REDIS_HOST as string : "localhost",
        port: process.env.REDIS_PORT as unknown as number || 6379,
    },
});

// Redis connection for caching
export const redisClient = createClient({
    url: mode === 'Production' ? prodUrl : devUrl
})

// Connect to Redis
redisClient.connect();

redisClient.on('connect', () => {
    console.log(`Redis client connected successfully with ${process.env.NODE_ENV?.trim()} mode.`);
});

// Listen for errors to handle connection issues
redisClient.on('error', (err) => {
    console.error('Redis connection error:', err);
});

analyzeQueue.on("error", (error) => {
    console.error("An error occurred with the queue:", error);
});

