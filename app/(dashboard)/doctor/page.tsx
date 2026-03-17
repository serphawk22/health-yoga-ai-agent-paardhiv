'use client';

import { useState, useEffect } from 'react';
import { getUser } from '@/lib/actions/auth';
import { getDoctorStats, getDoctorTodayAppointments } from '@/lib/actions/doctor';
import { Loader2, Calendar, User, Clock, Activity, ArrowRight, CheckCircle, TrendingUp, Video } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export default function DoctorDashboard() {
    const [stats, setStats] = useState({
        upcomingAppointments: 0,
        totalPatients: 0,
        patientsTreatedToday: 0
    });
    const [todaySchedule, setTodaySchedule] = useState<any[]>([]);
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function loadData() {
            setIsLoading(true);
            const [statsResult, scheduleResult, userData] = await Promise.all([
                getDoctorStats(),
                getDoctorTodayAppointments(),
                getUser()
            ]);

            if (statsResult.success && statsResult.data) setStats(statsResult.data);
            if (scheduleResult.success && scheduleResult.data) setTodaySchedule(scheduleResult.data);
            if (userData) setUser(userData);
            setIsLoading(false);
        }
        loadData();
    }, []);

    const timeOfDay = new Date().getHours() < 12 ? 'Morning' : new Date().getHours() < 18 ? 'Afternoon' : 'Evening';

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Preparing Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-12 animate-fadeIn relative">
            {/* HUD Header Greeting */}
            <div className="relative rounded-[3rem] overflow-hidden bg-zinc-900/50 border border-white/5 p-8 md:p-12 backdrop-blur-3xl">
                <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 border border-primary-500/20 text-primary-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                            Operational Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
                            Good {timeOfDay}, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600">Dr. {user?.name.split(' ')[0]}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Global Status</p>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                <span className="text-sm font-bold text-white">Active Practice</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Today's Consults", val: stats.patientsTreatedToday, sub: "Completed sessions", icon: CheckCircle, color: "text-green-400", bg: "bg-green-400/10" },
                    { label: "Active Roster", val: stats.totalPatients, sub: "Unique patient IDs", icon: User, color: "text-primary-400", bg: "bg-primary-400/10" },
                    { label: "Pending Intake", val: stats.upcomingAppointments, sub: "Future bookings", icon: Calendar, color: "text-blue-400", bg: "bg-blue-400/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-zinc-900/40 border border-white/5 rounded-[2.5rem] p-8 hover:bg-zinc-900 transition-all duration-500"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl border border-white/5", stat.bg, stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2 text-green-400 font-bold text-xs uppercase tracking-widest">
                                <TrendingUp className="w-3 h-3" /> Growth
                            </div>
                        </div>
                        <h3 className="text-4xl font-black text-white mb-1 tabular-nums">{stat.val}</h3>
                        <p className="text-xs font-black text-zinc-500 uppercase tracking-widest">{stat.label}</p>
                        <div className="mt-6 pt-6 border-t border-white/5 text-[10px] font-bold text-zinc-600 uppercase tracking-widest group-hover:text-zinc-400 transition-colors">
                            {stat.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-black text-white uppercase tracking-widest">Today&apos;s Schedule</h2>
                        <Link href="/appointments" className="text-primary-400 text-xs font-black uppercase tracking-widest hover:text-primary-300 transition-colors">See Full Agenda →</Link>
                    </div>

                    <div className="space-y-4">
                        {todaySchedule.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {todaySchedule.map((appt, i) => (
                                    <div key={i} className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-zinc-900/50 transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-2xl bg-zinc-800 border border-white/5 flex items-center justify-center font-black text-zinc-500 group-hover:text-primary-400 transition-colors">
                                                {appt.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-bold text-white mb-1">{appt.user.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2">
                                                        <Clock className="w-3.5 h-3.5 text-zinc-500" />
                                                        <span className="text-xs font-bold text-zinc-400">{appt.scheduledTime}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-zinc-800" />
                                                    <span className="text-[10px] font-black text-primary-500 uppercase tracking-widest">{appt.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/appointments/call/${appt.meetingId}`}
                                            className="h-14 px-8 rounded-2xl bg-primary-600 hover:bg-primary-500 text-white flex items-center gap-3 transition-all active:scale-95 shadow-[0_8px_32px_rgba(37,99,235,0.3)] w-full sm:w-auto justify-center"
                                        >
                                            <Video className="w-4 h-4" />
                                            <span className="font-black uppercase tracking-widest text-xs">Launch Space</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-zinc-900/30 border border-white/5 rounded-[2.5rem] p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-zinc-900 border border-white/5 rounded-full flex items-center justify-center mx-auto">
                                    <Activity className="w-8 h-8 text-zinc-800" />
                                </div>
                                <div>
                                    <h4 className="text-white font-bold text-xl">Quiet Day Ahead</h4>
                                    <p className="text-zinc-500 mt-2 text-sm max-w-xs mx-auto">Your schedule is currently clear for the next few hours. Use this time to update patient records or explore the marketplace.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-xl font-black text-white uppercase tracking-widest px-2">Navigation</h2>
                    <div className="space-y-3">
                        {[
                            { name: 'My Patient Roster', href: '/doctor/patients', icon: User, desc: 'Manage histories & chats' },
                            { name: 'Practice Hours', href: '/doctor/availability', icon: Clock, desc: 'Set your consultation times' },
                            { name: 'Health Marketplace', href: '/marketplace', icon: ArrowRight, desc: 'Browse health inventory' }
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="flex items-center gap-5 p-5 bg-white/[0.03] border border-white/5 rounded-3xl hover:bg-white/[0.05] hover:border-primary-500/30 transition-all group"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-white/5 flex items-center justify-center text-zinc-500 group-hover:text-primary-400 group-hover:border-primary-500/20 transition-all">
                                    <link.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-bold text-white group-hover:text-primary-400 transition-colors">{link.name}</h4>
                                    <p className="text-[10px] text-zinc-600 uppercase tracking-widest font-black mt-1">{link.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
