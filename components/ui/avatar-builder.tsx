'use client';

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { createAvatar } from '@dicebear/core';
import { micah } from '@dicebear/collection';

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
    skinColor: '#F5CBA7', // Changed default to a micah-compatible format
    hairType: 'fonze',
    clothing: 'hoodie',
};

// Micah skin colors from dicebear docs (approx)
export const SKIN_COLORS = [
    { label: 'Light', value: 'f9c9b6' },
    { label: 'Fair', value: 'eebb99' },
    { label: 'Medium', value: 'd08b5b' },
    { label: 'Tan', value: 'ae5d29' },
    { label: 'Brown', value: '77311d' },
];

// Micah hair styles
export const HAIR_TYPES_MALE = ['fonze', 'mrClean', 'mrT', 'dougFunny', 'dannyPhantom'] as const;
export const HAIR_TYPES_FEMALE = ['fanny', 'turban', 'pixie', 'full'] as const;

export const CLOTHING_OPTIONS = [
    { label: 'Hoodie', value: 'hoodie' },
    { label: 'Open', value: 'open' },
    { label: 'Shirt', value: 'shirt' },
    { label: 'Crew', value: 'crew' },
] as const;

/* ═══════════════════════════════════════════════════════════
   Avatar Preview Component
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
    // We memoize the avatar creation to prevent unnecessary re-renders
    const avatarSvg = useMemo(() => {
        const avatar = createAvatar(micah, {
            seed: `${config.gender}-${config.skinColor}-${config.hairType}-${config.clothing}`,
            backgroundColor: ['transparent'],
            baseColor: [config.skinColor.replace('#', '')],
            hair: [config.hairType as any],
            shirt: [config.clothing as any],
            // Micah options (add some sensible defaults to match a clean look)
            eyebrows: ['up'],
            eyes: ['eyes'],
            mouth: ['smile'],
            ears: ['attached'],
            earrings: [],
            glasses: [],
            facialHair: [],
        });
        return avatar.toString();
    }, [config]);

    return (
        <div
            className={cn(
                'rounded-full overflow-hidden flex items-center justify-center bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-900/20 dark:to-blue-900/10 border border-slate-200/60 dark:border-slate-800',
                className,
            )}
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: avatarSvg }}
        />
    );
}

// We also export Avatar3D mapping straight to AvatarPreview to act as a drop-in replacement 
// for wherever it was used without breaking imports immediately.
export const Avatar3D = AvatarPreview;

/* ═══════════════════════════════════════════════════════════
   Reusable UI Primitives
   ═══════════════════════════════════════════════════════════ */

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
            <div className="rounded-2xl bg-white/40 dark:bg-zinc-950/40 border border-zinc-200/50 dark:border-zinc-800/50 p-4 backdrop-blur-md shadow-sm">
                {children}
            </div>
        </div>
    );
}

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
                        'relative py-2.5 px-3 rounded-xl border text-sm font-medium transition-all duration-300 capitalize',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                        value === opt.value
                            ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 border-transparent shadow-[0_4px_14px_rgba(0,0,0,0.1)] dark:shadow-[0_0_14px_rgba(255,255,255,0.06)] scale-[1.02]'
                            : 'bg-zinc-50 dark:bg-zinc-900/50 text-zinc-600 dark:text-zinc-500 border-zinc-200 dark:border-zinc-800/70 hover:border-zinc-300 dark:hover:border-zinc-600 hover:text-zinc-900 dark:hover:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 active:scale-[0.97]',
                    )}
                >
                    {opt.label}
                </button>
            ))}
        </div>
    );
}

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
                        'w-10 h-10 rounded-full border-2 transition-all duration-300',
                        'focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-500/40',
                        'hover:scale-110 active:scale-95',
                        value === sc.value
                            ? 'border-zinc-900 dark:border-white scale-110 ring-[3px] ring-zinc-900/10 dark:ring-white/20 shadow-lg'
                            : 'border-white dark:border-zinc-700/40 hover:border-zinc-300 dark:hover:border-zinc-500 shadow-sm',
                    )}
                    style={{ backgroundColor: `#${sc.value}` }}
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
        { label: 'Masculine', value: 'male' },
        { label: 'Feminine', value: 'female' },
    ];

    const hairOptions = hairTypes.map((ht) => ({
        label: (ht as string).replace(/([A-Z])/g, ' $1').trim(), // Add space before capital letters for readability
        value: ht as string,
    }));

    const clothingOptions = CLOTHING_OPTIONS.map((co) => ({
        label: co.label,
        value: co.value,
    }));

    return (
        <div className="space-y-4">
            <CustomizationSection title="Appearance">
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
                    columns={2}
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
