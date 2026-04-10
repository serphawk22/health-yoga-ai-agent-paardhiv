'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProduct, updateProduct } from '@/lib/actions/marketplace';
import { Loader2, Upload, ShoppingBag, DollarSign, Package, Tag, AlignLeft, AlertCircle } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { cn } from '@/lib/utils';
import { motion } from 'framer-motion';

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

function StyledSlider({
    label,
    value,
    min,
    max,
    step = 1,
    unit = "",
    onChange,
    icon: Icon
}: {
    label: string;
    value: number;
    min: number;
    max: number;
    step?: number;
    unit?: string;
    onChange: (val: number) => void;
    icon: any;
}) {
    return (
        <div className="space-y-4">
            <div className="flex justify-between items-end">
                <label className="text-xs font-black text-zinc-500 uppercase tracking-[0.2em] ml-1">
                    {label}
                </label>
                <div className="text-right">
                    <span className="text-2xl font-black text-white tabular-nums">
                        {unit === "$" ? `${unit}${value.toFixed(2)}` : `${value}${unit}`}
                    </span>
                </div>
            </div>
            <div className="relative group flex items-center gap-4">
                <div className="p-3 bg-white/[0.03] border border-white/10 rounded-xl group-focus-within:border-primary-500/50 transition-colors">
                    <Icon className="w-5 h-5 text-zinc-500 group-hover:text-primary-400 transition-colors" />
                </div>
                <div className="relative flex-1 h-2 bg-white/[0.05] rounded-full overflow-hidden">
                    <motion.div
                        className="absolute h-full bg-gradient-to-r from-primary-600 to-primary-400"
                        initial={false}
                        animate={{ width: `${((value - min) / (max - min)) * 100}%` }}
                    />
                    <input
                        type="range"
                        min={min}
                        max={max}
                        step={step}
                        value={value}
                        onChange={(e) => onChange(parseFloat(e.target.value))}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                </div>
            </div>
        </div>
    );
}

export function ProductForm({ product, isEditing = false }: ProductFormProps) {
    const router = useRouter();
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [price, setPrice] = useState(product?.price || 29.99);
    const [stock, setStock] = useState(product?.stock || 50);

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        const formData = new FormData(e.currentTarget);

        // Normalize Image URL
        let imageUrl = formData.get('imageUrl') as string;
        if (imageUrl && imageUrl.includes('unsplash.com/photos/')) {
            // Convert page link to source link (best effort)
            const id = imageUrl.split('/').pop();
            if (id) {
                imageUrl = `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&q=80&w=800`;
                formData.set('imageUrl', imageUrl);
            }
        }

        // Ensure slider values are included
        formData.set('price', price.toString());
        formData.set('stock', stock.toString());

        try {
            const result = isEditing
                ? await updateProduct(product.id, formData)
                : await createProduct(formData);

            if (result.success) {
                router.push('/marketplace');
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

    const inputClasses = "w-full bg-white/[0.03] border border-white/10 rounded-2xl px-12 py-4 text-white focus:outline-none focus:ring-2 focus:ring-primary-500/50 transition-all placeholder:text-zinc-600 font-medium";
    const labelClasses = "text-xs font-black text-zinc-500 uppercase tracking-[0.2em] mb-3 ml-1 block";

    return (
        <form onSubmit={handleSubmit} className="space-y-10">
            {error && (
                <div className="p-6 rounded-[2rem] bg-red-500/10 border border-red-500/20 text-red-400 flex items-center gap-4 animate-shake">
                    <AlertCircle className="w-6 h-6 shrink-0" />
                    <p className="font-bold text-sm tracking-wide">{error}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-10">
                {/* Left Column: Basic Info & Sliders */}
                <div className="space-y-10">
                    <div>
                        <label className={labelClasses}>Product Identity</label>
                        <div className="relative group">
                            <ShoppingBag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                name="title"
                                type="text"
                                required
                                defaultValue={product?.title}
                                className={inputClasses}
                                placeholder="e.g. Elite Whey Isolate"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Classification</label>
                        <div className="relative group">
                            <Tag className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary-400 transition-colors z-10" />
                            <select
                                name="category"
                                required
                                defaultValue={product?.category || ''}
                                className={cn(inputClasses, "appearance-none relative cursor-pointer")}
                            >
                                <option value="" disabled className="bg-zinc-900">Select Category</option>
                                {CATEGORIES.map(cat => (
                                    <option key={cat} value={cat} className="bg-zinc-900">{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="space-y-10 pt-4 px-1">
                        <StyledSlider
                            label="Pricing Strategy"
                            value={price}
                            onChange={setPrice}
                            min={0}
                            max={500}
                            step={0.5}
                            unit="$"
                            icon={DollarSign}
                        />

                        <StyledSlider
                            label="Inventory Level"
                            value={stock}
                            onChange={setStock}
                            min={0}
                            max={1000}
                            step={1}
                            unit=" units"
                            icon={Package}
                        />
                    </div>
                </div>

                {/* Right Column: Visuals & Narrative */}
                <div className="space-y-10">
                    <div>
                        <label className={labelClasses}>Product Narrative</label>
                        <div className="relative group">
                            <AlignLeft className="absolute left-4 top-5 w-5 h-5 text-zinc-500 group-focus-within:text-primary-400 transition-colors" />
                            <textarea
                                name="description"
                                required
                                rows={6}
                                defaultValue={product?.description}
                                className={cn(inputClasses, "min-h-[220px] py-5 resize-none leading-relaxed")}
                                placeholder="What makes this product special? Benefits, usage, and quality..."
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelClasses}>Visual Assets (URL)</label>
                        <div className="relative group">
                            <Upload className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-500 group-focus-within:text-primary-400 transition-colors" />
                            <input
                                name="imageUrl"
                                type="url"
                                defaultValue={product?.images?.[0]}
                                className={inputClasses}
                                placeholder="https://images.unsplash.com/..."
                            />
                        </div>
                        <p className="mt-3 text-[10px] font-bold text-zinc-600 uppercase tracking-widest ml-1">
                            High-quality Unsplash or Shopify URLs recommended
                        </p>
                    </div>
                </div>
            </div>

            <div className="flex justify-end gap-6 pt-10 border-t border-white/5">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="px-8 py-4 text-xs font-black text-zinc-500 hover:text-white uppercase tracking-[0.2em] transition-all"
                >
                    Discard Changes
                </button>
                <GradientButton type="submit" disabled={isLoading} className="clay-cta h-14 px-12 rounded-2xl min-w-[220px]">
                    {isLoading ? (
                        <div className="flex items-center gap-3">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span className="uppercase tracking-widest text-xs font-black">Syncing...</span>
                        </div>
                    ) : (
                        <span className="uppercase tracking-widest text-xs font-black">
                            {isEditing ? 'Update Assets' : 'Publish Product'}
                        </span>
                    )}
                </GradientButton>
            </div>
        </form>
    );
}
