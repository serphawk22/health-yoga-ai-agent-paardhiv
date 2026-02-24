"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import ColorBends from "@/components/ui/ColorBends";
import { GradientButton } from "@/components/ui/gradient-button";
import { Calendar, Clock, Activity, Leaf, Sun, Heart, Stethoscope, Video } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";

interface AppointmentData {
    id: string;
    scheduledDate: string;
    scheduledTime: string;
    duration: number;
    status: string;
    type: string;
    reason: string | null;
    doctorName: string;
    doctorSpecialization: string;
    meetingId: string | null;
}

interface YogaDashboardProps {
    userName: string;
    appointments: AppointmentData[];
}

export function YogaDashboard({ userName, appointments }: YogaDashboardProps) {
    const [currentTime, setCurrentTime] = useState(new Date());
    const [timeUntilYogaDay, setTimeUntilYogaDay] = useState<{ days: number; hours: number; minutes: number; seconds: number } | null>(null);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date());
            calculateTimeUntilYogaDay();
        }, 1000);
        calculateTimeUntilYogaDay();
        return () => clearInterval(timer);
    }, []);

    const calculateTimeUntilYogaDay = () => {
        const now = new Date();
        const currentYear = now.getFullYear();
        let yogaDay = new Date(currentYear, 5, 21);

        if (now > yogaDay) {
            yogaDay = new Date(currentYear + 1, 5, 21);
        }

        const diff = yogaDay.getTime() - now.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeUntilYogaDay({ days, hours, minutes, seconds });
    };

    const formattedDate = currentTime.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
    const formattedTime = currentTime.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', second: '2-digit' });

    const yogaNews = [
        {
            id: 1,
            title: "Science Confirms: Regular Yoga Boosts Brain Function",
            summary: "A new study reveals that practicing yoga for just 20 minutes a day can significantly improve cognitive abilities and memory retention.",
            source: "Health Science Journal",
        },
        {
            id: 2,
            title: "Global Yoga Fest 2026 Announced",
            summary: "The world's largest gathering of yoga instructors and practitioners will take place in Bali this November. Early bird tickets available now.",
            source: "Yoga Daily",
        },
    ];

    const statusColors: Record<string, string> = {
        PENDING: "bg-yellow-500/20 text-yellow-300 border-yellow-500/30",
        CONFIRMED: "bg-primary-500/20 text-primary-400 border-primary-500/30",
    };

    const typeLabels: Record<string, string> = {
        CONSULTATION: "Consultation",
        FOLLOW_UP: "Follow Up",
        CHECKUP: "Checkup",
        EMERGENCY: "Emergency",
        TELECONSULTATION: "Teleconsultation",
    };

    return (
        <div className="relative min-h-screen text-zinc-100 font-sans overflow-hidden">
            {/* Background */}
            <div className="fixed inset-0 z-[-1]">
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

            <div className="relative z-10 px-6 py-8 md:px-12 max-w-7xl mx-auto space-y-10">

                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-zinc-800 pb-8 backdrop-blur-sm rounded-2xl p-8 bg-zinc-950/60">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-thin tracking-tight mb-2">
                                Namaste, <span className="text-primary-400 uppercase font-thin">{userName}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl">
                                Find your balance today. Your journey to inner peace continues.
                            </p>
                        </motion.div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 text-primary-400 mb-1">
                            <Calendar className="w-4 h-4" />
                            <span className="text-sm font-light tracking-wider uppercase">{formattedDate}</span>
                        </div>
                        <div className="text-3xl md:text-5xl font-thin tracking-tighter tabular-nums text-white">
                            {formattedTime}
                        </div>
                    </div>
                </header>

                {/* Main Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                    {/* Left Column */}
                    <div className="space-y-6">

                        {/* Countdown Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="group relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-950/60 backdrop-blur-xl"
                        >
                            <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-primary-500/50 to-transparent opacity-50 group-hover:opacity-100 transition-opacity" />

                            <div className="p-8 flex flex-col items-center text-center">
                                <h3 className="text-xs font-bold uppercase tracking-[0.15em] text-primary-400 mb-6">International Day of Yoga</h3>

                                {timeUntilYogaDay ? (
                                    <div className="grid grid-cols-4 gap-4 w-full">
                                        <TimeUnit value={timeUntilYogaDay.days} label="Days" />
                                        <TimeUnit value={timeUntilYogaDay.hours} label="Hours" />
                                        <TimeUnit value={timeUntilYogaDay.minutes} label="Mins" />
                                        <TimeUnit value={timeUntilYogaDay.seconds} label="Secs" />
                                    </div>
                                ) : (
                                    <div className="animate-pulse h-16 w-full bg-zinc-800/50 rounded-xl" />
                                )}

                                <p className="mt-6 text-xs text-zinc-500 font-medium">June 21st • Global Celebration</p>
                            </div>
                        </motion.div>

                        {/* Benefits Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="rounded-2xl p-8 bg-zinc-950/60 backdrop-blur-xl border border-zinc-800 relative overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/5 rounded-full blur-3xl pointer-events-none" />
                            <h3 className="text-xl font-semibold mb-6">
                                Why Yoga Today?
                            </h3>
                            <ul className="space-y-4">
                                <BenefitItem text="Reduces cortisol levels & stress" />
                                <BenefitItem text="Boosts energy & metabolic rate" />
                                <BenefitItem text="Improves cardiovascular health" />
                                <BenefitItem text="Enhances flexibility & strength" />
                            </ul>

                            <div className="mt-8 pt-6 border-t border-zinc-800">
                                <Link href="/yoga">
                                    <GradientButton className="w-full text-white" variant="variant">Start Today&apos;s Session</GradientButton>
                                </Link>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Columns */}
                    <div className="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6">

                        {/* News Feed */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="md:col-span-2 rounded-2xl bg-zinc-950/60 backdrop-blur-xl border border-zinc-800 p-8"
                        >
                            <div className="mb-6">
                                <h2 className="text-2xl font-thin uppercase tracking-tight">Latest in <span className="text-primary-400">Yoga World</span></h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {yogaNews.map((news) => (
                                    <div key={news.id} className="group p-5 rounded-xl bg-zinc-900/50 border border-zinc-800 hover:bg-zinc-800/60 hover:border-zinc-700 transition-all cursor-pointer">
                                        <p className="text-xs font-bold text-primary-400 mb-2 uppercase tracking-wider">{news.source}</p>
                                        <h4 className="text-lg font-semibold leading-tight mb-2 group-hover:text-primary-300 transition-colors">{news.title}</h4>
                                        <p className="text-sm text-zinc-500 line-clamp-2">{news.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming Appointments */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="md:col-span-2 rounded-2xl bg-zinc-950/60 backdrop-blur-xl border border-zinc-800 p-8 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-xl font-semibold mb-6">
                                    Upcoming Appointments
                                </h3>

                                {appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {appointments.map((apt) => {
                                            const aptDate = new Date(apt.scheduledDate);
                                            return (
                                                <div key={apt.id} className="flex items-start gap-3 pb-4 border-b border-zinc-800 last:border-0 last:pb-0">
                                                    <div className="bg-primary-500/10 text-primary-400 rounded-lg p-2 text-center min-w-[50px]">
                                                        <span className="block text-xs font-bold uppercase">{aptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                        <span className="block text-lg font-bold leading-none">{aptDate.getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-0.5">
                                                            <h5 className="font-medium text-sm text-zinc-200 truncate">Dr. {apt.doctorName}</h5>
                                                            <span className={cn("text-[10px] font-bold uppercase px-1.5 py-0.5 rounded-full border", statusColors[apt.status] || "bg-zinc-500/20 text-zinc-300")}>
                                                                {apt.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-xs text-zinc-500 truncate">{apt.doctorSpecialization} • {typeLabels[apt.type] || apt.type}</p>
                                                        <div className="flex items-center gap-3 mt-1">
                                                            <div className="flex items-center gap-1 text-xs text-zinc-500">
                                                                <Clock className="w-3 h-3" /> {apt.scheduledTime}
                                                            </div>
                                                            {apt.meetingId && (
                                                                <Link href={`/appointments/call/${apt.meetingId}`} className="flex items-center gap-1 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                                                                    <Video className="w-3 h-3" /> Join Call
                                                                </Link>
                                                            )}
                                                        </div>
                                                        {apt.reason && (
                                                            <p className="text-xs text-zinc-600 mt-1 truncate">Reason: {apt.reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                        <div className="p-3 rounded-full bg-primary-500/10 mb-3">
                                            <Calendar className="w-6 h-6 text-primary-400" />
                                        </div>
                                        <p className="text-sm text-zinc-400 mb-1">No upcoming appointments</p>
                                        <p className="text-xs text-zinc-600">Book a consultation to get started</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-6">
                                <Link href="/appointments">
                                    <GradientButton className="w-full justify-center" variant="variant">
                                        {appointments.length > 0 ? 'View All Appointments' : 'Book an Appointment'}
                                    </GradientButton>
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>
            </div>
        </div>
    );
}

// ---------------- Helper Components ----------------

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-3xl lg:text-4xl font-thin text-white tabular-nums tracking-tighter">
                {value.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-bold uppercase text-zinc-500 tracking-wider mt-1">{label}</span>
        </div>
    )
}

function BenefitItem({ text }: { text: string }) {
    return (
        <li className="text-sm text-zinc-300">
            {text}
        </li>
    )
}
