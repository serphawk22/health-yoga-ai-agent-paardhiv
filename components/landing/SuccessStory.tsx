'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { useScroll, useTransform, motion, MotionValue } from 'framer-motion';
import { ReactLenis } from 'lenis/react';
import { Quote } from 'lucide-react';

export function SuccessStory() {
    const containerRef = useRef<HTMLDivElement>(null);
    const { scrollYProgress } = useScroll({
        target: containerRef,
        offset: ['start start', 'end end'],
    });

    const stories = [
        {
            title: "THE STRUGGLE",
            image: "/images/struggle.svg", // Using local placeholder as fallback
            description: "Sarah was drowning in deadlines and neglecting her health. Fast food at her desk was the norm, and her energy was crashing by 2 PM.",
            quote: "I was exhausted and unproductive.",
        },
        {
            title: "THE DISCOVERY",
            image: "https://images.unsplash.com/photo-1555421689-491a97ff2040?q=80&w=1200&auto=format&fit=crop", // Looking at phone happy
            description: "She found Health Agent. It wasn't just another tracker; it was a partner that understood her busy schedule and tailored everything to her.",
            quote: "Finally, something that gets my lifestyle.",
        },
        {
            title: "THE PLAN",
            image: "https://images.unsplash.com/photo-1490645935967-10de6ba17061?q=80&w=1200&auto=format&fit=crop", // Healthy food
            description: "I&apos;ve tried so many diet apps, but they never felt adaptable to my real life. This AI agent actually listens. when I said I twisted my ankle, it immediately adjusted my workout plan to be low-impact and focused on recovery. It felt like having a real coach who cares.",
            quote: "Delicious food that actually gives me energy?",
        },
        {
            title: "THE SHIFT",
            image: "https://images.unsplash.com/photo-1518611012118-696072aa579a?q=80&w=1200&auto=format&fit=crop", // Active/Exercise
            description: "With better fuel and quick AI-suggested workouts, her foggy mornings turned into productive power hours. The brain fog vanished.",
            quote: "I can't believe how much more I get done.",
        },
        {
            title: "THE RESULT",
            image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?q=80&w=1200&auto=format&fit=crop", // Productive happy woman
            description: "Now, Sarah is crushing her goals. Focused, energetic, and healthy. Health Agent didn't just change her diet; it reclaimed her time.",
            quote: "I'm the most productive I've ever been.",
        }
    ];

    return (
        <ReactLenis root>
            <div className="bg-black">
                <header className='text-white relative w-full bg-black grid place-content-center h-[50vh] overflow-hidden'>
                    <div className='absolute bottom-0 left-0 right-0 top-0 bg-[linear-gradient(to_right,#4f4f4f2e_1px,transparent_1px),linear-gradient(to_bottom,#4f4f4f2e_1px,transparent_1px)] bg-size-[14px_24px] mask-[radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]'></div>

                    <div className="relative z-10 text-center">
                        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/10 text-primary-400 text-sm font-medium mb-4">
                            <Quote className="w-4 h-4" />
                            <span>Success Stories</span>
                        </div>
                        <h1 className='text-4xl md:text-6xl font-bold tracking-tight mb-4'>
                            Real Stories <br />
                            <span className="text-primary-500">Real Results</span>
                        </h1>
                        <p className="text-slate-400 max-w-xl mx-auto">
                            Scroll to see Sarah&apos;s transformation journey with Health Agent.
                        </p>
                    </div>
                </header>

                {/* Sticky Container */}
                <div ref={containerRef} className="relative h-[600vh] bg-black">
                    <div className="sticky top-0 h-screen overflow-hidden flex items-center justify-center">
                        {stories.map((story, index) => (
                            <StorySection
                                key={index}
                                story={story}
                                index={index}
                                total={stories.length}
                                scrollYProgress={scrollYProgress}
                            />
                        ))}
                    </div>
                </div>

                {/* Spacer for next section */}
                <div className="h-[20vh] bg-black" />
            </div>
        </ReactLenis>
    );
}

function StorySection({ story, index, total, scrollYProgress }: { story: any, index: number, total: number, scrollYProgress: MotionValue<number> }) {
    // Calculate the range of scroll where this story should be visible
    // Each story gets a segment of 1/total
    const step = 1 / total;
    const start = index * step;
    const end = start + step;

    // Opacity transition: Fade in at start, fade out at end
    // For the fast scroll effect, we want a tighter transition
    const opacity = useTransform(
        scrollYProgress,
        [start, start + step * 0.2, end - step * 0.2, end],
        [0, 1, 1, 0]
    );

    // Scale effect for a subtle "zoom in" feel
    const scale = useTransform(
        scrollYProgress,
        [start, end],
        [0.8, 1]
    );

    // Simple z-index management: active one is on top if needed, but opacity handles visibility mostly
    // const zIndex = useTransform(scrollYProgress, (v) => (v >= start && v < end ? 10 : 0));

    return (
        <motion.div
            style={{ opacity, scale }}
            className="absolute inset-0 w-full h-full flex flex-col justify-center items-center"
        >
            {/* Background Image - Full Screen */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={story.image}
                    alt={story.title}
                    fill
                    className="object-cover opacity-60"
                    priority={index === 0}
                />
                <div className="absolute inset-0 bg-black/60 z-10" /> {/* Dark Overlay */}
            </div>

            {/* Text Content */}
            <div className="relative z-20 text-center px-4 max-w-4xl">
                <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter mb-8 drop-shadow-2xl">
                    {story.title}
                </h2>

                <div className="space-y-6">
                    <p className="text-2xl md:text-3xl text-white/90 font-medium leading-relaxed drop-shadow-lg">
                        {story.description}
                    </p>
                    <div className="inline-block relative">
                        <p className="text-xl md:text-2xl text-primary-400 italic font-serif">
                            &quot;{story.quote}&quot;
                        </p>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
