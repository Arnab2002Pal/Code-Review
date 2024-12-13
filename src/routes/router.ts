import express from "express";
import { testRoute, analyzePR, resultPR, taskStatus } from "../controllers/controller";

const router = express.Router();

router.get('/', testRoute)

// Endpoint to analyze a GitHub Pull Request
router.post('/analyze_pr', analyzePR)
router.get('/status/:task_id', taskStatus);
router.get('/results/:task_id', resultPR)

export default router