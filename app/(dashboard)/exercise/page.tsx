'use client';

import { useState } from 'react';
import { WorkoutView } from '@/components/features/exercise/WorkoutView';
import { YogaView } from '@/components/features/exercise/YogaView';
import { cn } from '@/lib/utils';
import { Dumbbell, Leaf } from 'lucide-react';

import { useSearchParams } from 'next/navigation';

export default function ExercisePage() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get('tab') === 'yoga' ? 'yoga' : 'workout';
  const [activeTab, setActiveTab] = useState<'workout' | 'yoga'>(initialTab);

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-health-text">Fitness & Movement</h1>
        <p className="text-health-muted">Personalized workouts and yoga sequences for your goals</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 no-print border-b border-health-border">
        <button
          onClick={() => setActiveTab('workout')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'workout'
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-health-muted hover:text-health-text"
          )}
        >
          <div className="flex items-center gap-2">
            <Dumbbell className="w-4 h-4" />
            Workout Plans
          </div>
        </button>
        <button
          onClick={() => setActiveTab('yoga')}
          className={cn(
            "px-4 py-2 text-sm font-medium border-b-2 transition-colors",
            activeTab === 'yoga'
              ? "border-primary-600 text-primary-600"
              : "border-transparent text-health-muted hover:text-health-text"
          )}
        >
          <div className="flex items-center gap-2">
            <Leaf className="w-4 h-4" />
            Yoga & Mindfulness
          </div>
        </button>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {activeTab === 'workout' ? <WorkoutView /> : <YogaView />}
      </div>
    </div>
  );
}
