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
                <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center backdrop-blur-lg">
                    <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
                </div>
                <p className="text-gray-400 font-medium uppercase tracking-wider text-xs">Preparing Dashboard...</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-12 animate-fadeIn relative">
            {/* Aurora Background Effects */}
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-purple-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-cyan-500/5 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* HUD Header Greeting */}
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-lg shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-end gap-10">
                    <div>
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-4">
                            Operational Hub
                        </div>
                        <h1 className="text-4xl md:text-6xl font-light text-white leading-tight tracking-tight">
                            Good {timeOfDay}, <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-medium">Dr. {user?.name.split(' ')[0]}</span>
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Global Status</p>
                            <div className="flex items-center gap-2 mt-1 justify-end">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
                                <span className="text-sm font-medium text-white">Active Practice</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Matrix Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {[
                    { label: "Today's Consults", val: stats.patientsTreatedToday, sub: "Completed sessions", icon: CheckCircle, color: "text-emerald-400", bg: "bg-emerald-400/10" },
                    { label: "Active Roster", val: stats.totalPatients, sub: "Unique patient IDs", icon: User, color: "text-cyan-400", bg: "bg-cyan-400/10" },
                    { label: "Pending Intake", val: stats.upcomingAppointments, sub: "Future bookings", icon: Calendar, color: "text-purple-400", bg: "bg-purple-400/10" }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="group bg-white/5 border border-white/10 rounded-2xl p-8 backdrop-blur-lg hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] transition-all duration-500"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className={cn("p-4 rounded-2xl border border-white/5", stat.bg, stat.color)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div className="flex items-center gap-2 text-emerald-400 font-medium text-xs uppercase tracking-wider">
                                <TrendingUp className="w-3 h-3" /> Growth
                            </div>
                        </div>
                        <h3 className="text-4xl font-light text-white mb-1 tabular-nums">{stat.val}</h3>
                        <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">{stat.label}</p>
                        <div className="mt-6 pt-6 border-t border-white/10 text-xs font-medium text-gray-400 uppercase tracking-wider group-hover:text-gray-300 transition-colors">
                            {stat.sub}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Quick Actions / Activity Feed */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 pt-8">
                <div className="lg:col-span-2 space-y-8">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xl font-medium text-white uppercase tracking-wider">Today&apos;s Schedule</h2>
                        <Link href="/appointments" className="text-emerald-400 text-xs font-medium uppercase tracking-wider hover:text-emerald-300 transition-colors">See Full Agenda →</Link>
                    </div>

                    <div className="space-y-4">
                        {todaySchedule.length > 0 ? (
                            <div className="grid grid-cols-1 gap-4">
                                {todaySchedule.map((appt, i) => (
                                    <div key={i} className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-6 flex flex-col sm:flex-row items-center justify-between gap-6 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group">
                                        <div className="flex items-center gap-6">
                                            <div className="w-16 h-16 rounded-full bg-white/5 border border-white/10 flex items-center justify-center font-medium text-gray-400 group-hover:text-emerald-400 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                                                {appt.user.name.split(' ').map((n: string) => n[0]).join('').slice(0, 2)}
                                            </div>
                                            <div>
                                                <h4 className="text-lg font-medium text-white mb-1">{appt.user.name}</h4>
                                                <div className="flex items-center gap-4">
                                                    <div className="flex items-center gap-2 text-gray-400 text-xs tracking-wider font-medium">
                                                        <Clock className="w-3.5 h-3.5" />
                                                        <span>{appt.scheduledTime}</span>
                                                    </div>
                                                    <div className="w-1 h-1 rounded-full bg-gray-500" />
                                                    <span className="text-[10px] font-medium text-emerald-400 uppercase tracking-wider">{appt.type}</span>
                                                </div>
                                            </div>
                                        </div>

                                        <Link
                                            href={`/appointments/call/${appt.meetingId}`}
                                            className="h-12 px-6 rounded-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-black flex items-center gap-3 transition-all active:scale-95 shadow-[0_0_20px_rgba(16,185,129,0.3)] w-full sm:w-auto justify-center font-medium"
                                        >
                                            <Video className="w-4 h-4" />
                                            <span className="uppercase tracking-wider text-xs">Launch Space</span>
                                        </Link>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-12 text-center space-y-6">
                                <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mx-auto shadow-[0_0_20px_rgba(255,255,255,0.02)]">
                                    <Activity className="w-8 h-8 text-gray-400" />
                                </div>
                                <div>
                                    <h4 className="text-white font-medium text-xl">Quiet Day Ahead</h4>
                                    <p className="text-gray-400 mt-2 text-sm max-w-xs mx-auto font-medium tracking-wider">Your schedule is currently clear for the next few hours. Use this time to update patient records or explore the marketplace.</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                <div className="space-y-8">
                    <h2 className="text-xl font-medium text-white uppercase tracking-wider px-2">Navigation</h2>
                    <div className="space-y-3">
                        {[
                            { name: 'My Patient Roster', href: '/doctor/patients', icon: User, desc: 'Manage histories & chats' },
                            { name: 'Practice Hours', href: '/doctor/availability', icon: Clock, desc: 'Set your consultation times' },
                            { name: 'Health Marketplace', href: '/marketplace', icon: ArrowRight, desc: 'Browse health inventory' }
                        ].map((link, i) => (
                            <Link
                                key={i}
                                href={link.href}
                                className="flex items-center gap-5 p-5 bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all group"
                            >
                                <div className="w-12 h-12 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-400 group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-all shadow-[0_0_15px_rgba(255,255,255,0.02)]">
                                    <link.icon className="w-5 h-5" />
                                </div>
                                <div>
                                    <h4 className="text-sm font-medium text-white group-hover:text-emerald-400 transition-colors">{link.name}</h4>
                                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-medium mt-1">{link.desc}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
