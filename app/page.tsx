'use client';

import Link from 'next/link';
import Image from 'next/image';
import { useRef } from 'react';
import { motion, useScroll, useTransform } from 'motion/react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { TubesBackground } from '@/components/ui/neon-flow';
import { ArrowDown, ArrowRight } from 'lucide-react';

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

      {/* ═══ Section 3: Features ═══ */}
      <motion.section
        style={{ opacity: featuresOpacity }}
        className="relative z-10 py-32 px-6"
      >
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-20">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-[0.3em] mb-6">
              What we offer
            </p>
            <h2 className="text-3xl lg:text-4xl font-light text-white tracking-tight">
              Everything you need, nothing you don&apos;t
            </h2>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            {[
              {
                title: 'AI Diet Plans',
                description: 'Nutrition plans tailored to your body type, dietary preferences, and health goals.',
              },
              {
                title: 'Guided Workouts',
                description: 'Exercise routines from strength training to yoga, adapting as you progress.',
              },
              {
                title: 'Doctor Consults',
                description: 'Book appointments with verified professionals and consult from anywhere.',
              },
            ].map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-50px' }}
                transition={{ delay: i * 0.15, duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="group rounded-3xl bg-zinc-900/50 border border-zinc-800/60 p-8 hover:border-zinc-700/60 transition-all duration-500"
              >
                <div className="w-10 h-10 rounded-xl bg-zinc-800/80 flex items-center justify-center mb-6 group-hover:bg-zinc-800 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-zinc-500 group-hover:bg-primary-500 transition-colors" />
                </div>
                <h3 className="text-base font-medium text-white mb-3 tracking-tight">
                  {feature.title}
                </h3>
                <p className="text-sm text-zinc-500 leading-relaxed font-light">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* ═══ Section 4: CTA ═══ */}
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
      <footer className="relative z-10 border-t border-zinc-900 py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-zinc-700 font-medium">
            Health Agent
          </p>
          <div className="flex items-center gap-6">
            <Link href="/login" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Sign In
            </Link>
            <Link href="/register" className="text-xs text-zinc-600 hover:text-zinc-400 transition-colors">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
