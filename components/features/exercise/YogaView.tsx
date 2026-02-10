'use client';

// Yoga View Component
// Refactored from original YogaPage

import { useState } from 'react';
import { getYogaRecommendation } from '@/lib/actions/recommendations';
import {
    Loader2,
    AlertCircle,
    RefreshCw,
    Clock,
    Leaf,
    Heart,
    Shield,
    ChevronDown,
    ChevronUp,
    Play,
    CheckCircle2,
    Sparkles,
    Wind,
    Moon,
    Sun,
    Printer
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

const FOCUS_AREAS = [
    { id: 'stress_relief', label: 'Stress Relief', emoji: '😌', icon: Wind },
    { id: 'flexibility', label: 'Flexibility', emoji: '🧘', icon: Leaf },
    { id: 'strength', label: 'Strength', emoji: '💪', icon: Heart },
    { id: 'back_pain', label: 'Back Pain', emoji: '🔙', icon: Shield },
    { id: 'sleep', label: 'Better Sleep', emoji: '😴', icon: Moon },
    { id: 'energy', label: 'Energy Boost', emoji: '⚡', icon: Sun },
    { id: 'core', label: 'Core Strength', emoji: '🎯', icon: Heart },
    { id: 'general', label: 'General Wellness', emoji: '✨', icon: Sparkles },
];

const EXPERIENCE_LEVELS = [
    { id: 'beginner', label: 'Beginner', desc: 'New to yoga' },
    { id: 'intermediate', label: 'Intermediate', desc: 'Some experience' },
    { id: 'advanced', label: 'Advanced', desc: 'Regular practice' },
];

const DURATIONS = [
    { id: '15', label: '15 min', desc: 'Quick session' },
    { id: '30', label: '30 min', desc: 'Regular practice' },
    { id: '45', label: '45 min', desc: 'Extended practice' },
    { id: '60', label: '60 min', desc: 'Full session' },
];

export function YogaView() {
    const [isLoading, setIsLoading] = useState(false);
    const [yogaPlan, setYogaPlan] = useState<any>(null);
    const [selectedFocus, setSelectedFocus] = useState('general');
    const [experienceLevel, setExperienceLevel] = useState('beginner');
    const [duration, setDuration] = useState('30');
    const [specificRequest, setSpecificRequest] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [completedPoses, setCompletedPoses] = useState<Set<number>>(new Set());

    async function generateYogaPlan() {
        setIsLoading(true);
        setError(null);
        setCompletedPoses(new Set());

        const focusLabel = FOCUS_AREAS.find(f => f.id === selectedFocus)?.label || 'General Wellness';
        const request = specificRequest
            ? `Focus: ${focusLabel}. Duration: ${duration} minutes. Level: ${experienceLevel}. ${specificRequest}`
            : `Focus: ${focusLabel}. Duration: ${duration} minutes. Level: ${experienceLevel}.`;

        const result = await getYogaRecommendation(focusLabel, request);

        if (result.success) {
            setYogaPlan(result.data);
        } else {
            setError(result.error || 'Failed to generate yoga plan');
        }

        setIsLoading(false);
    }

    function togglePoseComplete(index: number) {
        const newSet = new Set(completedPoses);
        if (newSet.has(index)) {
            newSet.delete(index);
        } else {
            newSet.add(index);
        }
        setCompletedPoses(newSet);
    }

    function handlePrint() {
        window.print();
    }

    return (
        <div className="space-y-6">
            {/* Selection Section - Hide on print */}
            <div className="card mb-6 no-print">
                <h2 className="font-semibold text-health-text mb-4">Customize Your Practice</h2>

                {/* Focus Area Selection */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-health-text mb-2">
                        Focus Area
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {FOCUS_AREAS.map((focus) => {
                            const Icon = focus.icon;
                            return (
                                <button
                                    key={focus.id}
                                    onClick={() => setSelectedFocus(focus.id)}
                                    className={cn(
                                        "p-3 rounded-lg text-sm font-medium transition-all border",
                                        selectedFocus === focus.id
                                            ? 'bg-primary-600 border-primary-600 text-white'
                                            : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                                    )}
                                >
                                    <Icon className={cn("w-5 h-5 mx-auto mb-1", selectedFocus === focus.id ? 'text-white' : 'text-primary-500')} />
                                    {focus.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Experience Level */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-health-text mb-2">
                        Experience Level
                    </label>
                    <div className="flex gap-2">
                        {EXPERIENCE_LEVELS.map((level) => (
                            <button
                                key={level.id}
                                onClick={() => setExperienceLevel(level.id)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors flex-1 border",
                                    experienceLevel === level.id
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                                )}
                            >
                                <span className="block">{level.label}</span>
                                <span className={cn("text-xs", experienceLevel === level.id ? 'text-primary-200' : 'text-health-muted')}>
                                    {level.desc}
                                </span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Duration */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-health-text mb-2">
                        Session Duration
                    </label>
                    <div className="flex gap-2">
                        {DURATIONS.map((d) => (
                            <button
                                key={d.id}
                                onClick={() => setDuration(d.id)}
                                className={cn(
                                    "px-4 py-2 rounded-lg text-sm font-medium transition-colors border",
                                    duration === d.id
                                        ? 'bg-primary-600 border-primary-600 text-white'
                                        : 'bg-white/5 border-white/10 text-health-text hover:bg-white/10'
                                )}
                            >
                                {d.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Specific Request */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-health-text mb-2">
                        Additional Requirements (optional)
                    </label>
                    <textarea
                        value={specificRequest}
                        onChange={(e) => setSpecificRequest(e.target.value)}
                        placeholder="e.g., 'Gentle poses only' or 'Include breathing exercises'"
                        className="textarea"
                        rows={2}
                    />
                </div>

                <div className="flex gap-2">
                    <GradientButton
                        onClick={generateYogaPlan}
                        disabled={isLoading}
                        className="flex-1"
                    >
                        {isLoading ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Generating...
                            </>
                        ) : yogaPlan ? (
                            <>
                                <RefreshCw className="w-4 h-4 mr-2" />
                                Regenerate Practice
                            </>
                        ) : (
                            <>
                                <Leaf className="w-4 h-4 mr-2" />
                                Generate Yoga Practice
                            </>
                        )}
                    </GradientButton>

                    {yogaPlan && (
                        <button
                            onClick={handlePrint}
                            className="btn-secondary"
                            title="Print Plan"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print
                        </button>
                    )}
                </div>

                {error && (
                    <div className="mt-4 p-4 rounded-lg bg-red-500/10 border border-red-500/20 text-red-500 flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                        <p>{error}</p>
                    </div>
                )}
            </div>

            {/* Yoga Plan Display */}
            {yogaPlan && (
                <div id="printable-content" className="space-y-6 animate-fadeIn">
                    {/* Print Header */}
                    <div className="hidden print:block mb-8 text-center">
                        <h1 className="text-3xl font-bold text-primary-800 mb-2">Personalized Yoga Practice</h1>
                        <p className="text-gray-600">Generated by Health Agent on {format(new Date(), 'PPP')}</p>
                    </div>

                    {/* Overview */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="card p-4 text-center print:shadow-none print:border">
                            <Clock className="w-6 h-6 mx-auto text-blue-600 mb-2 print:text-black" />
                            <p className="text-xs text-health-muted mb-1 print:text-gray-600">Duration</p>
                            <p className="text-lg font-bold text-health-text print:text-black">{yogaPlan.totalDuration || duration} min</p>
                        </div>
                        <div className="card p-4 text-center print:shadow-none print:border">
                            <Leaf className="w-6 h-6 mx-auto text-green-600 mb-2 print:text-black" />
                            <p className="text-xs text-health-muted mb-1 print:text-gray-600">Poses</p>
                            <p className="text-lg font-bold text-health-text print:text-black">{yogaPlan.poses?.length || 0}</p>
                        </div>
                        <div className="card p-4 text-center print:shadow-none print:border">
                            <Heart className="w-6 h-6 mx-auto text-red-500 mb-2 print:text-black" />
                            <p className="text-xs text-health-muted mb-1 print:text-gray-600">Level</p>
                            <p className="text-lg font-bold text-health-text capitalize print:text-black">{experienceLevel}</p>
                        </div>
                        <div className="card p-4 text-center no-print">
                            <CheckCircle2 className="w-6 h-6 mx-auto text-green-600 mb-2" />
                            <p className="text-xs text-health-muted mb-1">Completed</p>
                            <p className="text-lg font-bold text-health-text">{completedPoses.size}/{yogaPlan.poses?.length || 0}</p>
                        </div>
                    </div>

                    {/* Progress Bar - Hide on print */}
                    {yogaPlan.poses && (
                        <div className="card p-4 no-print">
                            <div className="flex justify-between text-sm mb-2">
                                <span className="font-medium text-health-text">Practice Progress</span>
                                <span className="text-health-muted">
                                    {Math.round((completedPoses.size / yogaPlan.poses.length) * 100)}%
                                </span>
                            </div>
                            <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-green-400 to-green-600 transition-all duration-500"
                                    style={{ width: `${(completedPoses.size / yogaPlan.poses.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    )}

                    {/* Opening Meditation */}
                    {yogaPlan.openingMeditation && (
                        <div className="card bg-purple-500/10 border-purple-500/20 print:bg-transparent print:border-gray-200 print:break-inside-avoid">
                            <div className="flex items-center gap-2 mb-3">
                                <Wind className="w-5 h-5 text-purple-400 print:text-black" />
                                <h3 className="font-semibold text-purple-400 print:text-black">Opening Meditation & Breathing</h3>
                            </div>
                            <p className="text-sm text-purple-300 print:text-black">{yogaPlan.openingMeditation}</p>
                        </div>
                    )}

                    {/* Poses */}
                    <div className="card print:shadow-none">
                        <h3 className="font-semibold text-health-text mb-4 print:text-black">Yoga Poses (Asanas)</h3>
                        <div className="space-y-3">
                            {yogaPlan.poses?.map((pose: any, index: number) => (
                                <PoseCard
                                    key={index}
                                    pose={pose}
                                    index={index}
                                    isCompleted={completedPoses.has(index)}
                                    onToggleComplete={() => togglePoseComplete(index)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Breathing Exercises */}
                    {yogaPlan.breathingExercises && yogaPlan.breathingExercises.length > 0 && (
                        <div className="card print:shadow-none print:break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4">
                                <Wind className="w-5 h-5 text-blue-600 print:text-black" />
                                <h3 className="font-semibold text-health-text print:text-black">Pranayama (Breathing)</h3>
                            </div>
                            <div className="space-y-3">
                                {yogaPlan.breathingExercises.map((exercise: any, i: number) => (
                                    <div key={i} className="p-4 rounded-lg border border-blue-500/20 bg-blue-500/10 print:bg-transparent print:border-gray-200">
                                        <h4 className="font-medium text-blue-400 print:text-black">{exercise.name}</h4>
                                        {exercise.duration && (
                                            <span className="text-xs text-blue-400 print:text-gray-600">{exercise.duration}</span>
                                        )}
                                        {exercise.instructions && (
                                            <p className="text-sm text-blue-300 mt-2 print:text-black">{exercise.instructions}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Closing Meditation */}
                    {yogaPlan.closingMeditation && (
                        <div className="card bg-indigo-500/10 border-indigo-500/20 print:bg-transparent print:border-gray-200 print:break-inside-avoid">
                            <div className="flex items-center gap-2 mb-3">
                                <Moon className="w-5 h-5 text-indigo-400 print:text-black" />
                                <h3 className="font-semibold text-indigo-400 print:text-black">Closing Meditation (Savasana)</h3>
                            </div>
                            <p className="text-sm text-indigo-300 print:text-black">{yogaPlan.closingMeditation}</p>
                        </div>
                    )}

                    {/* Benefits */}
                    {yogaPlan.benefits && yogaPlan.benefits.length > 0 && (
                        <div className="card print:shadow-none print:break-inside-avoid">
                            <div className="flex items-center gap-2 mb-4">
                                <Sparkles className="w-5 h-5 text-yellow-600 print:text-black" />
                                <h3 className="font-semibold text-health-text print:text-black">Benefits of This Practice</h3>
                            </div>
                            <ul className="grid md:grid-cols-2 gap-2">
                                {yogaPlan.benefits.map((benefit: string, i: number) => (
                                    <li key={i} className="flex items-center gap-2 text-sm text-health-text print:text-black">
                                        <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 print:text-black" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Safety & Modifications */}
                    {yogaPlan.modifications && yogaPlan.modifications.length > 0 && (
                        <div className="card bg-amber-500/10 border-amber-500/20 print:bg-transparent print:border-gray-200 print:break-inside-avoid">
                            <div className="flex items-center gap-2 mb-3">
                                <Shield className="w-5 h-5 text-amber-500 print:text-black" />
                                <h3 className="font-semibold text-amber-500 print:text-black">Modifications & Safety Notes</h3>
                            </div>
                            <ul className="space-y-2">
                                {yogaPlan.modifications.map((mod: string, i: number) => (
                                    <li key={i} className="text-sm text-amber-400 flex items-start gap-2 print:text-black">
                                        <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                                        {mod}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}

                    {/* Disclaimer */}
                    <div className="p-4 rounded-lg bg-white/5 text-sm text-health-muted print:bg-transparent print:text-xs print:mt-8">
                        <strong>⚠️ Disclaimer:</strong> This yoga practice is for general wellness purposes only.
                        Consult a healthcare provider before starting a yoga practice.
                    </div>
                </div>
            )}
        </div>
    );
}

function PoseCard({
    pose,
    index,
    isCompleted,
    onToggleComplete
}: {
    pose: any;
    index: number;
    isCompleted: boolean;
    onToggleComplete: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);

    return (
        <div
            className={cn(
                "rounded-lg border transition-all print:border-gray-200 print:break-inside-avoid",
                isCompleted
                    ? 'bg-green-500/10 border-green-500/50 print:bg-transparent'
                    : 'border-health-border hover:border-primary-500/50'
            )}
        >
            <div className="p-4">
                <div className="flex items-center gap-4">
                    <button
                        onClick={onToggleComplete}
                        className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors no-print",
                            isCompleted
                                ? 'bg-green-600 text-white'
                                : 'bg-gradient-to-br from-green-500/20 to-teal-500/20 text-green-400 hover:from-green-500/30 hover:to-teal-500/30'
                        )}
                    >
                        {isCompleted ? (
                            <CheckCircle2 className="w-5 h-5" />
                        ) : (
                            <Leaf className="w-5 h-5" />
                        )}
                    </button>

                    <span className="hidden print:inline-block font-bold mr-2 text-black">{index + 1}.</span>

                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                            <h4 className={`font-medium ${isCompleted ? 'text-green-500 line-through print:text-black print:no-underline' : 'text-health-text print:text-black'}`}>
                                {pose.englishName}
                            </h4>
                            {pose.sanskritName && (
                                <span className="text-xs italic text-health-muted print:text-gray-600">({pose.sanskritName})</span>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2 mt-1">
                            {pose.duration && (
                                <span className="text-xs px-2 py-1 rounded bg-blue-100 text-blue-700 print:text-black print:bg-gray-100">
                                    {pose.duration}
                                </span>
                            )}
                        </div>
                    </div>

                    <button
                        onClick={() => setIsExpanded(!isExpanded)}
                        className="p-2 hover:bg-white/5 rounded-lg transition-colors no-print"
                    >
                        {isExpanded ? (
                            <ChevronUp className="w-5 h-5 text-health-muted" />
                        ) : (
                            <ChevronDown className="w-5 h-5 text-health-muted" />
                        )}
                    </button>
                </div>
            </div>

            <div className={cn("px-4 pb-4 pt-0 pl-14 print:pl-6", !isExpanded && "hidden print:block")}>
                <div className="space-y-3">
                    {pose.instructions && (
                        <div>
                            <p className="text-sm font-medium text-health-text mb-2 print:text-black">How to do it:</p>
                            <ul className="list-disc pl-4 space-y-1">
                                {pose.instructions.map((step: string, i: number) => (
                                    <li key={i} className="text-sm text-health-muted print:text-black">{step}</li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {pose.benefits && pose.benefits.length > 0 && (
                        <div>
                            <p className="text-sm font-medium text-health-text mb-2 print:text-black">Benefits:</p>
                            <ul className="space-y-1">
                                {pose.benefits.map((benefit: string, i: number) => (
                                    <li key={i} className="text-sm text-health-muted flex items-start gap-2 print:text-black">
                                        <CheckCircle2 className="w-3 h-3 text-green-600 shrink-0 mt-1 print:text-black" />
                                        {benefit}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                    {pose.breathingPattern && (
                        <div className="p-3 rounded-lg bg-blue-500/10 text-sm border border-blue-500/20 print:bg-transparent print:border-gray-200">
                            <span className="font-medium text-blue-400 print:text-black">Breathing: </span>
                            <span className="text-blue-300 print:text-black">{pose.breathingPattern}</span>
                        </div>
                    )}
                    {pose.modifications && (
                        <div className="p-3 rounded-lg bg-amber-500/10 text-sm border border-amber-500/20 print:bg-transparent print:border-gray-200">
                            <span className="font-medium text-amber-500 print:text-black">Modification: </span>
                            <span className="text-amber-400 print:text-black">{pose.modifications}</span>
                        </div>
                    )}
                    {pose.contraindications && pose.contraindications.length > 0 && (
                        <div className="p-3 rounded-lg bg-red-500/10 text-sm border border-red-500/20 print:bg-transparent print:border-gray-200">
                            <span className="font-medium text-red-500 print:text-black">Caution: </span>
                            <span className="text-red-400 print:text-black">{pose.contraindications.join(', ')}</span>
                        </div>
                    )}
                </div>
            </div>
        </div >
    );
}
