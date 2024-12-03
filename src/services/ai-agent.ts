import { GitHubPullRequest } from "../interface";
import axios from "axios";
import { create_file } from "../utils/util";

export const analyzePullRequest = async ({ repo_url, pr_number, github_token }: GitHubPullRequest) => {
    const owner = repo_url.split('/')[3]
    const repo = repo_url.split('/')[4]
    
    const result = await axios.get(`https://api.github.com/repos/${owner}/${repo}/pulls/${pr_number}/files`, {
        headers: {
            'Authorization': `Bearer ${github_token}`,
            'Accept': 'application/vnd.github+json',
            'X-GitHub-Api-Version': '2022-11-28'
        }
    })

    await create_file(result)
}