import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveWorkoutSession } from '@/lib/actions/exercise';
import { getExerciseRecommendation } from '@/lib/actions/recommendations';
import { ExerciseGenerator } from './ExerciseGenerator';
import { WorkoutDisplay } from './WorkoutDisplay';
import { WorkoutDisplaySkeleton } from './WorkoutDisplaySkeleton';

export function WorkoutView() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [exercisePlan, setExercisePlan] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [planImageUrl, setPlanImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    // Save logic
    async function handleSaveSession() {
        if (!exercisePlan) return;

        setIsSaving(true);
        try {
            const result = await saveWorkoutSession({
                activityType: 'EXERCISE',
                duration: parseInt(exercisePlan.totalDuration) || 45,
                title: 'Custom Workout',
                difficulty: 'MODERATE', // Defaulting for now to keep UI clean
                notes: '',
                exercises: {
                    completed: [], // Logic moved to display component state, ideally would lift state up but sticking to minimal req
                    total: exercisePlan.exercises?.length || 0,
                    plan: exercisePlan
                }
            });

            if (result.success) {
                router.push('/exercise?tab=history');
            } else {
                setError('Failed to save session');
            }
        } catch (err) {
            console.error(err);
            setError('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    }

    // Generate logic
    async function generateExercisePlan(data: any) {
        setIsLoading(true);
        setError(null);

        const { part, level, specificRequest } = data;
        const request = specificRequest
            ? `${specificRequest}. Fitness level: ${level}`
            : `Fitness level: ${level}`;

        // Map part to API expected format
        const bodyPart = part === 'full_body' ? undefined : part;

        const result = await getExerciseRecommendation(bodyPart, request);

        if (result.success) {
            setExercisePlan(result.data);
            // Generate the visual workout infographic in the background
            if (result.data?.exercises?.length) {
                setIsGeneratingImage(true);
                try {
                    const imgRes = await fetch('/api/generate-workout-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exercises: result.data.exercises, type: 'WORKOUT' }),
                    });
                    const imgData = await imgRes.json();
                    if (imgData.imageUrl) setPlanImageUrl(imgData.imageUrl);
                } catch (imgErr) {
                    console.error('Image generation failed:', imgErr);
                } finally {
                    setIsGeneratingImage(false);
                }
            }
        } else {
            setError(result.error || 'Failed to generate exercise plan');
        }

        setIsLoading(false);
    }

    return (
        <div>
            {!exercisePlan ? (
                <>
                    <ExerciseGenerator
                        type="WORKOUT"
                        onGenerate={generateExercisePlan}
                        isLoading={isLoading}
                    />
                    {isLoading && <WorkoutDisplaySkeleton />}
                </>
            ) : (
                <WorkoutDisplay
                    type="WORKOUT"
                    plan={exercisePlan}
                    onSave={handleSaveSession}
                    onReset={() => { setExercisePlan(null); setPlanImageUrl(null); }}
                    isSaving={isSaving}
                    planImageUrl={planImageUrl}
                    isGeneratingImage={isGeneratingImage}
                />
            )}

            {error && (
                <div className="text-center text-red-500 mt-4 bg-red-50 p-3 rounded-lg max-w-md mx-auto">
                    {error}
                </div>
            )}
        </div>
    );
}
