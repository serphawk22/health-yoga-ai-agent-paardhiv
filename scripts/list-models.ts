import dotenv from "dotenv";

dotenv.config();

import fs from 'fs';

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        console.error("No API key found in .env");
        return;
    }

    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

    try {
        const response = await fetch(url);
        const data = await response.json();

        let output = "Available Models:\n";
        if (data.models) {
            data.models.forEach((m: any) => {
                if (m.name.includes("flash") || m.name.includes("gemini")) {
                    output += `- ${m.name} (Methods: ${m.supportedGenerationMethods})\n`;
                }
            });
        } else {
            output += "Failed to list models: " + JSON.stringify(data);
        }
        fs.writeFileSync("models.txt", output);
        console.log("Wrote models to models.txt");
    } catch (error) {
        console.error("Error fetching models:", error);
    }
}

listModels();
