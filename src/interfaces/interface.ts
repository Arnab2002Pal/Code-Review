export enum Status_Code {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
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
