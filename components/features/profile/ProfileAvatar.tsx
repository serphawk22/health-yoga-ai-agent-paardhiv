import React from 'react';
import { motion } from 'framer-motion';

interface ProfileAvatarProps {
    gender?: string; // Expecting 'MALE', 'FEMALE', or other string values
}

export function ProfileAvatar({ gender }: ProfileAvatarProps) {
    // Normalize gender to lowercase for comparison, strictly checking for 'male'
    // Any other value (including undefined, null, 'female', 'other') defaults to female appearance
    const isMale = gender?.toLowerCase() === 'male';

    return (
        <div className="relative group inline-flex items-center justify-center cursor-pointer">

            {/* Tooltip: Hidden by default, appears on hover */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-10 border border-zinc-700">
                Hi!
                {/* Tooltip bottom arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800"></div>
            </div>

            {/* Avatar SVG */}
            <motion.svg
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                width="80"
                height="80"
                viewBox="0 0 100 100"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="rounded-full bg-indigo-50 dark:bg-zinc-800 border-4 border-white dark:border-zinc-700 shadow-lg overflow-hidden"
            >
                {/* Base Body (Shared between both genders) */}
                <path d="M15 100 C 15 60, 85 60, 85 100" fill="#94a3b8" />

                {isMale ? (
                    // --- MALE AVATAR ---
                    <>
                        {/* Head */}
                        <circle cx="50" cy="40" r="20" fill="#cbd5e1" />
                        {/* Short Hair */}
                        <path d="M 28 35 Q 50 15 72 35" stroke="#475569" strokeWidth="6" strokeLinecap="round" />
                        {/* Smile */}
                        <path d="M 45 48 Q 50 52 55 48" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                    </>
                ) : (
                    // --- FEMALE AVATAR (Default) ---
                    <>
                        {/* Head */}
                        <circle cx="50" cy="40" r="18" fill="#cbd5e1" />
                        {/* Longer Hair */}
                        <path
                            d="M 32 30 C 32 10, 68 10, 68 30 L 70 60 C 70 65, 60 65, 60 60 L 60 35 M 32 30 L 30 60 C 30 65, 40 65, 40 60 L 40 35"
                            stroke="#475569"
                            strokeWidth="6"
                            strokeLinecap="round"
                            fill="none"
                        />
                        {/* Smile */}
                        <path d="M 45 46 Q 50 50 55 46" stroke="#475569" strokeWidth="2" strokeLinecap="round" />
                    </>
                )}
            </motion.svg>

        </div>
    );
}
