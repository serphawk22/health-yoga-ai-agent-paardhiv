// Health Metrics Server Actions
'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { healthMetricsSchema } from '@/lib/validations';
import { subDays } from 'date-fns';
import { calculateHealthScores } from '@/lib/ai';

// ==================== TYPES ====================

export interface MetricsActionResult {
  success: boolean;
  error?: string;
  data?: any;
}

// ==================== LOG SINGLE METRIC ====================

export async function logHealthMetric(
  type: string,
  value: number,
  recordedAt?: Date
): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    // Map type to field in HealthMetrics model
    const fieldMapping: Record<string, string> = {
      'WEIGHT': 'weight',
      'BLOOD_PRESSURE_SYS': 'bloodPressureSystolic',
      'BLOOD_PRESSURE_DIA': 'bloodPressureDiastolic',
      'HEART_RATE': 'heartRate',
      'BLOOD_SUGAR': 'bloodSugar',
      'SLEEP_HOURS': 'sleepHours',
      'STEPS': 'stepsCount',
      'CALORIES_BURNED': 'caloriesBurned',
      'WATER_INTAKE': 'waterIntake',
    };

    const field = fieldMapping[type];
    if (!field) {
      return { success: false, error: 'Invalid metric type' };
    }

    const data: any = {
      userId: user.id,
      date: recordedAt || new Date(),
      [field]: value,
    };

    const metric = await prisma.healthMetrics.create({
      data,
    });

    // Update profile weight if logging weight
    if (type === 'WEIGHT') {
      await prisma.healthProfile.updateMany({
        where: { userId: user.id },
        data: { weight: value },
      });
    }

    revalidatePath('/metrics');
    revalidatePath('/dashboard');

    return { success: true, data: metric };
  } catch (error) {
    console.error('Log metric error:', error);
    return { success: false, error: 'Failed to log metric' };
  }
}

// ==================== GET HEALTH METRICS ====================

export async function getHealthMetrics(
  range: 'week' | 'month' | 'all' = 'week'
): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const where: any = { userId: user.id };

    if (range === 'week') {
      where.date = { gte: subDays(new Date(), 7) };
    } else if (range === 'month') {
      where.date = { gte: subDays(new Date(), 30) };
    }

    const metrics = await prisma.healthMetrics.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Transform metrics to type-based format
    const transformedMetrics: any[] = [];

    const fieldMapping: Record<string, { type: string }> = {
      'weight': { type: 'WEIGHT' },
      'bloodPressureSystolic': { type: 'BLOOD_PRESSURE_SYS' },
      'bloodPressureDiastolic': { type: 'BLOOD_PRESSURE_DIA' },
      'heartRate': { type: 'HEART_RATE' },
      'bloodSugar': { type: 'BLOOD_SUGAR' },
      'sleepHours': { type: 'SLEEP_HOURS' },
      'stepsCount': { type: 'STEPS' },
      'caloriesBurned': { type: 'CALORIES_BURNED' },
      'waterIntake': { type: 'WATER_INTAKE' },
    };

    metrics.forEach((m: any) => {
      for (const [field, config] of Object.entries(fieldMapping)) {
        if (m[field] !== null && m[field] !== undefined) {
          transformedMetrics.push({
            id: `${m.id}-${field}`,
            type: config.type,
            value: m[field],
            recordedAt: m.date,
          });
        }
      }
    });

    return { success: true, data: transformedMetrics };
  } catch (error) {
    console.error('Get metrics error:', error);
    return { success: false, error: 'Failed to get metrics' };
  }
}

// ==================== CALCULATE HEALTH ASSESSMENT ====================

export async function calculateHealthAssessment(): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const healthProfile = await prisma.healthProfile.findUnique({
      where: { userId: user.id },
    });

    if (!healthProfile) {
      return {
        success: false,
        error: 'Please complete your health profile first'
      };
    }

    // Get recent metrics
    const recentMetrics = await prisma.healthMetrics.findMany({
      where: {
        userId: user.id,
        date: { gte: subDays(new Date(), 30) },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate health scores using AI
    const assessment = await calculateHealthScores(healthProfile, recentMetrics);

    return { success: true, data: assessment };
  } catch (error) {
    console.error('Health assessment error:', error);
    return { success: false, error: 'Failed to calculate health assessment' };
  }
}

// ==================== GET METRICS HISTORY ====================

export async function getMetricsHistory(days: number = 30): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const startDate = subDays(new Date(), days);

    const metrics = await prisma.healthMetrics.findMany({
      where: {
        userId: user.id,
        date: { gte: startDate },
      },
      orderBy: { date: 'asc' },
    });

    return { success: true, data: metrics };
  } catch (error) {
    console.error('Get metrics error:', error);
    return { success: false, error: 'Failed to get metrics' };
  }
}

// ==================== GET LATEST METRICS ====================

export async function getLatestMetrics(): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const metrics = await prisma.healthMetrics.findFirst({
      where: { userId: user.id },
      orderBy: { date: 'desc' },
    });

    return { success: true, data: metrics };
  } catch (error) {
    console.error('Get latest metrics error:', error);
    return { success: false, error: 'Failed to get latest metrics' };
  }
}

// ==================== GET METRICS SUMMARY ====================

export async function getMetricsSummary(): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const thirtyDaysAgo = subDays(new Date(), 30);
    const sevenDaysAgo = subDays(new Date(), 7);

    // Get metrics for last 30 days
    const metrics = await prisma.healthMetrics.findMany({
      where: {
        userId: user.id,
        date: { gte: thirtyDaysAgo },
      },
      orderBy: { date: 'desc' },
    });

    // Calculate averages
    const recentMetrics = metrics.filter((m: any) => m.date >= sevenDaysAgo);

    const summary = {
      totalEntries: metrics.length,
      recentEntries: recentMetrics.length,
      averages: {
        weight: calculateAverage(recentMetrics, 'weight'),
        sleepHours: calculateAverage(recentMetrics, 'sleepHours'),
        waterIntake: calculateAverage(recentMetrics, 'waterIntake'),
        stepsCount: calculateAverage(recentMetrics, 'stepsCount'),
        heartRate: calculateAverage(recentMetrics, 'heartRate'),
      },
      trends: {
        weight: calculateTrend(metrics, 'weight'),
        sleepHours: calculateTrend(metrics, 'sleepHours'),
        stepsCount: calculateTrend(metrics, 'stepsCount'),
      },
    };

    return { success: true, data: summary };
  } catch (error) {
    console.error('Get summary error:', error);
    return { success: false, error: 'Failed to get summary' };
  }
}

// ==================== DELETE METRICS ENTRY ====================

export async function deleteMetricsEntry(id: string): Promise<MetricsActionResult> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    await prisma.healthMetrics.deleteMany({
      where: {
        id,
        userId: user.id,
      },
    });

    revalidatePath('/health-metrics');
    return { success: true };
  } catch (error) {
    console.error('Delete metrics error:', error);
    return { success: false, error: 'Failed to delete entry' };
  }
}

// ==================== HELPERS ====================

function calculateAverage(metrics: any[], field: string): number | null {
  const values = metrics.map(m => m[field]).filter(v => v !== null && v !== undefined);
  if (values.length === 0) return null;
  return Math.round((values.reduce((a, b) => a + b, 0) / values.length) * 10) / 10;
}

function calculateTrend(metrics: any[], field: string): 'up' | 'down' | 'stable' | null {
  const values = metrics.map(m => m[field]).filter(v => v !== null && v !== undefined);
  if (values.length < 2) return null;

  // Compare first half average to second half
  const mid = Math.floor(values.length / 2);
  const firstHalf = values.slice(mid);
  const secondHalf = values.slice(0, mid);

  const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
  const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

  const diff = ((secondAvg - firstAvg) / firstAvg) * 100;

  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}
