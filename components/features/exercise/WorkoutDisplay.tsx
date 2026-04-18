'use client';

import {
    CheckCircle2,
    Play,
    RotateCcw,
    Save,
    ImageIcon,
    Download,
    ExternalLink,
} from 'lucide-react';
import { useState } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';

interface WorkoutDisplayProps {
    plan: any;
    onSave: () => void;
    onReset: () => void;
    isSaving: boolean;
    type: 'WORKOUT' | 'YOGA';
    planImageUrl?: string | null;
    isGeneratingImage?: boolean;
    showSaveAction?: boolean;
}

function getItemName(type: 'WORKOUT' | 'YOGA', item: any) {
    return type === 'WORKOUT' ? item.name : item.englishName;
}

function getItemMeta(type: 'WORKOUT' | 'YOGA', item: any) {
    if (type === 'WORKOUT') {
        return `${item.sets || 3} sets x ${item.reps || '12'} reps`;
    }

    return `${item.duration || '1 min'}${item.sanskritName ? ` - ${item.sanskritName}` : ''}`;
}

export function WorkoutDisplay({
    plan,
    onSave,
    onReset,
    isSaving,
    type,
    planImageUrl,
    isGeneratingImage,
    showSaveAction = true,
}: WorkoutDisplayProps) {
    const [completed, setCompleted] = useState<Set<number>>(new Set());

    const items = type === 'WORKOUT' ? plan.exercises : plan.poses;
    const itemsLabel = type === 'WORKOUT' ? 'Exercises' : 'Poses';
    const visualFilename = type === 'YOGA' ? 'yoga-pose-guide.png' : 'exercise-guide.png';
    const downloadHref = planImageUrl
        ? `/api/download-workout-image?url=${encodeURIComponent(planImageUrl)}&filename=${encodeURIComponent(visualFilename)}`
        : null;

    const toggleComplete = (idx: number) => {
        const next = new Set(completed);
        if (next.has(idx)) next.delete(idx);
        else next.add(idx);
        setCompleted(next);
    };

    const progress = Math.round((completed.size / (items?.length || 1)) * 100);

    return (
        <div className="max-w-3xl mx-auto animate-slideUp">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8 border-b border-zinc-100 dark:border-zinc-800 pb-8">
                <div>
                    <h2 className="text-2xl font-semibold text-health-text">Your Plan</h2>
                    <p className="text-zinc-500">
                        {plan.totalDuration} min - {items?.length} {itemsLabel} - {plan.estimatedCalories || 'Active'} kcal
                    </p>
                </div>
                <div className="text-left sm:text-right">
                    <div className="text-3xl font-light text-primary-600">{progress}%</div>
                    <div className="text-xs text-zinc-400 uppercase tracking-wide">Complete</div>
                </div>
            </div>

            {(isGeneratingImage || planImageUrl) && (
                <div className="mb-8">
                    <div className="flex flex-wrap items-center gap-2 mb-3">
                        <ImageIcon className="w-4 h-4 text-zinc-400" />
                        <span className="text-sm font-medium text-zinc-400 uppercase tracking-wide">
                            {type === 'YOGA' ? 'Pose Guide' : 'Exercise Guide'}
                        </span>
                        {planImageUrl && (
                            <div className="ml-auto flex flex-wrap items-center gap-2">
                                <a
                                    href={planImageUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                                >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                    Full size
                                </a>
                                {downloadHref && (
                                    <a
                                        href={downloadHref}
                                        className="flex items-center gap-1.5 rounded-full border border-zinc-700 px-3 py-1.5 text-xs text-zinc-400 hover:border-zinc-500 hover:text-zinc-200 transition-colors"
                                    >
                                        <Download className="w-3.5 h-3.5" />
                                        Download
                                    </a>
                                )}
                            </div>
                        )}
                    </div>

                    {isGeneratingImage && !planImageUrl ? (
                        <div className="w-full rounded-xl overflow-hidden bg-zinc-800/50 border border-zinc-700/50" style={{ aspectRatio: '1792/1024' }}>
                            <div className="w-full h-full animate-pulse bg-gradient-to-r from-zinc-800 via-zinc-700 to-zinc-800 flex flex-col items-center justify-center gap-3">
                                <div className="w-10 h-10 rounded-full border-2 border-zinc-600 border-t-primary-500 animate-spin" />
                                <p className="text-sm text-zinc-500">Generating your visual guide...</p>
                            </div>
                        </div>
                    ) : planImageUrl ? (
                        <div className="overflow-hidden rounded-xl border border-zinc-700/50 bg-zinc-950">
                            <div className="relative w-full">
                                <Image
                                    src={planImageUrl}
                                    alt={type === 'YOGA' ? 'Yoga pose visual guide generated for the selected poses' : 'Workout exercise visual guide generated for the selected exercises'}
                                    width={1792}
                                    height={1024}
                                    sizes="(max-width: 768px) 100vw, 768px"
                                    className="w-full h-auto object-cover"
                                    unoptimized
                                />
                            </div>
                            <div className="grid gap-2 border-t border-zinc-800 bg-zinc-950/95 p-3 sm:grid-cols-2">
                                {items?.map((item: any, idx: number) => {
                                    const name = getItemName(type, item);
                                    const meta = getItemMeta(type, item);

                                    return (
                                        <div key={`${name}-${idx}`} className="flex items-start gap-2 rounded-lg bg-white/[0.03] px-3 py-2">
                                            <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary-500/15 text-[11px] font-bold text-primary-400">
                                                {idx + 1}
                                            </span>
                                            <div className="min-w-0">
                                                <p className="truncate text-xs font-semibold text-zinc-200">{name}</p>
                                                <p className="truncate text-[11px] text-zinc-500">{meta}</p>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : null}
                </div>
            )}

            <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-8 pl-7 sm:pl-8 py-2">
                {(plan.warmup || plan.openingMeditation) && (
                    <div className="relative">
                        <div className="absolute -left-[39px] sm:-left-[41px] top-1 w-6 h-6 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-white dark:border-black flex items-center justify-center">
                            <Play className="w-3 h-3 text-orange-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-orange-500 uppercase tracking-wide mb-2">Warm Up</h3>
                        <div className="space-y-2">
                            {type === 'WORKOUT' ? (
                                plan.warmup?.map((w: any, i: number) => (
                                    <div key={i} className="text-health-text">{w.name} <span className="text-zinc-400">({w.duration})</span></div>
                                ))
                            ) : (
                                <p className="text-health-text">{plan.openingMeditation}</p>
                            )}
                        </div>
                    </div>
                )}

                {items?.map((item: any, idx: number) => {
                    const isDone = completed.has(idx);
                    const name = getItemName(type, item);
                    const meta = getItemMeta(type, item);

                    return (
                        <div key={`${name}-${idx}`} className="relative group cursor-pointer" onClick={() => toggleComplete(idx)}>
                            <div className={cn(
                                'absolute -left-[39px] sm:-left-[41px] top-1 w-6 h-6 rounded-full border-2 border-white dark:border-black flex items-center justify-center transition-colors',
                                isDone ? 'bg-primary-500' : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-primary-100'
                            )}>
                                {isDone && <CheckCircle2 className="w-3 h-3 text-white" />}
                            </div>

                            <div className={cn('transition-opacity pr-1', isDone ? 'opacity-50' : 'opacity-100')}>
                                <h4 className="text-lg font-medium text-health-text">{name}</h4>
                                <p className="text-sm text-zinc-500 mb-1">{meta}</p>
                                <p className="text-xs text-zinc-400 sm:line-clamp-2 max-w-xl">
                                    {type === 'WORKOUT' ? item.description : item.instructions?.[0]}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {(plan.cooldown || plan.closingMeditation) && (
                    <div className="relative pt-4">
                        <div className="absolute -left-[39px] sm:-left-[41px] top-5 w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-black flex items-center justify-center">
                            <Play className="w-3 h-3 text-blue-600" />
                        </div>
                        <h3 className="text-sm font-semibold text-blue-500 uppercase tracking-wide mb-2">Cool Down</h3>
                        <div className="space-y-2">
                            {type === 'WORKOUT' ? (
                                plan.cooldown?.map((w: any, i: number) => (
                                    <div key={i} className="text-health-text">{w.name} <span className="text-zinc-400">({w.duration})</span></div>
                                ))
                            ) : (
                                <p className="text-health-text">{plan.closingMeditation}</p>
                            )}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col sm:flex-row justify-center gap-3 sm:gap-4 mt-12 mb-20">
                <button
                    onClick={onReset}
                    className="px-6 py-3 rounded-full text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors flex items-center justify-center gap-2"
                >
                    <RotateCcw className="w-4 h-4" />
                    Start Over
                </button>
                {showSaveAction && (
                    <button
                        onClick={onSave}
                        disabled={isSaving}
                        className="px-8 py-3 rounded-full bg-black dark:bg-white text-white dark:text-black font-medium hover:opacity-90 transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        <Save className="w-4 h-4" />
                        {isSaving ? 'Saving...' : 'Save Session'}
                    </button>
                )}
            </div>
        </div>
    );
}
