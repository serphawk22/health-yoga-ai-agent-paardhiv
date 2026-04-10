// Recommendations Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { applyRateLimit, getClientIdentifierFromHeaders } from '@/lib/security/rate-limit';
import {
  generateDietPlan,
  generateExercisePlan,
  generateYogaPlan,
  getDiseaseGuidance,
  generateGoalPlan,
  DietPlan,
  ExercisePlan,
  YogaPlan,
} from '@/lib/ai';

// ==================== TYPES ====================

export interface RecommendationActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

const AI_RATE_LIMIT_WINDOW_MS = 10 * 60 * 1000;

async function enforceAiRateLimit(
  userId: string,
  action: string,
  actionLimit: number
): Promise<RecommendationActionResult | null> {
  const incomingHeaders = await headers();
  const identifier = getClientIdentifierFromHeaders(incomingHeaders);

  const overallLimit = await applyRateLimit({
    key: `recommendations:all:${userId}:${identifier}`,
    limit: 30,
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
  });

  if (!overallLimit.allowed) {
    return {
      success: false,
      error: 'Too many AI requests. Please try again in a few minutes.',
    };
  }

  const scopedLimit = await applyRateLimit({
    key: `recommendations:${action}:${userId}:${identifier}`,
    limit: actionLimit,
    windowMs: AI_RATE_LIMIT_WINDOW_MS,
  });

  if (!scopedLimit.allowed) {
    return {
      success: false,
      error: 'Rate limit exceeded for this recommendation type. Please retry shortly.',
    };
  }

  return null;
}

// ==================== DIET RECOMMENDATIONS ====================

export async function getDietRecommendation(
  specificRequest?: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedRequest = specificRequest?.trim();
    if (normalizedRequest && normalizedRequest.length > 500) {
      return { success: false, error: 'Request is too long. Please keep it under 500 characters.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'diet', 8);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const dietPlan = await generateDietPlan(healthProfile, normalizedRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DIET',
        title: normalizedRequest || 'Personalized Diet Plan',
        content: dietPlan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: healthProfile?.primaryGoal,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: dietPlan };
  } catch (error) {
    console.error('Diet recommendation error:', error);
    return { success: false, error: `Failed to generate diet recommendation: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== EXERCISE RECOMMENDATIONS ====================

export async function getExerciseRecommendation(
  bodyPart?: string,
  specificRequest?: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedBodyPart = bodyPart?.trim();
    const normalizedRequest = specificRequest?.trim();

    if (normalizedBodyPart && normalizedBodyPart.length > 64) {
      return { success: false, error: 'Body part value is too long.' };
    }

    if (normalizedRequest && normalizedRequest.length > 500) {
      return { success: false, error: 'Request is too long. Please keep it under 500 characters.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'exercise', 8);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const exercisePlan = await generateExercisePlan(healthProfile, normalizedBodyPart, normalizedRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'EXERCISE',
        category: normalizedBodyPart,
        title: normalizedBodyPart ? `${normalizedBodyPart} Exercises` : 'Full Body Workout',
        content: exercisePlan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: healthProfile?.primaryGoal,
        bodyPart: normalizedBodyPart,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: exercisePlan };
  } catch (error) {
    console.error('Exercise recommendation error:', error);
    return { success: false, error: `Failed to generate exercise recommendation: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== YOGA RECOMMENDATIONS ====================

export async function getYogaRecommendation(
  bodyPart?: string,
  condition?: string,
  specificRequest?: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedBodyPart = bodyPart?.trim();
    const normalizedCondition = condition?.trim();
    const normalizedRequest = specificRequest?.trim();

    if (normalizedBodyPart && normalizedBodyPart.length > 64) {
      return { success: false, error: 'Body part value is too long.' };
    }

    if (normalizedCondition && normalizedCondition.length > 100) {
      return { success: false, error: 'Condition value is too long.' };
    }

    if (normalizedRequest && normalizedRequest.length > 500) {
      return { success: false, error: 'Request is too long. Please keep it under 500 characters.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'yoga', 8);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const yogaPlan = await generateYogaPlan(healthProfile, normalizedBodyPart, normalizedCondition, normalizedRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'YOGA',
        category: normalizedBodyPart || normalizedCondition,
        title: normalizedBodyPart
          ? `Yoga for ${normalizedBodyPart}`
          : normalizedCondition
            ? `Yoga for ${normalizedCondition}`
            : 'Personalized Yoga',
        content: yogaPlan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: healthProfile?.primaryGoal,
        bodyPart: normalizedBodyPart,
        basedOnCondition: normalizedCondition,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: yogaPlan };
  } catch (error) {
    console.error('Yoga recommendation error:', error);
    return { success: false, error: `Failed to generate yoga recommendation: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== DISEASE MANAGEMENT ====================

export async function getDiseaseRecommendation(
  condition: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedCondition = condition.trim();
    if (!normalizedCondition) {
      return { success: false, error: 'Condition is required.' };
    }
    if (normalizedCondition.length > 100) {
      return { success: false, error: 'Condition value is too long.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'disease', 6);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const guidance = await getDiseaseGuidance(healthProfile, normalizedCondition);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DISEASE_MANAGEMENT',
        category: normalizedCondition,
        title: `Managing ${normalizedCondition}`,
        content: { guidance } as any,
        basedOnProfile: !!healthProfile,
        basedOnCondition: normalizedCondition,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: { guidance } };
  } catch (error) {
    console.error('Disease recommendation error:', error);
    return { success: false, error: `Failed to generate guidance: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== GOAL-BASED RECOMMENDATIONS ====================

export async function getGoalRecommendation(
  goal: string,
  duration?: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedGoal = goal.trim();
    const normalizedDuration = duration?.trim();

    if (!normalizedGoal) {
      return { success: false, error: 'Goal is required.' };
    }
    if (normalizedGoal.length > 120) {
      return { success: false, error: 'Goal is too long.' };
    }
    if (normalizedDuration && normalizedDuration.length > 40) {
      return { success: false, error: 'Duration value is too long.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'goal', 6);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const plan = await generateGoalPlan(healthProfile, normalizedGoal, normalizedDuration);

    // Map goal string to enum
    const goalEnum = mapGoalToEnum(normalizedGoal);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'GOAL_BASED',
        category: normalizedGoal,
        title: `${normalizedGoal} Plan`,
        content: plan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: goalEnum,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: plan };
  } catch (error) {
    console.error('Goal recommendation error:', error);
    return { success: false, error: `Failed to generate goal plan: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== GET USER CONDITIONS ====================

export async function getUserConditions(): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
      select: { existingConditions: true },
    });

    return {
      success: true,
      data: healthProfile?.existingConditions || []
    };
  } catch (error) {
    console.error('Get conditions error:', error);
    return { success: false, error: 'Failed to get conditions' };
  }
}

// ==================== GET CONDITION GUIDANCE ====================

export async function getConditionGuidance(
  condition: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const normalizedCondition = condition.trim();
    if (!normalizedCondition) {
      return { success: false, error: 'Condition is required.' };
    }
    if (normalizedCondition.length > 100) {
      return { success: false, error: 'Condition value is too long.' };
    }

    const rateLimitError = await enforceAiRateLimit(user.id, 'condition-guidance', 6);
    if (rateLimitError) {
      return rateLimitError;
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    // getDiseaseGuidance takes (healthProfile, condition) as parameters
    const guidance = await getDiseaseGuidance(healthProfile, normalizedCondition);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DISEASE_MANAGEMENT',
        category: normalizedCondition,
        title: `${normalizedCondition} Management Guide`,
        content: { text: guidance },
        basedOnProfile: !!healthProfile,
      },
    });

    revalidatePath('/conditions');
    return { success: true, data: { guidance, condition: normalizedCondition } };
  } catch (error) {
    console.error('Condition guidance error:', error);
    return { success: false, error: `Failed to generate guidance: ${error instanceof Error ? error.message : String(error)}` };
  }
}

// ==================== GET USER RECOMMENDATIONS ====================

export async function getUserRecommendations(
  type?: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const where: any = { userId: user.id };
    if (type) {
      where.type = type;
    }

    const recommendations = await prisma.recommendation.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 50,
    });

    return { success: true, data: recommendations };
  } catch (error) {
    console.error('Get recommendations error:', error);
    return { success: false, error: 'Failed to get recommendations' };
  }
}

// ==================== TOGGLE FAVORITE ====================

export async function toggleRecommendationFavorite(
  recommendationId: string
): Promise<RecommendationActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const recommendation = await prisma.recommendation.findFirst({
      where: { id: recommendationId, userId: user.id },
    });

    if (!recommendation) {
      return { success: false, error: 'Recommendation not found' };
    }

    await prisma.recommendation.update({
      where: { id: recommendationId },
      data: { isFavorite: !recommendation.isFavorite },
    });

    revalidatePath('/recommendations');
    return { success: true };
  } catch (error) {
    console.error('Toggle favorite error:', error);
    return { success: false, error: 'Failed to toggle favorite' };
  }
}

// ==================== HELPER ====================

function mapGoalToEnum(goal: string): any {
  const mapping: Record<string, string> = {
    'weight loss': 'WEIGHT_LOSS',
    'fat loss': 'WEIGHT_LOSS',
    'weight gain': 'WEIGHT_GAIN',
    'muscle building': 'MUSCLE_BUILDING',
    'muscle gain': 'MUSCLE_BUILDING',
    'flexibility': 'INCREASE_FLEXIBILITY',
    'stress reduction': 'STRESS_REDUCTION',
    'better sleep': 'BETTER_SLEEP',
    'general wellness': 'GENERAL_WELLNESS',
    'recovery': 'INJURY_RECOVERY',
  };

  const lowerGoal = goal.toLowerCase();
  for (const [key, value] of Object.entries(mapping)) {
    if (lowerGoal.includes(key)) {
      return value;
    }
  }
  return 'GENERAL_WELLNESS';
}

// ==================== ALIAS EXPORTS ====================

// Alias for getGoalRecommendation (used by goals page)
export const getGoalPlan = getGoalRecommendation;
