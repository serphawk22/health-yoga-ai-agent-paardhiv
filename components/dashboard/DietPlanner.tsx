"use client";

import { useState, useEffect } from "react";
import { getDietRecommendation, getUserRecommendations } from "@/lib/actions/recommendations";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { GradientButton } from "@/components/ui/gradient-button";

export function DietPlanner() {
    const [activeTab, setActiveTab] = useState<'generate' | 'history'>('generate');
    const [isLoading, setIsLoading] = useState(false);
    const [dietPlan, setDietPlan] = useState<any>(null);
    const [specificRequest, setSpecificRequest] = useState('');
    const [error, setError] = useState<string | null>(null);

    // History state
    const [historyItems, setHistoryItems] = useState<any[]>([]);
    const [isLoadingHistory, setIsLoadingHistory] = useState(false);

    // Load history when tab changes
    useEffect(() => {
        if (activeTab === 'history') {
            loadHistory();
        }
    }, [activeTab]);

    async function loadHistory() {
        setIsLoadingHistory(true);
        const result = await getUserRecommendations('DIET');
        if (result.success && result.data) {
            setHistoryItems(result.data);
        }
        setIsLoadingHistory(false);
    }

    async function generateDietPlan() {
        setIsLoading(true);
        setError(null);

        const result = await getDietRecommendation(specificRequest || undefined);

        if (result.success) {
            setDietPlan(result.data);
            if (activeTab === 'history') loadHistory();
        } else {
            setError(result.error || 'Failed to generate diet plan');
        }

        setIsLoading(false);
    }

    function handlePrint() {
        window.print();
    }

    function loadFromHistory(item: any) {
        setDietPlan(item.content);
        setActiveTab('generate');
    }

    return (
        <div className="relative z-10 text-zinc-100 mt-16 pb-20">
            {/* Header */}
            <div className="mb-8 no-print">
                <h2 className="text-3xl font-extralight uppercase tracking-tight text-white mb-2">Diet <span className="text-primary-400 font-light">Planner</span></h2>
                <p className="text-zinc-400 font-light">Get personalized nutrition recommendations</p>
            </div>

            {/* Tabs */}
            <div className="flex bg-zinc-950/40 backdrop-blur-md p-1.5 rounded-2xl border border-white/5 mb-8 no-print w-fit shadow-xl gap-1 ring-1 ring-white/[0.03]">
                <button
                    onClick={() => setActiveTab('generate')}
                    className={cn(
                        "px-8 py-2.5 rounded-xl text-sm font-normal transition-all duration-300",
                        activeTab === 'generate' ? "bg-white/10 text-white shadow-xl border border-white/5" : "text-zinc-400 hover:text-white"
                    )}
                >
                    Current Plan
                </button>
                <button
                    onClick={() => setActiveTab('history')}
                    className={cn(
                        "px-8 py-2.5 rounded-xl text-sm font-normal transition-all duration-300",
                        activeTab === 'history' ? "bg-white/10 text-white shadow-xl border border-white/5" : "text-zinc-400 hover:text-white"
                    )}
                >
                    History
                </button>
            </div>

            {/* GENERATE TAB */}
            {activeTab === 'generate' && (
                <div className="animate-fadeIn space-y-6">
                    {/* Request Section */}
                    <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] no-print relative overflow-hidden group ring-1 ring-white/[0.03]">
                        <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent pointer-events-none" />
                        <h3 className="font-medium text-white text-xl mb-1 relative z-10 tracking-tight">Generate New Plan</h3>
                        <p className="text-sm font-extralight text-zinc-300 mb-6 relative z-10">
                            Our AI will create a personalized diet plan based on your health profile.
                        </p>

                        <textarea
                            value={specificRequest}
                            onChange={(e) => setSpecificRequest(e.target.value)}
                            placeholder="e.g., 'I want a high protein vegetarian plan' (optional)"
                            className="w-full bg-black/20 border border-white/5 rounded-2xl p-5 text-[15px] font-extralight text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-white/10 transition-all resize-none mb-6 group-focus-within:bg-black/40"
                            rows={2}
                        />

                        <div className="flex gap-3">
                            <GradientButton
                                onClick={generateDietPlan}
                                disabled={isLoading}
                                className="h-auto py-3 px-6 rounded-2xl"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        Generating...
                                    </>
                                ) : (
                                    'Generate New Plan'
                                )}
                            </GradientButton>

                            {dietPlan && (
                                <button
                                    onClick={handlePrint}
                                    className="px-5 py-3 rounded-xl border border-white/10 text-sm font-medium text-zinc-300 hover:text-white hover:bg-white/5 transition-all"
                                    title="Print Diet Plan"
                                >
                                    Print / Save PDF
                                </button>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm">
                                {error}
                            </div>
                        )}
                    </div>

                    {/* Diet Plan Display */}
                    {dietPlan ? (
                        <div id="printable-content" className="space-y-6">
                            {/* Print Header */}
                            <div className="hidden print:block mb-8 text-center">
                                <h1 className="text-3xl font-semibold text-primary-800 mb-2">Personalized Diet Plan</h1>
                                <p className="text-gray-600">Generated by Health Agent on {format(new Date(), 'PPP')}</p>
                            </div>

                            {/* Overview */}
                            <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.03] print:shadow-none print:border-gray-200">
                                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-4">Daily Overview</p>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="p-5 rounded-[1.5rem] bg-orange-500/5 border border-orange-500/10 print:bg-gray-50 print:border-gray-200 ring-1 ring-orange-500/5">
                                        <p className="text-[11px] font-medium text-orange-400/80 uppercase tracking-widest mb-2 print:text-black">Daily Calories</p>
                                        <p className="text-3xl font-extralight text-white print:text-black tabular-nums tracking-tight">{dietPlan.dailyCalories}</p>
                                        <p className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest">kcal</p>
                                    </div>
                                    {dietPlan.macros && (
                                        <>
                                            <div className="p-5 rounded-[1.5rem] bg-blue-500/5 border border-blue-500/10 print:bg-gray-50 print:border-gray-200 ring-1 ring-blue-500/5">
                                                <p className="text-[11px] font-medium text-blue-400/80 uppercase tracking-widest mb-2 print:text-black">Protein</p>
                                                <p className="text-3xl font-extralight text-white print:text-black tabular-nums tracking-tight">{dietPlan.macros.protein}g</p>
                                                <p className="text-[10px] text-zinc-400 mt-1">{Math.round((dietPlan.macros.protein * 4 / dietPlan.dailyCalories) * 100)}%</p>
                                            </div>
                                            <div className="p-5 rounded-[1.5rem] bg-green-500/5 border border-green-500/10 print:bg-gray-50 print:border-gray-200 ring-1 ring-green-500/5">
                                                <p className="text-[11px] font-medium text-green-400/80 uppercase tracking-widest mb-2 print:text-black">Carbs</p>
                                                <p className="text-3xl font-extralight text-white print:text-black tabular-nums tracking-tight">{dietPlan.macros.carbs}g</p>
                                                <p className="text-[10px] text-zinc-400 mt-1">{Math.round((dietPlan.macros.carbs * 4 / dietPlan.dailyCalories) * 100)}%</p>
                                            </div>
                                            <div className="p-5 rounded-[1.5rem] bg-purple-500/5 border border-purple-500/10 print:bg-gray-50 print:border-gray-200 ring-1 ring-purple-500/5">
                                                <p className="text-[11px] font-medium text-purple-400/80 uppercase tracking-widest mb-2 print:text-black">Fats</p>
                                                <p className="text-3xl font-extralight text-white print:text-black tabular-nums tracking-tight">{dietPlan.macros.fats}g</p>
                                                <p className="text-[10px] text-zinc-400 mt-1">{Math.round((dietPlan.macros.fats * 9 / dietPlan.dailyCalories) * 100)}%</p>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Meals */}
                            <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.03] print:shadow-none print:border-gray-200">
                                <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-widest mb-6">Daily Meals</p>
                                <div className="grid md:grid-cols-2 gap-4">
                                    {dietPlan.meals?.map((meal: any, index: number) => (
                                        <MealCard key={index} meal={meal} />
                                    ))}
                                </div>
                            </div>

                            {/* Foods to Include/Avoid */}
                            <div className="grid md:grid-cols-2 gap-6 print:block print:space-y-6">
                                {dietPlan.foodsToInclude && (
                                    <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.03] print:shadow-none print:border-gray-200 print:break-inside-avoid">
                                        <p className="text-[11px] font-medium text-green-400/80 uppercase tracking-widest mb-4">Foods to Include</p>
                                        <ul className="space-y-3">
                                            {dietPlan.foodsToInclude.map((food: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-[15px] font-light text-zinc-200">
                                                    <span className="text-green-500 mt-0.5 opacity-80">+</span>
                                                    <span>{food}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {dietPlan.foodsToAvoid && (
                                    <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.03] print:shadow-none print:border-gray-200 print:break-inside-avoid">
                                        <p className="text-[11px] font-medium text-red-400/80 uppercase tracking-widest mb-4">Foods to Avoid</p>
                                        <ul className="space-y-3">
                                            {dietPlan.foodsToAvoid.map((food: string, i: number) => (
                                                <li key={i} className="flex items-start gap-3 text-[15px] font-light text-zinc-200">
                                                    <span className="text-red-500 mt-0.5 opacity-80">-</span>
                                                    <span>{food}</span>
                                                </li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>

                            {/* Hydration Tips */}
                            {dietPlan.hydrationTips && (
                                <div className="bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] rounded-[2.5rem] p-10 shadow-[0_32px_64px_rgba(0,0,0,0.3)] ring-1 ring-white/[0.03] print:shadow-none print:border-gray-200 print:break-inside-avoid">
                                    <p className="text-[11px] font-medium text-blue-400/80 uppercase tracking-widest mb-4">Hydration Tips</p>
                                    <ul className="space-y-3">
                                        {dietPlan.hydrationTips.map((tip: string, i: number) => (
                                            <li key={i} className="text-[15px] font-light text-zinc-200 flex items-start gap-3">
                                                <span className="text-blue-500 mt-0.5 opacity-80">•</span>
                                                <span>{tip}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Special Notes */}
                            {dietPlan.specialNotes && dietPlan.specialNotes.length > 0 && (
                                <div className="bg-amber-500/5 border border-amber-500/20 rounded-[2.5rem] p-10 ring-1 ring-amber-500/5 print:bg-transparent print:border-gray-200 print:break-inside-avoid">
                                    <p className="text-[11px] font-semibold text-amber-400 uppercase tracking-widest mb-4">Special Notes</p>
                                    <ul className="space-y-3">
                                        {dietPlan.specialNotes.map((note: string, i: number) => (
                                            <li key={i} className="text-[15px] font-light text-zinc-300 flex items-start gap-3 print:text-black">
                                                <span className="text-amber-500 mt-0.5 opacity-80">•</span>
                                                <span>{note}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Disclaimer */}
                            <div className="p-6 text-center rounded-2xl border border-white/10 text-[13px] font-light text-zinc-500 print:bg-transparent print:text-xs print:mt-10">
                                <strong className="text-zinc-400 font-medium tracking-wide">Disclaimer:</strong> This diet plan is for general wellness purposes only.
                                It is not a substitute for professional nutritional advice.
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-[2.5rem] border border-white/[0.05] bg-zinc-950/20">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                </svg>
                            </div>
                            <p className="text-xl font-light text-zinc-300 mb-2">No plan generated yet</p>
                            <p className="text-[15px] text-zinc-500 font-light">Use the form above to create your personalized diet.</p>
                        </div>
                    )}
                </div>
            )}

            {/* HISTORY TAB */}
            {activeTab === 'history' && (
                <div className="animate-fadeIn">
                    {isLoadingHistory ? (
                        <div className="flex justify-center py-20">
                            <Loader2 className="w-8 h-8 animate-spin text-zinc-500" />
                        </div>
                    ) : historyItems.length > 0 ? (
                        <div className="grid md:grid-cols-2 gap-4">
                            {historyItems.map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => loadFromHistory(item)}
                                    className="w-full p-8 rounded-[2rem] bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] shadow-[0_16px_32px_rgba(0,0,0,0.2)] hover:bg-white/[0.05] hover:border-white/10 hover:shadow-[0_24px_48px_rgba(0,0,0,0.3)] hover:-translate-y-1 transition-all duration-300 text-left group ring-1 ring-white/[0.03]"
                                >
                                    <div className="flex items-center justify-between">
                                        <div>
                                            <h4 className="font-medium text-[17px] text-white group-hover:text-primary-400 transition-colors tracking-tight mb-2">
                                                {item.title}
                                            </h4>
                                            <div className="flex items-center gap-4 text-[13px] font-light text-zinc-400">
                                                <span className="flex items-center gap-1.5 opacity-80">
                                                    <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                                                    {format(new Date(item.createdAt), 'MMM d, yyyy')}
                                                </span>
                                                {item.content?.dailyCalories && (
                                                    <span className="flex items-center gap-1.5 opacity-80 text-orange-400/80">
                                                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.879 16.121A3 3 0 1012.015 11L11 14H9c0 .768.293 1.536.879 2.121z" /></svg>
                                                        {item.content.dailyCalories} kcal
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                        <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity transform group-hover:translate-x-1">
                                            <span className="text-zinc-300 text-lg font-extralight">&rarr;</span>
                                        </div>
                                    </div>
                                </button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center text-center py-20 px-6 rounded-[2.5rem] border border-white/[0.05] bg-zinc-950/20">
                            <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center mb-6">
                                <svg className="w-8 h-8 text-zinc-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <p className="text-xl font-light text-zinc-300 mb-2">No history found</p>
                            <p className="text-[15px] text-zinc-500 font-light">Generate a plan to save it here.</p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

function MealCard({ meal }: { meal: any }) {
    const mealColors: Record<string, string> = {
        breakfast: 'text-orange-400 border-orange-500/20 bg-orange-500/5 ring-orange-500/10',
        lunch: 'text-yellow-400 border-yellow-500/20 bg-yellow-500/5 ring-yellow-500/10',
        dinner: 'text-purple-400 border-purple-500/20 bg-purple-500/5 ring-purple-500/10',
        snack: 'text-green-400 border-green-500/20 bg-green-500/5 ring-green-500/10',
    };

    const mealType = meal.name?.toLowerCase() || 'snack';
    const colorClass = mealColors[mealType] || 'text-zinc-300 border-white/10 bg-white/5 ring-white/5';

    return (
        <div className={cn("p-6 rounded-[1.5rem] border ring-1 flex flex-col h-full print:border-gray-200 print:bg-transparent print:ring-0 print:break-inside-avoid", colorClass.split(' ').slice(1).join(' '))}>
            <div className="flex flex-wrap items-center justify-between gap-3 mb-5 pb-5 border-b border-white/[0.05] print:border-gray-100">
                <div>
                    <h4 className={cn("font-medium capitalize text-[17px] tracking-tight", colorClass.split(' ')[0])}>{meal.name}</h4>
                    {meal.time && (
                        <div className="flex items-center gap-1.5 mt-1.5 opacity-80">
                            <svg className="w-3.5 h-3.5 text-zinc-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                            <p className="text-[11px] font-medium tracking-wider uppercase text-zinc-400">{meal.time}</p>
                        </div>
                    )}
                </div>
                {meal.calories && (
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mb-0.5">Energy</span>
                        <span className="text-[15px] font-light text-white tracking-tight tabular-nums bg-white/5 px-2.5 py-1 rounded-lg ring-1 ring-white/10">{meal.calories} <span className="text-[11px] text-zinc-400">kcal</span></span>
                    </div>
                )}
            </div>

            {meal.items && (
                <ul className="space-y-3 flex-grow">
                    {meal.items.map((item: string, i: number) => (
                        <li key={i} className="text-[14px] font-light text-zinc-200 leading-relaxed flex items-start gap-3 print:text-black">
                            <span className={cn("mt-1 text-xs opacity-60", colorClass.split(' ')[0])}>✧</span>
                            <span className="flex-1">{item}</span>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
