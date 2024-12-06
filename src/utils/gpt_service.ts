import OpenAI from "openai";
import { read_file } from './file_operation';
import dotenv from 'dotenv'

dotenv.config()

const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY!
});

export const ai_review = async (filename: string) => {
    const code_content = await read_file(filename)
    console.log(`----Initialized-----`);
    
    const completion = await openai.chat.completions.create({
        model: "gpt-4o",
        messages: [
            { role: "system", content: `You are a helpful assistant. Analyze the following code for style issues, bugs, performance improvements, best practices and provide a summary for it: ${code_content}.` },
        ]
    });
    
    console.log(`----Completed-----`);
    return completion.choices[0].message.content
}
