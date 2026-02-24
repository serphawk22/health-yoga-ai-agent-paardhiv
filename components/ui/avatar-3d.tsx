'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Environment, RoundedBox, Sphere, Capsule, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { AvatarConfig } from './avatar-builder';

/* ═══════════════════════════════════════════════════════════
   Constants & Colour Maps
   ═══════════════════════════════════════════════════════════ */

const HAIR_COLOR_MAP: Record<string, string> = {
    '#FDEBD0': '#D4A843',
    '#F5CBA7': '#8B4513',
    '#E0AC69': '#3E2723',
    '#C68642': '#1A1A1A',
    '#8D5524': '#0F0F0F',
    '#5C3A1E': '#050505',
};

const CLOTHING_COLOR_MAP: Record<string, string> = {
    tshirt: '#3B82F6',
    hoodie: '#6366F1',
    formal: '#1E293B',
    tank: '#EF4444',
};

/* ═══════════════════════════════════════════════════════════
   Shared Materials (memoised per-component, never inline)
   ═══════════════════════════════════════════════════════════ */

function useMat(color: string, roughness = 0.55, metalness = 0) {
    return useMemo(
        () => new THREE.MeshStandardMaterial({ color, roughness, metalness }),
        [color, roughness, metalness],
    );
}

/* ═══════════════════════════════════════════════════════════
   Cone helper (drei doesn't expose <Cone/> directly)
   ═══════════════════════════════════════════════════════════ */

function Cone(props: {
    args: [number, number, number];
    position?: [number, number, number];
    rotation?: [number, number, number];
    material: THREE.Material;
}) {
    return (
        <mesh position={props.position} rotation={props.rotation} material={props.material}>
            <coneGeometry args={props.args} />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════════
   Cylinder helper
   ═══════════════════════════════════════════════════════════ */

function Cylinder(props: {
    args: [number, number, number, number?];
    position?: [number, number, number];
    rotation?: [number, number, number];
    material: THREE.Material;
}) {
    return (
        <mesh position={props.position} rotation={props.rotation} material={props.material}>
            <cylinderGeometry args={props.args} />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════════
   Hair
   ═══════════════════════════════════════════════════════════ */

function Hair({ type, color }: { type: string; color: string }) {
    const mat = useMat(color, 0.85);

    switch (type) {
        /* ── Male ── */
        case 'buzz':
            return (
                <mesh position={[0, 0, 0]} material={mat}>
                    <sphereGeometry args={[0.475, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.5]} />
                </mesh>
            );

        case 'short':
            return (
                <group>
                    <Sphere args={[0.48, 32, 32]} position={[0, 0.06, 0]} material={mat} />
                    <RoundedBox args={[0.84, 0.22, 0.84]} radius={0.08} position={[0, 0.28, 0]} material={mat} />
                </group>
            );

        case 'spiky':
            return (
                <group>
                    <Sphere args={[0.46, 32, 32]} position={[0, 0.04, 0]} material={mat} />
                    {[0, 0.22, -0.22, 0.16, -0.16].map((x, i) => (
                        <Cone key={i} args={[0.1, 0.32, 8]} position={[x, 0.38 + (i % 2) * 0.06, (i > 2 ? -0.12 : 0.04)]} material={mat} />
                    ))}
                </group>
            );

        case 'curly':
            return (
                <group>
                    {[[-0.24, 0.3, 0.08], [0, 0.34, 0.06], [0.24, 0.3, 0.08],
                      [-0.16, 0.28, -0.24], [0.16, 0.28, -0.24], [0, 0.22, -0.3],
                      [-0.3, 0.12, -0.14], [0.3, 0.12, -0.14]].map(([x, y, z], i) => (
                        <Sphere key={i} args={[0.18, 12, 12]} position={[x, y, z]} material={mat} />
                    ))}
                </group>
            );

        case 'slick':
            return (
                <group>
                    <Sphere args={[0.47, 32, 32]} position={[0, 0.04, -0.02]} material={mat} />
                    <RoundedBox args={[0.7, 0.12, 0.55]} radius={0.04} position={[0, -0.15, -0.28]} material={mat} />
                </group>
            );

        /* ── Female ── */
        case 'long':
            return (
                <group>
                    <Sphere args={[0.48, 32, 32]} position={[0, 0.03, 0]} material={mat} />
                    {/* Flowing sides */}
                    <Capsule args={[0.14, 0.7]} position={[-0.36, -0.25, -0.08]} material={mat} />
                    <Capsule args={[0.14, 0.7]} position={[0.36, -0.25, -0.08]} material={mat} />
                    {/* Back curtain */}
                    <RoundedBox args={[0.72, 0.9, 0.28]} radius={0.08} position={[0, -0.3, -0.3]} material={mat} />
                </group>
            );

        case 'bob':
            return (
                <group>
                    <Sphere args={[0.49, 32, 32]} position={[0, 0.02, 0]} material={mat} />
                    <RoundedBox args={[0.92, 0.5, 0.7]} radius={0.12} position={[0, -0.12, -0.06]} material={mat} />
                </group>
            );

        case 'ponytail':
            return (
                <group>
                    <Sphere args={[0.48, 32, 32]} position={[0, 0.02, 0]} material={mat} />
                    {/* tie + tail */}
                    <Sphere args={[0.12, 12, 12]} position={[0, 0.1, -0.46]} material={mat} />
                    <Capsule args={[0.1, 0.5]} position={[0, -0.25, -0.54]} rotation={[0.35, 0, 0]} material={mat} />
                </group>
            );

        case 'braids':
            return (
                <group>
                    <Sphere args={[0.48, 32, 32]} position={[0, 0.02, 0]} material={mat} />
                    <Capsule args={[0.08, 0.7]} position={[-0.32, -0.28, 0.06]} material={mat} />
                    <Capsule args={[0.08, 0.7]} position={[0.32, -0.28, 0.06]} material={mat} />
                </group>
            );

        case 'bun':
            return (
                <group>
                    <Sphere args={[0.48, 32, 32]} position={[0, 0.02, 0]} material={mat} />
                    <Sphere args={[0.22, 24, 24]} position={[0, 0.38, -0.22]} material={mat} />
                </group>
            );

        case 'none':
            return null;

        default:
            return <Sphere args={[0.47, 32, 32]} position={[0, 0.03, 0]} material={mat} />;
    }
}

/* ═══════════════════════════════════════════════════════════
   Eyes – white sclera + dark iris
   ═══════════════════════════════════════════════════════════ */

function Eyes() {
    const white = useMat('#f0f0f0', 0.3);
    const iris = useMat('#1a1a1a', 0.4);

    return (
        <group>
            {/* Left eye */}
            <Sphere args={[0.065, 16, 16]} position={[-0.12, 0.06, 0.38]} material={white} />
            <Sphere args={[0.04, 12, 12]} position={[-0.12, 0.06, 0.42]} material={iris} />
            {/* Right eye */}
            <Sphere args={[0.065, 16, 16]} position={[0.12, 0.06, 0.38]} material={white} />
            <Sphere args={[0.04, 12, 12]} position={[0.12, 0.06, 0.42]} material={iris} />
        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   Mouth (simple curved shape)
   ═══════════════════════════════════════════════════════════ */

function Mouth() {
    const mat = useMat('#c0616b', 0.5);
    return (
        <mesh position={[0, -0.14, 0.42]} scale={[1, 0.5, 1]}>
            <sphereGeometry args={[0.06, 16, 16, 0, Math.PI * 2, 0, Math.PI / 2]} />
            <primitive object={mat} attach="material" />
        </mesh>
    );
}

/* ═══════════════════════════════════════════════════════════
   Clothing Extras  (hoodie hood, formal collar, etc.)
   ═══════════════════════════════════════════════════════════ */

function ClothingExtras({ type, clothesMat }: { type: string; clothesMat: THREE.Material }) {
    switch (type) {
        case 'hoodie':
            return (
                <group>
                    {/* Hood behind head */}
                    <RoundedBox args={[0.72, 0.45, 0.5]} radius={0.15} position={[0, 1.05, -0.2]} material={clothesMat} />
                </group>
            );
        case 'formal':
            return (
                <group>
                    {/* Collar points */}
                    <RoundedBox args={[0.22, 0.16, 0.12]} radius={0.03} position={[-0.2, 0.82, 0.28]} rotation={[0, 0, 0.3]} material={clothesMat} />
                    <RoundedBox args={[0.22, 0.16, 0.12]} radius={0.03} position={[0.2, 0.82, 0.28]} rotation={[0, 0, -0.3]} material={clothesMat} />
                </group>
            );
        default:
            return null;
    }
}

/* ═══════════════════════════════════════════════════════════
   Character Rig
   ═══════════════════════════════════════════════════════════ */

function CharacterRig({ config }: { config: AvatarConfig }) {
    const groupRef = useRef<THREE.Group>(null);
    const rightArmRef = useRef<THREE.Group>(null);
    const headRef = useRef<THREE.Group>(null);
    const phaseRef = useRef<'wave' | 'lower' | 'idle'>('wave');
    const armAngleRef = useRef(0);

    /* ── Materials (all memoised) ── */
    const skinMat = useMat(config.skinColor, 0.5);
    const hairColor = HAIR_COLOR_MAP[config.skinColor] ?? '#1A1A1A';
    const clothesColor = CLOTHING_COLOR_MAP[config.clothing] ?? '#3B82F6';
    const clothesMat = useMat(clothesColor, 0.65);
    const pantsMat = useMat('#1e293b', 0.7);
    const shoeMat = useMat('#111111', 0.8);

    /* ── Proportions ── */
    const isMale = config.gender === 'male';
    const shoulderW = isMale ? 0.38 : 0.34;
    const torsoW = isMale ? 0.9 : 0.78;
    const torsoH = 1.05;
    const hipW = isMale ? 0.75 : 0.82;

    /* ── Wave animation ── */
    const WAVE_SEC = 2.2;
    const LOWER_SPEED = 3.5;

    useFrame((state) => {
        if (!rightArmRef.current || !headRef.current || !groupRef.current) return;
        const t = state.clock.getElapsedTime();
        const dt = state.clock.getDelta();

        // Gentle idle breathing
        groupRef.current.position.y = Math.sin(t * 0.9) * 0.02;

        // Subtle head movement
        headRef.current.rotation.y = Math.sin(t * 0.45) * 0.05;
        headRef.current.rotation.x = Math.sin(t * 0.7) * 0.02;

        if (phaseRef.current === 'wave') {
            const raise = Math.PI - 0.5;
            rightArmRef.current.rotation.z = raise + Math.sin(t * 7) * 0.25;
            rightArmRef.current.rotation.x = Math.sin(t * 4.5) * 0.08;
            armAngleRef.current = rightArmRef.current.rotation.z;
            if (t > WAVE_SEC) phaseRef.current = 'lower';
        } else if (phaseRef.current === 'lower') {
            armAngleRef.current = THREE.MathUtils.lerp(armAngleRef.current, 0, dt * LOWER_SPEED);
            rightArmRef.current.rotation.z = armAngleRef.current;
            rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, dt * LOWER_SPEED);
            if (Math.abs(armAngleRef.current) < 0.015) {
                rightArmRef.current.rotation.z = 0;
                rightArmRef.current.rotation.x = 0;
                phaseRef.current = 'idle';
            }
        }
    });

    // Whether arms show skin or clothing
    const armShowsSkin = config.clothing === 'tank' || config.clothing === 'tshirt';
    const upperArmMat = armShowsSkin ? skinMat : clothesMat;
    const forearmMat = skinMat; // forearms always visible

    return (
        <group ref={groupRef}>

            {/* ═══ HEAD ═══ */}
            <group ref={headRef} position={[0, 1.22, 0]}>
                <Sphere args={[0.44, 32, 32]} material={skinMat} />
                {/* Nose */}
                <Sphere args={[0.06, 12, 12]} position={[0, -0.02, 0.42]} material={skinMat} />
                {/* Eyes */}
                <Eyes />
                {/* Mouth */}
                <Mouth />
                {/* Ears */}
                <Sphere args={[0.07, 12, 12]} position={[-0.42, 0, 0]} material={skinMat} />
                <Sphere args={[0.07, 12, 12]} position={[0.42, 0, 0]} material={skinMat} />
                {/* Hair */}
                <Hair type={config.hairType} color={hairColor} />
            </group>

            {/* ═══ NECK ═══ */}
            <Cylinder args={[0.14, 0.16, 0.2, 16]} position={[0, 0.88, 0]} material={skinMat} />

            {/* ═══ TORSO ═══ */}
            {/* Upper torso (shoulders) */}
            <RoundedBox args={[torsoW, torsoH * 0.55, 0.52]} radius={0.14} position={[0, 0.5, 0]} material={clothesMat} />
            {/* Lower torso / hip */}
            <RoundedBox args={[hipW, torsoH * 0.5, 0.48]} radius={0.12} position={[0, 0.08, 0]} material={clothesMat} />

            {/* Clothing extras */}
            <ClothingExtras type={config.clothing} clothesMat={clothesMat} />

            {/* ═══ LEFT ARM (resting) ═══ */}
            <group position={[-(shoulderW + 0.12), 0.6, 0]}>
                {/* Upper arm */}
                <Capsule args={[0.1, 0.38]} position={[0, -0.22, 0]} material={upperArmMat} />
                {/* Forearm */}
                <Capsule args={[0.09, 0.34]} position={[0, -0.6, 0.04]} material={forearmMat} />
                {/* Hand */}
                <Sphere args={[0.1, 12, 12]} position={[0, -0.82, 0.04]} material={skinMat} />
            </group>

            {/* ═══ RIGHT ARM (waving → idle) ═══ */}
            <group ref={rightArmRef} position={[(shoulderW + 0.12), 0.6, 0]}>
                <Capsule args={[0.1, 0.38]} position={[0, -0.22, 0]} material={upperArmMat} />
                <Capsule args={[0.09, 0.34]} position={[0, -0.6, 0.04]} material={forearmMat} />
                <Sphere args={[0.1, 12, 12]} position={[0, -0.82, 0.04]} material={skinMat} />
            </group>

            {/* ═══ LEGS ═══ */}
            <group position={[0, -0.48, 0]}>
                {/* Left leg */}
                <Capsule args={[0.12, 0.5]} position={[-0.22, -0.1, 0]} material={pantsMat} />
                <Capsule args={[0.11, 0.4]} position={[-0.22, -0.58, 0]} material={pantsMat} />
                {/* Left shoe */}
                <RoundedBox args={[0.2, 0.14, 0.3]} radius={0.04} position={[-0.22, -0.88, 0.06]} material={shoeMat} />

                {/* Right leg */}
                <Capsule args={[0.12, 0.5]} position={[0.22, -0.1, 0]} material={pantsMat} />
                <Capsule args={[0.11, 0.4]} position={[0.22, -0.58, 0]} material={pantsMat} />
                {/* Right shoe */}
                <RoundedBox args={[0.2, 0.14, 0.3]} radius={0.04} position={[0.22, -0.88, 0.06]} material={shoeMat} />
            </group>

        </group>
    );
}

/* ═══════════════════════════════════════════════════════════
   Avatar3D — Public Component
   ═══════════════════════════════════════════════════════════ */

export function Avatar3D({
    config,
    className,
}: {
    config: AvatarConfig;
    className?: string;
}) {
    return (
        <div className={className}>
            <Canvas
                shadows
                camera={{ position: [0, 0.6, 3.6], fov: 36 }}
                gl={{ antialias: true, alpha: true }}
                style={{ background: 'transparent' }}
            >
                {/* Lighting — soft 3-point */}
                <ambientLight intensity={0.55} />
                <directionalLight position={[3, 5, 4]} intensity={0.9} castShadow shadow-mapSize={512} />
                <directionalLight position={[-2, 3, -2]} intensity={0.3} />
                <Environment preset="city" />

                {/* Character */}
                <CharacterRig config={config} />

                {/* Ground shadow */}
                <ContactShadows position={[0, -1.6, 0]} opacity={0.35} scale={6} blur={2.5} far={3} />

                {/* Orbit */}
                <OrbitControls
                    enablePan={false}
                    enableZoom={false}
                    minPolarAngle={Math.PI / 2.8}
                    maxPolarAngle={Math.PI / 1.7}
                    target={[0, 0.3, 0]}
                />
            </Canvas>
        </div>
    );
}
