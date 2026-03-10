import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { saveWorkoutSession } from '@/lib/actions/exercise';
import { getExerciseRecommendation } from '@/lib/actions/recommendations';
import { getActivePlan, saveActivePlan, updateActivePlanImage, incrementPlanProgress } from '@/lib/actions/active-plan';
import { ExerciseGenerator } from './ExerciseGenerator';
import { WorkoutDisplay } from './WorkoutDisplay';
import { WorkoutDisplaySkeleton } from './WorkoutDisplaySkeleton';
import { GradientButton } from '@/components/ui/gradient-button';

export function WorkoutView() {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [exercisePlan, setExercisePlan] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [planImageUrl, setPlanImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'HOME' | 'GENERATOR' | 'PLAN'>('HOME');
    const [isAppMounted, setIsAppMounted] = useState(false);

    // Check for existing active plan on mount
    useEffect(() => {
        async function fetchActivePlan() {
            const result = await getActivePlan();
            if (result.success && result.data && result.data.poses?._type === 'WORKOUT') {
                const dbPlan = result.data;
                setExercisePlan(dbPlan.poses);
                setPlanImageUrl(dbPlan.planImageUrl);
                setActivePlanId(dbPlan.id);
                setViewMode('HOME');
            } else {
                setViewMode('GENERATOR');
            }
            setIsAppMounted(true);
        }
        if (!isAppMounted) {
            fetchActivePlan();
        }
    }, [isAppMounted]);

    // Save logic
    async function handleSaveSession() {
        if (!exercisePlan) return;

        setIsSaving(true);
        try {
            if (activePlanId) {
                await incrementPlanProgress(activePlanId);
            } else {
                await saveWorkoutSession({
                    activityType: 'EXERCISE',
                    duration: parseInt(exercisePlan.totalDuration) || 45,
                    title: 'Custom Workout',
                    difficulty: 'MODERATE',
                    notes: '',
                    exercises: {
                        completed: [],
                        total: exercisePlan.exercises?.length || 0,
                        plan: exercisePlan
                    }
                });
            }
            router.push('/exercise?tab=history');
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

        const bodyPart = part === 'full_body' ? undefined : part;
        const result = await getExerciseRecommendation(bodyPart, request);

        if (result.success) {
            const returnedPlan = { ...result.data, _type: 'WORKOUT' };
            setExercisePlan(returnedPlan);

            // Save as active plan
            let newPlanId = null;
            const saveRes = await saveActivePlan(returnedPlan);
            if (saveRes.success) {
                newPlanId = saveRes.data.id;
                setActivePlanId(newPlanId);
            }

            setViewMode('PLAN');

            // Generate the visual workout infographic in the background
            if (returnedPlan?.exercises?.length && newPlanId) {
                setIsGeneratingImage(true);
                try {
                    const imgRes = await fetch('/api/generate-workout-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exercises: returnedPlan.exercises, type: 'WORKOUT' }),
                    });
                    const imgData = await imgRes.json();
                    if (imgData.imageUrl) {
                        setPlanImageUrl(imgData.imageUrl);
                        await updateActivePlanImage(newPlanId, imgData.imageUrl);
                    }
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
            {!isAppMounted && <WorkoutDisplaySkeleton />}

            {isAppMounted && viewMode === 'HOME' && exercisePlan && (
                <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto space-y-8 animate-fadeIn">
                    <div className="text-center">
                        <p className="text-primary-500 font-bold uppercase tracking-widest text-sm mb-2">Your Current Routine</p>
                        <h2 className="text-3xl font-light text-white">{exercisePlan.title || exercisePlan.focusArea || 'Custom Workout'}</h2>
                    </div>

                    {planImageUrl && (
                        <div className="w-full aspect-video rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
                            <img src={planImageUrl} alt="Current Routine" className="w-full h-full object-cover" />
                        </div>
                    )}

                    <div className="w-full space-y-3">
                        <GradientButton onClick={() => setViewMode('PLAN')} className="w-full py-4 text-lg">
                            Continue Today's Session
                        </GradientButton>

                        <button
                            onClick={() => setViewMode('PLAN')}
                            className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-all text-sm font-medium text-white"
                        >
                            View Full Plan
                        </button>

                        <button
                            onClick={() => setViewMode('GENERATOR')}
                            className="w-full py-3 rounded-xl text-zinc-400 hover:text-white hover:bg-white/5 transition-all text-sm font-medium"
                        >
                            Generate New Plan
                        </button>
                    </div>
                </div>
            )}

            {isAppMounted && viewMode === 'GENERATOR' && (
                <>
                    <ExerciseGenerator
                        type="WORKOUT"
                        onGenerate={generateExercisePlan}
                        isLoading={isLoading}
                    />
                    {isLoading && <WorkoutDisplaySkeleton />}

                    {activePlanId && !isLoading && (
                        <div className="text-center mt-6">
                            <button
                                onClick={() => setViewMode('HOME')}
                                className="text-sm text-zinc-500 hover:text-primary-400 font-medium"
                            >
                                &larr; Back to Current Routine
                            </button>
                        </div>
                    )}
                </>
            )}

            {isAppMounted && viewMode === 'PLAN' && exercisePlan && (
                <WorkoutDisplay
                    type="WORKOUT"
                    plan={exercisePlan}
                    onSave={handleSaveSession}
                    onReset={() => { setViewMode('HOME'); }}
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
