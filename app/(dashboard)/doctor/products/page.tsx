'use client';

import { useState, useEffect } from 'react';
import { getSellerProducts, deleteProduct } from '@/lib/actions/marketplace';
import { Plus, Edit, Trash, Package, ShoppingBag, DollarSign } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { formatCurrency } from '@/lib/utils';
import Link from 'next/link';
import Image from 'next/image';

export default function DoctorProductsPage() {
    const [products, setProducts] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProducts();
    }, []);

    async function loadProducts() {
        setIsLoading(true);
        const result = await getSellerProducts();
        if (result.success && result.data) {
            setProducts(result.data);
        }
        setIsLoading(false);
    }

    async function handleDelete(id: string) {
        if (!confirm('Are you sure you want to delete this product?')) return;

        try {
            const result = await deleteProduct(id);
            if (result.success) {
                setProducts(products.filter(p => p.id !== id));
            } else {
                alert('Failed to delete product');
            }
        } catch (error) {
            console.error('Delete error:', error);
        }
    }

    return (
        <div className="max-w-6xl mx-auto pb-20 lg:pb-6 space-y-8 animate-fadeIn">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-health-text">My Products</h1>
                    <p className="text-health-muted">Manage your marketplace listings</p>
                </div>
                <GradientButton asChild>
                    <Link href="/doctor/products/new" className="flex items-center gap-2">
                        <Plus className="w-5 h-5" />
                        Add Product
                    </Link>
                </GradientButton>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-500"></div>
                </div>
            ) : products.length === 0 ? (
                <div className="text-center py-20 bg-health-card rounded-2xl border border-health-border">
                    <div className="w-16 h-16 bg-primary-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Package className="w-8 h-8 text-primary-500" />
                    </div>
                    <h3 className="text-xl font-semibold text-health-text mb-2">No Products Yet</h3>
                    <p className="text-health-muted max-w-md mx-auto mb-6">
                        Start selling your health products, supplements, or equipment to patients.
                    </p>
                    <GradientButton asChild>
                        <Link href="/doctor/products/new">
                            Create First Product
                        </Link>
                    </GradientButton>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {products.map((product) => (
                        <div key={product.id} className="card group hover:border-primary-500/50 transition-colors">
                            <div className="relative aspect-video bg-gray-100 rounded-t-xl overflow-hidden mb-4">
                                {product.images[0] ? (
                                    <Image
                                        src={product.images[0]}
                                        alt={product.title}
                                        fill
                                        className="object-cover"
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                        <ShoppingBag className="w-10 h-10 text-gray-300" />
                                    </div>
                                )}
                                <div className="absolute top-2 right-2 px-2 py-1 bg-black/50 backdrop-blur-sm rounded-lg text-white text-xs font-medium">
                                    {product.category}
                                </div>
                            </div>

                            <div className="p-4 pt-0 space-y-4">
                                <div>
                                    <h3 className="font-semibold text-lg text-health-text line-clamp-1">{product.title}</h3>
                                    <p className="text-sm text-health-muted line-clamp-2 mt-1">{product.description}</p>
                                </div>

                                <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                                    <div className="font-bold text-lg text-primary-600">
                                        {formatCurrency(product.price)}
                                    </div>
                                    <div className="text-sm text-health-muted">
                                        {product.stock} in stock
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    <GradientButton asChild className="flex-1 h-10">
                                        <Link
                                            href={`/doctor/products/${product.id}/edit`}
                                            className="px-3 py-2 text-sm font-medium text-center justify-center"
                                        >
                                            Edit
                                        </Link>
                                    </GradientButton>
                                    <button
                                        onClick={() => handleDelete(product.id)}
                                        className="h-10 w-10 flex items-center justify-center text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-red-100"
                                    >
                                        <Trash className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
