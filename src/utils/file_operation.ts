import { Github_Response } from "../interfaces/interface";

export const formatting = async (result: any) => {
    let output = "";

    const filtered_response = await result.data.map((data: Github_Response) => ({
        filename: data.filename,
        patch: data.patch
    }));

    filtered_response.forEach((content: Github_Response) => {
        const { filename, patch } = content;

        // Append file name and its changes (or a placeholder if no changes)
        output += `File: ${filename}\n`;
        output += `Changes:\n${patch || "No changes detected"}\n`;
        output += `\n${"-".repeat(50)}\n\n`; // Separator for readability
    });

    console.log("Text cleaned up completed successfully!!!");
    return output;
}
