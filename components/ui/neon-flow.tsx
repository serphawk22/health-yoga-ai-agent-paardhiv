'use client';

import React, { useEffect, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

// Helper for random colors on click interaction
const randomColors = (count: number) => {
    return new Array(count)
        .fill(0)
        .map(() => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0'));
};

interface TubesBackgroundProps {
    children?: React.ReactNode;
    className?: string;
    enableClickInteraction?: boolean;
}

export function TubesBackground({
    children,
    className,
    enableClickInteraction = true,
}: TubesBackgroundProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isLoaded, setIsLoaded] = useState(false);
    const tubesRef = useRef<any>(null);

    useEffect(() => {
        let mounted = true;
        let cleanup: (() => void) | undefined;
        let cancelStart: (() => void) | undefined;

        const initTubes = async () => {
            if (!canvasRef.current) return;

            try {
                // Dynamic CDN import for the Three.js tubes cursor effect
                /* eslint-disable */
                const module = await import(
                    /* webpackIgnore: true */
                    // @ts-ignore
                    'https://cdn.jsdelivr.net/npm/threejs-components@0.0.19/build/cursors/tubes1.min.js'
                );
                /* eslint-enable */
                const TubesCursor = module.default;

                if (!mounted) return;

                const app = TubesCursor(canvasRef.current, {
                    tubes: {
                        colors: ['#f967fb', '#53bc28', '#6958d5'],
                        lights: {
                            intensity: 200,
                            colors: ['#83f36e', '#fe8a2e', '#ff008a', '#60aed5'],
                        },
                    },
                });

                tubesRef.current = app;
                setIsLoaded(true);

                const handleResize = () => {
                    // The library handles its own resize internally
                };

                window.addEventListener('resize', handleResize);

                cleanup = () => {
                    window.removeEventListener('resize', handleResize);
                    tubesRef.current = null;
                };
            } catch (error) {
                console.error('Failed to load TubesCursor:', error);
            }
        };

        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const isSmallScreen = window.matchMedia('(max-width: 640px)').matches;

        if (!prefersReducedMotion && !isSmallScreen) {
            if ('requestIdleCallback' in window) {
                const id = window.requestIdleCallback(initTubes, { timeout: 1200 });
                cancelStart = () => window.cancelIdleCallback(id);
            } else {
                const id = globalThis.setTimeout(initTubes, 500);
                cancelStart = () => globalThis.clearTimeout(id);
            }
        }

        return () => {
            mounted = false;
            if (cancelStart) cancelStart();
            if (cleanup) cleanup();
        };
    }, []);

    const handleClick = () => {
        if (!enableClickInteraction || !tubesRef.current) return;

        const colors = randomColors(3);
        const lightsColors = randomColors(4);

        tubesRef.current.tubes.setColors(colors);
        tubesRef.current.tubes.setLightsColors(lightsColors);
    };

    return (
        <div
            className={cn('relative w-full h-full min-h-[400px] overflow-hidden bg-background', className)}
            onClick={handleClick}
        >
            {!isLoaded && (
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(34,197,94,0.16),transparent_32%),radial-gradient(circle_at_70%_65%,rgba(14,165,233,0.12),transparent_34%),linear-gradient(180deg,#050505,#000)]" />
            )}
            <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full block"
                style={{ touchAction: 'none' }}
            />

            {/* Content Overlay */}
            <div className="relative z-10 w-full h-full pointer-events-none">
                {children}
            </div>
        </div>
    );
}

export default TubesBackground;
