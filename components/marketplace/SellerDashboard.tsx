'use client';

import { useState, useEffect } from 'react';
import { getSellerProducts, deleteProduct } from '@/lib/actions/marketplace';
import { Plus, Package, Edit, Trash2, ShoppingBag, ExternalLink, Loader2 } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { formatCurrency, cn } from '@/lib/utils';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';

export function SellerDashboard() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [deletingId, setDeletingId] = useState<string | null>(null);

    const loadProducts = async () => {
        setIsLoading(true);
        const result = await getSellerProducts();
        if (result.success && result.data) {
            setProducts(result.data);
        }
        setIsLoading(false);
    };

    useEffect(() => {
        loadProducts();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this product?')) return;
        setDeletingId(id);
        const result = await deleteProduct(id);
        if (result.success) {
            setProducts(products.filter(p => p.id !== id));
        } else {
            alert(result.error || 'Failed to delete product');
        }
        setDeletingId(null);
    };

    return (
        <div className="space-y-8 animate-fadeIn">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Seller Dashboard</h1>
                    <p className="text-zinc-500 mt-1">Manage your health products and track your sales</p>
                </div>
                <Link href="/marketplace/new">
                    <GradientButton className="h-12 px-6 rounded-2xl flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add New Product
                    </GradientButton>
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Products</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">{products.length}</h4>
                        <div className="w-10 h-10 rounded-xl bg-primary-500/10 flex items-center justify-center text-primary-400">
                            <Package className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Out of Stock</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">{products.filter(p => p.stock === 0).length}</h4>
                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400">
                            <ShoppingBag className="w-5 h-5" />
                        </div>
                    </div>
                </div>
                <div className="bg-zinc-900/50 border border-white/5 rounded-3xl p-6 backdrop-blur-xl">
                    <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Total Value</p>
                    <div className="flex items-end justify-between">
                        <h4 className="text-3xl font-black text-white">
                            {formatCurrency(products.reduce((acc, p) => acc + (p.price * p.stock), 0))}
                        </h4>
                        <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-400">
                            <span className="font-bold text-lg">$</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Products List */}
            <div className="bg-zinc-900/50 border border-white/5 rounded-[2.5rem] overflow-hidden backdrop-blur-xl">
                <div className="p-8 border-b border-white/5 flex items-center justify-between bg-white/[0.02]">
                    <h3 className="text-lg font-bold text-white">Your Products</h3>
                    <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
                        Last updated {new Date().toLocaleTimeString()}
                    </div>
                </div>

                {isLoading ? (
                    <div className="p-20 flex flex-col items-center justify-center gap-4">
                        <Loader2 className="w-10 h-10 animate-spin text-primary-500" />
                        <p className="text-zinc-500 font-medium tracking-wide">Fetching your inventory...</p>
                    </div>
                ) : products.length === 0 ? (
                    <div className="p-20 text-center flex flex-col items-center gap-4">
                        <div className="w-20 h-20 rounded-full bg-zinc-900 flex items-center justify-center border border-white/5">
                            <Plus className="w-10 h-10 text-zinc-800" />
                        </div>
                        <div>
                            <p className="text-white font-bold text-xl">No products yet</p>
                            <p className="text-zinc-500 max-w-xs mx-auto mt-2">Start selling by adding your first product to the marketplace.</p>
                        </div>
                        <Link href="/marketplace/new" className="mt-4">
                            <GradientButton variant="variant" className="px-8">Get Started</GradientButton>
                        </Link>
                    </div>
                ) : (
                    <div className="overflow-x-auto no-scrollbar">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] border-b border-white/5 bg-white/[0.01]">
                                    <th className="px-8 py-5">Product Info</th>
                                    <th className="px-6 py-5">Category</th>
                                    <th className="px-6 py-5">Price</th>
                                    <th className="px-6 py-5">Stock</th>
                                    <th className="px-8 py-5 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {products.map((product) => (
                                    <tr key={product.id} className="group hover:bg-white/[0.01] transition-colors">
                                        <td className="px-8 py-6">
                                            <div className="flex items-center gap-4">
                                                <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-zinc-800 border border-white/10">
                                                    {product.images?.[0] ? (
                                                        <Image
                                                            src={product.images[0]}
                                                            alt={product.title}
                                                            fill
                                                            className="object-cover"
                                                            onError={(e) => {
                                                                const target = e.target as HTMLImageElement;
                                                                target.style.display = 'none';
                                                                const fallback = document.createElement('div');
                                                                fallback.className = 'w-full h-full flex items-center justify-center bg-zinc-800';
                                                                fallback.innerHTML = '<svg class="w-4 h-4 text-zinc-700" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>';
                                                                target.parentElement!.appendChild(fallback);
                                                            }}
                                                        />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <Package className="w-6 h-6 text-zinc-700" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-white group-hover:text-primary-400 transition-colors">{product.title}</p>
                                                    <p className="text-xs text-zinc-500 mt-0.5 line-clamp-1 max-w-[200px]">{product.description}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-6">
                                            <span className="px-3 py-1 bg-zinc-800 text-zinc-400 text-[10px] font-black uppercase tracking-widest rounded-lg border border-white/5">
                                                {product.category}
                                            </span>
                                        </td>
                                        <td className="px-6 py-6">
                                            <p className="font-bold text-white">{formatCurrency(product.price)}</p>
                                        </td>
                                        <td className="px-6 py-6">
                                            <div className="flex items-center gap-2">
                                                <div className={cn(
                                                    "w-2 h-2 rounded-full",
                                                    product.stock > 10 ? "bg-green-500" :
                                                        product.stock > 0 ? "bg-amber-500" : "bg-red-500"
                                                )} />
                                                <p className={cn(
                                                    "font-bold",
                                                    product.stock === 0 ? "text-red-500" : "text-zinc-400"
                                                )}>{product.stock} units</p>
                                            </div>
                                        </td>
                                        <td className="px-8 py-6 text-right">
                                            <div className="flex items-center justify-end gap-2">
                                                <Link href={`/marketplace/edit/${product.id}`}>
                                                    <button className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-400 hover:text-white hover:bg-white/10 transition-all">
                                                        <Edit className="w-4 h-4" />
                                                    </button>
                                                </Link>
                                                <button
                                                    onClick={() => handleDelete(product.id)}
                                                    disabled={deletingId === product.id}
                                                    className="w-10 h-10 rounded-xl bg-white/5 border border-white/5 flex items-center justify-center text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all disabled:opacity-50"
                                                >
                                                    {deletingId === product.id ? (
                                                        <Loader2 className="w-4 h-4 animate-spin" />
                                                    ) : (
                                                        <Trash2 className="w-4 h-4" />
                                                    )}
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
}

import Link from 'next/link';
