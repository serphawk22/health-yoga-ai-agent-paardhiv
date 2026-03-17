'use client';

import { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { MessageCircle, Activity, BarChart3, Brain, Moon } from 'lucide-react';

export function NarrativeFeatures() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    return (
        <div ref={containerRef} className="relative bg-black text-white">
            {/* 
         Height is 300vh to allow for 3 distinctive 'Acts'.
         Each Act takes up screen space for scrolling.
      */}
            <div className="h-[200vh] relative">

                {/* Sticky Container */}
                <div className="sticky top-0 h-screen flex items-center justify-center overflow-hidden">

                    {/* Act 1: The Action (Interface) - First */}
                    <StoryAct
                        progress={scrollYProgress}
                        range={[0, 0.45]}
                        fadeRange={[0.42, 0.45]}
                    >
                        <div className="max-w-4xl text-center px-6">
                            <span className="text-blue-500 font-mono text-sm tracking-widest uppercase mb-4 block">The Interface</span>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-8">
                                Just ask.
                            </h2>

                            <div className="bg-neutral-900/80 border border-white/10 rounded-3xl p-6 md:p-8 max-w-2xl mx-auto backdrop-blur-md text-left shadow-2xl">
                                <div className="flex gap-4 mb-6">
                                    <div className="w-10 h-10 rounded-full bg-neutral-800 flex items-center justify-center shrink-0">
                                        <span className="text-neutral-400 text-sm">You</span>
                                    </div>
                                    <div className="bg-neutral-800 rounded-2xl rounded-tl-sm px-6 py-4 text-neutral-200">
                                        &quot;I tweaked my back yesterday. Can you adjust my workout plan for the week?&quot;
                                    </div>
                                </div>

                                <div className="flex gap-4">
                                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center shrink-0">
                                        <span className="text-white text-sm font-bold">AI</span>
                                    </div>
                                    <div className="space-y-4 w-full">
                                        <div className="bg-primary-900/20 border border-primary-500/20 rounded-2xl rounded-tl-sm px-6 py-4 text-primary-100">
                                            <p className="mb-2">I&apos;ve updated your schedule:</p>
                                            <ul className="list-disc pl-4 space-y-1 text-sm opacity-90">
                                                <li>Replaced Heavy Squats with Mobility Flow (15 min)</li>
                                                <li>Added &quot;Lower Back Relief&quot; Yoga session for Tuesday</li>
                                                <li>Reduced intensity on Wednesday&apos;s cardio</li>
                                            </ul>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </StoryAct>

                    {/* Act 2: The Peace (Result) - Second */}
                    <StoryAct
                        progress={scrollYProgress}
                        range={[0.55, 1]}
                        fadeRange={[0.95, 1]}
                    >
                        <div className="max-w-4xl text-center px-6">
                            <span className="text-emerald-500 font-mono text-sm tracking-widest uppercase mb-4 block">The Result</span>
                            <h2 className="text-5xl md:text-7xl font-bold tracking-tight mb-6">
                                Peace of mind.
                            </h2>
                            <div className="flex justify-center mb-8">
                                <Moon className="w-16 h-16 text-emerald-400 opacity-80" />
                            </div>
                            <p className="text-2xl md:text-3xl text-neutral-300 font-light leading-relaxed">
                                Sleep better. Live more. Let us worry about the data.
                            </p>
                        </div>
                    </StoryAct>

                </div>
            </div>
        </div>
    );
}

function StoryAct({
    children,
    progress,
    range,
    fadeRange
}: {
    children: React.ReactNode,
    progress: MotionValue<number>,
    range: [number, number],
    fadeRange: [number, number]
}) {
    // Opacity: Fade in at range[0], fade out at fadeRange[0] -> fadeRange[1]
    const opacity = useTransform(
        progress,
        [range[0], range[0] + 0.05, fadeRange[0], fadeRange[1]],
        [0, 1, 1, 0]
    );

    // Scale: Slight zoom in effect
    const scale = useTransform(
        progress,
        [range[0], fadeRange[1]],
        [0.9, 1.05]
    );

    // Y position to create a parallax feel
    const y = useTransform(
        progress,
        [range[0], fadeRange[1]],
        [50, -50]
    );

    // Pointer events logic: Only interactive when fully visible
    const pointerEvents = useTransform(
        opacity,
        (v) => v > 0.5 ? 'auto' : 'none'
    );

    return (
        <motion.div
            style={{ opacity, scale, y, pointerEvents }}
            className="absolute inset-0 flex items-center justify-center w-full h-full p-4"
        >
            {children}
        </motion.div>
    );
}
