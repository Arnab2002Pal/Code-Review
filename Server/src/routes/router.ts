import express from "express";
import { testRoute, newUser, getUser, checkToken,analyzePR, resultPR, taskStatus } from "../controllers/controller";

const apiRouter = express.Router();
const webhookRouter = express.Router();

apiRouter.get('/', testRoute)

apiRouter.get('/checkToken', checkToken)
apiRouter.get('/status/:taskID', taskStatus);
apiRouter.get('/results/:taskID', resultPR);
apiRouter.get('/user/:email', getUser);

apiRouter.post('/new-user', newUser);

// WebHook
webhookRouter.post('/analyzePR', analyzePR)

export{
    apiRouter,
    webhookRouter
}