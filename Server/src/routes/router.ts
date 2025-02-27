import express from "express";
import { testRoute, newUser, checkToken,analyzePR, resultPR, taskStatus } from "../controllers/controller";

const apiRouter = express.Router();
const webhookRouter = express.Router();

apiRouter.get('/', testRoute)

apiRouter.get('/checkToken', checkToken)
apiRouter.get('/status/:task_id', taskStatus);
apiRouter.get('/results/:task_id', resultPR)

apiRouter.post('/new-user', newUser);

// WebHook
webhookRouter.post('/analyzePR', analyzePR)


export{
    apiRouter,
    webhookRouter
}