// Recommendations Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import {
  generateDietPlan,
  generateExercisePlan,
  generateYogaPlan,
  getDiseaseGuidance,
  generateGoalPlan,
  DietPlan,
  ExercisePlan,
  YogaPlan,
} from '@/lib/ai/gemini';

// ==================== TYPES ====================

export interface RecommendationActionResult {
  success: boolean;
  error?: string;
  data?: any;
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const dietPlan = await generateDietPlan(healthProfile, specificRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DIET',
        title: specificRequest || 'Personalized Diet Plan',
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const exercisePlan = await generateExercisePlan(healthProfile, bodyPart, specificRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'EXERCISE',
        category: bodyPart,
        title: bodyPart ? `${bodyPart} Exercises` : 'Full Body Workout',
        content: exercisePlan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: healthProfile?.primaryGoal,
        bodyPart,
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const yogaPlan = await generateYogaPlan(healthProfile, bodyPart, condition, specificRequest);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'YOGA',
        category: bodyPart || condition,
        title: bodyPart ? `Yoga for ${bodyPart}` : condition ? `Yoga for ${condition}` : 'Personalized Yoga',
        content: yogaPlan as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: healthProfile?.primaryGoal,
        bodyPart,
        basedOnCondition: condition,
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const guidance = await getDiseaseGuidance(healthProfile, condition);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DISEASE_MANAGEMENT',
        category: condition,
        title: `Managing ${condition}`,
        content: { guidance } as any,
        basedOnProfile: !!healthProfile,
        basedOnCondition: condition,
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    const plan = await generateGoalPlan(healthProfile, goal, duration);

    // Map goal string to enum
    const goalEnum = mapGoalToEnum(goal);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'GOAL_BASED',
        category: goal,
        title: `${goal} Plan`,
        content: { plan, duration } as any,
        basedOnProfile: !!healthProfile,
        basedOnGoal: goalEnum,
      },
    });

    revalidatePath('/recommendations');
    return { success: true, data: { plan } };
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

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    // getDiseaseGuidance takes (healthProfile, condition) as parameters
    const guidance = await getDiseaseGuidance(healthProfile, condition);

    // Save recommendation
    await prisma.recommendation.create({
      data: {
        userId: user.id,
        type: 'DISEASE_MANAGEMENT',
        category: condition,
        title: `${condition} Management Guide`,
        content: { text: guidance },
        basedOnProfile: !!healthProfile,
      },
    });

    revalidatePath('/conditions');
    return { success: true, data: { guidance, condition } };
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
