"use server";

import { GoogleGenerativeAI } from "@google/generative-ai";

export async function analyzePrescription(formData: FormData) {
    try {
        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            console.error("GEMINI_API_KEY is missing in environment variables");
            return { success: false, error: "Server configuration error: API Key missing" };
        }

        const genAI = new GoogleGenerativeAI(apiKey);

        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("No file uploaded");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");

        const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

        const prompt = `
      Analyze this prescription image and extract the following details in strict JSON format:
      {
        "doctor": "Doctor's Name",
        "date": "Date of prescription",
        "patient": "Patient Name",
        "diagnosis": "Diagnosis (if available)",
        "medicines": [
          {
            "name": "Medicine Name",
            "dosage": "Dosage (e.g., 500mg)",
            "frequency": "Frequency (e.g., 2 times daily)",
            "duration": "Duration (e.g., 5 days)",
            "type": "Type (Tablet, Syrup, etc.)",
            "price": "Estimated price (e.g., ₹100.00)"
          }
        ],
        "instructions": ["List of instructions"]
      }
      If any field is missing or illegible, use "Unknown" or suitable default.
      Ensure the output is valid JSON without any markdown formatting.
    `;

        const result = await model.generateContent([
            prompt,
            {
                inlineData: {
                    data: base64Image,
                    mimeType: file.type,
                },
            },
        ]);

        const response = await result.response;
        const text = response.text();
        console.log("Gemini Raw Response:", text); // Debugging log

        // Clean up markdown code blocks if present
        const jsonString = text.replace(/```json\n|\n```/g, "").replace(/```/g, "").trim();

        try {
            const data = JSON.parse(jsonString);
            return { success: true, data };
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.log("Failed Text:", text);
            return { success: false, error: "Failed to parse AI response. The AI might have returned invalid JSON." };
        }

    } catch (error: any) {
        console.error("Prescription analysis error:", error);
        return { success: false, error: error.message || "Failed to analyze prescription" };
    }
}
