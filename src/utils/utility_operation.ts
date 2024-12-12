import { PrismaClient } from "@prisma/client"
import { redisClient } from "../services/redis_config"
import { Task_Data } from "../interfaces/interface"

const client = new PrismaClient()

export const initialize_DatabaseCache = async (job: any, analysedResult: any) => {
    const taskData: Task_Data = {
        taskId: Number(job.id),
        status: analysedResult.status,
        summary: analysedResult.code_summary || {},
        message: analysedResult.message
    }

    // Insert into database
    const data = await client.taskResult.create({
        data: taskData
    })

    // Cache the result in Redis
    const cache = await redisClient.setEx(`cached_job:${job.id}`, Number(process.env.CACHE_TIMING), JSON.stringify(taskData))

    return {
        id: data.id,
        taskId: data.taskId,
        cache_status: cache
    }
}

export const cacheData = async (taskID: number) => {
    const data = await client.taskResult.findUnique({
        where: {
            taskId: taskID
        }
    })

    if (!data) {
        throw new Error(`Task is not found with the taskID: ${taskID}`)
    }

    const taskData: Task_Data = {
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