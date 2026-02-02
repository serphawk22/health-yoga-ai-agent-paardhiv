'use client';

// Exercise Plan Page

import { useState } from 'react';
import { getExerciseRecommendation } from '@/lib/actions/recommendations';
import {
  Dumbbell,
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Flame,
  Heart,
  Shield,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Target,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';

const BODY_PARTS = [
  { id: 'full_body', label: 'Full Body', emoji: '🏋️' },
  { id: 'chest', label: 'Chest', emoji: '💪' },
  { id: 'back', label: 'Back', emoji: '🔙' },
  { id: 'shoulders', label: 'Shoulders', emoji: '🦾' },
  { id: 'arms', label: 'Arms', emoji: '💪' },
  { id: 'legs', label: 'Legs', emoji: '🦵' },
  { id: 'core', label: 'Core/Abs', emoji: '🎯' },
  { id: 'glutes', label: 'Glutes', emoji: '🍑' },
];

const FITNESS_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to exercise' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Regular exercise' },
  { id: 'advanced', label: 'Advanced', desc: 'Experienced' },
];

export default function ExercisePage() {
  const [isLoading, setIsLoading] = useState(false);
  const [exercisePlan, setExercisePlan] = useState<any>(null);
  const [selectedBodyPart, setSelectedBodyPart] = useState('full_body');
  const [fitnessLevel, setFitnessLevel] = useState('intermediate');
  const [specificRequest, setSpecificRequest] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedExercises, setCompletedExercises] = useState<Set<number>>(new Set());

  async function generateExercisePlan() {
    setIsLoading(true);
    setError(null);
    setCompletedExercises(new Set());

    const bodyPart = selectedBodyPart === 'full_body' ? undefined : selectedBodyPart;
    const request = specificRequest
      ? `${specificRequest}. Fitness level: ${fitnessLevel}`
      : `Fitness level: ${fitnessLevel}`;

    const result = await getExerciseRecommendation(bodyPart, request);

    if (result.success) {
      setExercisePlan(result.data);
    } else {
      setError(result.error || 'Failed to generate exercise plan');
    }

    setIsLoading(false);
  }

  function toggleExerciseComplete(index: number) {
    const newSet = new Set(completedExercises);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCompletedExercises(newSet);
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-health-text">Exercise Plan</h1>
        <p className="text-health-muted">Get personalized workout recommendations tailored to your needs</p>
      </div>

      {/* Selection Section */}
      <div className="card mb-6">
        <h2 className="font-semibold text-health-text mb-4">Customize Your Workout</h2>

        {/* Body Part Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Target Area
          </label>
          <div className="flex flex-wrap gap-2">
            {BODY_PARTS.map((part) => (
              <button
                key={part.id}
                onClick={() => setSelectedBodyPart(part.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  selectedBodyPart === part.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                )}
              >
                {part.emoji} {part.label}
              </button>
            ))}
          </div>
        </div>

        {/* Fitness Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Fitness Level
          </label>
          <div className="flex gap-2">
            {FITNESS_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setFitnessLevel(level.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  fitnessLevel === level.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>

        {/* Specific Request */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Additional Requirements (optional)
          </label>
          <textarea
            value={specificRequest}
            onChange={(e) => setSpecificRequest(e.target.value)}
            placeholder="e.g., 'No equipment available' or 'Focus on strength building'"
            className="textarea"
            rows={2}
          />
        </div>

        <GradientButton
          onClick={generateExercisePlan}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : exercisePlan ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Plan
            </>
          ) : (
            <>
              <Dumbbell className="w-4 h-4 mr-2" />
              Generate Exercise Plan
            </>
          )}
        </GradientButton>

        {error && (
          <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <p>{error}</p>
          </div>
        )}
      </div>

      {/* Exercise Plan Display */}
      {exercisePlan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-4 h-4 text-blue-600" />
                <span className="text-sm text-health-muted">Duration</span>
              </div>
              <p className="text-xl font-bold text-health-text">{exercisePlan.totalDuration || '45'} min</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Flame className="w-4 h-4 text-orange-600" />
                <span className="text-sm text-health-muted">Est. Calories</span>
              </div>
              <p className="text-xl font-bold text-health-text">{exercisePlan.estimatedCalories || '300'}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <Target className="w-4 h-4 text-primary-600" />
                <span className="text-sm text-health-muted">Exercises</span>
              </div>
              <p className="text-xl font-bold text-health-text">{exercisePlan.exercises?.length || 0}</p>
            </div>
            <div className="card p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
                <span className="text-sm text-health-muted">Completed</span>
              </div>
              <p className="text-xl font-bold text-health-text">
                {completedExercises.size}/{exercisePlan.exercises?.length || 0}
              </p>
            </div>
          </div>

          {/* Progress Bar */}
          {exercisePlan.exercises && (
            <div className="card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-health-text">Workout Progress</span>
                <span className="text-health-muted">
                  {Math.round((completedExercises.size / exercisePlan.exercises.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary-500 to-primary-600 transition-all duration-500"
                  style={{ width: `${(completedExercises.size / exercisePlan.exercises.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Warmup */}
          {exercisePlan.warmup && exercisePlan.warmup.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-health-text">Warm Up</h3>
                <span className="text-sm text-health-muted">(5-10 min)</span>
              </div>
              <ul className="space-y-2">
                {exercisePlan.warmup.map((item: any, i: number) => (
                  <li key={i} className="text-sm text-health-text flex items-start gap-2">
                    <Play className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                    <span><span className="font-medium">{item.name}</span> <span className="text-health-muted">({item.duration})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Exercises */}
          <div className="card">
            <h3 className="font-semibold text-health-text mb-4">Exercises</h3>
            <div className="space-y-3">
              {exercisePlan.exercises?.map((exercise: any, index: number) => (
                <ExerciseCard
                  key={index}
                  exercise={exercise}
                  index={index}
                  isCompleted={completedExercises.has(index)}
                  onToggleComplete={() => toggleExerciseComplete(index)}
                />
              ))}
            </div>
          </div>

          {/* Cooldown */}
          {exercisePlan.cooldown && exercisePlan.cooldown.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Heart className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-health-text">Cool Down</h3>
                <span className="text-sm text-health-muted">(5-10 min)</span>
              </div>
              <ul className="space-y-2">
                {exercisePlan.cooldown.map((item: any, i: number) => (
                  <li key={i} className="text-sm text-health-text flex items-start gap-2">
                    <Play className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                    <span><span className="font-medium">{item.name}</span> <span className="text-health-muted">({item.duration})</span></span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety Warnings */}
          {exercisePlan.safetyWarnings && exercisePlan.safetyWarnings.length > 0 && (
            <div className="card bg-red-500/10 border-red-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold text-red-500">Safety Warnings</h3>
              </div>
              <ul className="space-y-2">
                {exercisePlan.safetyWarnings.map((warning: string, i: number) => (
                  <li key={i} className="text-sm text-red-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {warning}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Modifications */}
          {exercisePlan.modifications && exercisePlan.modifications.length > 0 && (
            <div className="card bg-blue-500/10 border-blue-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold text-blue-400">Modifications for Your Conditions</h3>
              </div>
              <ul className="space-y-2">
                {exercisePlan.modifications.map((mod: string, i: number) => (
                  <li key={i} className="text-sm text-blue-300">• {mod}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-white/5 text-sm text-health-muted">
            <strong>⚠️ Disclaimer:</strong> This exercise plan is for general wellness purposes only.
            Stop any exercise that causes pain or discomfort. Consult a healthcare provider or certified
            fitness professional before starting any new exercise program, especially if you have
            health conditions or injuries.
          </div>
        </div>
      )}
    </div>
  );
}

function ExerciseCard({
  exercise,
  index,
  isCompleted,
  onToggleComplete
}: {
  exercise: any;
  index: number;
  isCompleted: boolean;
  onToggleComplete: () => void;
}) {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div
      className={cn(
        "rounded-lg border transition-all",
        isCompleted
          ? 'bg-green-500/10 border-green-500/50'
          : 'border-health-border hover:border-primary-500/50'
      )}
    >
      <div className="p-4">
        <div className="flex items-center gap-4">
          <button
            onClick={onToggleComplete}
            className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 transition-colors",
              isCompleted
                ? 'bg-green-600 text-white'
                : 'bg-white/5 text-health-muted hover:bg-white/10'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <span className="font-medium">{index + 1}</span>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h4 className={`font-medium ${isCompleted ? 'text-green-500 line-through' : 'text-health-text'}`}>
              {exercise.name}
            </h4>
            {exercise.sets && (
              <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400 border border-blue-500/20">
                {exercise.sets} sets
              </span>
            )}
            {exercise.reps && (
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/20">
                {exercise.reps} reps
              </span>
            )}
            {exercise.duration && (
              <span className="text-xs px-2 py-1 rounded bg-orange-500/20 text-orange-400 border border-orange-500/20">
                {exercise.duration}
              </span>
            )}
            {exercise.restBetweenSets && (
              <span className="text-xs px-2 py-1 rounded bg-white/5 text-health-muted border border-white/10">
                Rest: {exercise.restBetweenSets}
              </span>
            )}
          </div>
        </div>

        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="p-2 hover:bg-white/5 rounded-lg transition-colors"
        >
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-health-muted" />
          ) : (
            <ChevronDown className="w-5 h-5 text-health-muted" />
          )}
        </button>
      </div>

      {
        isExpanded && (
          <div className="px-4 pb-4 pt-0">
            <div className="pl-12 space-y-3">
              {exercise.description && (
                <p className="text-sm text-health-muted">{exercise.description}</p>
              )}
              {exercise.instructions && exercise.instructions.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-health-text mb-2">Instructions:</p>
                  <ol className="list-decimal list-inside space-y-1">
                    {exercise.instructions.map((step: string, i: number) => (
                      <li key={i} className="text-sm text-health-muted">{step}</li>
                    ))}
                  </ol>
                </div>
              )}
              {exercise.targetMuscles && exercise.targetMuscles.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  <span className="text-sm text-health-muted">Targets: </span>
                  {exercise.targetMuscles.map((muscle: string, i: number) => (
                    <span key={i} className="text-xs px-2 py-1 rounded bg-primary-500/20 text-primary-400 border border-primary-500/20">
                      {muscle}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )
      }
    </div >
  );
}
