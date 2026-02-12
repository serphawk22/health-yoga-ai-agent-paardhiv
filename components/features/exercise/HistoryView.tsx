'use client';

import { useEffect, useState } from 'react';
import { getWorkoutHistory } from '@/lib/actions/exercise';
import { format } from 'date-fns';
import {
    CalendarDays,
    Clock,
    Flame,
    Activity,
    MoreVertical,
    Dumbbell,
    Leaf,
    Trophy
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function HistoryView() {
    const [history, setHistory] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadHistory() {
            try {
                const result = await getWorkoutHistory();
                if (result.success && result.data) {
                    setHistory(result.data);
                }
            } catch (error) {
                console.error('Failed to load history', error);
            } finally {
                setIsLoading(false);
            }
        }
        loadHistory();
    }, []);

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
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
                    Complete your first yoga or workout session to start tracking your progress here.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6 animate-fadeIn">
            <div className="grid gap-4">
                {history.map((session) => (
                    <div
                        key={session.id}
                        className="card p-4 hover:border-primary-500/50 transition-colors group"
                    >
                        <div className="flex items-start justify-between">
                            <div className="flex items-start gap-4">
                                <div className={cn(
                                    "w-12 h-12 rounded-lg flex items-center justify-center shrink-0",
                                    session.activityType === 'YOGA'
                                        ? "bg-green-500/10 text-green-500"
                                        : "bg-orange-500/10 text-orange-500"
                                )}>
                                    {session.activityType === 'YOGA' ? (
                                        <Leaf className="w-6 h-6" />
                                    ) : (
                                        <Dumbbell className="w-6 h-6" />
                                    )}
                                </div>

                                <div>
                                    <h3 className="font-semibold text-health-text text-lg">
                                        {session.title || (session.activityType === 'YOGA' ? 'Yoga Session' : 'Workout Session')}
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
                ))}
            </div>
        </div>
    );
}
