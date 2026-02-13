'use client';

import { useState, useEffect, useCallback } from 'react';
import { getMarketplaceProducts, createOrder } from '@/lib/actions/marketplace';
import { useCart } from '@/components/providers/CartProvider';
import { Search, Filter, ShoppingBag, ShoppingCart } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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

export default function MarketplacePage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [category, setCategory] = useState('All');
    const { addToCart, cartCount, isOpen, setIsOpen } = useCart();
    const router = useRouter();

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
        <div className="max-w-7xl mx-auto pb-20 lg:pb-6 space-y-8 animate-fadeIn">
            {/* Header & Filters */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-health-text">Health Marketplace</h1>
                    <p className="text-health-muted">Curated products from health professionals</p>
                </div>

                <div className="flex items-center gap-4 w-full md:w-auto">

                    <div className="relative flex-1 md:w-64">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-health-muted" />
                        <input
                            type="text"
                            placeholder="Search products..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="input pl-9 h-10"
                        />
                    </div>
                </div>
            </div>

            {/* Category Tabs */}
            <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {CATEGORIES.map(cat => (
                    <button
                        key={cat}
                        onClick={() => setCategory(cat)}
                        className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${category === cat
                            ? 'bg-primary-500 text-white'
                            : 'bg-health-card border border-health-border text-health-muted hover:text-health-text hover:border-primary-500/50'
                            }`}
                    >
                        {cat}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20">
                    <div className="text-health-muted">No products found for your criteria.</div>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="card group hover:border-primary-500/50 transition-colors flex flex-col">
                            <div className="relative aspect-square bg-gray-100 rounded-t-xl overflow-hidden mb-4">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <ShoppingBag className="w-12 h-12 text-gray-300" />
                                    </div>
                                )}
                                {product.stock <= 0 && (
                                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                        <span className="text-white font-bold px-3 py-1 bg-red-500 rounded-full text-sm">Out of Stock</span>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 pt-0 flex-1 flex flex-col w-full space-y-2">
                                <div className="flex-1">
                                    <h3 className="font-semibold text-health-text line-clamp-1" title={product.title}>{product.title}</h3>
                                    <div className="text-xs text-health-muted mt-1">
                                        by {product.seller.name}
                                    </div>
                                    <div className="text-lg font-bold text-primary-600 mt-2">
                                        {formatCurrency(product.price)}
                                    </div>
                                </div>

                                <GradientButton
                                    disabled={product.stock <= 0}
                                    onClick={() => addToCart(product)}
                                    className="w-full mt-4"
                                >
                                    Add to Cart
                                </GradientButton>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
