'use client';

import { useState, useEffect } from 'react';
import { MarketplaceCatalog } from '@/components/marketplace/MarketplaceCatalog';
import { SellerDashboard } from '@/components/marketplace/SellerDashboard';
import { getUser } from '@/lib/actions/auth';
import { Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ColorBends from '@/components/ui/ColorBends';

export default function MarketplacePage() {
    const [user, setUser] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            const userData = await getUser();
            setUser(userData);
            setIsLoading(false);
        }
        fetchUser();
    }, []);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 gap-6 animate-pulse">
                <div className="w-16 h-16 rounded-3xl bg-zinc-900 border border-white/10 flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
                </div>
                <p className="text-zinc-500 font-bold uppercase tracking-[0.2em] text-xs">Initializing Marketplace...</p>
            </div>
        );
    }

    const isSeller = user?.role === 'DOCTOR' || user?.role === 'YOGA_INSTRUCTOR';

    return (
        <div className="max-w-7xl mx-auto pb-20 lg:pb-6 relative z-10 text-zinc-100 min-h-screen">
            {/* Background */}
            <div className="fixed inset-0 z-[-1] pointer-events-none">
                <ColorBends
                    colors={["#ff5c7a", "#8a5cff", "#00ffd1"]}
                    rotation={0}
                    speed={0.2}
                    scale={1}
                    frequency={1}
                    warpStrength={1}
                    mouseInfluence={1}
                    parallax={0.5}
                    noise={0.1}
                    transparent
                    autoRotate={0}
                />
            </div>

            <AnimatePresence mode="wait">
                {isSeller ? (
                    <motion.div
                        key="seller"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        <SellerDashboard />
                    </motion.div>
                ) : (
                    <motion.div
                        key="catalog"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.5, ease: "circOut" }}
                    >
                        <MarketplaceCatalog />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
