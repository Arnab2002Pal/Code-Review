import express from "express";
import { analyzePR, resultPR, taskStatus } from "../controllers/controller";
// import { analyzePR } from "../controllers/github_pr";

const router = express.Router();

// Endpoint to analyze a GitHub Pull Request
router.post("/analyze_pr", analyzePR)
router.get('/status/:task_id', taskStatus);
router.get('/results/:task_id', resultPR)

export default router