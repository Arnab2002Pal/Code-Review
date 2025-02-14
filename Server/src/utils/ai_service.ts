import { GoogleGenerativeAI } from "@google/generative-ai"
import { schema } from "../interfaces/gemini_interface";
import dotenv from 'dotenv';
import { generateContentWithRetry } from "./utility_operation";

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const ai_review = async (file: string) => {
    console.log(`[AI] ----Initialized-----`);

    const model = genAI.getGenerativeModel({
        model: "gemini-2.0-flash", generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    const prompt = `You are a helpful assistant. Review the following pull request containing multiple file changes and analyze each file for style issues, bugs, performance improvements, and best practices.
    This is the content, Provide the results in the following schema format:
    ${file} 

- An array of objects under the 'files' key, each containing the following properties:
  - name: The name of the file (String).
  - issues: An array of objects representing issues in the file, with the following properties:
    - type: The type of issue (e.g., style, bug, performance).
    - line: The line number where the issue occurs.
    - description: A brief description of the issue.
    - suggestion: Suggested solution or improvement for the issue.`;

    let parsedSummary = {};
    parsedSummary = await generateContentWithRetry(model, prompt)

    console.log(`[AI] ----Completed-----`);
    return parsedSummary;
}

