import { SchemaType } from "@google/generative-ai";

export const schema = {
    description: "Review of issues and solutions",
    type: SchemaType.OBJECT,
    properties: {
        results: {
            type: SchemaType.OBJECT,
            properties: {
                files: {
                    type: SchemaType.ARRAY,
                    items: {
                        type: SchemaType.OBJECT,
                        properties: {
                            name: {
                                type: SchemaType.STRING,
                                description: "Name of the file",
                                nullable: false,
                            },
                            issues: {
                                type: SchemaType.ARRAY,
                                items: {
                                    type: SchemaType.OBJECT,
                                    properties: {
                                        type: {
                                            type: SchemaType.STRING,
                                            description: "Type of issue (e.g., style, bug)",
                                            nullable: false,
                                        },
                                        line: {
                                            type: SchemaType.NUMBER,
                                            description: "Line number where the issue occurs",
                                            nullable: false,
                                        },
                                        description: {
                                            type: SchemaType.STRING,
                                            description: "Description of the issue",
                                            nullable: false,
                                        },
                                        suggestion: {
                                            type: SchemaType.STRING,
                                            description: "Suggested solution for the issue",
                                            nullable: false,
                                        },
                                    },
                                    required: ["type", "line", "description", "suggestion"],
                                },
                            },
                        },
                        required: ["name", "issues"],
                    },
                },
                summary: {
                    type: SchemaType.OBJECT,
                    properties: {
                        comment: {
                            type: SchemaType.STRING,
                            description: "Small and concise description of the issue",
                            nullable: false,
                        },
                        total_files: {
                            type: SchemaType.NUMBER,
                            description: "Total number of files reviewed",
                            nullable: false,
                        },
                        total_issues: {
                            type: SchemaType.NUMBER,
                            description: "Total number of issues found",
                            nullable: false,
                        },
                        critical_issues: {
                            type: SchemaType.NUMBER,
                            description: "Number of critical issues",
                            nullable: false,
                        },
                    },
                    required: ["comment","total_files", "total_issues", "critical_issues"],
                },
            },
            required: ["files", "summary"],
        },
    },
    required: ["results"],
};