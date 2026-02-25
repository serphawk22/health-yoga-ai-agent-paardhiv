import OpenAI from 'openai';
import { SYSTEM_PROMPTS, formatHealthProfile, RESPONSE_TEMPLATES, JSON_SCHEMAS } from './prompts';
import { HealthProfile } from '@prisma/client';
import { format, addDays, isValid } from 'date-fns';

// Initialize OpenAI
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
});

// ==================== TYPES ====================
// Re-exporting types for compatibility
export interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export interface AppointmentExtraction {
    date: string;
    time: string | null;
    timeRange: { start: string; end: string } | null;
    doctorName: string | null;
    intent: string;
    confidence: number;
}

export interface DietPlan {
    dailyCalories: number;
    macros: { protein: number; carbs: number; fats: number };
    meals: Array<{
        name: string;
        time: string;
        items: string[];
        calories: number;
    }>;
    foodsToInclude: string[];
    foodsToAvoid: string[];
    hydrationTips: string[];
    specialNotes: string[];
}

export interface Exercise {
    name: string;
    targetMuscle: string;
    sets: number;
    reps: string;
    restSeconds: number;
    formTips: string[];
    modifications: string;
}

export interface ExercisePlan {
    warmup: Array<{ name: string; duration: string }>;
    exercises: Exercise[];
    cooldown: Array<{ name: string; duration: string }>;
    safetyWarnings: string[];
    totalDuration: string;
}

export interface YogaPose {
    sanskritName: string;
    englishName: string;
    targetArea: string;
    benefits: string[];
    instructions: string[];
    duration: string;
    breathingPattern: string;
    contraindications: string[];
    modifications: string;
}

export interface YogaPlan {
    poses: YogaPose[];
    sequence: string[];
    totalDuration: string;
    generalTips: string[];
}

export interface HealthScores {
    bmi: { value: number; score: number; category: string; recommendation: string };
    activity: { score: number; category: string; recommendation: string };
    sleep: { score: number; category: string; recommendation: string };
    stress: { score: number; category: string; recommendation: string };
    nutrition: { score: number; category: string; recommendation: string };
    overall: { score: number; category: string; summary: string };
    riskFactors: string[];
    strengths: string[];
    recommendations: Array<{ title: string; description: string; priority: string }>;
    goalSuggestions: string[];
}

export interface GoalPlan {
    goalName: string;
    overview: string;
    timeline: string;
    milestones: Array<{
        title: string;
        description: string;
        timeframe: string;
    }>;
    weeklyPlan: {
        [key: string]: string[];
    };
    dietPlan: {
        guidelines: string[];
        calories: string;
        macros: string;
    };
    exercisePlan: {
        routines: string[];
        frequency: string;
    };
    lifestyleChanges: string[];
    trackingTips: string[];
    tipsForSuccess: string[];
    potentialChallenges: string[];
}

// ==================== HEALTH CHAT ====================

export async function healthChat(
    message: string,
    chatHistory: ChatMessage[],
    healthProfile: HealthProfile | null
): Promise<string> {
    const profileContext = healthProfile
        ? `\n\nUSER'S HEALTH PROFILE:\n${formatHealthProfile(healthProfile)}`
        : '\n\nNote: User has not completed their health profile yet.';

    const systemPrompt = SYSTEM_PROMPTS.healthChat + profileContext;

    const messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[] = [
        { role: 'system', content: systemPrompt },
        ...chatHistory.map((msg) => ({
            role: msg.role as 'user' | 'assistant',
            content: msg.content,
        })),
        { role: 'user', content: message },
    ];

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages,
            temperature: 0.7,
            max_tokens: 1024,
        });

        let response = completion.choices[0]?.message?.content || '';

        return response;
    } catch (error) {
        console.error('Health chat error:', error);
        throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== APPOINTMENT EXTRACTION ====================

export async function extractAppointmentDetails(
    naturalLanguage: string
): Promise<AppointmentExtraction> {
    const currentDate = new Date();
    const prompt = `${SYSTEM_PROMPTS.appointmentExtraction}

CURRENT DATE: ${format(currentDate, 'EEEE, MMMM d, yyyy')}
CURRENT TIME: ${format(currentDate, 'HH:mm')}

USER INPUT: "${naturalLanguage}"

Extract the appointment details and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.appointmentExtraction, null, 2)}

Important:
- For "tomorrow", add 1 day to current date
- For "next week", add 7 days
- For day names like "Monday", find the next occurrence
- For "morning", use timeRange 09:00-12:00
- For "afternoon", use timeRange 12:00-17:00
- For "evening", use timeRange 17:00-20:00
- If no specific time, set time to null and provide timeRange

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        const extracted = JSON.parse(responseText) as AppointmentExtraction;

        if (extracted.date) {
            const parsedDate = new Date(extracted.date);
            if (!isValid(parsedDate)) {
                extracted.date = format(addDays(currentDate, 1), 'yyyy-MM-dd');
                extracted.confidence = Math.max(0.3, extracted.confidence - 0.3);
            }
        }

        return extracted;
    } catch (error) {
        console.error('Appointment extraction error:', error);
        return {
            date: format(addDays(currentDate, 1), 'yyyy-MM-dd'),
            time: null,
            timeRange: { start: '09:00', end: '17:00' },
            doctorName: null,
            intent: naturalLanguage,
            confidence: 0.3,
        };
    }
}

// ==================== DIET RECOMMENDATIONS ====================

export async function generateDietPlan(
    healthProfile: HealthProfile | null,
    specificRequest?: string
): Promise<DietPlan> {
    const profileContext = formatHealthProfile(healthProfile);
    const prompt = `${SYSTEM_PROMPTS.dietRecommendation}

USER'S HEALTH PROFILE:
${profileContext}

${specificRequest ? `SPECIFIC REQUEST: ${specificRequest}` : ''}

Generate a personalized diet plan and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.dietPlan, null, 2)}

Consider:
- Their health conditions and allergies
- Their diet preference (vegetarian/non-vegetarian)
- Their health goals
- Their activity level

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText) as DietPlan;
    } catch (error) {
        console.error('Diet plan generation error:', error);
        throw new Error(`Failed to generate diet plan: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== EXERCISE RECOMMENDATIONS ====================

export async function generateExercisePlan(
    healthProfile: HealthProfile | null,
    bodyPart?: string,
    specificRequest?: string
): Promise<ExercisePlan> {
    const profileContext = formatHealthProfile(healthProfile);
    const prompt = `${SYSTEM_PROMPTS.exerciseRecommendation}

USER'S HEALTH PROFILE:
${profileContext}

${bodyPart ? `TARGET BODY PART: ${bodyPart}` : ''}
${specificRequest ? `SPECIFIC REQUEST: ${specificRequest}` : ''}

Generate a safe, personalized exercise plan and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.exercisePlan, null, 2)}

IMPORTANT SAFETY CONSIDERATIONS:
- Check for injuries affecting the target area
- Adjust intensity based on fitness level
- Include modifications for beginners
- Add warnings for any health conditions

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText) as ExercisePlan;
    } catch (error) {
        console.error('Exercise plan generation error:', error);
        throw new Error(`Failed to generate exercise plan: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== YOGA RECOMMENDATIONS ====================

export async function generateYogaPlan(
    healthProfile: HealthProfile | null,
    bodyPart?: string,
    condition?: string,
    specificRequest?: string
): Promise<YogaPlan> {
    const profileContext = formatHealthProfile(healthProfile);
    const prompt = `${SYSTEM_PROMPTS.yogaRecommendation}

USER'S HEALTH PROFILE:
${profileContext}

${bodyPart ? `TARGET BODY PART: ${bodyPart}` : ''}
${condition ? `FOR CONDITION: ${condition}` : ''}
${specificRequest ? `SPECIFIC REQUEST: ${specificRequest}` : ''}

Generate a safe, personalized yoga plan and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.yogaPlan, null, 2)}

Include appropriate poses considering:
- User's flexibility level
- Any injuries or conditions
- Target areas or conditions mentioned

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText) as YogaPlan;
    } catch (error) {
        console.error('Yoga plan generation error:', error);
        throw new Error(`Failed to generate yoga plan: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== HEALTH ASSESSMENT ====================

export async function calculateHealthScores(
    healthProfile: HealthProfile,
    metrics: any[] = []
): Promise<HealthScores> {
    const profileContext = formatHealthProfile(healthProfile);

    const metricsContext = metrics.length > 0
        ? `\nRECENT HEALTH METRICS:\n${metrics.slice(0, 5).map(m =>
            `- ${format(new Date(m.date), 'MM/dd')}: ${Object.entries(m)
                .filter(([k, v]) => ['weight', 'bloodPressure', 'heartRate', 'bloodSugar', 'sleepHours', 'stepsCount'].includes(k) && v !== null)
                .map(([k, v]) => `${k}=${v}`).join(', ')}`
        ).join('\n')}`
        : '\nNo recent health metrics recorded.';

    const prompt = `${SYSTEM_PROMPTS.healthAssessment}

USER'S HEALTH PROFILE:
${profileContext}

${metricsContext}

Calculate comprehensive health scores and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.healthScores, null, 2)}

SCORING GUIDELINES:
- BMI: Calculate from height/weight, score based on healthy range
- Activity: Based on activity level (Sedentary=20, Lightly Active=40, Moderately Active=60, Very Active=80, Extremely Active=95)
- Sleep: Based on sleep quality (Poor=25, Fair=50, Good=75, Excellent=95)
- Stress: Inverse score (Low stress=90, Moderate=60, High=35, Very High=15)
- Overall: Weighted average considering health conditions

Categories: 0-25=Poor, 26-50=Fair, 51-75=Good, 76-100=Excellent

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        const scores = JSON.parse(responseText) as HealthScores;

        if (scores.overall.score === 0 || scores.bmi.score === 0) {
            console.log("AI returned 0 scores, using deterministic fallback");
            return calculateDeterministicScores(healthProfile);
        }

        return scores;
    } catch (error) {
        console.error('Health scores calculation error:', error);
        return calculateDeterministicScores(healthProfile);
    }
}

function calculateDeterministicScores(profile: HealthProfile): HealthScores {
    let bmiScore = 50;
    let bmiCategory = "Fair";
    let bmiValue = 0;

    if (profile.height && profile.weight) {
        bmiValue = profile.weight / Math.pow(profile.height / 100, 2);
        const diff = Math.abs(bmiValue - 21.7);
        bmiScore = Math.max(0, Math.min(100, 100 - (diff * 2)));
        if (bmiScore >= 80) bmiCategory = "Excellent";
        else if (bmiScore >= 60) bmiCategory = "Good";
        else if (bmiScore >= 40) bmiCategory = "Fair";
        else bmiCategory = "Poor";
    }

    const activityMap: Record<string, number> = {
        'SEDENTARY': 30, 'LIGHTLY_ACTIVE': 50, 'MODERATELY_ACTIVE': 70,
        'VERY_ACTIVE': 90, 'EXTREMELY_ACTIVE': 95
    };
    const activityScore = profile.activityLevel ? (activityMap[profile.activityLevel] || 50) : 50;

    const sleepMap: Record<string, number> = {
        'POOR': 30, 'FAIR': 50, 'GOOD': 75, 'EXCELLENT': 95
    };
    const sleepScore = profile.sleepQuality ? (sleepMap[profile.sleepQuality] || 50) : 50;

    const stressMap: Record<string, number> = {
        'LOW': 90, 'MODERATE': 70, 'HIGH': 40, 'VERY_HIGH': 20
    };
    const stressScore = profile.stressLevel ? (stressMap[profile.stressLevel] || 50) : 50;

    const overallScore = Math.round((bmiScore + activityScore + sleepScore + stressScore) / 4);

    return {
        bmi: { value: Math.round(bmiValue * 10) / 10, score: Math.round(bmiScore), category: bmiCategory, recommendation: "Maintain a balanced diet and regular exercise." },
        activity: { score: activityScore, category: activityScore > 70 ? "Good" : "Fair", recommendation: "Aim for 150 minutes of moderate activity per week." },
        sleep: { score: sleepScore, category: sleepScore > 70 ? "Good" : "Fair", recommendation: "Stick to a consistent sleep schedule." },
        stress: { score: stressScore, category: stressScore > 60 ? "Good" : "Fair", recommendation: "Practice mindfulness and stress reduction techniques." },
        nutrition: { score: 50, category: "Fair", recommendation: "Focus on a balanced diet with more whole foods." },
        overall: { score: overallScore, category: overallScore > 70 ? "Good" : "Fair", summary: "Your overall health assessment based on your profile." },
        riskFactors: ["Check with a healthcare provider for personalized advice."],
        strengths: ["Taking proactive steps to monitor health."],
        recommendations: [
            {
                title: "Complete Health Profile",
                description: "Fill out all profile details for a more accurate assessment.",
                priority: "high"
            }
        ],
        goalSuggestions: ["General Wellness", "Better Sleep"]
    };
}

// ==================== DISEASE MANAGEMENT ====================

export async function getDiseaseGuidance(
    healthProfile: HealthProfile | null,
    condition: string
): Promise<string> {
    const profileContext = formatHealthProfile(healthProfile);
    const prompt = `${SYSTEM_PROMPTS.diseaseManagement}

USER'S HEALTH PROFILE:
${profileContext}

CONDITION TO MANAGE: ${condition}

Provide comprehensive lifestyle guidance for managing this condition.

Include:
1. Overview of the condition (brief, non-diagnostic)
2. Lifestyle modifications
3. Dietary recommendations
4. Safe exercise suggestions
5. Stress management tips
6. Warning signs to watch for
7. When to seek medical attention

Remember: NO medication advice, NO diagnosis. Emphasize consulting healthcare providers.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
        });

        const response = completion.choices[0]?.message?.content || '';
        return response;
    } catch (error) {
        console.error('Disease guidance error:', error);
        throw new Error(`Failed to generate guidance: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== GOAL-BASED RECOMMENDATIONS ====================

export async function generateGoalPlan(
    healthProfile: HealthProfile | null,
    goal: string,
    duration: string = '4 weeks'
): Promise<GoalPlan> {
    const profileContext = formatHealthProfile(healthProfile);
    const prompt = `${SYSTEM_PROMPTS.goalBasedPlan}

USER'S HEALTH PROFILE:
${profileContext}

GOAL: ${goal}
DURATION: ${duration}

Generate a comprehensive plan and respond with ONLY a valid JSON object matching this schema:
${JSON.stringify(JSON_SCHEMAS.goalPlan, null, 2)}

Respond with ONLY the JSON object, no markdown formatting or explanation.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText) as GoalPlan;
    } catch (error) {
        console.error('Goal plan generation error:', error);
        throw new Error(`Failed to generate goal plan: ${error instanceof Error ? error.message : String(error)}`);
    }
}

// ==================== PROFILE QUESTIONS ====================

export async function getNextProfileQuestion(
    currentProfile: Partial<HealthProfile>,
    currentStep: number
): Promise<{ question: string; field: string; options?: string[] }> {
    const completedFields = Object.entries(currentProfile)
        .filter(([_, value]) => value !== null && value !== undefined)
        .map(([key, value]) => `${key}: ${value}`);

    const prompt = `${SYSTEM_PROMPTS.profileQuestions}

COMPLETED INFORMATION:
${completedFields.length > 0 ? completedFields.join('\n') : 'None yet'}

CURRENT STEP: ${currentStep}

Generate the next question to ask the user. Consider what information is still missing.

Respond with a JSON object:
{
  "question": "The question to ask (friendly, conversational)",
  "field": "The database field this question fills",
  "options": ["Array", "of", "options"] // Optional, only if question has specific choices
}

Respond with ONLY the JSON object, no markdown formatting.`;

    try {
        const completion = await openai.chat.completions.create({
            model: 'gpt-4o',
            messages: [{ role: 'user', content: prompt }],
            response_format: { type: 'json_object' },
            temperature: 0.7,
            max_tokens: 512,
        });

        const responseText = completion.choices[0]?.message?.content || '{}';
        return JSON.parse(responseText);
    } catch (error) {
        console.error('Profile question error:', error);
        return {
            question: "What's your age?",
            field: 'age',
        };
    }
}
