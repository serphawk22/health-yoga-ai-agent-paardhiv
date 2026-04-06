'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useScroll, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';

const FRAME_COUNT = 120;
const INITIAL_FRAME = 1;

export const YogaScrollAnimation = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [loadedImages, setLoadedImages] = useState<number>(0);
  const [images] = useState<HTMLImageElement[]>([]);

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

  // Preload Images
  useEffect(() => {
    let currentLoaded = 0;
    const loadedImagesArr: HTMLImageElement[] = [];
    for (let i = INITIAL_FRAME; i <= FRAME_COUNT; i++) {
      const img = new Image();
      const frameNumber = i.toString().padStart(3, '0');
      img.src = `/frames/ezgif-frame-${frameNumber}.png`;
      img.onload = () => {
        currentLoaded++;
        setLoadedImages(currentLoaded);
      };
      loadedImagesArr.push(img);
    }
    // Only set images if we are in a fresh effect
    images.splice(0, images.length, ...loadedImagesArr);
  }, [images]);

  // Canvas Drawing Engine
  useEffect(() => {
    if (loadedImages < FRAME_COUNT || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;

    const render = () => {
      // Calculate current frame index based on scroll progress
      const progress = smoothProgress.get();
      const frameIndex = Math.min(
        FRAME_COUNT - 1,
        Math.floor(progress * FRAME_COUNT)
      );

      const img = images[frameIndex];
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
  }, [loadedImages, images, smoothProgress]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Initial resize setup

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const progressPercentage = (loadedImages / FRAME_COUNT) * 100;

  return (
    <div ref={containerRef} className="relative h-[400vh] w-full bg-black">
      {/* Preloader */}
      {loadedImages < FRAME_COUNT && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
          <div className="w-64 max-w-[80vw]">
            <p className="text-zinc-500 text-xs mb-3 text-center uppercase tracking-widest font-medium">
              Loading Experience...
            </p>
            <div className="h-1 w-full bg-zinc-900 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-300 ease-out"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Sticky Scroll Container */}
      <div className="sticky top-0 h-screen w-full overflow-hidden flex items-center bg-black">
        {/* Canvas Render Area */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
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
