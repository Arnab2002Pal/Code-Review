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
    userId: string,
    taskId: number,
    status: boolean,
    summary: any,
    message?: string
}

interface Issue {
    line: number;
    type: string;
    suggestion: string;
    description: string;
}

export interface FileReport {
    name: string;
    issues: Issue[];
}

interface Summary {
    comment: string;
    total_files: number;
    total_issues: number;
    critical_issues: number;
}

interface Results {
    files: FileReport[];
    summary: Summary;
}

export interface analysedResult {
    results: Results;
}

export interface User {
    full_name: string;
    pr_number: number;
    commit_id: string;
    comments_url: string;
    github_token: string;
}
