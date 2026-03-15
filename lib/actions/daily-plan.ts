'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';

export async function logDailyPlan(
  activePlanId: string,
  data: {
    followedDiet: boolean;
    completedWorkout: boolean;
    skipped: boolean;
    notes?: string;
  }
) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const log = await prisma.dailyPlanLog.upsert({
      where: {
        userId_activePlanId_date: {
          userId: user.id,
          activePlanId,
          date: today,
        },
      },
      update: {
        followedDiet: data.followedDiet,
        completedWorkout: data.completedWorkout,
        skipped: data.skipped,
        notes: data.notes || null,
      },
      create: {
        userId: user.id,
        activePlanId,
        date: today,
        followedDiet: data.followedDiet,
        completedWorkout: data.completedWorkout,
        skipped: data.skipped,
        notes: data.notes || null,
      },
    });

    revalidatePath('/dashboard');
    return { success: true, data: log };
  } catch (error) {
    console.error('Log daily plan error:', error);
    return { success: false, error: 'Failed to log daily plan' };
  }
}

export async function getDailyPlanLogs(activePlanId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const logs = await prisma.dailyPlanLog.findMany({
      where: {
        userId: user.id,
        activePlanId,
      },
      orderBy: { date: 'desc' },
      take: 30,
    });

    return { success: true, data: logs };
  } catch (error) {
    console.error('Get daily plan logs error:', error);
    return { success: false, error: 'Failed to fetch logs' };
  }
}

export async function getWeeklySummary(activePlanId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: 'Not authenticated' };

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const logs = await prisma.dailyPlanLog.findMany({
      where: {
        userId: user.id,
        activePlanId,
        date: { gte: sevenDaysAgo },
      },
      orderBy: { date: 'asc' },
    });

    const totalDays = 7;
    const dietDays = logs.filter(l => l.followedDiet).length;
    const workoutDays = logs.filter(l => l.completedWorkout).length;
    const skippedDays = logs.filter(l => l.skipped).length;
    const activeDays = logs.length;

    return {
      success: true,
      data: {
        totalDays,
        activeDays,
        dietDays,
        workoutDays,
        skippedDays,
        dietAdherence: totalDays > 0 ? Math.round((dietDays / totalDays) * 100) : 0,
        workoutAdherence: totalDays > 0 ? Math.round((workoutDays / totalDays) * 100) : 0,
        logs,
      },
    };
  } catch (error) {
    console.error('Get weekly summary error:', error);
    return { success: false, error: 'Failed to fetch summary' };
  }
}
