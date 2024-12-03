import { Github_Response } from "../interface";
import * as path from 'path'
import * as fs from 'fs'

export const create_file = async (result: any) => {
    let output = "";

    const filtered_response = await result.data.map((data: Github_Response) => ({
        filename: data.filename,
        patch: data.patch
    }));

    const directory = path.resolve(__dirname, "../../Report");

    // Ensure the directory exists
    if (!fs.existsSync(directory)) {
        fs.mkdirSync(directory, { recursive: true });
        console.log("File created successfully");
    }
    
    filtered_response.forEach((content: Github_Response) => {
        const { filename, patch } = content;
        
        // Append file name and its changes (or a placeholder if no changes)
        output += `File: ${filename}\n`;
        output += `Changes:\n${patch || "No changes detected"}\n`;
        output += `\n${"-".repeat(50)}\n\n`; // Separator for readability
    });
    
    const filePath = path.join(directory, "file.txt");
    fs.writeFile(filePath, output, err => {
        if (err) {
            console.error(err);
        } else {
            console.log("File is ready to open!");
        }
    })
}