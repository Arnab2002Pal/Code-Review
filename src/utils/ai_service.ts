import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai"
import dotenv from 'dotenv';
import { schema } from "../interfaces/gemini_interface";

dotenv.config()

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export const ai_review = async (filename: string) => {
    console.log(`----Initialized-----`);

    const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash", generationConfig: {
            responseMimeType: "application/json",
            responseSchema: schema
        }
    });
    const prompt = `You are a helpful assistant. Analyze the following code for style issues, bugs, performance improvements, best practices, and provide a summary in the following format:
        - An array of objects, each containing the keys 'issue', 'solution' and 'code'.
        - Each object should represent an issue found in the code, with a corresponding suggested solution and code improvement.The code to analyze is: ${filename}`;


    const result = await model.generateContent(prompt);
    let parsedSummary = {};
    parsedSummary = JSON.parse(result.response.text());

    console.log(`----Completed-----`);
    return parsedSummary;
}

