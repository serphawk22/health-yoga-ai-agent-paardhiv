'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMarketplaceProducts } from '@/lib/actions/marketplace';
import { useCart } from '@/components/providers/CartProvider';
import { Search, ShoppingBag, ShoppingCart, Filter, ArrowRight, X } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

const CATEGORIES = [
    'All',
    'Supplements',
    'Equipment',
    'Books',
    'Yoga Mats',
    'Nutrition',
    'Courses',
    'Other'
];

export function MarketplaceCatalog() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const { addToCart, cartCount, isOpen, setIsOpen } = useCart();

    const loadProducts = useCallback(async () => {
        setIsLoading(true);
        const result = await getMarketplaceProducts(category, search);
        if (result.success && result.data) {
            setProducts(result.data);
        }
        setIsLoading(false);
    }, [category, search]);

    useEffect(() => {
        loadProducts();
    }, [loadProducts]);

    return (
        <div className="space-y-12 animate-fadeIn">
            {/* Header section with fancy glassmorphism */}
            <div className="relative rounded-[2.5rem] md:rounded-[3.5rem] bg-zinc-950/40 border border-white/[0.08] p-6 md:p-10 lg:p-14 backdrop-blur-[40px] saturate-[1.8] shadow-[0_32px_64px_rgba(0,0,0,0.4)] ring-1 ring-white/[0.05]">
                {/* Background Blobs with proper clipping */}
                <div className="absolute inset-0 rounded-[2.5rem] md:rounded-[3.5rem] overflow-hidden pointer-events-none">
                    <div className="absolute top-0 right-0 w-64 h-64 md:w-96 md:h-96 bg-primary-500/15 rounded-full blur-[100px] -mr-32 md:-mr-48 -mt-32 md:-mt-48" />
                    <div className="absolute bottom-0 left-0 w-48 h-48 md:w-64 md:h-64 bg-blue-500/10 rounded-full blur-[80px] -ml-24 md:-ml-32 -mb-24 md:-mb-32" />
                </div>

                <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-end gap-6 md:gap-8">
                    <div className="max-w-full md:max-w-xl self-end">
                        <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-extralight text-white leading-tight tracking-tight">
                            Elevate your <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-primary-600 font-medium">Health Journey</span>
                        </h1>
                    </div>

                    <div className="w-full md:w-[500px]">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search inventory..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="w-full bg-zinc-950/60 border border-white/[0.08] rounded-[1.5rem] pl-12 pr-28 py-4 text-[15px] text-white focus:outline-none focus:border-white/20 transition-all placeholder:text-zinc-600 font-light ring-1 ring-white/[0.03] shadow-inner"
                            />

                            <div className="absolute right-2 top-1/2 -translate-y-1/2 group/filter">
                                <button className="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/[0.03] border border-white/[0.08] text-[11px] font-medium text-zinc-400 hover:text-white hover:bg-white/[0.08] transition-all ring-1 ring-white/[0.02]">
                                    <Filter className="w-3.5 h-3.5" />
                                    <span>Filter</span>
                                </button>

                                {/* Hover Menu */}
                                <div className="absolute right-0 top-full pt-4 opacity-0 pointer-events-none group-hover/filter:opacity-100 group-hover/filter:pointer-events-auto transition-all duration-300 z-50">
                                    <div className="w-48 bg-zinc-950/90 backdrop-blur-[40px] border border-white/[0.08] rounded-[2rem] p-3 shadow-[0_32px_64px_rgba(0,0,0,0.5)] ring-1 ring-white/[0.05] flex flex-col gap-1">
                                        {CATEGORIES.map(cat => (
                                            <button
                                                key={cat}
                                                onClick={() => setCategory(cat)}
                                                className={cn(
                                                    "w-full text-left px-4 py-2.5 rounded-xl text-xs font-medium transition-all",
                                                    category === cat
                                                        ? "bg-primary-500/10 text-primary-400"
                                                        : "text-zinc-500 hover:text-white hover:bg-white/[0.03]"
                                                )}
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>



            {/* Content section */}
            <AnimatePresence mode="wait">
                {isLoading ? (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
                    >
                        {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                            <div key={i} className="aspect-[4/5] rounded-xl md:rounded-[2rem] lg:rounded-[2.5rem] bg-zinc-900/50 border border-white/5 animate-pulse" />
                        ))}
                    </motion.div>
                ) : products.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="py-24 md:py-40 flex flex-col items-center justify-center text-center"
                    >
                        <div className="bg-zinc-950/40 backdrop-blur-[40px] border border-white/[0.08] rounded-[3rem] p-10 md:p-16 ring-1 ring-white/[0.05] shadow-[0_32px_64px_rgba(0,0,0,0.5)] flex flex-col items-center space-y-6 md:space-y-8">
                            <div>
                                <h3 className="text-2xl md:text-3xl font-extralight text-white tracking-tight">No items found</h3>
                                <p className="text-zinc-400 mt-3 max-w-sm text-sm md:text-[15px] font-light leading-relaxed">We couldn&apos;t find any products matching your search criteria. Try a different category or keywords.</p>
                            </div>
                            <button
                                onClick={() => { setCategory('All'); setSearch(''); }}
                                className="text-primary-400 font-medium hover:text-primary-300 transition-all flex items-center gap-2 group text-sm md:text-base tracking-wide"
                            >
                                Reset all filters <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                    </motion.div>
                ) : (
                    <motion.div
                        layout
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8"
                    >
                        {products.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                className="group relative bg-zinc-950/40 backdrop-blur-[30px] border border-white/[0.08] rounded-[2.5rem] p-4 hover:bg-zinc-900/40 transition-all duration-700 shadow-2xl hover:shadow-primary-500/5 hover:border-white/15 ring-1 ring-white/[0.03]"
                            >
                                <div className="relative aspect-[4/5] rounded-lg md:rounded-[1.5rem] lg:rounded-[2rem] overflow-hidden mb-4 md:mb-6 bg-zinc-800">
                                    {product.images?.[0] ? (
                                        <Image
                                            src={product.images[0]}
                                            alt={product.title}
                                            fill
                                            className="object-cover group-hover:scale-110 transition-transform duration-700"
                                            onError={(e) => {
                                                // Fallback if image fails to load
                                                const target = e.target as HTMLImageElement;
                                                target.style.display = 'none';
                                                target.parentElement!.classList.add('flex', 'items-center', 'justify-center');
                                                const fallback = document.createElement('div');
                                                fallback.className = 'w-full h-full flex items-center justify-center bg-zinc-800';
                                                fallback.innerHTML = '<svg class="w-16 h-16 text-zinc-700 opacity-20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                                                target.parentElement!.appendChild(fallback);
                                            }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-16 h-16 text-zinc-700 opacity-20" />
                                        </div>
                                    )}

                                    <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-all duration-300 translate-y-2 group-hover:translate-y-0">
                                        <div className="bg-black/60 backdrop-blur-md px-2 py-1 md:px-3 md:py-1.5 rounded-full text-[8px] md:text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                                            {product.category}
                                        </div>
                                    </div>

                                    {product.stock <= 0 && (
                                        <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center">
                                            <span className="text-white font-black px-4 py-1.5 md:px-6 md:py-2 rounded-full border-2 border-red-500/50 text-xs uppercase tracking-widest bg-red-500/10">Out of Stock</span>
                                        </div>
                                    )}

                                    {/* Quick add overlay */}
                                    <div className="absolute bottom-0 left-0 right-0 p-3 md:p-6 translate-y-full group-hover:translate-y-0 transition-transform duration-500 bg-gradient-to-t from-black via-black/80 to-transparent">
                                        <div className="relative">
                                            <motion.div
                                                animate={{ opacity: [0.3, 0.6, 0.3] }}
                                                transition={{ duration: 2, repeat: Infinity }}
                                                className="absolute -inset-1 bg-primary-500/20 blur-md rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity"
                                            />
                                            <GradientButton
                                                disabled={product.stock <= 0}
                                                onClick={() => addToCart(product)}
                                                className="clay-cta w-full py-2 md:py-4 h-auto rounded-xl md:rounded-2xl text-xs relative z-10"
                                            >
                                                <ShoppingCart className="w-4 h-4 mr-2" />
                                                Express Buy
                                            </GradientButton>
                                        </div>
                                    </div>
                                </div>

                                <div className="px-1 md:px-2 space-y-3 md:space-y-4">
                                    <div className="flex justify-between items-start gap-4">
                                        <div>
                                            <h3 className="font-medium text-white text-[15px] md:text-[17px] leading-snug line-clamp-2 group-hover:text-primary-400 transition-colors tracking-tight">{product.title}</h3>
                                            <p className="text-[10px] font-medium text-zinc-500 uppercase tracking-widest mt-2 opacity-60">by {product.seller.name}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-2">
                                        <div className="bg-white/[0.03] border border-white/[0.08] px-3.5 py-1.5 md:px-4.5 md:py-2 rounded-2xl ring-1 ring-white/[0.02]">
                                            <span className="text-base md:text-lg font-semibold text-white tracking-tight">{formatCurrency(product.price)}</span>
                                        </div>
                                        {product.stock > 0 && product.stock < 5 && (
                                            <span className="text-[10px] font-medium text-amber-500/80 uppercase tracking-widest animate-pulse">Only {product.stock} left</span>
                                        )}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
