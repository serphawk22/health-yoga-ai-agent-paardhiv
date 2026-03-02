'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { TubesBackground } from '@/components/ui/neon-flow';
import { ArrowDown, ArrowRight } from 'lucide-react';
import { YogaView } from '@/components/features/exercise/YogaView';

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement>(null);
  const yogaSectionRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const heroOpacity = useTransform(scrollYProgress, [0, 0.25], [1, 0]);
  const heroY = useTransform(scrollYProgress, [0, 0.25], [0, -80]);
  const yogaScale = useTransform(scrollYProgress, [0.2, 0.5], [0.9, 1]);
  const yogaOpacity = useTransform(scrollYProgress, [0.2, 0.4], [0, 1]);
  const featuresOpacity = useTransform(scrollYProgress, [0.55, 0.7], [0, 1]);

  return (
    <div ref={containerRef} className="relative bg-[#050505]">

      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50">
        <div className="max-w-6xl mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div className="flex items-center gap-2">
              <span className="text-lg font-semibold text-white tracking-tight">Health</span>
              <div className="text-sm font-medium text-zinc-500">
                <Typewriter
                  text={["Agent", "Partner", "Guide"]}
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
                Your Personal Wellness Companion
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
                Personalized health plans, AI-guided routines, and expert consultations — all in one serene space.
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

      {/* ═══ Section 2: Yoga Hero Image ═══ */}
      <motion.section
        ref={yogaSectionRef}
        style={{ scale: yogaScale, opacity: yogaOpacity }}
        className="relative z-10 min-h-screen flex items-center justify-center px-6"
      >
        <div className="max-w-5xl mx-auto w-full">
          <div className="grid md:grid-cols-2 gap-16 items-center">
            {/* Image */}
            <div className="relative order-2 md:order-1">
              <div className="relative aspect-[3/4] rounded-[2rem] overflow-hidden">
                {/* Soft glow behind image */}
                <div className="absolute inset-0 -m-8 bg-gradient-to-br from-primary-500/5 via-transparent to-blue-500/5 rounded-[3rem] blur-2xl" />
                <Image
                  src="https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=800&q=80&auto=format&fit=crop"
                  alt="Woman in a serene yoga pose"
                  fill
                  className="object-cover rounded-[2rem] relative z-10"
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                {/* Overlay fades */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-[#050505] via-transparent to-transparent opacity-60" />
                <div className="absolute inset-0 z-20 bg-gradient-to-r from-[#050505] via-transparent to-transparent opacity-30" />
              </div>
            </div>

            {/* Text */}
            <div className="order-1 md:order-2 space-y-8">
              <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em]">
                Mind, Body, Balance
              </p>
              <h2 className="text-4xl lg:text-5xl font-light text-white tracking-tight leading-[1.15]">
                Strength is built
                <br />
                in stillness
              </h2>
              <p className="text-zinc-500 leading-relaxed max-w-sm font-light">
                Science-backed yoga flows, guided breathing exercises, and meditation routines customized to your body and goals.
              </p>
              <div className="flex items-center gap-6 pt-2">
                <GradientButton asChild variant="variant" className="h-12 px-8 text-sm rounded-full min-w-0">
                  <Link href="/register">
                    Start Free
                  </Link>
                </GradientButton>
                <Link
                  href="/login"
                  className="text-sm text-zinc-500 hover:text-white transition-colors font-medium flex items-center gap-2"
                >
                  Learn more <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </motion.section>



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
              Join thousands who have transformed their health with a personalized, AI-powered experience.
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
        <div className="w-full flex items-center justify-center pt-32 pb-20">
          <h1
            className="
        font-extrabold
        tracking-[-0.04em]
        leading-[1]
        text-[24vw]
        md:text-[18vw]
        lg:text-[14vw]
        select-none
        whitespace-nowrap
        bg-gradient-to-r 
        from-white 
        via-zinc-300 
        to-zinc-500 
        bg-clip-text 
        text-transparent
        py-4
      "
          >
            Health-Agent
          </h1>
        </div>
      </footer>
    </div>
  );
}
