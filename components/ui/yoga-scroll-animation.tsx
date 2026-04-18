'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';

const FRAME_COUNT = 120;
const DESKTOP_FRAME_TARGET = 60;
const MOBILE_FRAME_TARGET = 36;
const BATCH_SIZE = 4;

function getFrameNumbers(targetCount: number) {
  return Array.from({ length: targetCount }, (_, index) => (
    Math.min(
      FRAME_COUNT,
      1 + Math.round(((FRAME_COUNT - 1) * index) / Math.max(1, targetCount - 1))
    )
  ));
}

function getFrameSrc(frameNumber: number) {
  return `/frames/ezgif-frame-${frameNumber.toString().padStart(3, '0')}.png`;
}

function scheduleIdle(callback: () => void) {
  if ('requestIdleCallback' in window) {
    const id = window.requestIdleCallback(callback, { timeout: 1000 });
    return () => window.cancelIdleCallback(id);
  }

  const id = globalThis.setTimeout(callback, 120);
  return () => globalThis.clearTimeout(id);
}

export const YogaScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageMapRef = useRef<Map<number, HTMLImageElement>>(new Map());
  const [loadedImages, setLoadedImages] = useState<number>(0);
  const [frameNumbers, setFrameNumbers] = useState<number[]>([]);
  const [hasFirstFrame, setHasFirstFrame] = useState(false);

  // Framer Motion Scroll Tracking
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end end'],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001,
  });

  // Typography Animations
  // Block 1: Heading
  const block1Opacity = useTransform(smoothProgress, [0, 0.1, 0.25, 0.3], [0, 1, 1, 0]);
  const block1Y = useTransform(smoothProgress, [0, 0.3], [50, -50]);

  // Block 2: Description
  const block2Opacity = useTransform(smoothProgress, [0.35, 0.45, 0.6, 0.65], [0, 1, 1, 0]);
  const block2Y = useTransform(smoothProgress, [0.35, 0.65], [50, -50]);

  useEffect(() => {
    let cancelled = false;
    let cancelIdle: (() => void) | undefined;
    let currentLoaded = 0;

    const targetCount = window.matchMedia('(max-width: 640px)').matches
      ? MOBILE_FRAME_TARGET
      : DESKTOP_FRAME_TARGET;
    const frames = getFrameNumbers(targetCount);

    imageMapRef.current.clear();
    setFrameNumbers(frames);
    setLoadedImages(0);
    setHasFirstFrame(false);

    const loadFrame = (frameNumber: number, eager = false) => new Promise<void>((resolve) => {
      const img = new Image();
      img.decoding = 'async';
      img.loading = eager ? 'eager' : 'lazy';
      img.src = getFrameSrc(frameNumber);
      img.onload = () => {
        if (cancelled) {
          resolve();
          return;
        }
        imageMapRef.current.set(frameNumber, img);
        currentLoaded++;
        setLoadedImages(currentLoaded);
        if (frameNumber === frames[0]) {
          setHasFirstFrame(true);
        }
        resolve();
      };
      img.onerror = () => resolve();
    });

    loadFrame(frames[0], true).then(() => {
      let index = 1;

      const loadBatch = () => {
        if (cancelled || index >= frames.length) {
          return;
        }

        const batch = frames.slice(index, index + BATCH_SIZE);
        index += BATCH_SIZE;

        Promise.all(batch.map((frameNumber) => loadFrame(frameNumber))).finally(() => {
          if (!cancelled && index < frames.length) {
            cancelIdle = scheduleIdle(loadBatch);
          }
        });
      };

      cancelIdle = scheduleIdle(loadBatch);
    });

    return () => {
      cancelled = true;
      cancelIdle?.();
    };
  }, []);

  // Canvas Drawing Engine
  useEffect(() => {
    if (!hasFirstFrame || frameNumbers.length === 0 || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Calculate current frame index based on scroll progress
      const progress = smoothProgress.get();
      const frameIndex = Math.min(
        frameNumbers.length - 1,
        Math.floor(progress * frameNumbers.length)
      );

      let img = imageMapRef.current.get(frameNumbers[frameIndex]);

      if (!img) {
        for (let offset = 1; offset < frameNumbers.length; offset++) {
          const previousFrame = frameNumbers[frameIndex - offset];
          const nextFrame = frameNumbers[frameIndex + offset];
          img = previousFrame ? imageMapRef.current.get(previousFrame) : undefined;
          if (img) break;
          img = nextFrame ? imageMapRef.current.get(nextFrame) : undefined;
          if (img) break;
        }
      }

      if (img && img.complete) {
        const { width, height } = canvas;
        const imgRatio = img.width / img.height;
        const canvasRatio = width / height;

        let drawWidth, drawHeight, offsetX, offsetY;

        // Object-cover equivalent logic for canvas
        if (imgRatio > canvasRatio) {
          drawHeight = height;
          drawWidth = height * imgRatio;
          offsetX = (width - drawWidth) / 2;
          offsetY = 0;
        } else {
          drawWidth = width;
          drawHeight = width / imgRatio;
          offsetX = 0;
          offsetY = (height - drawHeight) / 2;
        }

        ctx.clearRect(0, 0, width, height);
        ctx.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animationFrameId);
  }, [frameNumbers, hasFirstFrame, smoothProgress]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        const pixelRatio = Math.min(window.devicePixelRatio || 1, 2);
        canvasRef.current.width = Math.floor(window.innerWidth * pixelRatio);
        canvasRef.current.height = Math.floor(window.innerHeight * pixelRatio);
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize setup

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressPercentage = frameNumbers.length > 0
    ? Math.round((loadedImages / frameNumbers.length) * 100)
    : 0;

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-black">
      {/* Sticky Scroll Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-black">
        {loadedImages < frameNumbers.length && (
          <div className="absolute bottom-6 left-1/2 z-30 w-56 max-w-[70vw] -translate-x-1/2 rounded-full border border-white/10 bg-black/55 px-4 py-3 backdrop-blur">
            <div className="mb-2 flex items-center justify-between text-[10px] font-semibold uppercase tracking-[0.18em] text-zinc-500">
              <span>Visual guide</span>
              <span>{progressPercentage}%</span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-zinc-900">
              <div
                className="h-full rounded-full bg-emerald-400 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}

        {/* Canvas Render Area */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full bg-black"
        />

        {/* Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/90 z-10 pointer-events-none" />

        {/* Seamless Edge Fades */}
        <div className="absolute top-0 w-full h-48 bg-gradient-to-b from-black to-transparent z-20 pointer-events-none" />
        <div className="absolute bottom-0 w-full h-48 bg-gradient-to-t from-black to-transparent z-20 pointer-events-none" />

        {/* Content Wrapper */}
        <div className="relative z-20 w-full h-full max-w-7xl mx-auto px-6">
          <div className="md:grid md:grid-cols-2 h-full w-full">
            {/* Left 50% empty for character */}
            <div className="hidden md:block"></div>

            {/* Right 50% / Mobile Text Container */}
            <div className="flex flex-col justify-center h-full max-md:absolute max-md:bottom-10 max-md:left-0 max-md:right-0 max-md:px-6 max-md:justify-end max-md:h-auto max-md:text-center max-md:items-center">
              
              {/* Block 1: Heading */}
              <motion.div
                style={{ opacity: block1Opacity, y: block1Y }}
                className="absolute max-md:relative w-full md:pr-12 pointer-events-none"
              >
                <p className="uppercase tracking-[0.2em] text-gray-500 text-xs mb-4 font-semibold">
                  MIND, BODY, BALANCE
                </p>
                <h2 className="text-5xl md:text-6xl tracking-tight text-white font-light leading-[1.1]">
                  Strength is built<br />in stillness
                </h2>
              </motion.div>

              {/* Block 2: Description */}
              <motion.div
                style={{ opacity: block2Opacity, y: block2Y }}
                className="absolute max-md:relative w-full md:pr-12 pointer-events-none"
              >
                <p className="text-lg text-gray-300 leading-relaxed max-w-md max-md:mx-auto font-light">
                  Science-backed yoga flows, guided breathing exercises, and meditation routines customized to your body and goals.
                </p>
              </motion.div>

              {/* Block 3: CTA removed as requested */}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
