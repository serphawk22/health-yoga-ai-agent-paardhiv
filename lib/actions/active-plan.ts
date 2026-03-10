'use server';

import { getCurrentUser } from '@/lib/auth';
import prisma from '@/lib/prisma';
import { revalidatePath } from 'next/cache';

export async function getActivePlan() {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const activePlan = await prisma.activePlan.findUnique({
            where: { userId: user.id },
        });

        return { success: true, data: activePlan };
    } catch (error) {
        console.error('Failed to get active plan:', error);
        return { success: false, error: 'Failed to fetch active plan' };
    }
}

export async function updateActivePlanImage(planId: string, imageUrl: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const plan = await prisma.activePlan.update({
            where: { id: planId },
            data: { planImageUrl: imageUrl }
        });

        return { success: true, data: plan };
    } catch (e) {
        console.error('Failed to update active plan image:', e);
        return { success: false, error: 'Failed' };
    }
}

export async function saveActivePlan(planData: any) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        // Check if active plan exists
        const existingPlan = await prisma.activePlan.findUnique({
            where: { userId: user.id },
        });

        if (existingPlan) {
            // Move to history
            await prisma.planHistory.create({
                data: {
                    userId: user.id,
                    planData: existingPlan.poses as any,
                    planImageUrl: existingPlan.planImageUrl,
                    completedSessions: existingPlan.completedSessions,
                },
            });

            // Delete existing plan
            await prisma.activePlan.delete({
                where: { userId: user.id },
            });
        }

        // Create new active plan
        const newPlan = await prisma.activePlan.create({
            data: {
                userId: user.id,
                focusArea: planData.focusArea || planData.title || 'Workout Routine',
                duration: parseInt(planData.totalDuration) || 30,
                difficulty: planData.level || 'MODERATE',
                poses: { ...planData, _type: planData._type || 'YOGA' },
            },
        });

        revalidatePath('/yoga');
        return { success: true, data: newPlan };
    } catch (error) {
        console.error('Failed to save active plan:', error);
        return { success: false, error: 'Failed to save active plan' };
    }
}

export async function incrementPlanProgress(planId: string) {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const plan = await prisma.activePlan.findUnique({
            where: { id: planId }
        });

        if (!plan || plan.userId !== user.id) return { success: false };

        const res = await prisma.activePlan.update({
            where: { id: planId },
            data: {
                completedSessions: {
                    increment: 1
                }
            }
        });

        // We can also record an individual workout session for historical tracking,
        // but the main requirement is tracking plan progress. Let's create a workout session also.
        const planJson = plan.poses as any;
        const isWorkout = planJson?._type === 'WORKOUT';
        await prisma.workoutSession.create({
            data: {
                userId: user.id,
                activityType: isWorkout ? 'EXERCISE' : 'YOGA',
                duration: plan.duration,
                title: `${isWorkout ? 'Workout' : 'Yoga'} Session: ${plan.focusArea}`,
                difficulty: 'MODERATE',
                exercises: {
                    completed: [],
                    plan: planJson,
                    planImageUrl: plan.planImageUrl
                } as any,
            }
        });

        revalidatePath('/yoga');
        return { success: true, data: res };
    } catch (error) {
        console.error('Failed to increment plan progress:', error);
        return { success: false, error: 'Progress save fail' };
    }
}
