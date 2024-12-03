export interface GitHubPullRequest {
    repo_url: string;
    pr_number: number;
    github_token: string;
}

export interface Github_Response {
    filename: string;
    patch: string
}