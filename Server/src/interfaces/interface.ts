export enum StatusCode {
    SUCCESS = 200,
    BAD_REQUEST = 400,
    UNAUTHORIZED = 401,
    NOT_FOUND = 404,
    INTERNAL_ERROR = 500
}

export enum ProgressStatus {
    PENDING = "pending",
    IN_PROGRESS = "in_progress",
    COMPLETED = "completed",
    ACTIVE = "active",
    DELAYED = "delay",
    FAILED = "failed"
}

export enum WaitingType {
    COMMENT = "comment",
    STORE = "store"
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

export interface TaskData {
    userId: string,
    taskId: string,
    status: string,
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

export interface AnalysedResult {
    results: Results;
}

export interface User {
    userId: string;
    full_name: string;
    repository: string;
    pr_number: number;
    commit_id: string;
    comments_url: string;
    github_token: string;
    github_username: string;
    github_id: number;
}
