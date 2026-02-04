
import dotenv from "dotenv";
dotenv.config();
import fs from 'fs';
import path from 'path';

const logFile = path.resolve(process.cwd(), 'debug_output.txt');

function log(msg: string) {
    console.log(msg);
    fs.appendFileSync(logFile, msg + '\n');
}

async function testDietGen() {
    log("Starting test...");
    const key = process.env.GEMINI_API_KEY;
    if (!key) {
        log("API Key is MISSING in process.env");
    } else {
        log(`API Key present. Length: ${key.length}.`);
    }

    try {
        log("Dynamic importing gemini...");
        const { generateDietPlan } = await import('../lib/ai/gemini');
        log("Calling generateDietPlan for 'Vegetarian'...");
        const result1 = await generateDietPlan(null, "Vegetarian");
        log("Result 1: " + JSON.stringify(result1, null, 2));

        log("Calling generateDietPlan for 'Healthy vegan diet'...");
        const result2 = await generateDietPlan(null, "Healthy vegan diet");
        log("Result 2: " + JSON.stringify(result2, null, 2));

        log("Calling generateDietPlan for undefined...");
        const result3 = await generateDietPlan(null, undefined);
        log("Result 3: " + JSON.stringify(result3, null, 2));
    } catch (e) {
        log("Error: " + e);
        if (e instanceof Error) log(e.stack || '');
    }
}

testDietGen();
