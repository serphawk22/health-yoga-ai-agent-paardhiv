'use client';

// Yoga Plan Page

import { useState } from 'react';
import { getYogaRecommendation } from '@/lib/actions/recommendations';
import {
  Loader2,
  AlertCircle,
  RefreshCw,
  Clock,
  Leaf,
  Heart,
  Shield,
  ChevronDown,
  ChevronUp,
  Play,
  CheckCircle2,
  Sparkles,
  Wind,
  Moon,
  Sun,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';

const FOCUS_AREAS = [
  { id: 'stress_relief', label: 'Stress Relief', emoji: '😌', icon: Wind },
  { id: 'flexibility', label: 'Flexibility', emoji: '🧘', icon: Leaf },
  { id: 'strength', label: 'Strength', emoji: '💪', icon: Heart },
  { id: 'back_pain', label: 'Back Pain', emoji: '🔙', icon: Shield },
  { id: 'sleep', label: 'Better Sleep', emoji: '😴', icon: Moon },
  { id: 'energy', label: 'Energy Boost', emoji: '⚡', icon: Sun },
  { id: 'core', label: 'Core Strength', emoji: '🎯', icon: Heart },
  { id: 'general', label: 'General Wellness', emoji: '✨', icon: Sparkles },
];

const EXPERIENCE_LEVELS = [
  { id: 'beginner', label: 'Beginner', desc: 'New to yoga' },
  { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
  { id: 'advanced', label: 'Advanced', desc: 'Regular practice' },
];

const DURATIONS = [
  { id: '15', label: '15 min', desc: 'Quick session' },
  { id: '30', label: '30 min', desc: 'Regular practice' },
  { id: '45', label: '45 min', desc: 'Extended practice' },
  { id: '60', label: '60 min', desc: 'Full session' },
];

export default function YogaPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [yogaPlan, setYogaPlan] = useState<any>(null);
  const [selectedFocus, setSelectedFocus] = useState('general');
  const [experienceLevel, setExperienceLevel] = useState('beginner');
  const [duration, setDuration] = useState('30');
  const [specificRequest, setSpecificRequest] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [completedPoses, setCompletedPoses] = useState<Set<number>>(new Set());

  async function generateYogaPlan() {
    setIsLoading(true);
    setError(null);
    setCompletedPoses(new Set());

    const focusLabel = FOCUS_AREAS.find(f => f.id === selectedFocus)?.label || 'General Wellness';
    const request = specificRequest
      ? `Focus: ${focusLabel}. Duration: ${duration} minutes. Level: ${experienceLevel}. ${specificRequest}`
      : `Focus: ${focusLabel}. Duration: ${duration} minutes. Level: ${experienceLevel}.`;

    const result = await getYogaRecommendation(focusLabel, request);

    if (result.success) {
      setYogaPlan(result.data);
    } else {
      setError(result.error || 'Failed to generate yoga plan');
    }

    setIsLoading(false);
  }

  function togglePoseComplete(index: number) {
    const newSet = new Set(completedPoses);
    if (newSet.has(index)) {
      newSet.delete(index);
    } else {
      newSet.add(index);
    }
    setCompletedPoses(newSet);
  }

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-health-text">Yoga Practice</h1>
        <p className="text-health-muted">Personalized yoga sequences for your mind, body, and spirit</p>
      </div>

      {/* Selection Section */}
      <div className="card mb-6">
        <h2 className="font-semibold text-health-text mb-4">Customize Your Practice</h2>

        {/* Focus Area Selection */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Focus Area
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {FOCUS_AREAS.map((focus) => {
              const Icon = focus.icon;
              return (
                <button
                  key={focus.id}
                  onClick={() => setSelectedFocus(focus.id)}
                  className={cn(
                    "p-3 rounded-lg text-sm font-medium transition-all border",
                    selectedFocus === focus.id
                      ? 'bg-primary-600 border-primary-600 text-white'
                      : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                  )}
                >
                  <Icon className={cn("w-5 h-5 mx-auto mb-1", selectedFocus === focus.id ? 'text-white' : 'text-primary-500')} />
                  {focus.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Experience Level */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Experience Level
          </label>
          <div className="flex gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.id}
                onClick={() => setExperienceLevel(level.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 border",
                  experienceLevel === level.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                )}
              >
                <span className="block">{level.label}</span>
                <span className={cn("text-xs", experienceLevel === level.id ? 'text-primary-200' : 'text-health-muted')}>
                  {level.desc}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Duration */}
        <div className="mb-4">
          <label className="block text-sm font-medium text-health-text mb-2">
            Session Duration
          </label>
          <div className="flex gap-2">
            {DURATIONS.map((d) => (
              <button
                key={d.id}
                onClick={() => setDuration(d.id)}
                className={cn(
                  "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                  duration === d.id
                    ? 'bg-primary-600 border-primary-600 text-white'
                    : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                )}
              >
                {d.label}
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
            placeholder="e.g., 'Gentle poses only' or 'Include breathing exercises'"
            className="textarea"
            rows={2}
          />
        </div>

        <GradientButton
          onClick={generateYogaPlan}
          disabled={isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : yogaPlan ? (
            <>
              <RefreshCw className="w-4 h-4 mr-2" />
              Regenerate Practice
            </>
          ) : (
            <>
              <Leaf className="w-4 h-4 mr-2" />
              Generate Yoga Practice
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

      {/* Yoga Plan Display */}
      {yogaPlan && (
        <div className="space-y-6 animate-fadeIn">
          {/* Overview */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="card p-4 text-center">
              <Clock className="w-6 h-6 mx-auto text-blue-600 mb-2" />
              <p className="text-xs text-health-muted mb-1">Duration</p>
              <p className="text-lg font-bold text-health-text">{yogaPlan.totalDuration || duration} min</p>
            </div>
            <div className="card p-4 text-center">
              <Leaf className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-health-muted mb-1">Poses</p>
              <p className="text-lg font-bold text-health-text">{yogaPlan.poses?.length || 0}</p>
            </div>
            <div className="card p-4 text-center">
              <Heart className="w-6 h-6 mx-auto text-red-500 mb-2" />
              <p className="text-xs text-health-muted mb-1">Level</p>
              <p className="text-lg font-bold text-health-text capitalize">{experienceLevel}</p>
            </div>
            <div className="card p-4 text-center">
              <CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-2" />
              <p className="text-xs text-health-muted mb-1">Completed</p>
              <p className="text-lg font-bold text-health-text">{completedPoses.size}/{yogaPlan.poses?.length || 0}</p>
            </div>
          </div>

          {/* Progress Bar */}
          {yogaPlan.poses && (
            <div className="card p-4">
              <div className="flex justify-between text-sm mb-2">
                <span className="font-medium text-health-text">Practice Progress</span>
                <span className="text-health-muted">
                  {Math.round((completedPoses.size / yogaPlan.poses.length) * 100)}%
                </span>
              </div>
              <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                  style={{ width: `${(completedPoses.size / yogaPlan.poses.length) * 100}%` }}
                />
              </div>
            </div>
          )}

          {/* Opening Meditation */}
          {yogaPlan.openingMeditation && (
            <div className="card bg-purple-500/10 border-purple-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Wind className="w-5 h-5 text-purple-400" />
                <h3 className="font-semibold text-purple-400">Opening Meditation & Breathing</h3>
              </div>
              <p className="text-sm text-purple-300">{yogaPlan.openingMeditation}</p>
            </div>
          )}

          {/* Poses */}
          <div className="card">
            <h3 className="font-semibold text-health-text mb-4">Yoga Poses (Asanas)</h3>
            <div className="space-y-3">
              {yogaPlan.poses?.map((pose: any, index: number) => (
                <PoseCard
                  key={index}
                  pose={pose}
                  index={index}
                  isCompleted={completedPoses.has(index)}
                  onToggleComplete={() => togglePoseComplete(index)}
                />
              ))}
            </div>
          </div>

          {/* Breathing Exercises */}
          {yogaPlan.breathingExercises && yogaPlan.breathingExercises.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Wind className="w-5 h-5 text-blue-600" />
                <h3 className="font-semibold text-health-text">Pranayama (Breathing Exercises)</h3>
              </div>
              <div className="space-y-3">
                {yogaPlan.breathingExercises.map((exercise: any, i: number) => (
                  <div key={i} className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10">
                    <h4 className="font-medium text-blue-400">{exercise.name}</h4>
                    {exercise.duration && (
                      <span className="text-xs text-blue-400">{exercise.duration}</span>
                    )}
                    {exercise.instructions && (
                      <p className="text-sm text-blue-300 mt-2">{exercise.instructions}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Closing Meditation */}
          {yogaPlan.closingMeditation && (
            <div className="card bg-indigo-500/10 border-indigo-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Moon className="w-5 h-5 text-indigo-400" />
                <h3 className="font-semibold text-indigo-400">Closing Meditation (Savasana)</h3>
              </div>
              <p className="text-sm text-indigo-300">{yogaPlan.closingMeditation}</p>
            </div>
          )}

          {/* Benefits */}
          {yogaPlan.benefits && yogaPlan.benefits.length > 0 && (
            <div className="card">
              <div className="flex items-center gap-2 mb-4">
                <Sparkles className="w-5 h-5 text-yellow-600" />
                <h3 className="font-semibold text-health-text">Benefits of This Practice</h3>
              </div>
              <ul className="grid md:grid-cols-2 gap-2">
                {yogaPlan.benefits.map((benefit: string, i: number) => (
                  <li key={i} className="flex items-center gap-2 text-sm text-health-text">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0" />
                    {benefit}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Safety & Modifications */}
          {yogaPlan.modifications && yogaPlan.modifications.length > 0 && (
            <div className="card bg-amber-500/10 border-amber-500/20">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="w-5 h-5 text-amber-500" />
                <h3 className="font-semibold text-amber-500">Modifications & Safety Notes</h3>
              </div>
              <ul className="space-y-2">
                {yogaPlan.modifications.map((mod: string, i: number) => (
                  <li key={i} className="text-sm text-amber-400 flex items-start gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                    {mod}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Disclaimer */}
          <div className="p-4 rounded-lg bg-white/5 text-sm text-health-muted">
            <strong>⚠️ Disclaimer:</strong> This yoga practice is for general wellness purposes only.
            Listen to your body and avoid poses that cause pain or discomfort. If you have any injuries
            or health conditions, consult a healthcare provider before starting a yoga practice.
          </div>
        </div>
      )}
    </div>
  );
}

function PoseCard({
  pose,
  index,
  isCompleted,
  onToggleComplete
}: {
  pose: any;
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
              "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
              isCompleted
                ? 'bg-green-600 text-white'
                : 'bg-gradient-to-br from-green-500/20 to-teal-500/20 text-green-400 hover:from-green-500/30 hover:to-teal-500/30'
            )}
          >
            {isCompleted ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <Leaf className="w-5 h-5" />
            )}
          </button>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className={`font-medium ${isCompleted ? 'text-green-500 line-through' : 'text-health-text'}`}>
                {pose.name}
              </h4>
              {pose.sanskritName && (
                <span className="text-xs italic text-health-muted">({pose.sanskritName})</span>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mt-1">
              {pose.duration && (
                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700">
                  {pose.duration}
                </span>
              )}
              {pose.sides && (
                <span className="text-xs px-2 py-1 rounded bg-purple-100 text-purple-700">
                  {pose.sides}
                </span>
              )}
              {pose.difficulty && (
                <span className={cn("text-xs px-2 py-1 rounded border",
                  pose.difficulty === 'Easy' ? 'bg-green-500/20 text-green-400 border-green-500/20' :
                    pose.difficulty === 'Moderate' ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/20' :
                      'bg-orange-500/20 text-orange-400 border-orange-500/20'
                )}>
                  {pose.difficulty}
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
      </div>

      {isExpanded && (
        <div className="px-4 pb-4 pt-0">
          <div className="pl-14 space-y-3">
            {pose.instructions && (
              <div>
                <p className="text-sm font-medium text-health-text mb-2">How to do it:</p>
                <p className="text-sm text-health-muted">{pose.instructions}</p>
              </div>
            )}
            {pose.benefits && pose.benefits.length > 0 && (
              <div>
                <p className="text-sm font-medium text-health-text mb-2">Benefits:</p>
                <ul className="space-y-1">
                  {pose.benefits.map((benefit: string, i: number) => (
                    <li key={i} className="text-sm text-health-muted flex items-start gap-2">
                      <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-1" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {pose.breathingCue && (
              <div className="p-3 rounded-lg bg-blue-500/10 text-sm border border-blue-500/20">
                <span className="font-medium text-blue-400">Breathing: </span>
                <span className="text-blue-300">{pose.breathingCue}</span>
              </div>
            )}
            {pose.modification && (
              <div className="p-3 rounded-lg bg-amber-500/10 text-sm border border-amber-500/20">
                <span className="font-medium text-amber-500">Modification: </span>
                <span className="text-amber-400">{pose.modification}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
