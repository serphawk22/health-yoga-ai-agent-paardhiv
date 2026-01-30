// Gemini AI Service - Central AI layer for all AI features
import { GoogleGenerativeAI, GenerativeModel, Content } from '@google/generative-ai';
import { SYSTEM_PROMPTS, formatHealthProfile, RESPONSE_TEMPLATES, JSON_SCHEMAS } from './prompts';
import { HealthProfile } from '@prisma/client';
import { format, addDays, parse, isValid } from 'date-fns';

// Initialize Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ==================== MODEL CONFIGURATIONS ====================

const getModel = (modelName: string = 'gemini-2.5-flash'): GenerativeModel => {
  return genAI.getGenerativeModel({ model: modelName });
};

// ==================== TYPES ====================

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
  overall: { score: number; category: string; summary: string };
}

// ==================== HEALTH CHAT ====================

export async function healthChat(
  message: string,
  chatHistory: ChatMessage[],
  healthProfile: HealthProfile | null
): Promise<string> {
  const model = getModel('gemini-2.5-flash');

  const profileContext = healthProfile
    ? `\n\nUSER'S HEALTH PROFILE:\n${formatHealthProfile(healthProfile)}`
    : '\n\nNote: User has not completed their health profile yet.';

  const systemPrompt = SYSTEM_PROMPTS.healthChat + profileContext;

  // Build conversation history for Gemini
  const contents: Content[] = [
    {
      role: 'user',
      parts: [{ text: `System: ${systemPrompt}\n\nUser: ${chatHistory.length === 0 ? message : chatHistory[0].content}` }],
    },
  ];

  // Add previous messages
  for (let i = 0; i < chatHistory.length; i++) {
    const msg = chatHistory[i];
    if (i === 0) continue; // Skip first message as it's included above
    contents.push({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }],
    });
  }

  // Add current message if there's history
  if (chatHistory.length > 0) {
    contents.push({
      role: 'user',
      parts: [{ text: message }],
    });
  }

  try {
    const chat = model.startChat({
      history: contents.slice(0, -1),
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 1024,
      },
    });

    const result = await chat.sendMessage(contents[contents.length - 1].parts[0].text as string);
    let response = result.response.text();

    // Add medical disclaimer for health-related responses
    if (shouldAddDisclaimer(message, response)) {
      response += RESPONSE_TEMPLATES.medicalDisclaimer;
    }

    return response;
  } catch (error) {
    console.error('Health chat error:', error);
    throw new Error(`Failed to generate response: ${error instanceof Error ? error.message : String(error)}`);
  }
}

function shouldAddDisclaimer(message: string, response: string): boolean {
  const healthKeywords = [
    'symptom', 'pain', 'disease', 'condition', 'treatment', 'medication',
    'medicine', 'diagnosis', 'doctor', 'health', 'illness', 'sick',
    'blood pressure', 'diabetes', 'heart', 'cancer', 'infection'
  ];

  const combined = (message + response).toLowerCase();
  return healthKeywords.some(keyword => combined.includes(keyword));
}

// ==================== APPOINTMENT EXTRACTION ====================

export async function extractAppointmentDetails(
  naturalLanguage: string
): Promise<AppointmentExtraction> {
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();

    // Clean up response - remove markdown code blocks if present
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    const extracted = JSON.parse(cleanJson) as AppointmentExtraction;

    // Validate and fix date if needed
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
    // Return default extraction on error
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
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);

    const responseText = result.response.text().trim();
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    return JSON.parse(cleanJson) as DietPlan;
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
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);

    const responseText = result.response.text().trim();
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    return JSON.parse(cleanJson) as ExercisePlan;
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
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);

    const responseText = result.response.text().trim();
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    return JSON.parse(cleanJson) as YogaPlan;
  } catch (error) {
    console.error('Yoga plan generation error:', error);
    throw new Error(`Failed to generate yoga plan: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ==================== HEALTH ASSESSMENT ====================

export async function calculateHealthScores(
  healthProfile: HealthProfile
): Promise<HealthScores> {
  const model = getModel('gemini-2.5-flash');

  const profileContext = formatHealthProfile(healthProfile);

  const prompt = `${SYSTEM_PROMPTS.healthAssessment}

USER'S HEALTH PROFILE:
${profileContext}

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
    const result = await model.generateContent(prompt);

    const responseText = result.response.text().trim();
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    return JSON.parse(cleanJson) as HealthScores;
  } catch (error) {
    console.error('Health scores calculation error:', error);
    throw new Error(`Failed to calculate health scores: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// ==================== DISEASE MANAGEMENT ====================

export async function getDiseaseGuidance(
  healthProfile: HealthProfile | null,
  condition: string
): Promise<string> {
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent(prompt);

    let response = result.response.text();
    response += RESPONSE_TEMPLATES.medicalDisclaimer;

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
): Promise<string> {
  const model = getModel('gemini-2.5-flash');

  const profileContext = formatHealthProfile(healthProfile);

  const prompt = `${SYSTEM_PROMPTS.goalBasedPlan}

USER'S HEALTH PROFILE:
${profileContext}

GOAL: ${goal}
DURATION: ${duration}

Create a comprehensive plan including:
1. Weekly overview with milestones
2. Diet recommendations
3. Exercise schedule
4. Yoga/stretching routine
5. Lifestyle tips
6. Progress tracking methods
7. Motivation and mindset tips

Make the plan realistic and achievable based on their current fitness level and health conditions.`;

  try {
    const result = await model.generateContent(prompt);

    let response = result.response.text();

    // Add disclaimer for health-related goals
    if (['weight', 'muscle', 'fitness', 'recovery'].some(k => goal.toLowerCase().includes(k))) {
      response += RESPONSE_TEMPLATES.medicalDisclaimer;
    }

    return response;
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
  const model = getModel('gemini-2.5-flash');

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
    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 512,
      },
    });

    const responseText = result.response.text().trim();
    let cleanJson = responseText;
    if (responseText.startsWith('```')) {
      cleanJson = responseText.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    }

    return JSON.parse(cleanJson);
  } catch (error) {
    console.error('Profile question error:', error);
    // Return default question on error
    return {
      question: "What's your age?",
      field: 'age',
    };
  }
}

