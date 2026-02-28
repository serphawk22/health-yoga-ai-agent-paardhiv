import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AvatarPreview, DEFAULT_AVATAR, type AvatarConfig, AvatarCustomizer } from '@/components/ui/avatar-builder';
import { getAvatarConfig, updateAvatarConfig } from '@/lib/actions/user';
import { X, Loader2 } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { toast } from 'sonner';

interface ProfileAvatarProps {
    gender?: string;
}

export function ProfileAvatar({ gender }: ProfileAvatarProps) {
    const [config, setConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
    const [isLoaded, setIsLoaded] = useState(false);

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [tempConfig, setTempConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);

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

    const handleOpenModal = () => {
        setTempConfig(config);
        setIsModalOpen(true);
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            const result = await updateAvatarConfig(tempConfig as any);
            if (result?.success) {
                setConfig(tempConfig);
                setIsModalOpen(false);
                toast.success('Avatar updated successfully!');
            } else {
                toast.error(result?.error || 'Failed to update avatar');
            }
        } catch (error) {
            toast.error('An error occurred while saving.');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <>
            <div onClick={handleOpenModal} className="relative group inline-flex items-center justify-center cursor-pointer">

                {/* Tooltip: Hidden by default, appears on hover */}
                <div className="absolute -top-12 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:-translate-y-1 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-xl shadow-xl pointer-events-none whitespace-nowrap z-10 border border-zinc-700">
                    Customize Avatar
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

            {/* Customization Modal */}
            <AnimatePresence>
                {isModalOpen && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white/[0.03] backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-8 w-full max-w-md shadow-2xl relative max-h-[90vh] flex flex-col overflow-hidden"
                        >
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="absolute top-4 right-4 p-2 text-zinc-400 hover:text-white bg-zinc-900 hover:bg-zinc-800 rounded-full transition-colors z-10"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            <h2 className="text-xl font-bold text-white mb-6">Customize Avatar</h2>

                            <div className="flex justify-center mb-6 shrink-0">
                                <AvatarPreview config={tempConfig} size={100} className="shadow-2xl" />
                            </div>

                            <div className="overflow-y-auto custom-scrollbar pr-2 mb-6 flex-1 min-h-0">
                                <AvatarCustomizer config={tempConfig} onChange={setTempConfig} />
                            </div>

                            <div className="flex gap-3 shrink-0 pt-2 border-t border-zinc-800/50">
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 font-semibold transition-colors"
                                    disabled={isSaving}
                                >
                                    Cancel
                                </button>
                                <GradientButton
                                    variant="default"
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="flex-1 py-3 h-auto justify-center"
                                >
                                    {isSaving ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Save Changes'}
                                </GradientButton>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </>
    );
}
