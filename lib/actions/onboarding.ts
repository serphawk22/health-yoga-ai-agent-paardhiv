'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function getOnboardingProgress() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: user.id },
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId: user.id },
      });
    }

    // Auto-detect completed steps from health profile
    const profile = user.healthProfile;
    if (profile) {
      const updates: any = {};
      if (profile.allergies && profile.allergies.length > 0) updates.allergiesComplete = true;
      if (profile.existingConditions && profile.existingConditions.length > 0) updates.conditionsComplete = true;
      if (profile.medications && profile.medications.length > 0) updates.medicationsComplete = true;
      if (profile.primaryGoal || (profile.secondaryGoals && profile.secondaryGoals.length > 0)) updates.goalsComplete = true;

      if (Object.keys(updates).length > 0) {
        progress = await prisma.onboardingProgress.update({
          where: { userId: user.id },
          data: updates,
        });
      }
    }

    return { success: true, data: progress };
  } catch (error) {
    console.error('Get onboarding progress error:', error);
    return { success: false, error: 'Failed to fetch progress' };
  }
}

export async function completeOnboardingStep(
  step: 'allergies' | 'conditions' | 'medications' | 'goals',
  data: string[]
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    // Update health profile based on step
    const profileUpdate: any = {};
    const onboardingUpdate: any = {};

    switch (step) {
      case 'allergies':
        profileUpdate.allergies = data;
        onboardingUpdate.allergiesComplete = true;
        break;
      case 'conditions':
        profileUpdate.existingConditions = data;
        onboardingUpdate.conditionsComplete = true;
        break;
      case 'medications':
        profileUpdate.medications = data;
        onboardingUpdate.medicationsComplete = true;
        break;
      case 'goals':
        profileUpdate.secondaryGoals = data;
        onboardingUpdate.goalsComplete = true;
        break;
    }

    // Update health profile
    await prisma.healthProfile.upsert({
      where: { userId: user.id },
      update: profileUpdate,
      create: {
        userId: user.id,
        ...profileUpdate,
      },
    });

    // Update onboarding progress
    await prisma.onboardingProgress.upsert({
      where: { userId: user.id },
      update: onboardingUpdate,
      create: {
        userId: user.id,
        ...onboardingUpdate,
      },
    });

    revalidatePath('/dashboard');
    return { success: true };
  } catch (error) {
    console.error('Complete onboarding step error:', error);
    return { success: false, error: 'Failed to complete step' };
  }
}

export async function getNextOnboardingStep() {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, data: null };

    let progress = await prisma.onboardingProgress.findUnique({
      where: { userId: user.id },
    });

    if (!progress) {
      progress = await prisma.onboardingProgress.create({
        data: { userId: user.id },
      });
    }

    if (!progress.allergiesComplete) return { success: true, data: 'allergies' };
    if (!progress.conditionsComplete) return { success: true, data: 'conditions' };
    if (!progress.medicationsComplete) return { success: true, data: 'medications' };
    if (!progress.goalsComplete) return { success: true, data: 'goals' };

    return { success: true, data: null }; // All complete
  } catch (error) {
    console.error('Get next onboarding step error:', error);
    return { success: false, data: null };
  }
}
