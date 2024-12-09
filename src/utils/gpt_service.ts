import OpenAI from "openai";
import { z } from "zod";
import { zodResponseFormat } from "openai/helpers/zod";
import dotenv from 'dotenv';

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
});

const ResponseFormat = z.object({
    issue: z.string(),
    solution: z.string(),
    code: z.string().optional(),
});

const FinalSchema = z.object({
    suggestions: z.array(ResponseFormat),
    summary: z.string(),
});

export const ai_review = async (filename: string) => {
    console.log(`----Initialized-----`);
    
    const completion = await openai.beta.chat.completions.parse({
        model: "gpt-4o",
        messages: [
            { role: "system", content: `You are a helpful assistant. Analyze the following code for style issues, bugs, performance improvements, best practices and provide a summary for it in array of object format where inside each object there would be issue and solution key and there associated value: ${filename}.` },
        ],
        response_format: zodResponseFormat(FinalSchema, "summarized_content"),
    });
    
    console.log(`----Completed-----`);
    
    const summarized_content = completion.choices[0].message.parsed as unknown as string;
    return summarized_content;
}
