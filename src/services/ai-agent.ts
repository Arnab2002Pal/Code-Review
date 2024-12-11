import { GitHubPullRequest } from "../interfaces/interface";
import axios from "axios";
import { formatting } from "../utils/file_operation";
import { ai_review } from "../utils/ai_service";

export const analyzePullRequest = async ({ repo_url, pr_number, github_token }: GitHubPullRequest) => {
    try {
        const owner = repo_url.split('/')[3]
        const repo = repo_url.split('/')[4]

        const result = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/files`, {
            headers: {
                'Authorization': `Bearer ${github_token}`,
                'Accept': 'application/vnd.github+json',
                'X-GitHub-Api-Version': '2022-11-28'
            }
        }).catch(err => {
            return "Invalid Fields: " + err.message
        })

        const formatted_result = await formatting(result)

        if (!formatted_result) {
            throw new Error
        }

        const code_summary = await ai_review(formatted_result)

        if (code_summary == "" || code_summary == null) return {
            status: false,
            code_summary: null,
            message: "Failed to create summary"
        }

        return {
            status: true,
            code_summary,
            message: "Successfully created summary"
        }

    } catch (error) {
        console.error("Error at AI-Agent", error);

        return {
            status: false,
            code_summary: null,
            message: "Check Error Log for AI-Agent"
        }
    }

}