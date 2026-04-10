'use client';

import { AvailabilityManager } from '@/components/doctor/AvailabilityManager';
import { CalendarClock, Clock3, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

export default function AvailabilityPage() {
    const tips = [
        {
            title: 'Smart Buffers',
            desc: 'Keep a healthy pace with automatic breathing room between consultations.',
            icon: Sparkles
        },
        {
            title: 'Timezone Safe',
            desc: 'Displayed slots stay synced with your local timezone and booking rules.',
            icon: CalendarClock
        },
        {
            title: 'Instant Sync',
            desc: 'Updates apply immediately to patient booking availability.',
            icon: Clock3
        }
    ];

    return (
        <div className="max-w-6xl mx-auto pb-24 space-y-12 animate-fadeIn relative">
            <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />
            <div className="fixed bottom-0 right-1/4 w-[600px] h-[600px] bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none -z-10" />

            {/* HUD Header */}
            <div className="relative rounded-3xl overflow-hidden bg-white/5 border border-white/10 p-8 md:p-12 backdrop-blur-lg shadow-[0_0_40px_rgba(0,0,0,0.3)]">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] -mr-48 -mt-48 pointer-events-none" />

                <div className="relative z-10">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium uppercase tracking-wider mb-4">
                        Practice Hours
                    </div>
                    <h1 className="text-4xl md:text-6xl font-light text-white leading-tight tracking-tight">
                        Set Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-cyan-400 font-medium">Availability</span>
                    </h1>
                    <p className="text-gray-400 mt-4 text-lg max-w-2xl">
                        Configure your weekly consultation windows so patients can book only during hours that work for you.
                    </p>
                </div>
            </div>

            {/* Main Manager Container */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white/5 border border-white/10 rounded-3xl p-8 md:p-10 backdrop-blur-lg shadow-[0_0_30px_rgba(0,0,0,0.2)]"
            >
                <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                        <Clock3 className="w-6 h-6" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-medium text-white">Weekly Schedule</h2>
                        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider mt-1">Manage recurring appointment windows</p>
                    </div>
                </div>

                <AvailabilityManager />
            </motion.div>

            {/* Pro Tips / Info Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {tips.map((tip, i) => (
                    <div
                        key={i}
                        className="bg-white/5 border border-white/10 backdrop-blur-lg rounded-2xl p-6 hover:bg-white/10 hover:border-emerald-500/30 hover:shadow-[0_0_20px_rgba(16,185,129,0.1)] transition-all"
                    >
                        <tip.icon className="w-6 h-6 text-emerald-400 mb-4" />
                        <h4 className="font-medium text-white mb-2">{tip.title}</h4>
                        <p className="text-sm text-gray-400 leading-relaxed">{tip.desc}</p>
                    </div>
                ))}
            </div>
        </div>
    );
}
