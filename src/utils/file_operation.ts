import { Github_Response } from "../interface";
import * as path from 'path'
import * as fs from 'fs'
import * as fsp from "fs/promises";


const directory = path.resolve(__dirname, "../../Report");

export const create_file = async (result: any, filename: string, flag: string) => {
    const filePath = path.join(directory, `${filename}.txt`);
    let output = "";

    if (flag == "review") {
        const filtered_response = await result.data.map((data: Github_Response) => ({
            filename: data.filename,
            patch: data.patch
        }));


        // Ensure the directory exists
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log("Folder created successfully");
        }

        filtered_response.forEach((content: Github_Response) => {
            const { filename, patch } = content;

            // Append file name and its changes (or a placeholder if no changes)
            output += `File: ${filename}\n`;
            output += `Changes:\n${patch || "No changes detected"}\n`;
            output += `\n${"-".repeat(50)}\n\n`; // Separator for readability
        });

        fs.writeFile(filePath, output, err => {
            if (err) {
                console.error(err);
                return false
            }
        })
        console.log("PR file created successfully");
        return true;

    } else if (flag == "summary") {
        // Ensure the directory exists
        if (!fs.existsSync(directory)) {
            fs.mkdirSync(directory, { recursive: true });
            console.log("Folder created successfully");
        }

        fs.writeFile(filePath, result, err => {
            if (err) {
                console.error("Error at creating summary file: ",err);
                return false
            }
        })
        console.log("Summary File created successfully");
        return true;
    }
}

export async function read_file(filename: string): Promise<string> {
    const filePath = path.join(directory, `${filename}.txt`);

    try {
        const content = await fsp.readFile(filePath, "utf-8"); 
        return content;      
    } catch (error: any) {
        throw new Error(`Error reading file at ${filePath}: ${error.message}`);
    }
}