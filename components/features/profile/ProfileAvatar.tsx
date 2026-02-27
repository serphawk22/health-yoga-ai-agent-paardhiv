import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { AvatarPreview, DEFAULT_AVATAR, type AvatarConfig } from '@/components/ui/avatar-builder';
import { getAvatarConfig } from '@/lib/actions/user';

interface ProfileAvatarProps {
    gender?: string;
}

export function ProfileAvatar({ gender }: ProfileAvatarProps) {
    const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        async function load() {
            try {
                const data = await getAvatarConfig();
                if (data?.avatarConfig) {
                    setConfig(data.avatarConfig as unknown as AvatarConfig);
                } else if (gender) {
                    setConfig(prev => ({
                        ...prev,
                        gender: gender.toLowerCase() as 'male' | 'female'
                    }));
                }
            } catch (error) {
                console.error("Failed to load avatar config", error);
            } finally {
                setIsLoaded(true);
            }
        }
        load();
    }, [gender]);

    return (
        <div className="relative group inline-flex items-center justify-center cursor-pointer">

            {/* Tooltip: Hidden by default, appears on hover */}
            <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-10 border border-zinc-700">
                Avatar Profile
                {/* Tooltip bottom arrow */}
                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-zinc-800"></div>
            </div>

            {/* Avatar Profile */}
            <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
            >
                <AvatarPreview config={config} size={80} className="shadow-lg border-2 border-white dark:border-zinc-700" />
            </motion.div>

        </div>
    );
}
