'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/actions/marketplace';
import { Loader2, Upload, ShoppingBag, DollarSign, Package } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';

interface ProductFormProps {
    product?: any;
    isEditing?: boolean;
}

const CATEGORIES = [
    'Supplements',
    'Equipment',
    'Books',
    'Yoga Mats',
    'Nutrition',
    'Courses',
    'Other'
];

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        try {
            const result = isEditing
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (result.success) {
                router.push('/doctor/products');
                router.refresh();
            } else {
                setError(result.error || 'Something went wrong');
            }
        } catch (error) {
            setError('An unexpected error occurred');
        } finally {
            setIsLoading(false);
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-2xl">
            {error && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-700">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="title" className="label">Product Title</label>
                    <div className="relative">
                        <ShoppingBag className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
                        <input
                            id="title"
                            name="title"
                            type="text"
                            required
                            defaultValue={product?.title}
                            className="input pl-11"
                            placeholder="e.g. Premium Yoga Mat"
                        />
                    </div>
                </div>

                <div>
                    <label htmlFor="category" className="label">Category</label>
                    <select
                        id="category"
                        name="category"
                        required
                        defaultValue={product?.category || ''}
                        className="input"
                    >
                        <option value="" disabled>Select a category</option>
                        {CATEGORIES.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="price" className="label">Price ($)</label>
                        <div className="relative">
                            <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
                            <input
                                id="price"
                                name="price"
                                type="number"
                                step="0.01"
                                min="0"
                                required
                                defaultValue={product?.price}
                                className="input pl-11"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div>
                        <label htmlFor="stock" className="label">Stock Quantity</label>
                        <div className="relative">
                            <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
                            <input
                                id="stock"
                                name="stock"
                                type="number"
                                min="0"
                                required
                                defaultValue={product?.stock || 0}
                                className="input pl-11"
                                placeholder="0"
                            />
                        </div>
                    </div>
                </div>

                <div>
                    <label htmlFor="description" className="label">Description</label>
                    <textarea
                        id="description"
                        name="description"
                        required
                        rows={5}
                        defaultValue={product?.description}
                        className="input min-h-[120px]"
                        placeholder="Describe your product..."
                    />
                </div>

                <div>
                    <label htmlFor="imageUrl" className="label">Image URL</label>
                    <div className="text-xs text-health-muted mb-2">
                        For now, please provide a direct link to an image.
                    </div>
                    <div className="relative">
                        <Upload className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
                        <input
                            id="imageUrl"
                            name="imageUrl"
                            type="url"
                            defaultValue={product?.images?.[0]}
                            className="input pl-11"
                            placeholder="https://example.com/image.jpg"
                        />
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-health-border">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-4 py-2 text-sm font-medium text-health-muted hover:text-health-text transition-colors"
                >
                    Cancel
                </button>
                <GradientButton type="submit" disabled={isLoading} className="w-32">
                    {isLoading ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        isEditing ? 'Update Product' : 'Create Product'
                    )}
                </GradientButton>
            </div>
        </form>
    );
}
