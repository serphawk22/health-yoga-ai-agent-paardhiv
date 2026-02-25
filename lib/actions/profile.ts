// Health Profile Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { healthProfileSchema } from '@/lib/validations';
import { calculateHealthScores } from '@/lib/ai';

// ==================== TYPES ====================

export interface ProfileActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ==================== GET PROFILE ====================

export async function getHealthProfile(): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    return { success: true, data: profile };
  } catch (error) {
    console.error('Get profile error:', error);
    return { success: false, error: 'Failed to get profile' };
  }
}

// Alias for getHealthProfile used by profile page
export async function getProfile(): Promise<ProfileActionResult> {
  return getHealthProfile();
}

// ==================== UPDATE PROFILE (JSON-BASED) ====================

export async function updateProfile(data: any): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Ensure profile exists
    let profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    // Map field names from frontend to schema
    const fieldMapping: Record<string, string> = {
      'heightCm': 'height',
      'weightKg': 'weight',
      'dietType': 'dietPreference',
      'healthConditions': 'existingConditions',
      'fitnessGoals': 'secondaryGoals',
    };

    const allowedFields = new Set([
      'dateOfBirth', 'age', 'gender', 'height', 'weight', 'bloodType',
      'existingConditions', 'allergies', 'medications', 'injuries',
      'dietPreference', 'activityLevel', 'sleepQuality', 'stressLevel',
      'smokingStatus', 'alcoholConsumption', 'primaryGoal', 'secondaryGoals',
      'targetWeight', 'bmiScore', 'activityScore', 'sleepScore', 'stressScore',
      'overallHealthScore', 'isComplete', 'completionStep',
      'sleepHours', 'waterIntake',
    ]);

    const mappedData: any = {};
    for (const [key, value] of Object.entries(data)) {
      const mappedKey = fieldMapping[key] || key;
      if (!allowedFields.has(mappedKey)) {
        continue; // Skip unknown or read-only fields
      }
      mappedData[mappedKey] = value;
    }

    if (!profile) {
      profile = await prisma.healthProfile.create({
        data: {
          userId: user.id,
          ...mappedData,
        },
      });
    } else {
      profile = await prisma.healthProfile.update({
        where: { id: profile.id },
        data: {
          ...mappedData,
          updatedAt: new Date(),
        },
      });
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    // Map back to frontend format
    const responseData = {
      ...profile,
      heightCm: profile.height,
      weightKg: profile.weight,
      dietType: profile.dietPreference,
      healthConditions: profile.existingConditions,
      fitnessGoals: profile.secondaryGoals,
    };

    return { success: true, data: responseData };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ==================== CREATE/UPDATE PROFILE ====================

export async function updateHealthProfile(formData: FormData): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Parse form data
    const rawData: Record<string, any> = {};
    formData.forEach((value, key) => {
      if (key.endsWith('[]')) {
        const actualKey = key.slice(0, -2);
        if (!rawData[actualKey]) rawData[actualKey] = [];
        if (value) rawData[actualKey].push(value);
      } else {
        rawData[key] = value || undefined;
      }
    });

    // Handle arrays that might come as comma-separated strings
    ['existingConditions', 'allergies', 'medications', 'injuries', 'secondaryGoals'].forEach(field => {
      if (typeof rawData[field] === 'string') {
        rawData[field] = rawData[field].split(',').map((s: string) => s.trim()).filter(Boolean);
      }
    });

    // Convert numeric fields
    if (rawData.age) rawData.age = parseInt(rawData.age);
    if (rawData.height) rawData.height = parseFloat(rawData.height);
    if (rawData.weight) rawData.weight = parseFloat(rawData.weight);
    if (rawData.targetWeight) rawData.targetWeight = parseFloat(rawData.targetWeight);

    // Parse date
    if (rawData.dateOfBirth) {
      rawData.dateOfBirth = new Date(rawData.dateOfBirth);
    }

    // Get completion step
    const completionStep = parseInt(rawData.completionStep || '0');
    const isComplete = completionStep >= 4;

    // Upsert profile
    const profile = await prisma.healthProfile.upsert({
      where: { userId: user.id },
      update: {
        ...rawData,
        completionStep,
        isComplete,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        ...rawData,
        completionStep,
        isComplete,
      },
    });

    // Calculate health scores if profile is complete
    if (isComplete && profile.height && profile.weight) {
      try {
        const scores = await calculateHealthScores(profile);
        await prisma.healthProfile.update({
          where: { id: profile.id },
          data: {
            bmiScore: scores.bmi.score,
            activityScore: scores.activity.score,
            sleepScore: scores.sleep.score,
            stressScore: scores.stress.score,
            overallHealthScore: scores.overall.score,
          },
        });
      } catch (scoreError) {
        console.error('Score calculation error:', scoreError);
        // Don't fail the whole operation for score calculation
      }
    }

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, data: profile };
  } catch (error) {
    console.error('Update profile error:', error);
    return { success: false, error: 'Failed to update profile' };
  }
}

// ==================== UPDATE SINGLE FIELD ====================

export async function updateProfileField(
  field: string,
  value: any
): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Ensure profile exists
    let profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      profile = await prisma.healthProfile.create({
        data: { userId: user.id },
      });
    }

    // Update the field
    const updateData: Record<string, any> = {
      [field]: value,
      updatedAt: new Date(),
    };

    const updatedProfile = await prisma.healthProfile.update({
      where: { id: profile.id },
      data: updateData,
    });

    revalidatePath('/dashboard');
    revalidatePath('/profile');

    return { success: true, data: updatedProfile };
  } catch (error) {
    console.error('Update field error:', error);
    return { success: false, error: 'Failed to update field' };
  }
}

// ==================== COMPLETE PROFILE STEP ====================

export async function completeProfileStep(step: number): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const profile = await prisma.healthProfile.update({
      where: { userId: user.id },
      data: {
        completionStep: step,
        isComplete: step >= 4,
      },
    });

    revalidatePath('/profile');
    return { success: true, data: profile };
  } catch (error) {
    console.error('Complete step error:', error);
    return { success: false, error: 'Failed to complete step' };
  }
}

// ==================== RECALCULATE SCORES ====================

export async function recalculateHealthScores(): Promise<ProfileActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const profile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    if (!profile) {
      return { success: false, error: 'Profile not found' };
    }

    const scores = await calculateHealthScores(profile);

    await prisma.healthProfile.update({
      where: { id: profile.id },
      data: {
        bmiScore: scores.bmi.score,
        activityScore: scores.activity.score,
        sleepScore: scores.sleep.score,
        stressScore: scores.stress.score,
        overallHealthScore: scores.overall.score,
      },
    });

    revalidatePath('/dashboard');
    revalidatePath('/health-assessment');

    return { success: true, data: scores };
  } catch (error) {
    console.error('Recalculate scores error:', error);
    return { success: false, error: 'Failed to recalculate scores' };
  }
}
