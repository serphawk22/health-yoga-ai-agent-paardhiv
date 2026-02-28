// Diet Plan Page
'use client';

import { useState, useEffect } from 'react';
import { getDietRecommendation, getUserRecommendations } from '@/lib/actions/recommendations';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { GradientButton } from '@/components/ui/gradient-button';
import ColorBends from '@/components/ui/ColorBends';

export default function DietPage() {
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
    <div className="max-w-5xl mx-auto pb-20 lg:pb-6 relative z-10 text-zinc-100 min-h-screen">
      {/* Background */}
      <div className="fixed inset-0 z-[-1] pointer-events-none">
        <ColorBends
          colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
          rotation={0}
          speed={0.2}
          scale={1}
          frequency={1}
          warpStrength={1}
          mouseInfluence={1}
          parallax={0.5}
          noise={0.1}
          transparent
          autoRotate={0}
        />
      </div>

      {/* Header */}
      <div className="mb-8 no-print">
        <h1 className="text-3xl font-bold tracking-tight text-white mb-1">Diet Plan</h1>
        <p className="text-zinc-500 font-medium">Get personalized nutrition recommendations</p>
      </div>

      {/* Tabs */}
      <div className="flex bg-white/[0.03] backdrop-blur-md p-1.5 rounded-2xl border border-white/10 mb-8 no-print w-fit shadow-xl gap-1">
        <button
          onClick={() => setActiveTab('generate')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === 'generate' ? "bg-white/10 text-white shadow-xl border border-white/5" : "text-zinc-500 hover:text-white"
          )}
        >
          Current Plan
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={cn(
            "px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300",
            activeTab === 'history' ? "bg-white/10 text-white shadow-xl border border-white/5" : "text-zinc-500 hover:text-white"
          )}
        >
          History
        </button>
      </div>

      {/* GENERATE TAB */}
      {activeTab === 'generate' && (
        <div className="animate-fadeIn space-y-6">
          {/* Request Section */}
          <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl no-print relative overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-primary-500/[0.02] to-transparent pointer-events-none" />
            <h2 className="font-bold text-white text-xl mb-1 relative z-10">Generate New Plan</h2>
            <p className="text-sm text-zinc-400 mb-6 relative z-10">
              Our AI will create a personalized diet plan based on your health profile.
            </p>

            <textarea
              value={specificRequest}
              onChange={(e) => setSpecificRequest(e.target.value)}
              placeholder="e.g., 'I want a high protein vegetarian plan' (optional)"
              className="w-full bg-white/[0.03] border border-white/10 rounded-2xl p-5 text-[15px] text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-2 focus:ring-primary-500/20 transition-all resize-none mb-6 group-focus-within:bg-white/[0.05]"
              rows={2}
            />

            <div className="flex gap-3">
              <GradientButton
                onClick={generateDietPlan}
                disabled={isLoading}
                className="h-auto py-3 px-6"
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
                  className="px-5 py-3 rounded-xl border border-zinc-800 text-sm font-semibold text-zinc-400 hover:text-white hover:border-zinc-700 transition-all"
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
                <h1 className="text-3xl font-bold text-primary-800 mb-2">Personalized Diet Plan</h1>
                <p className="text-gray-600">Generated by Health Agent on {format(new Date(), 'PPP')}</p>
              </div>

              {/* Overview */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl print:shadow-none print:border-gray-200">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Daily Overview</p>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="p-4 rounded-2xl bg-orange-500/10 border border-orange-500/20 print:bg-gray-50 print:border-gray-200">
                    <p className="text-[11px] font-bold text-orange-400 uppercase tracking-widest mb-2 print:text-black">Daily Calories</p>
                    <p className="text-2xl font-black text-white print:text-black">{dietPlan.dailyCalories}</p>
                    <p className="text-[10px] text-zinc-500 mt-0.5">kcal</p>
                  </div>
                  {dietPlan.macros && (
                    <>
                      <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 print:bg-gray-50 print:border-gray-200">
                        <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-2 print:text-black">Protein</p>
                        <p className="text-2xl font-black text-white print:text-black">{dietPlan.macros.protein}g</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round((dietPlan.macros.protein * 4 / dietPlan.dailyCalories) * 100)}%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-green-500/10 border border-green-500/20 print:bg-gray-50 print:border-gray-200">
                        <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-2 print:text-black">Carbs</p>
                        <p className="text-2xl font-black text-white print:text-black">{dietPlan.macros.carbs}g</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round((dietPlan.macros.carbs * 4 / dietPlan.dailyCalories) * 100)}%</p>
                      </div>
                      <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 print:bg-gray-50 print:border-gray-200">
                        <p className="text-[11px] font-bold text-purple-400 uppercase tracking-widest mb-2 print:text-black">Fats</p>
                        <p className="text-2xl font-black text-white print:text-black">{dietPlan.macros.fats}g</p>
                        <p className="text-[10px] text-zinc-500 mt-0.5">{Math.round((dietPlan.macros.fats * 9 / dietPlan.dailyCalories) * 100)}%</p>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Meals */}
              <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl print:shadow-none print:border-gray-200">
                <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mb-4">Daily Meals</p>
                <div className="space-y-3">
                  {dietPlan.meals?.map((meal: any, index: number) => (
                    <MealCard key={index} meal={meal} />
                  ))}
                </div>
              </div>

              {/* Foods to Include/Avoid */}
              <div className="grid md:grid-cols-2 gap-4 print:block print:space-y-6">
                {dietPlan.foodsToInclude && (
                  <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl print:shadow-none print:border-gray-200 print:break-inside-avoid">
                    <p className="text-[11px] font-bold text-green-400 uppercase tracking-widest mb-4">Foods to Include</p>
                    <ul className="space-y-2">
                      {dietPlan.foodsToInclude.map((food: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-green-500 mt-0.5">+</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {dietPlan.foodsToAvoid && (
                  <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl print:shadow-none print:border-gray-200 print:break-inside-avoid">
                    <p className="text-[11px] font-bold text-red-400 uppercase tracking-widest mb-4">Foods to Avoid</p>
                    <ul className="space-y-2">
                      {dietPlan.foodsToAvoid.map((food: string, i: number) => (
                        <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                          <span className="text-red-500 mt-0.5">-</span>
                          <span>{food}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Hydration Tips */}
              {dietPlan.hydrationTips && (
                <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-3xl p-8 shadow-2xl print:shadow-none print:border-gray-200 print:break-inside-avoid">
                  <p className="text-[11px] font-bold text-blue-400 uppercase tracking-widest mb-4">Hydration Tips</p>
                  <ul className="space-y-2">
                    {dietPlan.hydrationTips.map((tip: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-300">• {tip}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Special Notes */}
              {dietPlan.specialNotes && dietPlan.specialNotes.length > 0 && (
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-3xl p-6 print:bg-transparent print:border-gray-200 print:break-inside-avoid">
                  <p className="text-[11px] font-bold text-amber-400 uppercase tracking-widest mb-3">Special Notes</p>
                  <ul className="space-y-2">
                    {dietPlan.specialNotes.map((note: string, i: number) => (
                      <li key={i} className="text-sm text-zinc-400 print:text-black">• {note}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Disclaimer */}
              <div className="p-5 rounded-2xl border border-zinc-800 text-sm text-zinc-600 print:bg-transparent print:text-xs print:mt-8">
                <strong className="text-zinc-500">Disclaimer:</strong> This diet plan is for general wellness purposes only.
                It is not a substitute for professional nutritional advice.
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-600">
              <p className="text-lg font-medium mb-1">No plan generated yet</p>
              <p className="text-sm">Use the form above to start.</p>
            </div>
          )}
        </div>
      )}

      {/* HISTORY TAB */}
      {activeTab === 'history' && (
        <div className="animate-fadeIn">
          {isLoadingHistory ? (
            <div className="flex justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-zinc-700" />
            </div>
          ) : historyItems.length > 0 ? (
            <div className="space-y-3">
              {historyItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => loadFromHistory(item)}
                  className="w-full p-6 rounded-3xl bg-white/[0.03] backdrop-blur-3xl border border-white/10 shadow-lg hover:bg-white/[0.05] hover:border-white/20 hover:scale-[1.01] transition-all text-left group"
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-primary-400 transition-colors">
                        {item.title}
                      </h3>
                      <div className="flex items-center gap-4 mt-1 text-sm text-zinc-500">
                        <span>{format(new Date(item.createdAt), 'PPP')}</span>
                        {item.content?.dailyCalories && (
                          <span>{item.content.dailyCalories} kcal</span>
                        )}
                      </div>
                    </div>
                    <span className="text-zinc-700 group-hover:text-zinc-400 transition-colors text-lg">&rarr;</span>
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-zinc-600">
              <p className="text-lg font-medium mb-1">No history found</p>
              <p className="text-sm">Generate a plan to save it here.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function MealCard({ meal }: { meal: any }) {
  const mealColors: Record<string, string> = {
    breakfast: 'text-orange-400 border-orange-500/20',
    lunch: 'text-yellow-400 border-yellow-500/20',
    dinner: 'text-purple-400 border-purple-500/20',
    snack: 'text-green-400 border-green-500/20',
  };

  const mealType = meal.name?.toLowerCase() || 'snack';
  const colorClass = mealColors[mealType] || 'text-zinc-400 border-zinc-700';

  return (
    <div className={cn("p-4 rounded-2xl border border-zinc-800 print:border-gray-200 print:break-inside-avoid", colorClass.split(' ').slice(1).join(' '))}>
      <div className="flex items-center justify-between mb-3">
        <div>
          <h4 className={cn("font-bold capitalize text-sm", colorClass.split(' ')[0])}>{meal.name}</h4>
          {meal.time && <p className="text-[11px] text-zinc-600 mt-0.5">{meal.time}</p>}
        </div>
        {meal.calories && (
          <span className="text-xs font-bold text-zinc-500 bg-zinc-800 px-2.5 py-1 rounded-lg">{meal.calories} kcal</span>
        )}
      </div>

      {meal.items && (
        <ul className="space-y-1">
          {meal.items.map((item: string, i: number) => (
            <li key={i} className="text-sm text-zinc-400 flex items-start gap-2 print:text-black">
              <span className="text-zinc-600">•</span>
              {item}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
