import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import router from './routes/router'

dotenv.config()

const app = express()
app.use(bodyParser.json())

app.use('/webhook/v1', router)

const port = process.env.SERVER_PORT || 3000
const mode = process.env.NODE_ENV
app.listen(port, () => {
    console.log(`Mode: ${mode?.trim()}, Server Port: ${port}`);
})
