"use server";

import OpenAI from "openai";

export async function analyzePrescription(formData: FormData) {
    try {
        const apiKey = process.env.OPENAI_API_KEY;
        if (!apiKey) {
            console.error("OPENAI_API_KEY is missing in environment variables");
            return { success: false, error: "Server configuration error: API Key missing" };
        }

        const openai = new OpenAI({ apiKey });

        const file = formData.get("file") as File;
        if (!file) {
            throw new Error("No file uploaded");
        }

        const arrayBuffer = await file.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const base64Image = buffer.toString("base64");
        const dataUrl = `data:${file.type};base64,${base64Image}`;

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

        const response = await openai.chat.completions.create({
            model: "gpt-4o",
            messages: [
                {
                    role: "user",
                    content: [
                        { type: "text", text: prompt },
                        {
                            type: "image_url",
                            image_url: {
                                url: dataUrl,
                            },
                        },
                    ],
                },
            ],
            max_tokens: 1000,
            response_format: { type: "json_object" },
        });

        const text = response.choices[0]?.message?.content || "{}";
        console.log("OpenAI Raw Response:", text);

        try {
            const data = JSON.parse(text);
            return { success: true, data };
        } catch (parseError) {
            console.error("JSON Parse Error:", parseError);
            console.log("Failed Text:", text);
            return { success: false, error: "Failed to parse AI response." };
        }

    } catch (error: any) {
        console.error("Prescription analysis error:", error);
        return { success: false, error: error.message || "Failed to analyze prescription" };
    }
}
