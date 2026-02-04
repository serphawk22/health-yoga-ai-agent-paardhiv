'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getPublicDietRecommendation } from '@/lib/actions/public-recommendations';
import {
    Apple,
    Loader2,
    Sparkles,
    ChevronRight,
    AlertCircle,
    Coffee,
    Sun,
    Moon,
    Utensils,
    RefreshCw,
    Lock
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';

const MAX_TRIES = 2;
const STORAGE_KEY = 'health-agent-diet-tries';

export function FreeDietPlanGenerator() {
    const [mounted, setMounted] = useState(false);
    const [triesLeft, setTriesLeft] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [dietPlan, setDietPlan] = useState<any>(null);
    const [specificRequest, setSpecificRequest] = useState('');
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        setMounted(true);
        const usedTries = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        setTriesLeft(Math.max(0, MAX_TRIES - usedTries));
    }, []);

    async function generateDietPlan() {
        if (triesLeft <= 0) return;

        setIsLoading(true);
        setError(null);

        // Decrement immediately to correct UI state, will commit to storage on success/attempt
        const currentUsed = parseInt(localStorage.getItem(STORAGE_KEY) || '0', 10);
        const newUsed = currentUsed + 1;

        const result = await getPublicDietRecommendation(specificRequest || undefined);

        // Always increment usage count on attempt, even if it fails, to prevent spamming
        // Actually, let's be kind and only count successful attempts or real API calls.
        // The server action was called, so we count it.
        localStorage.setItem(STORAGE_KEY, newUsed.toString());
        setTriesLeft(Math.max(0, MAX_TRIES - newUsed));

        if (result.success) {
            setDietPlan(result.data);
        } else {
            setError(result.error || 'Failed to generate diet plan');
        }

        setIsLoading(false);
    }

    if (!mounted) return null; // Avoid hydration mismatch for localStorage

    const isLimitReached = triesLeft === 0 && !dietPlan;

    // Reuse MealCard logic locally for simplicity
    const renderMeal = (meal: any, index: number) => {
        const icons: Record<string, any> = {
            breakfast: Coffee,
            lunch: Sun,
            dinner: Moon,
            snack: Apple,
        };
        const colors: Record<string, string> = {
            breakfast: 'bg-orange-100 text-orange-600',
            lunch: 'bg-yellow-100 text-yellow-600',
            dinner: 'bg-purple-100 text-purple-600',
            snack: 'bg-green-100 text-green-600',
        };

        const mealType = meal.name?.toLowerCase() || 'snack';
        const Icon = icons[mealType] || Utensils;
        const color = colors[mealType] || 'bg-gray-100 text-gray-600';

        return (
            <div key={index} className="p-4 rounded-lg border border-health-border bg-white dark:bg-neutral-800">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${color} flex items-center justify-center`}>
                            <Icon className="w-5 h-5" />
                        </div>
                        <div>
                            <h4 className="font-medium text-health-text capitalize">{meal.name}</h4>
                            <p className="text-sm text-health-muted">{meal.time}</p>
                        </div>
                    </div>
                    {meal.calories && (
                        <span className="text-sm font-medium text-health-muted">{meal.calories} kcal</span>
                    )}
                </div>
                {meal.items && (
                    <ul className="space-y-1">
                        {meal.items.map((item: string, i: number) => (
                            <li key={i} className="text-sm text-health-text flex items-start gap-2">
                                <span className="text-primary-600">•</span>
                                {item}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        );
    };

    return (
        <section id="try-diet-planner" className="py-20 px-4 bg-health-surface/50">
            <div className="max-w-4xl mx-auto">
                <div className="text-center mb-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-100 text-primary-700 text-sm font-medium mb-4">
                        <Sparkles className="w-4 h-4" />
                        Try It Free
                    </div>
                    <h2 className="text-3xl font-bold text-health-text mb-4">Generate Your Personal Diet Plan</h2>
                    <p className="text-health-muted max-w-2xl mx-auto">
                        Experience the power of our AI health assistant. Try it now without signing up (limited to 2 generations).
                    </p>
                </div>

                <div className="card max-w-2xl mx-auto border-primary-100 shadow-lg">
                    {dietPlan ? (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="flex items-center justify-between">
                                <h3 className="text-xl font-bold text-health-text">Your Personalized Plan</h3>
                                <button
                                    onClick={() => setDietPlan(null)}
                                    className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                                >
                                    Create New Plan
                                </button>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-3">
                                <div className="p-3 rounded-lg bg-orange-50 text-center">
                                    <p className="text-xs text-orange-600 mb-1">Calories</p>
                                    <p className="text-lg font-bold text-orange-700">{dietPlan.dailyCalories}</p>
                                </div>
                                <div className="p-3 rounded-lg bg-blue-50 text-center">
                                    <p className="text-xs text-blue-600 mb-1">Protein</p>
                                    <p className="text-lg font-bold text-blue-700">{dietPlan.macros.protein}g</p>
                                </div>
                                <div className="p-3 rounded-lg bg-green-50 text-center">
                                    <p className="text-xs text-green-600 mb-1">Carbs</p>
                                    <p className="text-lg font-bold text-green-700">{dietPlan.macros.carbs}g</p>
                                </div>
                            </div>

                            {/* Meals Preview (First 2 meals only to encourage sign up for full plan?) - No, let's show all for the free try to be impressive */}
                            <div className="space-y-3">
                                {dietPlan.meals?.map((meal: any, index: number) => renderMeal(meal, index))}
                            </div>

                            {/* Register CTA */}
                            <div className="p-6 mt-6 rounded-xl bg-gradient-to-br from-primary-600 to-accent-600 text-white text-center">
                                <h4 className="text-lg font-bold mb-2">Want to save this plan?</h4>
                                <p className="text-white/90 mb-6 text-sm">
                                    Create a free account to save your diet plans, customize your profile, and access exercise routines.
                                </p>
                                <Link
                                    href="/register"
                                    className="inline-flex items-center justify-center px-6 py-2.5 bg-white text-primary-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
                                >
                                    Create Free Account
                                    <ChevronRight className="w-4 h-4 ml-1" />
                                </Link>
                            </div>

                            {/* Debug Info */}
                            <details className="mt-4 text-xs text-left text-gray-500 cursor-pointer">
                                <summary>Debug Info</summary>
                                <div className="mt-2 p-2 bg-gray-100 rounded border overflow-auto max-h-40">
                                    <p>Tries Left: {triesLeft}</p>
                                    <p>Request: {specificRequest}</p>
                                    <pre>{JSON.stringify(dietPlan, null, 2)}</pre>
                                </div>
                            </details>
                        </div>
                    ) : isLimitReached ? (
                        <div className="text-center py-10">
                            <div className="w-16 h-16 bg-neutral-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Lock className="w-8 h-8 text-neutral-400" />
                            </div>
                            <h3 className="text-xl font-bold text-health-text mb-2">Free Trials Used</h3>
                            <p className="text-health-muted mb-8 max-w-md mx-auto">
                                You've used your 2 free diet plan generations. Create a free account to generate unlimited personalized plans!
                            </p>
                            <GradientButton asChild className="px-8">
                                <Link href="/register">
                                    Sign Up Now - It's Free
                                </Link>
                            </GradientButton>
                            <p className="mt-4 text-sm text-health-muted">
                                Already have an account? <Link href="/login" className="text-primary-600 hover:underline">Sign in</Link>
                            </p>
                        </div>
                    ) : (
                        <div className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium text-health-text mb-2">
                                    What are your diet goals/preferences?
                                </label>
                                <textarea
                                    value={specificRequest}
                                    onChange={(e) => setSpecificRequest(e.target.value)}
                                    placeholder="E.g., High protein vegetarian meal plan, or Keto diet for weight loss..."
                                    className="w-full px-4 py-3 rounded-xl border border-health-border focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none bg-white dark:bg-neutral-900 min-h-[100px]"
                                />
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-sm text-health-muted">
                                    {triesLeft} free generation{triesLeft !== 1 ? 's' : ''} remaining
                                </span>
                                <button
                                    onClick={generateDietPlan}
                                    disabled={isLoading || !specificRequest.trim()}
                                    className="flex items-center justify-center px-6 py-3 bg-gradient-to-r from-primary-500 to-primary-600 text-white rounded-xl font-medium hover:from-primary-600 hover:to-primary-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-primary-500/25"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                            Generating Plan...
                                        </>
                                    ) : (
                                        <>
                                            <Sparkles className="w-5 h-5 mr-2" />
                                            Generate Plan
                                        </>
                                    )}
                                </button>
                            </div>

                            {error && (
                                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 flex items-start gap-2 text-sm">
                                    <AlertCircle className="w-5 h-5 shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </section>
    );
}
