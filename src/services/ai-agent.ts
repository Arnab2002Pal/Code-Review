import { GitHubPullRequest } from "../interface";
import axios from "axios";
import * as fs from "fs"


export const analyzePullRequest = async ({ repo_url, pr_number, github_token }: GitHubPullRequest) => {
    const result = await axios.get(`${repo_url}/pull/${pr_number}/files`)
    fs.writeFile("file.txt", result.data, err => {
        if (err) {
            console.error(err);
        } else {
            console.log("File created successfully");
            
        }}
    )
}