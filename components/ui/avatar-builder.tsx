'use client';

import React from 'react';
import { cn } from '@/lib/utils';

/* ═══════════════════════════════════════════════════════════
   Types & Defaults
   ═══════════════════════════════════════════════════════════ */

export interface AvatarConfig {
    gender: 'male' | 'female';
    skinColor: string;
    hairType: string;
    clothing: string;
}

export const DEFAULT_AVATAR: AvatarConfig = {
    gender: 'male',
    skinColor: '#C68642',
    hairType: 'short',
    clothing: 'tshirt',
};

export const SKIN_COLORS = [
    { label: 'Light', value: '#FDEBD0' },
    { label: 'Fair', value: '#F5CBA7' },
    { label: 'Medium', value: '#E0AC69' },
    { label: 'Tan', value: '#C68642' },
    { label: 'Brown', value: '#8D5524' },
    { label: 'Dark', value: '#5C3A1E' },
];

export const HAIR_TYPES_MALE = ['short', 'buzz', 'curly', 'spiky', 'slick', 'none'] as const;
export const HAIR_TYPES_FEMALE = ['long', 'bob', 'curly', 'ponytail', 'braids', 'bun'] as const;

export const CLOTHING_OPTIONS = [
    { label: 'T-Shirt', value: 'tshirt' },
    { label: 'Hoodie', value: 'hoodie' },
    { label: 'Formal', value: 'formal' },
    { label: 'Tank Top', value: 'tank' },
] as const;

/* ═══════════════════════════════════════════════════════════
   Color Utilities — single source of truth
   ═══════════════════════════════════════════════════════════ */

/** Darken a hex colour by a relative amount (0-1 scale). */
function darken(hex: string, factor: number): string {
    const num = parseInt(hex.replace('#', ''), 16);
    const r = Math.max(Math.round(((num >> 16) & 0xff) * (1 - factor)), 0);
    const g = Math.max(Math.round(((num >> 8) & 0xff) * (1 - factor)), 0);
    const b = Math.max(Math.round((num & 0xff) * (1 - factor)), 0);
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

/** Hair colour is always independent of skin tone — never derived from it. */
const HAIR_COLORS: Record<string, string> = {
    '#FDEBD0': '#C4975A', // Light skin → sandy blonde
    '#F5CBA7': '#7B4B2A', // Fair skin → medium brown
    '#E0AC69': '#3E2723', // Medium → dark brown
    '#C68642': '#1C1008', // Tan → near-black
    '#8D5524': '#0E0906', // Brown → black
    '#5C3A1E': '#080503', // Dark → jet black
};
function getHairColor(skinColor: string): string {
    return HAIR_COLORS[skinColor] ?? '#1C1008';
}

/** Clothing palette per type — independent of skin tone. */
const CLOTHING_PALETTE: Record<string, { fill: string; accent: string }> = {
    tshirt: { fill: '#3B82F6', accent: '#2563EB' },
    hoodie: { fill: '#6B7280', accent: '#4B5563' },
    formal: { fill: '#1F2937', accent: '#111827' },
    tank: { fill: '#EF4444', accent: '#DC2626' },
};

/* ═══════════════════════════════════════════════════════════
   Layout Constants
   ═══════════════════════════════════════════════════════════
   All coordinates are in a 200×250 viewBox.
   Centre-X = 100.  All Y values are relative to this grid.
*/
const CX = 100; // centre x

/* ═══════════════════════════════════════════════════════════
   SVG Layer 1 — Body & Skin
   ═══════════════════════════════════════════════════════════
   Renders: shoulders / torso / arms / neck / head / ears.
   Everything uses the SAME skinColor — zero separate darkening.
*/

function BodySkin({ skinColor, gender }: { skinColor: string; gender: string }) {
    const isFemale = gender === 'female';
    const shoulderW = isFemale ? 72 : 82;
    const headRx = isFemale ? 29 : 32;
    const headRy = isFemale ? 36 : 38;
    const headCy = 82;
    const neckW = 20;

    return (
        <g id="body-skin">
            {/* ── Torso (smooth rounded trapezoid) ── */}
            <path
                d={`
                    M ${CX - shoulderW / 2},155
                    Q ${CX - shoulderW / 2 - 4},158 ${CX - shoulderW / 2 + 4},200
                    L ${CX + shoulderW / 2 - 4},200
                    Q ${CX + shoulderW / 2 + 4},158 ${CX + shoulderW / 2},155
                    Z
                `}
                fill={skinColor}
            />

            {/* ── Shoulders (curved caps) ── */}
            <ellipse cx={CX - shoulderW / 2 + 2} cy={155} rx={12} ry={8} fill={skinColor} />
            <ellipse cx={CX + shoulderW / 2 - 2} cy={155} rx={12} ry={8} fill={skinColor} />

            {/* ── Left arm (capsule shape via rounded rect) ── */}
            <rect
                x={CX - shoulderW / 2 - 16}
                y={152}
                width={16}
                height={50}
                rx={8}
                ry={8}
                fill={skinColor}
            />
            {/* ── Right arm ── */}
            <rect
                x={CX + shoulderW / 2}
                y={152}
                width={16}
                height={50}
                rx={8}
                ry={8}
                fill={skinColor}
            />

            {/* ── Neck ── */}
            <rect
                x={CX - neckW / 2}
                y={headCy + headRy - 10}
                width={neckW}
                height={28}
                rx={neckW / 2}
                fill={skinColor}
            />

            {/* ── Head (single ellipse — same skinColor) ── */}
            <ellipse cx={CX} cy={headCy} rx={headRx} ry={headRy} fill={skinColor} />

            {/* ── Ears ── */}
            <ellipse cx={CX - headRx - 3} cy={headCy + 4} rx={5} ry={8} fill={skinColor} />
            <ellipse cx={CX + headRx + 3} cy={headCy + 4} rx={5} ry={8} fill={skinColor} />
        </g>
    );
}

/* ═══════════════════════════════════════════════════════════
   SVG Layer 2 — Clothing Variants
   ═══════════════════════════════════════════════════════════
   Each type renders a DIFFERENT shape group entirely.
   Clothing covers the torso but never the head/face/arms skin.
*/

function ClothingLayer({ type, skinColor }: { type: string; skinColor: string }) {
    const c = CLOTHING_PALETTE[type] ?? CLOTHING_PALETTE.tshirt;

    const variants: Record<string, React.ReactNode> = {
        tshirt: (
            <g id="clothing-tshirt">
                {/* Main body */}
                <path
                    d="M59,200 Q58,168 75,157 Q88,150 100,148 Q112,150 125,157 Q142,168 141,200 Z"
                    fill={c.fill}
                />
                {/* Left sleeve — rounded */}
                <path d="M59,162 Q50,160 44,170 Q40,180 46,190 L56,182 Q58,172 59,166 Z" fill={c.fill} />
                {/* Right sleeve — rounded */}
                <path d="M141,162 Q150,160 156,170 Q160,180 154,190 L144,182 Q142,172 141,166 Z" fill={c.fill} />
                {/* Round collar */}
                <path d="M88,149 Q100,157 112,149" fill="none" stroke={c.accent} strokeWidth={2} strokeLinecap="round" />
            </g>
        ),
        hoodie: (
            <g id="clothing-hoodie">
                {/* Main body — wider, more coverage */}
                <path
                    d="M54,200 Q53,162 74,153 Q88,147 100,146 Q112,147 126,153 Q147,162 146,200 Z"
                    fill={c.fill}
                />
                {/* Sleeves — longer */}
                <path d="M54,162 Q44,158 38,170 Q34,184 42,196 L54,184 Z" fill={c.fill} />
                <path d="M146,162 Q156,158 162,170 Q166,184 158,196 L146,184 Z" fill={c.fill} />
                {/* Hood — arches behind neck */}
                <path
                    d="M72,148 Q68,136 76,128 Q88,122 100,120 Q112,122 124,128 Q132,136 128,148"
                    fill={c.accent}
                    fillOpacity={0.55}
                />
                {/* Centre zipper line */}
                <line x1={CX} y1={146} x2={CX} y2={200} stroke={c.accent} strokeWidth={1.5} strokeDasharray="4,3" />
                {/* Kangaroo pocket */}
                <rect x={80} y={176} width={40} height={14} rx={6} fill={c.accent} fillOpacity={0.35} />
            </g>
        ),
        formal: (
            <g id="clothing-formal">
                {/* Jacket body */}
                <path
                    d="M56,200 Q56,164 76,155 Q88,150 100,148 Q112,150 124,155 Q144,164 144,200 Z"
                    fill={c.fill}
                />
                {/* Sleeves */}
                <path d="M56,164 Q46,162 40,174 Q36,186 44,196 L56,184 Z" fill={c.fill} />
                <path d="M144,164 Q154,162 160,174 Q164,186 156,196 L144,184 Z" fill={c.fill} />
                {/* White shirt underneath */}
                <path d="M88,149 L88,200 L112,200 L112,149 Q100,158 88,149 Z" fill="#E5E7EB" />
                {/* Left lapel */}
                <path d="M88,149 L80,168 L90,164 Z" fill="#F3F4F6" />
                {/* Right lapel */}
                <path d="M112,149 L120,168 L110,164 Z" fill="#F3F4F6" />
                {/* Tie */}
                <path d="M98,156 L102,156 L104,186 L100,190 L96,186 Z" fill="#DC2626" />
                {/* Buttons on jacket */}
                <circle cx={88} cy={174} r={1.5} fill={c.accent} />
                <circle cx={88} cy={184} r={1.5} fill={c.accent} />
                <circle cx={112} cy={174} r={1.5} fill={c.accent} />
                <circle cx={112} cy={184} r={1.5} fill={c.accent} />
            </g>
        ),
        tank: (
            <g id="clothing-tank">
                {/* Narrow body — no sleeves */}
                <path
                    d="M72,200 Q72,168 84,158 Q92,153 100,151 Q108,153 116,158 Q128,168 128,200 Z"
                    fill={c.fill}
                />
                {/* Straps */}
                <rect x={84} y={142} width={7} height={18} rx={3.5} fill={c.fill} />
                <rect x={109} y={142} width={7} height={18} rx={3.5} fill={c.fill} />
                {/* Exposed shoulders — show skin over the arm area */}
                <ellipse cx={CX - 36} cy={155} rx={10} ry={6} fill={skinColor} />
                <ellipse cx={CX + 36} cy={155} rx={10} ry={6} fill={skinColor} />
            </g>
        ),
    };

    return <>{variants[type] ?? variants.tshirt}</>;
}

/* ═══════════════════════════════════════════════════════════
   SVG Layer 3 — Face Details
   ═══════════════════════════════════════════════════════════
   Rendered ABOVE clothing but BELOW hair.
   Uses subtle darken() of the SAME skinColor — never a separate
   colour. Ensures nose/mouth lines stay relative, not absolute.
*/

function FaceDetails({ skinColor, gender }: { skinColor: string; gender: string }) {
    const cy = 82; // same headCy
    const lineColor = darken(skinColor, 0.28);
    const isFemale = gender === 'female';

    return (
        <g id="face-details">
            {/* Eyes */}
            <ellipse cx={CX - 10} cy={cy} rx={3} ry={3.2} fill="#1a1a1a" />
            <ellipse cx={CX + 10} cy={cy} rx={3} ry={3.2} fill="#1a1a1a" />
            {/* Eye highlights */}
            <circle cx={CX - 9} cy={cy - 1} r={1.2} fill="white" />
            <circle cx={CX + 11} cy={cy - 1} r={1.2} fill="white" />
            {/* Eyebrows */}
            <path
                d={`M${CX - 16},${cy - 9} Q${CX - 10},${cy - 12} ${CX - 5},${cy - 9}`}
                fill="none" stroke="#444" strokeWidth={isFemale ? 1.4 : 2} strokeLinecap="round"
            />
            <path
                d={`M${CX + 5},${cy - 9} Q${CX + 10},${cy - 12} ${CX + 16},${cy - 9}`}
                fill="none" stroke="#444" strokeWidth={isFemale ? 1.4 : 2} strokeLinecap="round"
            />
            {/* Nose */}
            <path
                d={`M${CX - 3},${cy + 9} Q${CX},${cy + 14} ${CX + 3},${cy + 9}`}
                fill="none" stroke={lineColor} strokeWidth={1.4} strokeLinecap="round"
            />
            {/* Mouth — friendly smile */}
            <path
                d={`M${CX - 7},${cy + 20} Q${CX},${cy + 26} ${CX + 7},${cy + 20}`}
                fill="none" stroke={lineColor} strokeWidth={1.6} strokeLinecap="round"
            />
            {/* Optional: blush for female */}
            {isFemale && (
                <>
                    <circle cx={CX - 16} cy={cy + 10} r={5} fill="#F9A8D4" fillOpacity={0.2} />
                    <circle cx={CX + 16} cy={cy + 10} r={5} fill="#F9A8D4" fillOpacity={0.2} />
                </>
            )}
        </g>
    );
}

/* ═══════════════════════════════════════════════════════════
   SVG Layer 4 — Hair Variants (map-based)
   ═══════════════════════════════════════════════════════════
   Every variant is its own distinct path group.
   Positioned relative to the head centre (CX, headCy=82).
   Hair NEVER uses skinColor — only hairColor.
*/

function HairLayer({ gender, type, hairColor }: { gender: string; type: string; hairColor: string }) {
    const hc = hairColor;
    const headTop = 45; // top of head ellipse

    /** Male variants */
    const maleVariants: Record<string, React.ReactNode> = {
        short: (
            <g id="hair-short">
                {/* Cap of hair sitting on top of the head */}
                <path
                    d={`M${CX - 33},${headTop + 20}
                        Q${CX - 34},${headTop + 2} ${CX - 20},${headTop - 4}
                        Q${CX},${headTop - 12} ${CX + 20},${headTop - 4}
                        Q${CX + 34},${headTop + 2} ${CX + 33},${headTop + 20}
                        Q${CX + 20},${headTop + 12} ${CX},${headTop + 10}
                        Q${CX - 20},${headTop + 12} ${CX - 33},${headTop + 20} Z`}
                    fill={hc}
                />
                {/* Side coverage */}
                <rect x={CX - 33} y={headTop + 14} width={8} height={24} rx={4} fill={hc} />
                <rect x={CX + 25} y={headTop + 14} width={8} height={24} rx={4} fill={hc} />
            </g>
        ),
        buzz: (
            <g id="hair-buzz">
                {/* Very thin layer — like 5 o'clock shadow on head */}
                <ellipse cx={CX} cy={headTop + 10} rx={31} ry={18} fill={hc} fillOpacity={0.7} />
            </g>
        ),
        curly: (
            <g id="hair-curly">
                {/* Bunch of overlapping circles above & around head */}
                <circle cx={CX - 18} cy={headTop} r={14} fill={hc} />
                <circle cx={CX} cy={headTop - 6} r={14} fill={hc} />
                <circle cx={CX + 18} cy={headTop} r={14} fill={hc} />
                <circle cx={CX - 26} cy={headTop + 12} r={12} fill={hc} />
                <circle cx={CX + 26} cy={headTop + 12} r={12} fill={hc} />
                <circle cx={CX - 10} cy={headTop - 4} r={11} fill={hc} />
                <circle cx={CX + 10} cy={headTop - 4} r={11} fill={hc} />
            </g>
        ),
        spiky: (
            <g id="hair-spiky">
                {/* Triangular spikes rising from head */}
                <polygon points={`${CX - 20},${headTop + 14} ${CX - 14},${headTop - 18} ${CX - 6},${headTop + 14}`} fill={hc} />
                <polygon points={`${CX - 8},${headTop + 10} ${CX},${headTop - 24} ${CX + 8},${headTop + 10}`} fill={hc} />
                <polygon points={`${CX + 6},${headTop + 14} ${CX + 14},${headTop - 18} ${CX + 20},${headTop + 14}`} fill={hc} />
                {/* Base band connecting spikes */}
                <rect x={CX - 28} y={headTop + 8} width={56} height={12} rx={6} fill={hc} />
            </g>
        ),
        slick: (
            <g id="hair-slick">
                {/* Smooth shell swept back */}
                <path
                    d={`M${CX - 34},${headTop + 22}
                        Q${CX - 36},${headTop} ${CX - 22},${headTop - 8}
                        Q${CX},${headTop - 16} ${CX + 22},${headTop - 8}
                        Q${CX + 36},${headTop} ${CX + 34},${headTop + 22}
                        Q${CX},${headTop + 15} ${CX - 34},${headTop + 22} Z`}
                    fill={hc}
                />
                {/* Part line */}
                <path
                    d={`M${CX - 8},${headTop - 10} Q${CX - 4},${headTop + 6} ${CX - 10},${headTop + 20}`}
                    fill="none" stroke={darken(hc, 0.2)} strokeWidth={1.2} strokeLinecap="round"
                />
            </g>
        ),
        none: null,
    };

    /** Female variants */
    const femaleVariants: Record<string, React.ReactNode> = {
        long: (
            <g id="hair-long">
                {/* Top cap */}
                <path
                    d={`M${CX - 34},${headTop + 18}
                        Q${CX - 36},${headTop - 2} ${CX},${headTop - 14}
                        Q${CX + 36},${headTop - 2} ${CX + 34},${headTop + 18}
                        Z`}
                    fill={hc}
                />
                {/* Left flowing hair */}
                <path
                    d={`M${CX - 34},${headTop + 16}
                        Q${CX - 38},${headTop + 50} ${CX - 34},${headTop + 100}
                        Q${CX - 30},${headTop + 104} ${CX - 24},${headTop + 98}
                        Q${CX - 28},${headTop + 50} ${CX - 26},${headTop + 18}
                        Z`}
                    fill={hc}
                />
                {/* Right flowing hair */}
                <path
                    d={`M${CX + 34},${headTop + 16}
                        Q${CX + 38},${headTop + 50} ${CX + 34},${headTop + 100}
                        Q${CX + 30},${headTop + 104} ${CX + 24},${headTop + 98}
                        Q${CX + 28},${headTop + 50} ${CX + 26},${headTop + 18}
                        Z`}
                    fill={hc}
                />
            </g>
        ),
        bob: (
            <g id="hair-bob">
                {/* Top cap */}
                <path
                    d={`M${CX - 34},${headTop + 22}
                        Q${CX - 36},${headTop - 2} ${CX},${headTop - 14}
                        Q${CX + 36},${headTop - 2} ${CX + 34},${headTop + 22}
                        Z`}
                    fill={hc}
                />
                {/* Rounded bob sides */}
                <path
                    d={`M${CX - 34},${headTop + 18}
                        Q${CX - 40},${headTop + 50} ${CX - 32},${headTop + 60}
                        Q${CX - 22},${headTop + 66} ${CX - 16},${headTop + 58}
                        Q${CX - 24},${headTop + 40} ${CX - 26},${headTop + 20}
                        Z`}
                    fill={hc}
                />
                <path
                    d={`M${CX + 34},${headTop + 18}
                        Q${CX + 40},${headTop + 50} ${CX + 32},${headTop + 60}
                        Q${CX + 22},${headTop + 66} ${CX + 16},${headTop + 58}
                        Q${CX + 24},${headTop + 40} ${CX + 26},${headTop + 20}
                        Z`}
                    fill={hc}
                />
            </g>
        ),
        curly: (
            <g id="hair-curly-f">
                {/* Cloud of curls around head */}
                <circle cx={CX - 20} cy={headTop - 2} r={16} fill={hc} />
                <circle cx={CX} cy={headTop - 8} r={16} fill={hc} />
                <circle cx={CX + 20} cy={headTop - 2} r={16} fill={hc} />
                <circle cx={CX - 30} cy={headTop + 16} r={14} fill={hc} />
                <circle cx={CX + 30} cy={headTop + 16} r={14} fill={hc} />
                {/* Side volume flowing down */}
                <circle cx={CX - 34} cy={headTop + 40} r={12} fill={hc} />
                <circle cx={CX + 34} cy={headTop + 40} r={12} fill={hc} />
                <circle cx={CX - 30} cy={headTop + 60} r={10} fill={hc} />
                <circle cx={CX + 30} cy={headTop + 60} r={10} fill={hc} />
            </g>
        ),
        ponytail: (
            <g id="hair-ponytail">
                {/* Top cap */}
                <path
                    d={`M${CX - 33},${headTop + 20}
                        Q${CX - 34},${headTop - 2} ${CX},${headTop - 12}
                        Q${CX + 34},${headTop - 2} ${CX + 33},${headTop + 20}
                        Q${CX},${headTop + 14} ${CX - 33},${headTop + 20} Z`}
                    fill={hc}
                />
                {/* Ponytail gathered at back-right */}
                <ellipse cx={CX + 28} cy={headTop + 18} rx={6} ry={8} fill={hc} />
                <path
                    d={`M${CX + 26},${headTop + 24}
                        Q${CX + 32},${headTop + 50} ${CX + 28},${headTop + 80}
                        Q${CX + 26},${headTop + 86} ${CX + 22},${headTop + 78}
                        Q${CX + 24},${headTop + 50} ${CX + 22},${headTop + 26}
                        Z`}
                    fill={hc}
                />
                {/* Hair tie */}
                <ellipse cx={CX + 25} cy={headTop + 24} rx={4} ry={3} fill={darken(hc, 0.3)} />
            </g>
        ),
        braids: (
            <g id="hair-braids">
                {/* Top cap */}
                <path
                    d={`M${CX - 34},${headTop + 20}
                        Q${CX - 34},${headTop - 2} ${CX},${headTop - 12}
                        Q${CX + 34},${headTop - 2} ${CX + 34},${headTop + 20}
                        Q${CX},${headTop + 14} ${CX - 34},${headTop + 20} Z`}
                    fill={hc}
                />
                {/* Left braid */}
                <rect x={CX - 32} y={headTop + 16} width={7} height={80} rx={3.5} fill={hc} />
                <circle cx={CX - 28.5} cy={headTop + 98} r={5} fill={darken(hc, 0.15)} />
                {/* Right braid */}
                <rect x={CX + 25} y={headTop + 16} width={7} height={80} rx={3.5} fill={hc} />
                <circle cx={CX + 28.5} cy={headTop + 98} r={5} fill={darken(hc, 0.15)} />
            </g>
        ),
        bun: (
            <g id="hair-bun">
                {/* Top cap */}
                <path
                    d={`M${CX - 33},${headTop + 20}
                        Q${CX - 34},${headTop - 2} ${CX},${headTop - 12}
                        Q${CX + 34},${headTop - 2} ${CX + 33},${headTop + 20}
                        Q${CX},${headTop + 14} ${CX - 33},${headTop + 20} Z`}
                    fill={hc}
                />
                {/* Bun on top */}
                <circle cx={CX} cy={headTop - 12} r={14} fill={hc} />
                <circle cx={CX} cy={headTop - 14} r={10} fill={darken(hc, 0.08)} />
            </g>
        ),
    };

    const variants = gender === 'male' ? maleVariants : femaleVariants;
    return <>{variants[type] ?? null}</>;
}

/* ═══════════════════════════════════════════════════════════
   Avatar Preview Component — Assembled with correct layer order
   ═══════════════════════════════════════════════════════════ */

export function AvatarPreview({
    config,
    size = 120,
    className,
}: {
    config: AvatarConfig;
    size?: number;
    className?: string;
}) {
    const hairColor = getHairColor(config.skinColor);
    const hairTypes = config.gender === 'male' ? HAIR_TYPES_MALE : HAIR_TYPES_FEMALE;
    const validHair = (hairTypes as readonly string[]).includes(config.hairType)
        ? config.hairType
        : (hairTypes[0] as string);

    return (
        <div
            className={cn(
                'rounded-full overflow-hidden bg-gradient-to-b from-zinc-800 to-zinc-900 flex items-center justify-center',
                className,
            )}
            style={{ width: size, height: size }}
        >
            <svg
                viewBox="30 30 140 180"
                width={size}
                height={size}
                xmlns="http://www.w3.org/2000/svg"
            >
                {/* Background */}
                <defs>
                    <radialGradient id="avatarBg" cx="50%" cy="38%" r="62%">
                        <stop offset="0%" stopColor="#27272a" />
                        <stop offset="100%" stopColor="#18181b" />
                    </radialGradient>
                </defs>
                <rect x={30} y={30} width={140} height={180} fill="url(#avatarBg)" />

                {/*
                    Layer order (back → front):
                    1. Body skin (torso + arms + neck + head + ears)
                    2. Clothing (wraps over torso, under head)
                    3. Face details (eyes, brows, nose, mouth)
                    4. Hair (on top of everything)
                */}

                {/* Layer 1 — Skin */}
                <BodySkin skinColor={config.skinColor} gender={config.gender} />

                {/* Layer 2 — Clothing */}
                <ClothingLayer type={config.clothing} skinColor={config.skinColor} />

                {/* Layer 3 — Face */}
                <FaceDetails skinColor={config.skinColor} gender={config.gender} />

                {/* Layer 4 — Hair */}
                <HairLayer gender={config.gender} type={validHair} hairColor={hairColor} />
            </svg>
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Reusable UI Primitives
   ═══════════════════════════════════════════════════════════ */

/** Card section wrapper with a consistent title style */
export function CustomizationSection({
    title,
    children,
}: {
    title: string;
    children: React.ReactNode;
}) {
    return (
        <div className="space-y-3">
            <h3 className="text-[11px] font-semibold text-zinc-400 uppercase tracking-[0.14em] px-1 select-none">
                {title}
            </h3>
            <div className="rounded-2xl bg-zinc-950/40 border border-zinc-800/50 p-4">
                {children}
            </div>
        </div>
    );
}

/** Generic pill-button selector rendered as a responsive grid */
export function OptionGrid({
    options,
    value,
    onChange,
    columns = 2,
}: {
    options: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
    columns?: 2 | 3;
}) {
    return (
        <div
            className={cn(
                'grid gap-2',
                columns === 3 ? 'grid-cols-3' : 'grid-cols-2',
            )}
        >
            {options.map((opt) => (
                <button
                    key={opt.value}
                    type="button"
                    onClick={() => onChange(opt.value)}
                    className={cn(
                        'relative py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-200 capitalize',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                        value === opt.value
                            ? 'bg-white text-zinc-900 border-white/90 shadow-[0_0_14px_rgba(255,255,255,0.06)]'
                            : 'bg-zinc-900/50 text-zinc-500 border-zinc-800/70 hover:border-zinc-600 hover:text-zinc-300 hover:bg-zinc-800/60 active:scale-[0.97]',
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

/** Color swatch selector for skin tones */
export function SkinTonePicker({
    colors,
    value,
    onChange,
}: {
    colors: { label: string; value: string }[];
    value: string;
    onChange: (value: string) => void;
}) {
    return (
        <div className="flex items-center gap-3 flex-wrap">
            {colors.map((sc) => (
                <button
                    key={sc.value}
                    type="button"
                    onClick={() => onChange(sc.value)}
                    className={cn(
                        'w-10 h-10 rounded-full border-2 transition-all duration-200',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                        'hover:scale-110 active:scale-100',
                        value === sc.value
                            ? 'border-white scale-110 ring-[3px] ring-white/20 shadow-lg'
                            : 'border-zinc-700/40 hover:border-zinc-500',
                    )}
                    style={{ backgroundColor: sc.value }}
                    title={sc.label}
                    aria-label={`Skin tone: ${sc.label}`}
                />
            ))}
        </div>
    );
}

/* ═══════════════════════════════════════════════════════════
   Avatar Customizer — Controls Panel
   ═══════════════════════════════════════════════════════════ */

export function AvatarCustomizer({
    config,
    onChange,
}: {
    config: AvatarConfig;
    onChange: (config: AvatarConfig) => void;
}) {
    const hairTypes = config.gender === 'male' ? HAIR_TYPES_MALE : HAIR_TYPES_FEMALE;

    const handleGenderChange = (gender: 'male' | 'female') => {
        const newHairTypes = gender === 'male' ? HAIR_TYPES_MALE : HAIR_TYPES_FEMALE;
        onChange({ ...config, gender, hairType: newHairTypes[0] as string });
    };

    const genderOptions = [
        { label: 'Male', value: 'male' },
        { label: 'Female', value: 'female' },
    ];

    const hairOptions = hairTypes.map((ht) => ({
        label: (ht as string).charAt(0).toUpperCase() + (ht as string).slice(1),
        value: ht as string,
    }));

    const clothingOptions = CLOTHING_OPTIONS.map((co) => ({
        label: co.label,
        value: co.value,
    }));

    return (
        <div className="space-y-5">
            <CustomizationSection title="Gender">
                <OptionGrid
                    options={genderOptions}
                    value={config.gender}
                    onChange={(v) => handleGenderChange(v as 'male' | 'female')}
                    columns={2}
                />
            </CustomizationSection>

            <CustomizationSection title="Skin Tone">
                <SkinTonePicker
                    colors={SKIN_COLORS}
                    value={config.skinColor}
                    onChange={(v) => onChange({ ...config, skinColor: v })}
                />
            </CustomizationSection>

            <CustomizationSection title="Hair Style">
                <OptionGrid
                    options={hairOptions}
                    value={config.hairType}
                    onChange={(v) => onChange({ ...config, hairType: v })}
                    columns={3}
                />
            </CustomizationSection>

            <CustomizationSection title="Clothing">
                <OptionGrid
                    options={clothingOptions}
                    value={config.clothing}
                    onChange={(v) => onChange({ ...config, clothing: v })}
                    columns={2}
                />
            </CustomizationSection>
        </div>
    );
}
