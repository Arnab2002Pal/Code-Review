import express from "express";
import { analyzePR } from "../controllers/controller";
// import { analyzePR } from "../controllers/github_pr";

const router = express.Router();

// Endpoint to analyze a GitHub Pull Request
router.post("/analyze_pr", analyzePR)


export default router