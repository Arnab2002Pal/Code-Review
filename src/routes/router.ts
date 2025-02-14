import express from "express";
import { testRoute, analyzePR, resultPR, taskStatus } from "../controllers/controller";

const apiRouter = express.Router();
const webhookRouter = express.Router();

apiRouter.get('/', testRoute)
// Endpoint to analyze a GitHub Pull Request
// router.post('/analyze_pr', analyzePR)
apiRouter.get('/status/:task_id', taskStatus);
apiRouter.get('/results/:task_id', resultPR)

// WebHook
webhookRouter.post('/analyzePR', analyzePR)


export{
    apiRouter,
    webhookRouter
}