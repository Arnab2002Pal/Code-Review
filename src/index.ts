import express from 'express'
import bodyParser from 'body-parser'
import dotenv from 'dotenv'
import router from './routes/router'

dotenv.config()

const app = express()
app.use(bodyParser.json())

app.use('/api/v1', router)

const port = process.env.SERVER_PORT || 3001
app.listen(port, () => {
    console.log("Server listening on port:", port);
})
