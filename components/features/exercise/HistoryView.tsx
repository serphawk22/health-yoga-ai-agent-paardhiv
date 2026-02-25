'use client';

import { useEffect, useState } from 'react';
import { getWorkoutHistory } from '@/lib/actions/exercise';
import { format } from 'date-fns';
import {
    CalendarDays,
    Clock,
    Flame,
    Activity,
    Dumbbell,
    Leaf,
    Trophy,
    ChevronDown,
    Play,
    CheckCircle2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';

export function HistoryView({ filterType }: { filterType?: 'EXERCISE' | 'YOGA' }) {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    useEffect(() => {
        async function loadHistory() {
            try {
                const result = await getWorkoutHistory();
                if (result.success && result.data) {
                    let data = result.data;
                    if (filterType) {
                        data = data.filter((session: any) => session.activityType === filterType);
                    }
                    setHistory(data);
                }
            } catch (error) {
                console.error('Failed to load history', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadHistory();
    }, [filterType]);

    if (isLoading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="card p-4 space-y-4">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-4">
                                <Skeleton className="w-12 h-12 rounded-lg" />
                                <div className="space-y-2">
                                    <Skeleton className="h-5 w-32" />
                                    <Skeleton className="h-4 w-24" />
                                </div>
                            </div>
                            <Skeleton className="h-6 w-20 rounded-full" />
                        </div>
                        <div className="flex gap-4 pt-4 border-t border-white/5">
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-16" />
                            <Skeleton className="h-4 w-20" />
                        </div>
                    </div>
                ))}
            </div>
        );
    }

    if (history.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] text-center p-8">
                <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center mb-4">
                    <Trophy className="w-8 h-8 text-health-muted" />
                </div>
                <h3 className="text-xl font-semibold text-health-text mb-2">No History Yet</h3>
                <p className="text-health-muted max-w-md">
                    {filterType === 'YOGA'
                        ? "Complete your first yoga practice to start tracking your progress here."
                        : "Complete your first workout to start tracking your progress here."
                    }
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-4">
                {history.map((session) => {
                    const isExpanded = expandedId === session.id;
                    const plan = session.exercises?.plan;
                    const isYoga = session.activityType === 'YOGA';
                    const items = plan ? (isYoga ? plan.poses : plan.exercises) : null;

                    return (
                        <div
                            key={session.id}
                            className={cn(
                                "card overflow-hidden transition-colors",
                                plan ? "cursor-pointer hover:border-primary-500/50" : "",
                                isExpanded && "border-primary-500/30"
                            )}
                        >
                            {/* Card Header (always visible) */}
                            <div
                                className="p-4"
                                onClick={() => plan && setExpandedId(isExpanded ? null : session.id)}
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-start gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                                            isYoga
                                                ? "bg-green-500/10 text-green-500"
                                                : "bg-orange-500/10 text-orange-500"
                                        )}>
                                            {isYoga ? (
                                                <Leaf className="w-6 h-6" />
                                            ) : (
                                                <Dumbbell className="w-6 h-6" />
                                            )}
                                        </div>

                                        <div>
                                            <h3 className="font-semibold text-health-text text-lg">
                                                {session.title || (isYoga ? 'Yoga Session' : 'Workout Session')}
                                            </h3>
                                            <div className="flex items-center gap-2 text-sm text-health-muted mt-1">
                                                <CalendarDays className="w-4 h-4" />
                                                <span>{format(new Date(session.completedAt), 'PPP p')}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end gap-2">
                                        {session.difficulty && (
                                            <span className={cn(
                                                "text-xs px-2 py-1 rounded-full border",
                                                session.difficulty === 'HIGH' || session.difficulty === 'VERY_HIGH'
                                                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                                                    : session.difficulty === 'MODERATE'
                                                        ? "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                                                        : "bg-green-500/10 text-green-400 border-green-500/20"
                                            )}>
                                                {session.difficulty} INTENSITY
                                            </span>
                                        )}
                                        {plan && (
                                            <ChevronDown className={cn(
                                                "w-4 h-4 text-zinc-500 transition-transform duration-200",
                                                isExpanded && "rotate-180"
                                            )} />
                                        )}
                                    </div>
                                </div>

                                <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-white/5">
                                    <div className="flex items-center gap-2">
                                        <Clock className="w-4 h-4 text-blue-400" />
                                        <span className="text-sm">
                                            <span className="font-medium text-health-text">{session.duration}</span>
                                            <span className="text-health-muted ml-1">min</span>
                                        </span>
                                    </div>

                                    {session.calories && (
                                        <div className="flex items-center gap-2">
                                            <Flame className="w-4 h-4 text-orange-400" />
                                            <span className="text-sm">
                                                <span className="font-medium text-health-text">{session.calories}</span>
                                                <span className="text-health-muted ml-1">kcal</span>
                                            </span>
                                        </div>
                                    )}

                                    {session.feeling && (
                                        <div className="flex items-center gap-2">
                                            <Activity className="w-4 h-4 text-purple-400" />
                                            <span className="text-sm capitalize text-health-text">
                                                {session.feeling.toLowerCase().replace('_', ' ')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {session.notes && (
                                    <div className="mt-4 text-sm text-health-muted italic">
                                        &quot;{session.notes}&quot;
                                    </div>
                                )}
                            </div>

                            {/* Expandable Plan Details */}
                            <AnimatePresence>
                                {isExpanded && plan && (
                                    <motion.div
                                        initial={{ height: 0, opacity: 0 }}
                                        animate={{ height: 'auto', opacity: 1 }}
                                        exit={{ height: 0, opacity: 0 }}
                                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                                        className="overflow-hidden"
                                    >
                                        <div className="px-4 pb-5 pt-2 border-t border-zinc-100 dark:border-zinc-800">
                                            <h4 className="text-sm font-semibold text-zinc-500 uppercase tracking-wide mb-4">
                                                Saved Plan
                                            </h4>

                                            <div className="relative border-l-2 border-zinc-100 dark:border-zinc-800 ml-3 space-y-5 pl-6 py-1">

                                                {/* Warmup */}
                                                {(plan.warmup || plan.openingMeditation) && (
                                                    <div className="relative">
                                                        <div className="absolute -left-[29px] top-0.5 w-5 h-5 rounded-full bg-orange-100 dark:bg-orange-900/30 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                                            <Play className="w-2.5 h-2.5 text-orange-600" />
                                                        </div>
                                                        <h5 className="text-xs font-semibold text-orange-500 uppercase tracking-wide mb-1">Warm Up</h5>
                                                        <div className="space-y-1">
                                                            {isYoga ? (
                                                                <p className="text-sm text-health-text">{plan.openingMeditation}</p>
                                                            ) : (
                                                                plan.warmup?.map((w: any, i: number) => (
                                                                    <div key={i} className="text-sm text-health-text">
                                                                        {w.name} <span className="text-zinc-400">({w.duration})</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                                {/* Exercises / Poses */}
                                                {items?.map((item: any, idx: number) => {
                                                    const name = isYoga ? item.englishName : item.name;
                                                    const meta = isYoga
                                                        ? `${item.duration || '1 min'} • ${item.sanskritName || 'Asana'}`
                                                        : `${item.sets || 3} sets • ${item.reps || '12'} reps`;

                                                    return (
                                                        <div key={idx} className="relative">
                                                            <div className="absolute -left-[29px] top-0.5 w-5 h-5 rounded-full bg-primary-500/20 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                                                <CheckCircle2 className="w-2.5 h-2.5 text-primary-500" />
                                                            </div>
                                                            <h5 className="text-sm font-medium text-health-text">{name}</h5>
                                                            <p className="text-xs text-zinc-500">{meta}</p>
                                                            {(item.description || item.instructions?.[0]) && (
                                                                <p className="text-xs text-zinc-400 mt-0.5 line-clamp-2 max-w-lg">
                                                                    {isYoga ? item.instructions?.[0] : item.description}
                                                                </p>
                                                            )}
                                                        </div>
                                                    );
                                                })}

                                                {/* Cooldown */}
                                                {(plan.cooldown || plan.closingMeditation) && (
                                                    <div className="relative">
                                                        <div className="absolute -left-[29px] top-0.5 w-5 h-5 rounded-full bg-blue-100 dark:bg-blue-900/30 border-2 border-white dark:border-zinc-900 flex items-center justify-center">
                                                            <Play className="w-2.5 h-2.5 text-blue-600" />
                                                        </div>
                                                        <h5 className="text-xs font-semibold text-blue-500 uppercase tracking-wide mb-1">Cool Down</h5>
                                                        <div className="space-y-1">
                                                            {isYoga ? (
                                                                <p className="text-sm text-health-text">{plan.closingMeditation}</p>
                                                            ) : (
                                                                plan.cooldown?.map((w: any, i: number) => (
                                                                    <div key={i} className="text-sm text-health-text">
                                                                        {w.name} <span className="text-zinc-400">({w.duration})</span>
                                                                    </div>
                                                                ))
                                                            )}
                                                        </div>
                                                    </div>
                                                )}

                                            </div>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

