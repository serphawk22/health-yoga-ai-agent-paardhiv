'use client';

import { useState, useEffect, useCallback } from 'react';
import { getActivePlan } from '@/lib/actions/active-plan';
import { logDailyPlan, getWeeklySummary } from '@/lib/actions/daily-plan';
import { Loader2, CheckSquare, Square, FileText, Save, TrendingUp, Calendar, ArrowLeft } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import Link from 'next/link';

export default function PlanTrackingPage() {
  const [plan, setPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [followedDiet, setFollowedDiet] = useState(false);
  const [completedWorkout, setCompletedWorkout] = useState(false);
  const [skipped, setSkipped] = useState(false);
  const [notes, setNotes] = useState('');
  const [summary, setSummary] = useState<any>(null);

  const loadPlan = useCallback(async () => {
    setIsLoading(true);
    const result = await getActivePlan();
    if (result.success && result.data) {
      setPlan(result.data);
      // Load weekly summary
      const summaryResult = await getWeeklySummary(result.data.id);
      if (summaryResult.success) {
        setSummary(summaryResult.data);
      }
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  const handleSave = async () => {
    if (!plan) return;
    setIsSaving(true);
    const result = await logDailyPlan(plan.id, {
      followedDiet,
      completedWorkout,
      skipped,
      notes: notes || undefined,
    });
    if (result.success) {
      toast.success('Daily progress saved');
      loadPlan();
    } else {
      toast.error('Failed to save progress');
    }
    setIsSaving(false);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
      </div>
    );
  }

  if (!plan) {
    return (
      <div className="max-w-2xl mx-auto pt-12">
        <div className="rounded-3xl bg-zinc-900 border border-zinc-800 p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-zinc-800 flex items-center justify-center mx-auto mb-6">
            <FileText className="w-8 h-8 text-zinc-500" />
          </div>
          <h2 className="text-xl font-medium text-health-text mb-2">No Active Plan</h2>
          <p className="text-zinc-500 max-w-sm mx-auto mb-6">
            You don&apos;t have an active plan yet. Create a yoga or workout plan to start tracking your daily progress.
          </p>
          <Link href="/yoga">
            <GradientButton>Create a Plan</GradientButton>
          </Link>
        </div>
      </div>
    );
  }

  const planData = plan.poses as any;

  return (
    <div className="max-w-3xl mx-auto pb-20 pt-6">
      {/* Back Link */}
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-primary-400 transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </Link>

      <div className="mb-8">
        <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Plan Tracking</p>
        <h1 className="text-3xl font-light text-health-text tracking-tight">
          {plan.focusArea}
        </h1>
        <p className="text-zinc-500 mt-2 text-sm">
          {plan.duration} min session  |  {plan.difficulty} difficulty  |  {plan.completedSessions} sessions completed
        </p>
      </div>

      {/* Daily Status Section */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8 mb-8"
      >
        <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-6">Today&apos;s Status</h2>

        <div className="space-y-4">
          {/* Diet Checkbox */}
          <button
            onClick={() => { setFollowedDiet(!followedDiet); setSkipped(false); }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              followedDiet
                ? 'bg-primary-600/10 border-primary-500/30'
                : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
            )}
          >
            {followedDiet ? (
              <CheckSquare className="w-5 h-5 text-primary-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-health-text">I followed my diet plan today</p>
              <p className="text-xs text-zinc-500 mt-0.5">Mark if you adhered to your dietary guidelines</p>
            </div>
          </button>

          {/* Workout Checkbox */}
          <button
            onClick={() => { setCompletedWorkout(!completedWorkout); setSkipped(false); }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              completedWorkout
                ? 'bg-primary-600/10 border-primary-500/30'
                : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
            )}
          >
            {completedWorkout ? (
              <CheckSquare className="w-5 h-5 text-primary-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-health-text">I completed my workout</p>
              <p className="text-xs text-zinc-500 mt-0.5">Mark if you finished your planned exercise session</p>
            </div>
          </button>

          {/* Skipped Checkbox */}
          <button
            onClick={() => { setSkipped(!skipped); if (!skipped) { setFollowedDiet(false); setCompletedWorkout(false); } }}
            className={cn(
              'w-full flex items-center gap-4 p-4 rounded-2xl border transition-all text-left',
              skipped
                ? 'bg-amber-500/10 border-amber-500/30'
                : 'bg-zinc-800/50 border-zinc-800 hover:border-zinc-700'
            )}
          >
            {skipped ? (
              <CheckSquare className="w-5 h-5 text-amber-400 shrink-0" />
            ) : (
              <Square className="w-5 h-5 text-zinc-600 shrink-0" />
            )}
            <div>
              <p className="text-sm font-medium text-health-text">I skipped today</p>
              <p className="text-xs text-zinc-500 mt-0.5">It&apos;s okay to take rest days when needed</p>
            </div>
          </button>
        </div>

        {/* Notes Field */}
        <div className="mt-6">
          <label className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
            Daily Notes (optional)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="How did your day go? Any observations or feedback..."
            className="w-full bg-zinc-800/60 border border-zinc-800 focus:border-primary-500/50 outline-none rounded-xl px-4 py-3 text-sm min-h-[100px] transition-all resize-none text-zinc-300 placeholder:text-zinc-600"
          />
        </div>

        <div className="mt-6">
          <GradientButton
            onClick={handleSave}
            disabled={isSaving}
            className="w-full"
          >
            {isSaving ? (
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
            ) : (
              <Save className="w-4 h-4 mr-2" />
            )}
            Save Today&apos;s Progress
          </GradientButton>
        </div>
      </motion.div>

      {/* Weekly Summary */}
      {summary && (
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="rounded-3xl bg-zinc-900 border border-zinc-800 p-8"
        >
          <div className="flex items-center gap-2 mb-6">
            <TrendingUp className="w-4 h-4 text-primary-400" />
            <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-widest">Weekly Progress Summary</h2>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="p-4 rounded-2xl bg-zinc-800/50 text-center">
              <p className="text-2xl font-bold text-health-text">{summary.activeDays}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Active Days</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800/50 text-center">
              <p className="text-2xl font-bold text-primary-400">{summary.dietAdherence}%</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Diet Adherence</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800/50 text-center">
              <p className="text-2xl font-bold text-primary-400">{summary.workoutAdherence}%</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Workout Rate</p>
            </div>
            <div className="p-4 rounded-2xl bg-zinc-800/50 text-center">
              <p className="text-2xl font-bold text-amber-400">{summary.skippedDays}</p>
              <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-widest mt-1">Rest Days</p>
            </div>
          </div>

          {/* Mini Day-by-Day */}
          {summary.logs && summary.logs.length > 0 && (
            <div>
              <p className="text-xs text-zinc-500 font-medium mb-3">Day-by-Day</p>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-2">
                {summary.logs.map((log: any, i: number) => (
                  <div
                    key={i}
                    className={cn(
                      'shrink-0 p-3 rounded-xl text-center min-w-[70px] border',
                      log.skipped
                        ? 'bg-amber-500/10 border-amber-500/20'
                        : log.completedWorkout && log.followedDiet
                          ? 'bg-primary-600/10 border-primary-500/20'
                          : 'bg-zinc-800/50 border-zinc-800'
                    )}
                  >
                    <p className="text-xs font-bold text-health-text">
                      {new Date(log.date).toLocaleDateString(undefined, { weekday: 'short' })}
                    </p>
                    <p className="text-[10px] text-zinc-500 mt-1">
                      {log.skipped ? 'Rest' : log.completedWorkout ? 'Done' : 'Partial'}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </motion.div>
      )}
    </div>
  );
}
