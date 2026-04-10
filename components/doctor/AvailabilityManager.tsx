'use client';

import { useState, useEffect, useRef } from 'react';
import { getDoctorAvailability, updateDoctorAvailability } from '@/lib/actions/doctor';
import { Loader2, Save, CheckCircle2, AlertCircle, Clock, ChevronDown, Check, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

const DAYS = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
];

function PremiumToggle({ checked, onChange, label, sublabel }: { checked: boolean, onChange: (v: boolean) => void, label: string, sublabel: string }) {
    return (
        <div className="flex items-center gap-4 cursor-pointer group select-none" onClick={() => onChange(!checked)}>
            <div className={cn(
                "relative w-12 h-7 rounded-full transition-all duration-300 p-1 flex items-center border",
                checked ? "bg-emerald-500/20 border-emerald-500/40" : "bg-white/5 border-white/10"
            )}>
                <motion.div
                    layout
                    className={cn(
                        "w-5 h-5 rounded-full shadow-lg transition-colors duration-300",
                        checked ? "bg-emerald-400" : "bg-zinc-500"
                    )}
                    animate={{ x: checked ? 20 : 0 }}
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                />
            </div>
            <div className="flex flex-col">
                <span className={cn(
                    "font-medium text-sm transition-colors duration-300",
                    checked ? "text-white" : "text-gray-400"
                )}>
                    {label}
                </span>
                <span className="text-[11px] text-gray-500 mt-0.5">
                    {sublabel}
                </span>
            </div>
        </div>
    );
}

function TimePicker({ value, onChange, disabled }: { value: string, onChange: (v: string) => void, disabled: boolean }) {
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    const format12h = (time24: string) => {
        const [h, m] = time24.split(':').map(Number);
        const period = h >= 12 ? 'PM' : 'AM';
        const h12 = h % 12 || 12;
        return `${h12}:${m.toString().padStart(2, '0')} ${period}`;
    };

    const options = [];
    for (let h = 6; h <= 22; h++) {
        for (let m = 0; m < 60; m += 30) {
            options.push(`${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`);
        }
    }

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => setIsOpen(!isOpen)}
                className={cn(
                    "flex items-center justify-between gap-4 px-4 py-3 rounded-xl border transition-all duration-300 min-w-[170px]",
                    disabled
                        ? "bg-white/[0.02] border-white/5 text-gray-600 cursor-not-allowed"
                        : "bg-white/5 border-white/10 hover:border-emerald-500/40 hover:bg-white/10 text-white"
                )}
            >
                <div className="flex items-center gap-3">
                    <Clock className={cn("w-4 h-4", disabled ? "text-gray-600" : "text-emerald-400")} />
                    <span className="text-sm font-medium tracking-tight tabular-nums">
                        {format12h(value)}
                    </span>
                </div>
                <ChevronDown className={cn("w-4 h-4 text-gray-500 transition-transform duration-300", isOpen && "rotate-180")} />
            </button>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute top-full mt-2 left-0 right-0 bg-[#111113] border border-white/10 rounded-2xl overflow-hidden shadow-2xl z-[100] backdrop-blur-2xl"
                    >
                        <div className="max-h-[240px] overflow-y-auto no-scrollbar py-2">
                            {options.map((t) => (
                                <button
                                    key={t}
                                    type="button"
                                    onClick={() => {
                                        onChange(t);
                                        setIsOpen(false);
                                    }}
                                    className={cn(
                                        "w-full px-6 py-3 text-left transition-all flex items-center justify-between",
                                        value === t
                                            ? "bg-emerald-500/10 text-emerald-300 font-medium"
                                            : "text-gray-400 hover:text-white hover:bg-white/[0.03]"
                                    )}
                                >
                                    <span className="text-xs tracking-wide">{format12h(t)}</span>
                                    {value === t && <Check className="w-4 h-4" />}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export function AvailabilityManager() {
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [availability, setAvailability] = useState<any[]>([]);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        loadAvailability();
    }, []);

    async function loadAvailability() {
        setIsLoading(true);
        const result = await getDoctorAvailability();

        if (result.success && result.data) {
            const initialAvailability = DAYS.map((day, index) => {
                const existing = result.data.find((a: any) => a.dayOfWeek === index);
                return existing || {
                    dayOfWeek: index,
                    startTime: '09:00',
                    endTime: '17:00',
                    isActive: false,
                };
            });
            setAvailability(initialAvailability);
        }
        setIsLoading(false);
    }

    async function handleSave() {
        setIsSaving(true);
        setMessage(null);

        const activeSlots = availability.filter(a => a.isActive);
        const result = await updateDoctorAvailability(activeSlots);

        if (result.success) {
            setMessage({ type: 'success', text: 'Availability updated successfully' });
            setTimeout(() => setMessage(null), 3000);
        } else {
            setMessage({ type: 'error', text: 'Failed to update availability' });
        }
        setIsSaving(false);
    }

    function updateDay(index: number, field: string, value: any) {
        setAvailability(prev => {
            const updated = [...prev];
            updated[index] = { ...updated[index], [field]: value };
            return updated;
        });
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-emerald-500" />
                <p className="text-gray-500 font-medium uppercase tracking-wider text-xs">Loading availability...</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header Info */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
                <div className="space-y-1">
                    <h3 className="text-2xl font-medium text-white">Configure Availability</h3>
                    <p className="text-sm text-gray-400">Enable days and set your consultation start and end times.</p>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                    <AnimatePresence>
                        {message && (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 20 }}
                                className={cn(
                                    "px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium border",
                                    message.type === 'success' ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-red-500/10 text-red-300 border-red-500/20"
                                )}
                            >
                                {message.type === 'success' ? <CheckCircle2 className="w-3 h-3" /> : <AlertCircle className="w-3 h-3" />}
                                {message.text}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="h-12 px-7 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black flex items-center gap-2 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.25)] font-medium disabled:opacity-70"
                    >
                        {isSaving ? (
                            <div className="flex items-center gap-3">
                                <Loader2 className="w-4 h-4 animate-spin" />
                                <span>Saving...</span>
                            </div>
                        ) : (
                            <div className="flex items-center gap-3">
                                <Save className="w-4 h-4" />
                                <span>Save Availability</span>
                            </div>
                        )}
                    </button>
                </div>
            </div>

            {/* Schedule Grid */}
            <div className="grid grid-cols-1 gap-4">
                {availability.map((slot, index) => {
                    const today = new Date();
                    const currentDay = today.getDay();
                    const daysUntil = (index + 7 - currentDay) % 7;
                    const date = new Date(today);
                    date.setDate(today.getDate() + daysUntil);
                    const isToday = daysUntil === 0;

                    return (
                        <motion.div
                            key={index}
                            initial={false}
                            animate={{ opacity: slot.isActive ? 1 : 0.75 }}
                            className={cn(
                                "flex flex-col xl:flex-row xl:items-center gap-6 p-6 rounded-2xl border transition-all duration-300",
                                slot.isActive
                                    ? "bg-white/5 border-white/10 shadow-[0_0_20px_rgba(16,185,129,0.08)]"
                                    : "bg-white/[0.02] border-white/5"
                            )}
                        >
                            <div className="flex items-center gap-4 xl:w-72">
                                <PremiumToggle
                                    checked={slot.isActive}
                                    onChange={(v) => updateDay(index, 'isActive', v)}
                                    label={DAYS[index]}
                                    sublabel={isToday ? "Active today" : "Recurring weekly"}
                                />
                            </div>

                            <div className="flex-1 flex flex-wrap items-end gap-4">
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-medium text-gray-500 ml-1">Start</span>
                                    <TimePicker
                                        value={slot.startTime}
                                        onChange={(v) => updateDay(index, 'startTime', v)}
                                        disabled={!slot.isActive}
                                    />
                                </div>
                                <div className="pt-7">
                                    <span className="text-gray-600 font-medium text-xs px-1">to</span>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <span className="text-xs font-medium text-gray-500 ml-1">End</span>
                                    <TimePicker
                                        value={slot.endTime}
                                        onChange={(v) => updateDay(index, 'endTime', v)}
                                        disabled={!slot.isActive}
                                    />
                                </div>
                            </div>

                            <div className="xl:ml-auto">
                                <div className={cn(
                                    "px-4 py-2 rounded-full flex items-center gap-2 text-xs font-medium border transition-colors duration-300",
                                    slot.isActive ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/20" : "bg-white/5 text-gray-500 border-white/10"
                                )}>
                                    <Calendar className="w-3 h-3" />
                                    Next: {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                                </div>
                            </div>
                        </motion.div>
                    );
                })}
            </div>
        </div>
    );
}
