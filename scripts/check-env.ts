
import dotenv from "dotenv";

dotenv.config();

console.log("Checking Environment Variables...");

const apiKey = process.env.OPENAI_API_KEY;
if (!apiKey) {
    console.error("OPENAI_API_KEY is MISSING in process.env");
} else {
    console.log("OPENAI_API_KEY is present.");
    console.log(`Length: ${apiKey.length}`);
    if (apiKey.startsWith("sk-")) {
        console.log("Format looks correct (starts with sk-)");
    } else {
        console.warn("Warning: Key does not start with sk-");
    }
}
