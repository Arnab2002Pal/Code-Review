import { SchemaType } from "@google/generative-ai";

export const schema = {
    description: "Review of issues and solutions",
    type: SchemaType.OBJECT,
    properties: {
        suggestions: {
            type: SchemaType.ARRAY,
            items: {
                type: SchemaType.OBJECT,
                properties: {
                    issue: {
                        type: SchemaType.STRING,
                        description: "Description of the issue",
                        nullable: false,
                    },
                    solution: {
                        type: SchemaType.STRING,
                        description: "Suggested solution for the issue",
                        nullable: false,
                    },
                    code: {
                        type: SchemaType.STRING,
                        description: "Code snippet for the solution",
                        nullable: false,
                    }
                },
                required: ["issue", "solution"],
            },
        },
        summary: {
            type: SchemaType.STRING,
            description: "Summary of the review",
            nullable: false,
        },
    },
    required: ["suggestions", "summary"],
};