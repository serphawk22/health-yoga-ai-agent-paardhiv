'use server';

import { generateDietPlan, DietPlan } from '@/lib/ai/gemini';

export interface PublicRecommendationResult {
    success: boolean;
    error?: string;
    data?: DietPlan;
}

export async function getPublicDietRecommendation(
    specificRequest?: string
): Promise<PublicRecommendationResult> {
    try {
        // Pass null as healthProfile for public requests
        const dietPlan = await generateDietPlan(null, specificRequest);

        return { success: true, data: dietPlan };
    } catch (error) {
        console.error('Public diet recommendation error:', error);
        return {
            success: false,
            error: `Failed to generate diet recommendation: ${error instanceof Error ? error.message : String(error)}`
        };
    }
}
