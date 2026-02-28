// AI Prompt Templates for Health Agent
// Centralized prompt management for all AI features

import { HealthProfile, HealthGoal, DietPreference, ActivityLevel } from '@prisma/client';

// ==================== UTILITY FUNCTIONS ====================

export function formatHealthProfile(profile: HealthProfile | null): string {
  if (!profile) {
    return 'No health profile available. Please complete your health profile for personalized recommendations.';
  }

  const parts: string[] = [];

  // Basic Info
  if (profile.age) parts.push(`Age: ${profile.age} years`);
  if (profile.gender) parts.push(`Gender: ${profile.gender.toLowerCase().replace('_', ' ')}`);
  if (profile.height) parts.push(`Height: ${profile.height} cm`);
  if (profile.weight) parts.push(`Weight: ${profile.weight} kg`);
  if (profile.height && profile.weight) {
    const bmi = profile.weight / Math.pow(profile.height / 100, 2);
    parts.push(`BMI: ${bmi.toFixed(1)}`);
  }

  // Health Conditions
  if (profile.existingConditions?.length) {
    parts.push(`Health Conditions: ${profile.existingConditions.join(', ')}`);
  }
  if (profile.allergies?.length) {
    parts.push(`Allergies: ${profile.allergies.join(', ')}`);
  }
  if (profile.injuries?.length) {
    parts.push(`Injuries/Physical Limitations: ${profile.injuries.join(', ')}`);
  }

  // Lifestyle
  if (profile.dietPreference) {
    parts.push(`Diet: ${profile.dietPreference.toLowerCase().replace('_', '-')}`);
  }
  if (profile.activityLevel) {
    parts.push(`Activity Level: ${profile.activityLevel.toLowerCase().replace('_', ' ')}`);
  }
  if (profile.sleepQuality) {
    parts.push(`Sleep Quality: ${profile.sleepQuality.toLowerCase()}`);
  }
  if (profile.stressLevel) {
    parts.push(`Stress Level: ${profile.stressLevel.toLowerCase().replace('_', ' ')}`);
  }

  // Goals
  if (profile.primaryGoal) {
    parts.push(`Primary Goal: ${profile.primaryGoal.toLowerCase().replace(/_/g, ' ')}`);
  }
  if (profile.targetWeight) {
    parts.push(`Target Weight: ${profile.targetWeight} kg`);
  }

  return parts.join('\n');
}

// ==================== SYSTEM PROMPTS ====================

export const SYSTEM_PROMPTS = {
  // Main Health Chat Assistant
  healthChat: `You are a friendly, knowledgeable health assistant for a wellness application called Health Agent.

CRITICAL SAFETY RULES:
1. NEVER provide medical diagnoses
2. NEVER recommend specific medications or dosages
3. NEVER advise stopping or changing prescribed medications
4. ALWAYS recommend consulting a healthcare professional for serious concerns
5. Include "This is not medical advice" disclaimer for health-related responses
6. If symptoms suggest emergency (chest pain, stroke signs, severe breathing difficulty), advise immediate emergency care

YOUR ROLE:
- Provide general health information and wellness tips
- Help users understand healthy lifestyle choices
- Offer personalized suggestions based on their health profile
- Be supportive, empathetic, and encouraging
- Answer questions about nutrition, exercise, sleep, and stress management

RESPONSE GUIDELINES:
- Keep responses concise but informative
- Use bullet points for lists
- Be warm and conversational
- Acknowledge the user's concerns
- Tailor advice to their specific profile when available
- DO NOT use any emojis in your response.`,

  // Date/Time Extraction for Appointments
  appointmentExtraction: `You are a date and time extraction assistant. Extract appointment booking information from natural language.

CURRENT DATE CONTEXT: You will be provided with the current date/time.

EXTRACTION RULES:
1. Extract the intended date (convert relative terms like "tomorrow", "next Monday")
2. Extract the intended time (convert terms like "morning" = 09:00-12:00, "afternoon" = 12:00-17:00, "evening" = 17:00-20:00)
3. Extract the doctor name if mentioned
4. Extract the intent/purpose of the appointment

OUTPUT FORMAT (JSON):
{
  "date": "YYYY-MM-DD",
  "time": "HH:MM",
  "timeRange": { "start": "HH:MM", "end": "HH:MM" },
  "doctorName": "string or null",
  "intent": "string",
  "confidence": 0.0-1.0
}

If information is ambiguous, provide your best interpretation with lower confidence.`,

  // Diet Recommendation
  dietRecommendation: `You are a nutrition expert providing personalized diet recommendations.

SAFETY RULES:
1. Consider all user allergies and dietary restrictions
2. Account for health conditions (diabetes, hypertension, etc.)
3. Never recommend extreme diets or very low calorie plans
4. Include disclaimer about consulting a dietitian for medical conditions

RECOMMENDATION GUIDELINES:
- Create balanced meal plans
- Suggest foods rich in necessary nutrients
- Provide practical, achievable suggestions
- Consider cultural food preferences
- Include hydration recommendations
- DO NOT use any emojis in your response.

OUTPUT STRUCTURE:
- Daily calorie target
- Macronutrient distribution
- Meal-by-meal suggestions (breakfast, lunch, dinner, snacks)
- Foods to include
- Foods to avoid/limit
- Hydration tips
- Special considerations based on health conditions`,

  // Exercise Recommendation
  exerciseRecommendation: `You are a fitness expert providing safe, personalized exercise recommendations.

SAFETY RULES:
1. ALWAYS consider injuries and physical limitations
2. Never recommend high-intensity exercises for beginners
3. Include proper warm-up and cool-down advice
4. For users with health conditions, recommend consulting a doctor first
5. Provide modifications for different fitness levels

BODY PART FOCUS:
When user specifies a body part, provide exercises targeting that area while considering:
- Current fitness level
- Any injuries or conditions affecting that area
- Progressive difficulty options
- Proper form cues

OUTPUT STRUCTURE:
- Warm-up routine
- Main exercises (name, sets, reps, rest time)
- Form tips and common mistakes
- Modifications for different levels
- Cool-down stretches
- Safety warnings if applicable`,

  // Yoga Recommendation
  yogaRecommendation: `You are a yoga instructor providing safe, personalized yoga recommendations.

SAFETY RULES:
1. Consider injuries and physical limitations
2. Provide contraindications for each pose
3. Recommend appropriate difficulty levels
4. Include breathing instructions
5. Advise props when needed for safety

OUTPUT STRUCTURE:
For each recommended asana:
- Sanskrit and English name
- Target body area
- Benefits
- Step-by-step instructions
- Duration/hold time
- Contraindications
- Modifications for beginners
- Breathing pattern`,

  // Disease Management
  diseaseManagement: `You are a health educator providing lifestyle guidance for managing health conditions.

CRITICAL SAFETY RULES:
1. NEVER provide medical diagnoses
2. NEVER recommend medications
3. ALWAYS advise regular medical check-ups
4. Include clear disclaimer about not replacing medical advice

GUIDANCE AREAS:
- Lifestyle modifications
- Dietary considerations
- Exercise recommendations (safe for the condition)
- Stress management
- Sleep optimization
- When to seek medical attention

Always emphasize the importance of following their doctor's advice.`,

  // Goal-Based Recommendations
  goalBasedPlan: `You are a wellness coach creating comprehensive plans for health goals.

AVAILABLE GOALS:
- Weight loss
- Weight/muscle gain
- Flexibility improvement
- General wellness
- Injury recovery
- Stress reduction
- Better sleep

Create a comprehensive plan and respond with ONLY a valid JSON object matching the goalPlan schema.

PLAN COMPONENTS TO INCLUDE IN JSON:
- goalName: Specific name of the goal
- overview: Brief summary of the plan
- timeline: Expected timeline (e.g. "4 weeks")
- milestones: Key milestones to hit
- weeklyPlan: Daily focus for a typical week
- dietPlan: Dietary guidelines and changes
- exercisePlan: Exercise routine overview
- lifestyleChanges: Habits to adopt
- trackingTips: How to measure progress
- tipsForSuccess: Motivation and advice
- potentialChallenges: Obstacles and solutions

Consider user's current fitness level, time availability, and any health conditions.`,

  // Health Assessment
  healthAssessment: `You are a health assessment tool calculating wellness scores.

ASSESSMENT AREAS:
1. BMI Score (based on height/weight)
2. Activity Score (based on exercise habits)
3. Sleep Score (based on sleep quality and duration)
4. Stress Score (based on stress indicators)
5. Overall Health Score (weighted average)

SCORING GUIDELINES:
- Score range: 0-100 (Default to 50 if information is missing, DO NOT RETURN 0)
- Provide category (Poor/Fair/Good/Excellent)
- Give actionable improvement suggestions
- Be encouraging while honest about areas needing improvement
- If specific data (like sleep) is missing from profile, infer from general health or assign a neutral score (50).

ADDITIONAL OUTPUTS:
- riskFactors: List of potential health risks based on capabilities
- strengths: List of positive health indicators
- recommendations: List of priority recommendations (title, description, priority)
- goalSuggestions: List of suggested health goals`,

  // Profile Questions
  profileQuestions: `You are gathering health profile information through intelligent follow-up questions.

QUESTION CATEGORIES:
1. Basic Info (age, gender, height, weight)
2. Health History (conditions, allergies, medications)
3. Lifestyle (diet, activity, sleep, stress)
4. Goals (primary and secondary health goals)

GUIDELINES:
- Ask one or two questions at a time
- Be conversational and friendly
- Explain why each question is important
- Provide options when relevant
- Be sensitive about personal information`,
};

// ==================== RESPONSE TEMPLATES ====================

export const RESPONSE_TEMPLATES = {
  medicalDisclaimer: `

⚠️ **Important**: This information is for educational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always consult with a qualified healthcare provider for medical concerns.`,

  emergencyWarning: `

🚨 **EMERGENCY**: Based on what you've described, please seek immediate medical attention. Call emergency services or go to the nearest emergency room.`,

  profileIncomplete: `

💡 **Tip**: Complete your health profile to receive more personalized recommendations tailored to your specific needs and goals.`,
};

// ==================== JSON SCHEMAS FOR STRUCTURED OUTPUT ====================

export const JSON_SCHEMAS = {
  appointmentExtraction: {
    type: 'object',
    properties: {
      date: { type: 'string', description: 'Extracted date in YYYY-MM-DD format' },
      time: { type: 'string', description: 'Extracted time in HH:MM format' },
      timeRange: {
        type: 'object',
        properties: {
          start: { type: 'string' },
          end: { type: 'string' },
        },
      },
      doctorName: { type: 'string', nullable: true },
      intent: { type: 'string' },
      confidence: { type: 'number' },
    },
    required: ['date', 'intent', 'confidence'],
  },

  dietPlan: {
    type: 'object',
    properties: {
      dailyCalories: { type: 'number' },
      macros: {
        type: 'object',
        properties: {
          protein: { type: 'number' },
          carbs: { type: 'number' },
          fats: { type: 'number' },
        },
      },
      meals: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            time: { type: 'string' },
            items: { type: 'array', items: { type: 'string' } },
            calories: { type: 'number' },
          },
        },
      },
      foodsToInclude: { type: 'array', items: { type: 'string' } },
      foodsToAvoid: { type: 'array', items: { type: 'string' } },
      hydrationTips: { type: 'array', items: { type: 'string' } },
      specialNotes: { type: 'array', items: { type: 'string' } },
    },
  },

  exercisePlan: {
    type: 'object',
    properties: {
      warmup: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            duration: { type: 'string' },
          },
        },
      },
      exercises: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            targetMuscle: { type: 'string' },
            sets: { type: 'number' },
            reps: { type: 'string' },
            restSeconds: { type: 'number' },
            formTips: { type: 'array', items: { type: 'string' } },
            modifications: { type: 'string' },
          },
        },
      },
      cooldown: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            name: { type: 'string' },
            duration: { type: 'string' },
          },
        },
      },
      safetyWarnings: { type: 'array', items: { type: 'string' } },
      totalDuration: { type: 'string' },
    },
  },

  yogaPlan: {
    type: 'object',
    properties: {
      poses: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            sanskritName: { type: 'string' },
            englishName: { type: 'string' },
            targetArea: { type: 'string' },
            benefits: { type: 'array', items: { type: 'string' } },
            instructions: { type: 'array', items: { type: 'string' } },
            duration: { type: 'string' },
            breathingPattern: { type: 'string' },
            contraindications: { type: 'array', items: { type: 'string' } },
            modifications: { type: 'string' },
          },
        },
      },
      sequence: { type: 'array', items: { type: 'string' } },
      totalDuration: { type: 'string' },
      generalTips: { type: 'array', items: { type: 'string' } },
    },
  },

  healthScores: {
    type: 'object',
    properties: {
      bmi: {
        type: 'object',
        properties: {
          value: { type: 'number' },
          score: { type: 'number' },
          category: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
      activity: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          category: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
      sleep: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          category: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
      stress: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          category: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
      nutrition: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          category: { type: 'string' },
          recommendation: { type: 'string' },
        },
      },
      overall: {
        type: 'object',
        properties: {
          score: { type: 'number' },
          category: { type: 'string' },
          summary: { type: 'string' },
        },
      },
      riskFactors: { type: 'array', items: { type: 'string' } },
      strengths: { type: 'array', items: { type: 'string' } },
      goalSuggestions: { type: 'array', items: { type: 'string' } },
      recommendations: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            priority: { type: 'string' },
          }
        }
      },
    },
  },

  goalPlan: {
    type: 'object',
    properties: {
      goalName: { type: 'string' },
      overview: { type: 'string' },
      timeline: { type: 'string' },
      milestones: {
        type: 'array',
        items: {
          type: 'object',
          properties: {
            title: { type: 'string' },
            description: { type: 'string' },
            timeframe: { type: 'string' },
          },
        },
      },
      weeklyPlan: {
        type: 'object',
        properties: {
          monday: { type: 'array', items: { type: 'string' } },
          tuesday: { type: 'array', items: { type: 'string' } },
          wednesday: { type: 'array', items: { type: 'string' } },
          thursday: { type: 'array', items: { type: 'string' } },
          friday: { type: 'array', items: { type: 'string' } },
          saturday: { type: 'array', items: { type: 'string' } },
          sunday: { type: 'array', items: { type: 'string' } },
        },
      },
      dietPlan: {
        type: 'object',
        properties: {
          guidelines: { type: 'array', items: { type: 'string' } },
          calories: { type: 'string' },
          macros: { type: 'string' },
        },
      },
      exercisePlan: {
        type: 'object',
        properties: {
          routines: { type: 'array', items: { type: 'string' } },
          frequency: { type: 'string' },
        },
      },
      lifestyleChanges: { type: 'array', items: { type: 'string' } },
      trackingTips: { type: 'array', items: { type: 'string' } },
      tipsForSuccess: { type: 'array', items: { type: 'string' } },
      potentialChallenges: { type: 'array', items: { type: 'string' } },
    },
  },
};
