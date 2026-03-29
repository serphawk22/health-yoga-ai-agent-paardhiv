import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { saveWorkoutSession } from '@/lib/actions/exercise';
import { getYogaRecommendation } from '@/lib/actions/recommendations';
import { getActivePlan, saveActivePlan, updateActivePlanImage, incrementPlanProgress } from '@/lib/actions/active-plan';
import { ExerciseGenerator } from './ExerciseGenerator';
import { WorkoutDisplay } from './WorkoutDisplay';
import { WorkoutDisplaySkeleton } from './WorkoutDisplaySkeleton';
import { GradientButton } from '@/components/ui/gradient-button';

export function YogaView({ isLandingPage = false }: { isLandingPage?: boolean } = {}) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [yogaPlan, setYogaPlan] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);
    const [planImageUrl, setPlanImageUrl] = useState<string | null>(null);
    const [isGeneratingImage, setIsGeneratingImage] = useState(false);
    const [activePlanId, setActivePlanId] = useState<string | null>(null);
    const [viewMode, setViewMode] = useState<'HOME' | 'GENERATOR' | 'PLAN'>('HOME');
    const [isAppMounted, setIsAppMounted] = useState(false);
    const [updatedAt, setUpdatedAt] = useState<Date | null>(null);

    const [usageCount, setUsageCount] = useState<number>(() => {
        if (typeof window !== 'undefined') {
            return parseInt(localStorage.getItem('yogaLandingUsage') || '0');
        }
        return 0;
    });

    // Check for existing active plan on mount
    useEffect(() => {
        if (isLandingPage) {
            setIsAppMounted(true);
            setViewMode('GENERATOR');
            return;
        }

        async function fetchActivePlan() {
            const result = await getActivePlan();
            if (result.success && result.data) {
                const dbPlan = result.data;
                setYogaPlan({
                    focusArea: dbPlan.focusArea,
                    totalDuration: dbPlan.duration,
                    poses: dbPlan.poses,
                    level: dbPlan.difficulty,
                });
                setPlanImageUrl(dbPlan.planImageUrl);
                setActivePlanId(dbPlan.id);
                setUpdatedAt(new Date(dbPlan.updatedAt));
                setViewMode('HOME');
            } else {
                setViewMode('GENERATOR');
            }
            setIsAppMounted(true);
        }

        if (!isAppMounted) {
            fetchActivePlan();
        }
    }, [isLandingPage, isAppMounted]);

    // Handle session start with image regeneration check
    async function handleContinueSession() {
        if (!yogaPlan || !activePlanId) return;

        setViewMode('PLAN');

        // Check if image needs regeneration (OpenAI URLs expire after 2h)
        const isExpired = updatedAt && (new Date().getTime() - updatedAt.getTime() > 90 * 60 * 1000); // 1.5 hours
        
        if (!planImageUrl || isExpired) {
            setIsGeneratingImage(true);
            try {
                const imgRes = await fetch('/api/generate-workout-image', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ exercises: yogaPlan.poses, type: 'YOGA' }),
                });
                const imgData = await imgRes.json();
                if (imgData.imageUrl) {
                    setPlanImageUrl(imgData.imageUrl);
                    await updateActivePlanImage(activePlanId, imgData.imageUrl);
                    setUpdatedAt(new Date());
                }
            } catch (err) {
                console.error('Failed to refresh yoga image:', err);
            } finally {
                setIsGeneratingImage(false);
            }
        }
    }

    async function handleSaveSession() {
        if (!yogaPlan) return;
        if (isLandingPage) {
            router.push('/register');
            return;
        }
        setIsSaving(true);
        try {
            if (activePlanId) {
                // Persistent plan logic - increment progress instead of just dumping to history
                await incrementPlanProgress(activePlanId);
            } else {
                // Fallback for landing page or generic session
                await saveWorkoutSession({
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
            }

            if (isLandingPage) {
                // Should not reach here for landing but just in case
                router.push('/register');
                return;
            }
            router.push('/yoga?tab=history');
        } catch (err) {
            console.error(err);
            setError('An error occurred while saving');
        } finally {
            setIsSaving(false);
        }
    }

    async function generateYogaPlan(data: any) {
        if (isLandingPage) {
            if (usageCount >= 3) {
                setError("You've reached the free limit of 3 tries. Please sign up to continue!");
                return;
            }
        }

        setIsLoading(true);
        setError(null);

        const { part, duration, level, specificRequest } = data;
        const request = specificRequest
            ? `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}. ${specificRequest}`
            : `Focus: ${part}. Duration: ${duration} minutes. Level: ${level}.`;

        const result = await getYogaRecommendation(part, request);

        if (result.success) {
            setYogaPlan(result.data);

            // Save as active plan
            let newPlanId = null;
            if (!isLandingPage) {
                const saveRes = await saveActivePlan(result.data);
                if (saveRes.success && saveRes.data) {
                    newPlanId = saveRes.data.id;
                    setActivePlanId(newPlanId);
                }
            }

            setViewMode('PLAN');

            if (isLandingPage) {
                const newCount = usageCount + 1;
                setUsageCount(newCount);
                if (typeof window !== 'undefined') localStorage.setItem('yogaLandingUsage', newCount.toString());
            }

            // Generate the visual yoga infographic in the background (skip on landing page)
            const poses = result.data?.poses;
            if (poses?.length && !isLandingPage && newPlanId) {
                setIsGeneratingImage(true);
                try {
                    const imgRes = await fetch('/api/generate-workout-image', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ exercises: poses, type: 'YOGA' }),
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
            setError(result.error || 'Failed to generate yoga plan');
        }

        setIsLoading(false);
    }

    return (
        <div className="relative">
            {isLandingPage && (
                <div className="absolute -top-4 right-0 z-20">
                    <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-bold text-emerald-400 uppercase tracking-widest">
                        {Math.max(0, 3 - usageCount)} {Math.max(0, 3 - usageCount) === 1 ? 'Trial' : 'Trials'} Left
                    </div>
                </div>
            )}
            <div>
                <div>
                    {!isAppMounted && <WorkoutDisplaySkeleton />}

                    {isAppMounted && viewMode === 'HOME' && yogaPlan && (
                        <div className="flex flex-col items-center justify-center py-12 px-4 max-w-xl mx-auto space-y-8 animate-fadeIn">
                            <div className="text-center">
                                <p className="text-primary-500 font-bold uppercase tracking-widest text-sm mb-2">Your Current Routine</p>
                                <h2 className="text-3xl font-light text-white">{yogaPlan.focusArea || 'Yoga Plan'}</h2>
                            </div>

                            {/* Image removed from HOME view as per request */}

                            <div className="w-full space-y-3">
                                <GradientButton onClick={handleContinueSession} className="w-full py-4 text-lg">
                                    Continue Today&apos;s Session
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
                                type="YOGA"
                                onGenerate={generateYogaPlan}
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

                    {isAppMounted && viewMode === 'PLAN' && yogaPlan && (
                        <WorkoutDisplay
                            type="YOGA"
                            plan={yogaPlan}
                            onSave={handleSaveSession}
                            onReset={() => { setViewMode('HOME'); }}
                            isSaving={isSaving}
                            planImageUrl={planImageUrl}
                            isGeneratingImage={isGeneratingImage}
                            isLandingPage={isLandingPage}
                        />
                    )}

                </div>
            </div>
        </div>
    );
}
