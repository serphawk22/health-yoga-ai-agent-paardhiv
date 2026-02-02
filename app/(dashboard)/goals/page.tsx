'use client';

// Goals Page

import { useState, useEffect } from 'react';
import { getGoalPlan } from '@/lib/actions/recommendations';
import {
  Loader2,
  AlertCircle,
  Target,
  TrendingUp,
  Calendar,
  CheckCircle2,
  ChevronRight,
  Sparkles,
  RefreshCw,
  Clock,
  Flag,
  Award,
  Zap,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { GlowingEffect } from '@/components/ui/glowing-effect';
import { cn } from '@/lib/utils';

const GOAL_TYPES = [
  {
    id: 'WEIGHT_LOSS',
    label: 'Weight Loss',
    emoji: '⚖️',
    description: 'Lose weight healthily and sustainably',
    color: 'bg-orange-500/20 text-orange-500 border-orange-500/50',
  },
  {
    id: 'MUSCLE_BUILDING',
    label: 'Build Muscle',
    emoji: '💪',
    description: 'Increase muscle mass and strength',
    color: 'bg-blue-500/20 text-blue-500 border-blue-500/50',
  },
  {
    id: 'BETTER_SLEEP',
    label: 'Better Sleep',
    emoji: '😴',
    description: 'Improve sleep quality and duration',
    color: 'bg-purple-500/20 text-purple-500 border-purple-500/50',
  },
  {
    id: 'STRESS_REDUCTION',
    label: 'Reduce Stress',
    emoji: '🧘',
    description: 'Manage stress and anxiety better',
    color: 'bg-green-500/20 text-green-500 border-green-500/50',
  },
  {
    id: 'INCREASE_ENERGY',
    label: 'Increase Energy',
    emoji: '⚡',
    description: 'Feel more energetic throughout the day',
    color: 'bg-yellow-500/20 text-yellow-500 border-yellow-500/50',
  },
  {
    id: 'IMPROVE_FLEXIBILITY',
    label: 'Improve Flexibility',
    emoji: '🤸',
    description: 'Increase mobility and flexibility',
    color: 'bg-pink-500/20 text-pink-500 border-pink-500/50',
  },
  {
    id: 'HEART_HEALTH',
    label: 'Heart Health',
    emoji: '❤️',
    description: 'Improve cardiovascular health',
    color: 'bg-red-500/20 text-red-500 border-red-500/50',
  },
  {
    id: 'DIABETES_MANAGEMENT',
    label: 'Manage Diabetes',
    emoji: '🩸',
    description: 'Better blood sugar management',
    color: 'bg-teal-500/20 text-teal-500 border-teal-500/50',
  },
];

export default function GoalsPage() {
  const [selectedGoal, setSelectedGoal] = useState<string | null>(null);
  const [goalPlan, setGoalPlan] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [customGoal, setCustomGoal] = useState('');

  async function loadGoalPlan(goalType: string) {
    setSelectedGoal(goalType);
    setIsLoading(true);
    setError(null);

    const result = await getGoalPlan(goalType);

    if (result.success) {
      setGoalPlan(result.data);
    } else {
      setError(result.error || 'Failed to generate goal plan');
    }

    setIsLoading(false);
  }

  async function loadCustomGoalPlan() {
    if (!customGoal.trim()) return;
    await loadGoalPlan(customGoal);
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-health-text">Health Goals</h1>
        <p className="text-health-muted">Set goals and get a comprehensive plan to achieve them</p>
      </div>

      {/* Goal Selection */}
      <div className="card mb-6">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary-600" />
          <h2 className="font-semibold text-health-text">Choose Your Goal</h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          {GOAL_TYPES.map((goal) => (
            <div key={goal.id} className="relative h-full rounded-2xl p-0.5">
              <div className="relative h-full rounded-[1.25rem] border-[0.75px] border-health-border md:rounded-[1.5rem] bg-health-card">
                <GlowingEffect
                  spread={40}
                  glow={true}
                  disabled={false}
                  proximity={64}
                  inactiveZone={0.01}
                  borderWidth={3}
                  className="rounded-[1.25rem] md:rounded-[1.5rem]"
                />
                <button
                  onClick={() => loadGoalPlan(goal.id)}
                  className={cn(
                    "relative flex w-full h-full flex-col items-start text-left p-4 rounded-[1.25rem] md:rounded-[1.5rem] transition-all",
                    "hover:bg-white/5 active:scale-[0.98]",
                    selectedGoal === goal.id ? 'bg-primary-600/20 border-primary-500/50' : ''
                  )}
                >
                  <span className="text-3xl mb-3 block">{goal.emoji}</span>
                  <h3 className="font-medium text-health-text text-lg">{goal.label}</h3>
                  <p className="text-sm text-health-muted mt-1">{goal.description}</p>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Custom Goal */}
        <div className="border-t border-health-border pt-4">
          <p className="text-sm text-health-muted mb-2">Or enter a custom goal:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={customGoal}
              onChange={(e) => setCustomGoal(e.target.value)}
              placeholder="e.g., Run a 5K marathon, Lower cholesterol"
              className="input flex-1"
              onKeyDown={(e) => e.key === 'Enter' && loadCustomGoalPlan()}
            />
            <GradientButton
              onClick={loadCustomGoalPlan}
              disabled={!customGoal.trim() || isLoading}
              className="h-auto px-4"
            >
              <Sparkles className="w-4 h-4 mr-2" />
              Generate Plan
            </GradientButton>
          </div>
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="card">
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-primary-600" />
            <span className="ml-3 text-health-muted">Creating your personalized plan...</span>
          </div>
        </div>
      )}

      {/* Error State */}
      {error && !isLoading && (
        <div className="card bg-red-500/10 border-red-500/20">
          <div className="flex items-center gap-2 text-red-500">
            <AlertCircle className="w-5 h-5" />
            <p>{error}</p>
          </div>
          <button
            onClick={() => selectedGoal && loadGoalPlan(selectedGoal)}
            className="mt-4 btn-secondary"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </button>
        </div>
      )}

      {/* Goal Plan Display */}
      {goalPlan && !isLoading && (
        <div className="space-y-6 animate-fadeIn">
          {/* Goal Overview */}
          <div className="card bg-gradient-to-br from-primary-500 to-primary-600 text-white">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">{goalPlan.goalName || selectedGoal}</h2>
                {goalPlan.overview && (
                  <p className="text-primary-100">{goalPlan.overview}</p>
                )}
              </div>
              <Award className="w-12 h-12 text-primary-200" />
            </div>

            {/* Timeline */}
            {goalPlan.timeline && (
              <div className="mt-6 flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary-200" />
                  <span className="text-sm">Timeline: <strong>{goalPlan.timeline}</strong></span>
                </div>
              </div>
            )}
          </div>

          {/* Milestones */}
          {goalPlan.milestones && goalPlan.milestones.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Flag className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-health-text">Milestones</h3>
              </div>
              <div className="space-y-4">
                {goalPlan.milestones.map((milestone: any, i: number) => (
                  <div key={i} className="flex items-start gap-4">
                    <div className="w-10 h-10 rounded-full bg-primary-500/20 flex items-center justify-center shrink-0">
                      <span className="font-bold text-primary-500">{i + 1}</span>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-health-text">{milestone.title || milestone}</h4>
                        {milestone.timeframe && (
                          <span className="text-xs px-2 py-1 rounded bg-white/5 text-health-muted border border-white/10">
                            {milestone.timeframe}
                          </span>
                        )}
                      </div>
                      {milestone.description && (
                        <p className="text-sm text-health-muted mt-1">{milestone.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Weekly Plan */}
          {goalPlan.weeklyPlan && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Calendar className="w-5 h-5 text-primary-600" />
                <h3 className="font-semibold text-health-text">Weekly Action Plan</h3>
              </div>
              <div className="space-y-4">
                {Object.entries(goalPlan.weeklyPlan).map(([day, tasks]: [string, any]) => (
                  <div key={day} className="border border-health-border rounded-lg overflow-hidden">
                    <div className="bg-white/5 px-4 py-2 font-medium text-health-text capitalize">
                      {day}
                    </div>
                    <div className="p-4">
                      {Array.isArray(tasks) ? (
                        <ul className="space-y-2">
                          {tasks.map((task: string, i: number) => (
                            <li key={i} className="flex items-start gap-2 text-sm">
                              <ChevronRight className="w-4 h-4 text-primary-600 shrink-0 mt-0.5" />
                              {task}
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-sm text-health-text">{tasks}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Diet Plan */}
          {goalPlan.dietPlan && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-500" />
                <h3 className="font-semibold text-health-text">Diet Recommendations</h3>
              </div>
              {typeof goalPlan.dietPlan === 'string' ? (
                <p className="text-sm text-health-text">{goalPlan.dietPlan}</p>
              ) : (
                <div className="space-y-3">
                  {goalPlan.dietPlan.guidelines && (
                    <ul className="space-y-2">
                      {goalPlan.dietPlan.guidelines.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Exercise Plan */}
          {goalPlan.exercisePlan && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-health-text">Exercise Plan</h3>
              </div>
              {typeof goalPlan.exercisePlan === 'string' ? (
                <p className="text-sm text-health-text">{goalPlan.exercisePlan}</p>
              ) : (
                <div className="space-y-3">
                  {goalPlan.exercisePlan.routines && (
                    <ul className="space-y-2">
                      {goalPlan.exercisePlan.routines.map((item: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm">
                          <CheckCircle2 className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                          {item}
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Lifestyle Changes */}
          {goalPlan.lifestyleChanges && goalPlan.lifestyleChanges.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-purple-500" />
                <h3 className="font-semibold text-health-text">Lifestyle Changes</h3>
              </div>
              <ul className="space-y-2">
                {goalPlan.lifestyleChanges.map((change: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-health-text">
                    <CheckCircle2 className="w-4 h-4 text-purple-500 shrink-0 mt-0.5" />
                    {change}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tracking Tips */}
          {goalPlan.trackingTips && goalPlan.trackingTips.length > 0 && (
            <div className="card bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-500">How to Track Progress</h3>
              </div>
              <ul className="space-y-2">
                {goalPlan.trackingTips.map((tip: string, i: number) => (
                  <li key={i} className="text-sm text-blue-400 flex items-start gap-2">
                    <Clock className="w-4 h-4 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Tips for Success */}
          {goalPlan.tipsForSuccess && goalPlan.tipsForSuccess.length > 0 && (
            <div className="card bg-green-500/10 border-green-500/20">
              <div className="flex items-center gap-2 mb-4">
                <Award className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold text-green-500">Tips for Success</h3>
              </div>
              <ul className="space-y-2">
                {goalPlan.tipsForSuccess.map((tip: string, i: number) => (
                  <li key={i} className="text-sm text-green-400 flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Challenges */}
          {goalPlan.potentialChallenges && goalPlan.potentialChallenges.length > 0 && (
            <div className="card bg-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-2 mb-4">
                <AlertCircle className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Potential Challenges & Solutions</h3>
              </div>
              <ul className="space-y-2">
                {goalPlan.potentialChallenges.map((challenge: string, i: number) => (
                  <li key={i} className="text-sm text-amber-400">• {challenge}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-white/5 text-sm text-health-muted">
            <strong>⚠️ Disclaimer:</strong> This goal plan is for general wellness guidance only.
            Results vary based on individual factors. Consult healthcare professionals before
            making significant changes to your diet, exercise, or lifestyle, especially if you
            have existing health conditions.
          </div>
        </div>
      )}
    </div>
  );
}
