'use client';

import Link from 'next/link';
import dynamic from 'next/dynamic';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { TubesBackground } from '@/components/ui/neon-flow';
import { LazyYogaScrollAnimation } from '@/components/landing/LazyYogaScrollAnimation';
import { ArrowDown, ArrowRight } from 'lucide-react';

const YogaView = dynamic(
  () => import('@/components/features/exercise/YogaView').then((mod) => mod.YogaView),
  {
    ssr: false,
    loading: () => (
      <div className="w-full rounded-3xl border border-white/10 bg-black/20 p-10 text-center text-zinc-500">
        Loading yoga generator...
      </div>
    ),
  }
);

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -80]);

  return (
    <div ref={containerRef} className="relative bg-[#050505]">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white tracking-tight">Yoga</span>
              <div className="text-sm font-medium text-zinc-500">
                <Typewriter
                  text={["Women", "for Everyone"]}
                  speed={70}
                  waitTime={2000}
                  deleteSpeed={40}
                  cursorChar="|"
                />
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/login"
                className="px-5 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
              >
                Sign In
              </Link>
              <GradientButton asChild className="min-w-[110px] px-6 py-2.5 h-10 text-sm rounded-full">
                <Link href="/register">
                  Get Started
                </Link>
              </GradientButton>
            </div>
          </div>
        </div>
      </nav>

      {/* ═══ Section 1: Hero with Neon Flow Background ═══ */}
      <motion.section
        style={{ opacity: heroOpacity, y: heroY }}
        className="relative z-10 min-h-screen"
      >
        <TubesBackground className="min-h-screen bg-transparent" enableClickInteraction={true}>
          <div className="flex flex-col items-center justify-center min-h-screen px-6 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, ease: [0.22, 1, 0.36, 1] }}
              className="max-w-2xl mx-auto pointer-events-auto"
            >
              <p className="text-[11px] font-bold text-zinc-400 uppercase tracking-[0.3em] mb-8">
                Your Personal Yoga Companion
              </p>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-light text-white tracking-tight leading-[1.1] mb-8 drop-shadow-[0_0_40px_rgba(0,0,0,0.8)]">
                A calmer way
                <br />
                to feel{' '}
                <span className="bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent font-normal">
                  alive
                </span>
              </h1>

              <p className="text-lg text-zinc-400 leading-relaxed max-w-md mx-auto mb-12 font-light drop-shadow-[0_0_20px_rgba(0,0,0,0.9)]">
                Personalized yoga plans, AI-guided routines, and expert consultations — all in one serene space.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                <GradientButton asChild className="h-14 px-10 text-base rounded-full min-w-[200px]">
                  <Link href="/register">
                    Begin Your Journey
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </GradientButton>
              </div>
            </motion.div>

            {/* Scroll indicator */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 2, duration: 1 }}
              className="absolute bottom-12 flex flex-col items-center gap-3 pointer-events-auto"
            >
              <p className="text-[10px] text-zinc-500 uppercase tracking-[0.25em] font-medium">Scroll</p>
              <motion.div
                animate={{ y: [0, 8, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              >
                <ArrowDown className="w-4 h-4 text-zinc-500" />
              </motion.div>
            </motion.div>
          </div>
        </TubesBackground>
      </motion.section>

      {/* ═══ Section 2: Interactive Yoga Scroll Animation ═══ */}
      <LazyYogaScrollAnimation />



      {/* ═══ Section 4: Interactive Yoga Showcase ═══ */}
      <section className="relative z-10 py-32 px-6 border-t border-white/[0.02]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <p className="text-[11px] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-green-300 uppercase tracking-[0.3em] mb-4">
              Try It Now
            </p>
            <h2 className="text-3xl lg:text-4xl font-light text-white tracking-tight leading-[1.2] mb-4">
              Generate a personalized yoga sequence
            </h2>
            <p className="text-zinc-500 font-light text-sm sm:text-base max-w-xl mx-auto">
              Experience the power of our AI wellness engine. Tell us what you need, and we&apos;ll create a custom routine.
            </p>
          </div>

          <div className="bg-zinc-950/40 backdrop-blur-xl border border-white/[0.05] rounded-[2.5rem] p-6 sm:p-10 shadow-[0_32px_64px_rgba(0,0,0,0.4)] relative overflow-hidden">
            {/* Subtle ambient glow behind the interactive component */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[80%] h-[80%] bg-emerald-500/5 rounded-full blur-[100px] pointer-events-none -z-10" />

            <YogaView isLandingPage={true} />
          </div>
        </div>
      </section>

      {/* ═══ Section 5: CTA ═══ */}
      <section className="relative z-10 py-32 px-6">
        <div className="max-w-xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-3xl lg:text-4xl font-light text-white tracking-tight mb-6">
              Begin today
            </h2>
            <p className="text-zinc-500 mb-10 font-light leading-relaxed">
              Join thousands who have transformed their life through yoga with a personalized, AI-powered experience.
            </p>
            <GradientButton asChild className="h-14 px-12 text-base rounded-full min-w-[220px]">
              <Link href="/register">
                Create Free Account
                <ArrowRight className="w-4 h-4 ml-3" />
              </Link>
            </GradientButton>
          </motion.div>
        </div>
      </section>

      {/* ═══ Footer ═══ */}
      <footer className="relative z-10 bg-[#050505] overflow-hidden">
        <div className="w-full flex items-center justify-center pt-20 pb-12">
          <h1
            className="
        font-extrabold
        tracking-[-0.04em]
        leading-[1]
        text-[18vw]
        md:text-[12vw]
        lg:text-[10vw]
        select-none
        whitespace-nowrap
        bg-gradient-to-r 
        from-white 
        via-zinc-100 
        to-zinc-200 
        bg-clip-text 
        text-transparent
        py-2
      "
          >
            Yoga-<Typewriter
              text={["Women", "for Everyone"]}
              speed={70}
              waitTime={2000}
              deleteSpeed={40}
              cursorChar=""
              showCursor={false}
            />
          </h1>
        </div>
      </footer>
    </div>
  );
}
