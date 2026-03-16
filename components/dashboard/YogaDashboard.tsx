"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import ColorBends from "@/components/ui/ColorBends";
import { GradientButton } from "@/components/ui/gradient-button";
import { Calendar, Clock, Activity, Leaf, Sun, Heart, Stethoscope, Video, ClipboardList, BookOpen, Users } from "lucide-react";
import { cn } from "@/lib/utils";
import Link from "next/link";
import { DashboardHeroChat } from "./DashboardHeroChat";
import { OnboardingNotification } from "./OnboardingNotification";

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
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 border-b border-white/5 pb-10 backdrop-blur-[40px] saturate-[1.8] rounded-[2.5rem] p-10 bg-zinc-950/40 ring-1 ring-white/[0.05] shadow-[0_32px_64px_rgba(0,0,0,0.4)]">
                    <div>
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-4xl md:text-6xl font-extralight tracking-tight mb-2">
                                Namaste, <span className="text-primary-400 uppercase font-thin">{userName}</span>
                            </h1>
                            <p className="text-lg md:text-xl text-zinc-400 font-light max-w-2xl">
                                Find your balance today. Your journey to inner peace continues.
                            </p>
                        </motion.div>
                    </div>

                    <div className="text-right flex flex-col items-end">
                        <div className="flex items-center gap-2 text-primary-400/80 mb-2">
                            <Calendar className="w-3.5 h-3.5" />
                            <span className="text-[11px] font-medium tracking-[0.2em] uppercase opacity-70">{formattedDate}</span>
                        </div>
                        <div className="text-4xl md:text-5xl font-extralight tracking-tighter tabular-nums text-white/90">
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
                            className="group relative overflow-hidden rounded-[2rem] border border-white/[0.08] bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] ring-1 ring-white/[0.03] shadow-[0_20px_40px_rgba(0,0,0,0.3)]"
                        >
                            <div className="p-8 flex flex-col items-center text-center">
                                <h3 className="text-[10px] font-medium uppercase tracking-[0.2em] text-primary-400 mb-8 opacity-60">International Day of Yoga</h3>

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

                                <p className="mt-8 text-[10px] text-zinc-500 font-medium uppercase tracking-widest opacity-40">June 21st • Global Celebration</p>
                            </div>
                        </motion.div>

                        {/* Benefits Card */}
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="rounded-[2rem] p-8 bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] ring-1 ring-white/[0.03] shadow-[0_20px_40px_rgba(0,0,0,0.3)] relative overflow-hidden"
                        >
                            <div className="absolute -right-10 -top-10 w-40 h-40 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
                            <h3 className="text-xl font-medium mb-8 tracking-tight">
                                Why Yoga Today?
                            </h3>
                            <ul className="space-y-4">
                                <BenefitItem text="Reduces cortisol levels & stress" />
                                <BenefitItem text="Boosts energy & metabolic rate" />
                                <BenefitItem text="Improves cardiovascular health" />
                                <BenefitItem text="Enhances flexibility & strength" />
                            </ul>

                            <div className="mt-8 pt-6 border-t border-white/5">
                                <Link href="/yoga">
                                    <GradientButton className="w-full text-white rounded-2xl" variant="variant">Start Today&apos;s Session</GradientButton>
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
                            className="md:col-span-2 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] ring-1 ring-white/[0.03] shadow-[0_32px_64px_rgba(0,0,0,0.3)] p-10"
                        >
                            <div className="mb-8">
                                <h2 className="text-2xl font-extralight uppercase tracking-[0.1em]">Latest in <span className="text-primary-400 font-light">Yoga World</span></h2>
                            </div>

                            <div className="grid md:grid-cols-2 gap-6">
                                {yogaNews.map((news) => (
                                    <div key={news.id} className="group p-6 rounded-[1.5rem] bg-zinc-950/30 border border-white/[0.05] hover:bg-zinc-900/40 hover:border-white/10 transition-all cursor-pointer ring-1 ring-white/[0.02]">
                                        <p className="text-[10px] font-medium text-primary-400/80 mb-3 uppercase tracking-[0.2em] opacity-60">{news.source}</p>
                                        <h4 className="text-[17px] font-medium leading-snug mb-3 group-hover:text-primary-300 transition-colors tracking-tight">{news.title}</h4>
                                        <p className="text-sm text-zinc-500 font-light line-clamp-2 leading-relaxed">{news.summary}</p>
                                    </div>
                                ))}
                            </div>
                        </motion.div>

                        {/* Upcoming Appointments */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.5, duration: 0.5 }}
                            className="md:col-span-2 rounded-[2.5rem] bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] ring-1 ring-white/[0.03] shadow-[0_32px_64px_rgba(0,0,0,0.3)] p-10 flex flex-col justify-between"
                        >
                            <div>
                                <h3 className="text-xl font-medium mb-8 tracking-tight">
                                    Upcoming Appointments
                                </h3>

                                {appointments.length > 0 ? (
                                    <div className="space-y-4">
                                        {appointments.map((apt) => {
                                            const aptDate = new Date(apt.scheduledDate);
                                            return (
                                                <div key={apt.id} className="flex items-start gap-4 pb-6 border-b border-white/5 last:border-0 last:pb-0">
                                                    <div className="bg-primary-500/10 text-primary-400 rounded-2xl p-2.5 text-center min-w-[55px] ring-1 ring-primary-500/20 shadow-lg">
                                                        <span className="block text-[10px] font-bold uppercase tracking-wider opacity-60 font-sans">{aptDate.toLocaleDateString('en-US', { month: 'short' })}</span>
                                                        <span className="block text-xl font-bold leading-tight mt-0.5">{aptDate.getDate()}</span>
                                                    </div>
                                                    <div className="flex-1 min-w-0 pt-0.5">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h5 className="font-medium text-[15px] text-white/90 truncate tracking-tight">Dr. {apt.doctorName}</h5>
                                                            <span className={cn("text-[9px] font-medium uppercase px-2 py-0.5 rounded-full border tracking-[0.1em]", statusColors[apt.status] || "bg-zinc-500/20 text-zinc-300 border-zinc-500/30")}>
                                                                {apt.status}
                                                            </span>
                                                        </div>
                                                        <p className="text-[13px] text-zinc-500 font-light truncate">{apt.doctorSpecialization} • {typeLabels[apt.type] || apt.type}</p>
                                                        <div className="flex items-center gap-3 mt-1.5">
                                                            <div className="flex items-center gap-1.5 text-xs text-zinc-500 font-light">
                                                                <Clock className="w-3.5 h-3.5 opacity-60" /> {apt.scheduledTime}
                                                            </div>
                                                            {apt.meetingId && (
                                                                <Link href={`/appointments/call/${apt.meetingId}`} className="flex items-center gap-1.5 text-xs text-primary-400 hover:text-primary-300 transition-colors">
                                                                    <Video className="w-3.5 h-3.5" /> Join Call
                                                                </Link>
                                                            )}
                                                        </div>
                                                        {apt.reason && (
                                                            <p className="text-xs text-zinc-600 mt-1.5 truncate font-light">Reason: {apt.reason}</p>
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
                                        <p className="text-sm text-zinc-400 mb-1 font-medium">No upcoming appointments</p>
                                        <p className="text-xs text-zinc-600 font-light">Book a consultation to get started</p>
                                    </div>
                                )}
                            </div>
                            <div className="mt-8">
                                <Link href="/appointments">
                                    <GradientButton className="w-full justify-center rounded-2xl" variant="variant">
                                        {appointments.length > 0 ? 'View All Appointments' : 'Book an Appointment'}
                                    </GradientButton>
                                </Link>
                            </div>
                        </motion.div>

                    </div>
                </div>

                {/* Dashboard Hero Chat Section */}
                <DashboardHeroChat />

                {/* Quick Access Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-2">
                  <Link href="/plan">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.5 }}
                      className="group rounded-[2rem] p-6 bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] ring-1 ring-white/[0.03] shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.15] transition-all cursor-pointer"
                    >
                      <div className="p-3 bg-primary-600/10 rounded-xl w-fit mb-4">
                        <ClipboardList className="w-5 h-5 text-primary-400" />
                      </div>
                      <h3 className="text-sm font-medium text-health-text mb-1">View My Current Plan</h3>
                      <p className="text-xs text-zinc-500 font-light">Track daily adherence and view weekly progress</p>
                    </motion.div>
                  </Link>

                  <Link href="/nutritionists">
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.6 }}
                      className="group rounded-[2rem] p-6 bg-zinc-950/40 backdrop-blur-[40px] saturate-[1.8] border border-white/[0.08] ring-1 ring-white/[0.03] shadow-[0_20px_40px_rgba(0,0,0,0.3)] hover:border-white/[0.15] transition-all cursor-pointer"
                    >
                      <div className="p-3 bg-purple-500/10 rounded-xl w-fit mb-4">
                        <Users className="w-5 h-5 text-purple-400" />
                      </div>
                      <h3 className="text-sm font-medium text-health-text mb-1">Our Nutritionists</h3>
                      <p className="text-xs text-zinc-500 font-light">Meet certified health and nutrition experts</p>
                    </motion.div>
                  </Link>
                </div>
            </div>

            {/* Progressive Onboarding Notification */}
            <OnboardingNotification />
        </div>
    );
}

// ---------------- Helper Components ----------------

function TimeUnit({ value, label }: { value: number; label: string }) {
    return (
        <div className="flex flex-col items-center">
            <div className="text-4xl lg:text-5xl font-extralight text-white/90 tabular-nums tracking-tighter">
                {value.toString().padStart(2, '0')}
            </div>
            <span className="text-[10px] font-medium uppercase text-zinc-500 tracking-[0.2em] mt-2 opacity-50">{label}</span>
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
