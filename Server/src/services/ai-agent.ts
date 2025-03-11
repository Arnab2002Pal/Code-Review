import axios from "axios";
import { ai_review } from "../utils/ai_service";
import { ProgressStatus } from "../interfaces/interface";

export const analyzePullRequest = async (diff_url: string) => {    
    const {data} = await axios.get(diff_url)    
    try {
        const code_summary = await ai_review(data)

        if (code_summary == "" || code_summary == null) return {
            status: ProgressStatus.FAILED,
            code_summary: "",
            message: "Failed to create summary"
        }

        return {
            status: ProgressStatus.COMPLETED,
            code_summary,
            message: "Successfully created summary"
        }

    } catch (error) {
        console.error("[AI] Error at AI-Agent", error);

        return {
            status: ProgressStatus.FAILED,
            
            code_summary: null,
            message: "Check Error Log for AI-Agent"
        }
    }

}