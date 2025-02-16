import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import { apiRouter, webhookRouter } from './routes/router'
import cors from 'cors'

dotenv.config()

const app = express()
app.use(cors())
app.use(bodyParser.json())

app.use('/webhook/v1', webhookRouter)
app.use('/api/v1/', apiRouter)

const port = process.env.SERVER_PORT || 3000
const mode = process.env.NODE_ENV
app.listen(port, () => {
    console.log(`[SERVER] Mode: ${mode?.trim()}, Server Port: ${port}`);
})
