import { GitHubPullRequest } from "../interface";
import axios from "axios";
import { create_file, read_file } from "../utils/file_operation";
import { ai_review } from "../utils/gpt_service";

export const analyzePullRequest = async ({ repo_url, pr_number, github_token }: GitHubPullRequest) => {
    const owner = repo_url.split('/')[3]
    const repo = repo_url.split('/')[4]

    const prFileName = `pr_files_${owner}_${repo}_pr${pr_number}`;
    const summaryFileName = `summary_${owner}_${repo}_pr${pr_number}`;
    const result = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/files`, {
        headers: {
            'Authorization': `Bearer ${github_token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    const pr_file_ready = await create_file(result, prFileName, "review")

    if (!pr_file_ready) {
        throw new Error
    }

    const reviewed_code = await ai_review(prFileName)
    const summary_file_ready = await create_file(reviewed_code, summaryFileName, "summary")

    
}