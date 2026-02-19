'use client'

import { Suspense, lazy } from 'react'
const Spline = lazy(() => import('@splinetool/react-spline'))

interface SplineSceneProps {
    scene: string
    className?: string
    scale?: number
}

export function SplineScene({ scene, className, scale = 0.35 }: SplineSceneProps) {
    return (
        <Suspense
            fallback={
                <div className="w-full h-full flex items-center justify-center">
                    <span className="loader"></span>
                </div>
            }
        >
            <div className="relative w-full h-full flex items-center justify-center overflow-visible">
                <div
                    className="absolute w-[300%] h-[300%] flex items-center justify-center pointer-events-auto"
                    style={{ transform: `scale(${scale})` }}
                >
                    <Spline
                        scene={scene}
                        className="w-full h-full"
                    />
                </div>
            </div>
        </Suspense>
    )
}
