import dotenv from 'dotenv'
import { createQueue } from "../utils/utility_operation";
import { createClient } from "redis";
dotenv.config()
const mode = process.env.NODE_ENV?.trim()
const devUrl = "redis://localhost:6379"
const prodUrl = `redis://${process.env.REDIS_HOST}:6379`

const queueConfig = {
    host: mode === 'Production' ? process.env.REDIS_HOST as string : "localhost",
    port: process.env.REDIS_PORT as unknown as number || 6379,
}

export const redisConnection = {
    host: mode === 'Production' ? process.env.REDIS_HOST as unknown as string : 'localhost',
        port: process.env.REDIS_PORT as unknown as number || 6379
}

export const fetchQueue = createQueue("code-analysis-queue", queueConfig);
export const storeResultQueue = createQueue("store-result-queue", queueConfig);
export const postCommentsQueue = createQueue("post-comments-queue", queueConfig);


// Redis connection for caching
export const redisClient = createClient({
    url: mode === 'Production' ? prodUrl : devUrl
})

// Connect to Redis
redisClient.connect();

redisClient.on('connect', () => {
    console.log(`[REDIS] Redis client connected successfully with ${process.env.NODE_ENV?.trim()} mode.`);
});

// Listen for errors to handle connection issues
redisClient.on('error', (err) => {
    console.error('[REDIS] Redis connection error:', err);
});
