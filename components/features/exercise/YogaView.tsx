"use client";

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { saveWorkoutSession } from '@/lib/actions/exercise';
import { getYogaRecommendation } from '@/lib/actions/recommendations';
import { ExerciseGenerator } from './ExerciseGenerator';
import { WorkoutDisplay } from './WorkoutDisplay';
import { WorkoutDisplaySkeleton } from './WorkoutDisplaySkeleton';

interface YogaGeneratorInput {
    part: string;
    duration: string;
    level: string;
    specificRequest?: string;
}

interface YogaViewProps {
    isLandingPage?: boolean;
}

export function YogaView({ isLandingPage = false }: YogaViewProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [yogaPlan, setYogaPlan] = useState<Record<string, any> | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [planImageUrl, setPlanImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);

    async function handleSaveSession() {
        if (!yogaPlan || isLandingPage) return;
        setIsSaving(true);
        try {
            const result = await saveWorkoutSession({
                activityType: 'YOGA',
                duration: Number.parseInt(String(yogaPlan.totalDuration), 10) || 30,
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

    async function generateYogaPlan(data: YogaGeneratorInput) {
        setIsLoading(true);
        setError(null);
        setPlanImageUrl(null);

        try {
            const { part, duration, level, specificRequest } = data;
            const request = specificRequest
                ? `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}. ${specificRequest}`
                : `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}.`;

            // Signature is (bodyPart, condition, specificRequest).
            const result = await getYogaRecommendation(part, undefined, request);

            if (!result.success) {
                setError(result.error || 'Failed to generate yoga plan');
                return;
            }

            setYogaPlan(result.data);

            // Generate the visual yoga infographic in the background.
            const poses = result.data?.poses;
            if (!poses?.length) {
                return;
            }

            setIsGeneratingImage(true);
            try {
                const imgRes = await fetch('/api/generate-workout-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exercises: poses, type: 'YOGA' }),
                });

                if (!imgRes.ok) {
                    throw new Error('Image generation request failed');
                }

                const imgData = await imgRes.json();
                if (imgData.imageUrl) {
                    setPlanImageUrl(imgData.imageUrl);
                }
            } catch (imgErr) {
                console.error('Image generation failed:', imgErr);
            } finally {
                setIsGeneratingImage(false);
            }
        } catch (err) {
            console.error('Yoga plan generation failed:', err);
            setError('Failed to generate yoga plan');
        } finally {
            setIsLoading(false);
        }
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
                    showSaveAction={!isLandingPage}
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
