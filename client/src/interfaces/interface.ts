
export interface Summary {
    files: Files[];
    summary: {
        comment: string;
        critical_issues: number;
        total_files: number;
        total_issues: number;
    };
}

interface Files {
    issues: Issue[];
    name: string;
}

interface Issue {
    description: string;
    line: number;
    suggestion: string;
    type: string;
}

export interface Repo {
    createdAt: string;
    id: string;
    message: string;
    repository: string;
    status: string;
    summary: Summary
    taskId: number;
    userId: string;
}
