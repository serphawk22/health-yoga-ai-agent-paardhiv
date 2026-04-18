'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';

const YogaScrollAnimation = dynamic(
  () => import('@/components/ui/yoga-scroll-animation').then((mod) => mod.YogaScrollAnimation),
  {
    ssr: false,
    loading: () => <ScrollAnimationPlaceholder isLoading />,
  }
);

function ScrollAnimationPlaceholder({ isLoading = false }: { isLoading?: boolean }) {
  return (
    <section className="relative h-[400vh] w-full bg-black">
      <div className="sticky top-0 flex h-screen items-center justify-center overflow-hidden bg-black px-6 text-center">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_40%,rgba(16,185,129,0.16),transparent_34%),linear-gradient(180deg,rgba(0,0,0,0.15),#000)]" />
        <div className="relative z-10 max-w-xl">
          <p className="mb-4 text-xs font-semibold uppercase tracking-[0.24em] text-emerald-400/70">
            Mind, body, balance
          </p>
          <h2 className="text-4xl font-light leading-tight tracking-tight text-white sm:text-5xl">
            Strength is built in stillness
          </h2>
          <p className="mx-auto mt-5 max-w-md text-sm leading-6 text-zinc-400 sm:text-base">
            Science-backed yoga flows, guided breathing, and meditation routines customized to your body and goals.
          </p>
          {isLoading && (
            <p className="mt-6 text-xs font-medium uppercase tracking-[0.2em] text-zinc-600">
              Preparing visual guide
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export function LazyYogaScrollAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    if (shouldLoad || !containerRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setShouldLoad(true);
          observer.disconnect();
        }
      },
      { threshold: 0.01 }
    );

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef}>
      {shouldLoad ? <YogaScrollAnimation /> : <ScrollAnimationPlaceholder />}
    </div>
  );
}
