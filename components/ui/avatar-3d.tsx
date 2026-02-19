'use client';

import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox, Sphere, Capsule, ContactShadows, Float } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig, HAIR_TYPES_MALE, HAIR_TYPES_FEMALE } from './avatar-builder';

/* ═══════════════════════════════════════════════════════════
   Utilities
   ═══════════════════════════════════════════════════════════ */

// Convert hex to THREE.Color
function useColor(hex: string) {
    return useMemo(() => new THREE.Color(hex), [hex]);
}

// Get hair color based on skin tone (logic tailored for 3D materials)
function get3DHairColor(skinColor: string): string {
    const map: Record<string, string> = {
        '#FDEBD0': '#E6BE8A', // Light -> Blonde/Light Brown
        '#F5CBA7': '#8B4513', // Fair -> Brown
        '#E0AC69': '#3E2723', // Medium -> Dark Brown
        '#C68642': '#1A1A1A', // Tan -> Black
        '#8D5524': '#0F0F0F', // Brown -> Black
        '#5C3A1E': '#050505', // Dark -> Jet Black
    };
    return map[skinColor] || '#1A1A1A';
}

function getClothingColors(type: string) {
    const map: Record<string, string> = {
        tshirt: '#3B82F6',
        hoodie: '#6B7280',
        formal: '#1F2937',
        tank: '#EF4444',
    };
    return map[type] || '#3B82F6';
}

/* ═══════════════════════════════════════════════════════════
   Character Parts
   ═══════════════════════════════════════════════════════════ */

function Hair({ type, color, gender }: { type: string; color: string; gender: string }) {
    const hairMaterial = useMemo(() => new THREE.MeshStandardMaterial({ color, roughness: 0.8 }), [color]);

    switch (type) {
        // ─── MALE STYLES ───
        case 'buzz':
            return (
                <Sphere args={[0.52, 32, 32]} position={[0, 0.05, 0]}>
                    <primitive object={hairMaterial} attach="material" />
                </Sphere>
            );
        case 'short':
            return (
                <group position={[0, 0.3, 0]}>
                    <RoundedBox args={[1.05, 0.4, 1.05]} radius={0.1}>
                        <primitive object={hairMaterial} attach="material" />
                    </RoundedBox>
                </group>
            );
        case 'spiky':
            return (
                <group position={[0, 0.45, 0]}>
                    <Cone position={[0, 0.1, 0]} args={[0.6, 0.6, 32]} material={hairMaterial} />
                </group>
            );
        case 'curly':
            return (
                <group position={[0, 0.1, 0]}>
                    {[-0.3, 0, 0.3].map((x, i) => (
                        <Sphere key={i} args={[0.25, 16, 16]} position={[x, 0.3, 0]} material={hairMaterial} />
                    ))}
                    {[-0.2, 0.2].map((x, i) => (
                        <Sphere key={`b-${i}`} args={[0.25, 16, 16]} position={[x, 0.3, -0.3]} material={hairMaterial} />
                    ))}
                </group>
            );

        // ─── FEMALE STYLES ───
        case 'long':
            return (
                <group>
                    <Sphere args={[0.52, 32, 32]} position={[0, 0, 0]} material={hairMaterial} />
                    <RoundedBox args={[1.1, 1.2, 0.4]} radius={0.1} position={[0, -0.4, -0.4]} material={hairMaterial} />
                </group>
            );
        case 'bob':
            return (
                <group>
                    <Sphere args={[0.52, 32, 32]} position={[0, 0, 0]} material={hairMaterial} />
                    <RoundedBox args={[1.2, 0.8, 0.9]} radius={0.1} position={[0, -0.1, -0.1]} material={hairMaterial} />
                </group>
            );
        case 'ponytail':
            return (
                <group>
                    <Sphere args={[0.51, 32, 32]} position={[0, 0, 0]} material={hairMaterial} />
                    <Sphere args={[0.3, 16, 16]} position={[0, 0.2, -0.5]} material={hairMaterial} />
                    <Cone args={[0.2, 0.8, 16]} position={[0, -0.2, -0.6]} rotation={[-0.5, 0, 0]} material={hairMaterial} />
                </group>
            );
        case 'bun':
            return (
                <group>
                    <Sphere args={[0.51, 32, 32]} position={[0, 0, 0]} material={hairMaterial} />
                    <Sphere args={[0.35, 32, 32]} position={[0, 0.4, -0.3]} material={hairMaterial} />
                </group>
            );

        default: // fallback / slick / braids
            return <Sphere args={[0.51, 32, 32]} position={[0, 0, 0]} material={hairMaterial} />;
    }
}

// Helper component for Cone since Drei doesn't expose it directly as a simple primitive like Sphere
function Cone({ args, position, rotation, material }: any) {
    return (
        <mesh position={position} rotation={rotation} material={material}>
            <coneGeometry args={args} />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main Rig
   ═══════════════════════════════════════════════════════════ */

function CharacterRig({ config }: { config: AvatarConfig }) {
    const group = useRef<THREE.Group>(null);
    const rightArm = useRef<THREE.Group>(null);
    const head = useRef<THREE.Group>(null);
    const wavePhase = useRef<'waving' | 'lowering' | 'idle'>('waving');
    const armAngle = useRef(0);

    const skinColor = config.skinColor;
    const hairColor = get3DHairColor(skinColor);
    const clothesColor = getClothingColors(config.clothing);

    const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: skinColor, roughness: 0.5 }), [skinColor]);
    const clothesMat = useMemo(() => new THREE.MeshStandardMaterial({ color: clothesColor, roughness: 0.7 }), [clothesColor]);

    const WAVE_DURATION = 2.5; // seconds of waving
    const LOWER_SPEED = 3;    // how fast the arm lowers

    // Animation Loop
    useFrame((state) => {
        if (!rightArm.current || !head.current || !group.current) return;
        const t = state.clock.getElapsedTime();

        // Gentle breathing
        group.current.position.y = Math.sin(t * 1) * 0.03 - 0.5;

        // Head subtle idle movement (always active)
        head.current.rotation.y = Math.sin(t * 0.5) * 0.06;
        head.current.rotation.x = Math.sin(t * 0.8) * 0.03;

        // Wave → Lower → Idle
        if (wavePhase.current === 'waving') {
            // Raise arm and wave back and forth
            const raiseAngle = Math.PI - 0.5;
            const waveSwing = Math.sin(t * 8) * 0.3;
            rightArm.current.rotation.z = raiseAngle + waveSwing;
            rightArm.current.rotation.x = Math.sin(t * 5) * 0.1;
            armAngle.current = rightArm.current.rotation.z;

            if (t > WAVE_DURATION) {
                wavePhase.current = 'lowering';
            }
        } else if (wavePhase.current === 'lowering') {
            // Smoothly lower the arm back to resting position (z ≈ 0)
            armAngle.current = THREE.MathUtils.lerp(armAngle.current, 0, state.clock.getDelta() * LOWER_SPEED);
            rightArm.current.rotation.z = armAngle.current;
            rightArm.current.rotation.x = THREE.MathUtils.lerp(rightArm.current.rotation.x, 0, state.clock.getDelta() * LOWER_SPEED);

            if (Math.abs(armAngle.current) < 0.02) {
                rightArm.current.rotation.z = 0;
                rightArm.current.rotation.x = 0;
                wavePhase.current = 'idle';
            }
        }
        // 'idle' → arm stays at rest, no further updates
    });

    const isMale = config.gender === 'male';
    const torsoWidth = isMale ? 1.4 : 1.2;
    const torsoHeight = 1.2;

    return (
        <group ref={group}>
            {/* ─── HEAD GROUP ─── */}
            <group ref={head} position={[0, 1.3, 0]}>
                {/* Face */}
                <Sphere args={[0.5, 32, 32]} material={skinMat} />
                {/* Nose */}
                <Sphere args={[0.08, 16, 16]} position={[0, 0, 0.45]} material={skinMat} />
                {/* Eyes */}
                <Sphere args={[0.08, 16, 16]} position={[-0.15, 0.05, 0.42]} material={new THREE.MeshStandardMaterial({ color: '#111' })} />
                <Sphere args={[0.08, 16, 16]} position={[0.15, 0.05, 0.42]} material={new THREE.MeshStandardMaterial({ color: '#111' })} />

                {/* Hair */}
                <Hair type={config.hairType} color={hairColor} gender={config.gender} />
            </group>

            {/* ─── BODY (Torso) ─── */}
            <RoundedBox
                args={[torsoWidth, torsoHeight, 0.8]}
                radius={0.2}
                position={[0, 0.2, 0]}
                material={clothesMat}
            />

            {/* ─── LEFT ARM (Idle) ─── */}
            <group position={[- (torsoWidth / 2 + 0.2), 0.6, 0]}>
                <Capsule args={[0.15, 0.9]} material={isMale && config.clothing !== 'tank' ? clothesMat : skinMat} position={[0, -0.45, 0]}>
                    {/* Using standard material prop on mesh if needed, but Capsule passes it down */}
                </Capsule>
            </group>

            {/* ─── RIGHT ARM (Waving) ─── */}
            {/* Pivot point at shoulder */}
            <group ref={rightArm} position={[(torsoWidth / 2 + 0.2), 0.6, 0]}>
                <Capsule args={[0.15, 0.9]} material={isMale && config.clothing !== 'tank' ? clothesMat : skinMat} position={[0, -0.45, 0]} />
                {/* Hand */}
                <Sphere args={[0.18, 16, 16]} position={[0, -1, 0]} material={skinMat} />
            </group>

            {/* ─── LEGS (Simple) ─── */}
            <group position={[0, -1, 0]}>
                {/* Left */}
                <RoundedBox args={[0.4, 1.2, 0.4]} position={[-0.3, 0, 0]} radius={0.1} material={new THREE.MeshStandardMaterial({ color: '#222' })} />
                {/* Right */}
                <RoundedBox args={[0.4, 1.2, 0.4]} position={[0.3, 0, 0]} radius={0.1} material={new THREE.MeshStandardMaterial({ color: '#222' })} />
            </group>

        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   Main Component
   ═══════════════════════════════════════════════════════════ */

export function Avatar3D({
    config,
    className
}: {
    config: AvatarConfig;
    className?: string;
}) {
    return (
        <div className={className}>
            <Canvas shadows camera={{ position: [0, 0, 4], fov: 40 }}>
                {/* Lighting */}
                <ambientLight intensity={0.7} />
                <spotLight position={[10, 10, 10]} angle={0.15} penumbra={1} intensity={1} castShadow />
                <Environment preset="city" />

                {/* Scene */}
                <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
                    <CharacterRig config={config} />
                </Float>

                <ContactShadows position={[0, -1.8, 0]} opacity={0.4} scale={10} blur={2.5} far={4} />

                {/* Controls */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 2.5}
                    maxPolarAngle={Math.PI / 1.5}
                />
            </Canvas>
        </div>
    );
}
