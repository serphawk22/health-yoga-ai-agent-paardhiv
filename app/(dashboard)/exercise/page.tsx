'use client';

import { WorkoutView } from '@/components/features/exercise/WorkoutView';
import { YogaView } from '@/components/features/exercise/YogaView';

import { useSearchParams } from 'next/navigation';

export default function ExercisePage() {
  const searchParams = useSearchParams();
  const isYoga = searchParams.get('tab') === 'yoga';

  return (
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6">
      {/* Header */}
      <div className="mb-6 no-print">
        <h1 className="text-2xl font-bold text-health-text">
          {isYoga ? 'Yoga & Mindfulness' : 'Fitness & Movement'}
        </h1>
        <p className="text-health-muted">
          {isYoga
            ? 'Personalized yoga sequences for your mind and body'
            : 'Personalized workout plans to reach your fitness goals'}
        </p>
      </div>

      {/* Content */}
      <div className="animate-fadeIn">
        {isYoga ? <YogaView /> : <WorkoutView />}
      </div>
    </div>
  );
}
