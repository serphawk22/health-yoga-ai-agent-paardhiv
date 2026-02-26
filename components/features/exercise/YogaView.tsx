import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveWorkoutSession } from '@/lib/actions/exercise';
import { getYogaRecommendation } from '@/lib/actions/recommendations';
import { ExerciseGenerator } from './ExerciseGenerator';
import { WorkoutDisplay } from './WorkoutDisplay';
import { WorkoutDisplaySkeleton } from './WorkoutDisplaySkeleton';

export function YogaView() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [yogaPlan, setYogaPlan] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [planImageUrl, setPlanImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    async function handleSaveSession() {
        if (!yogaPlan) return;
        setIsSaving(true);
        try {
            const result = await saveWorkoutSession({
                activityType: 'YOGA',
                duration: parseInt(yogaPlan.totalDuration) || 30,
                title: 'Yoga Practice',
                difficulty: 'MODERATE',
                notes: '',
                exercises: {
                    completed: [],
                    total: yogaPlan.poses?.length || 0,
                    plan: yogaPlan
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

    async function generateYogaPlan(data: any) {
        setIsLoading(true);
        setError(null);

        const { part, duration, level, specificRequest } = data;
        const request = specificRequest
            ? `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}. ${specificRequest}`
            : `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}.`;

        const result = await getYogaRecommendation(part, request);

        if (result.success) {
            setYogaPlan(result.data);
            // Generate the visual yoga infographic in the background
            const poses = result.data?.poses;
            if (poses?.length) {
                setIsGeneratingImage(true);
                try {
                    const imgRes = await fetch('/api/generate-workout-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exercises: poses, type: 'YOGA' }),
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
            setError(result.error || 'Failed to generate yoga plan');
        }

        setIsLoading(false);
    }

    return (
        <div>
            {!yogaPlan ? (
                <>
                    <ExerciseGenerator
                        type="YOGA"
                        onGenerate={generateYogaPlan}
                        isLoading={isLoading}
                    />
                    {isLoading && <WorkoutDisplaySkeleton />}
                </>
            ) : (
                <WorkoutDisplay
                    type="YOGA"
                    plan={yogaPlan}
                    onSave={handleSaveSession}
                    onReset={() => { setYogaPlan(null); setPlanImageUrl(null); }}
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
