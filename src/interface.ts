enum Status_Code {
    success = 200,
    error = 500
    
}

export interface GitHubPullRequest {
    repo_url: string;
    pr_number: number;
    github_token: string;
}

export interface Github_Response {
    filename: string;
    patch: string;
}

export interface Task_Data {
    taskId: number,
    status: boolean,
    summary: any,
    message?: string
}
