'use client';

import { useCart } from '@/components/providers/CartProvider';
import { createOrder } from '@/lib/actions/marketplace';
import { X, Minus, Plus, Trash, ShoppingBag, Loader2 } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export function CartDrawer() {
    const { items, isOpen, setIsOpen, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
    const [isCheckingOut, setIsCheckingOut] = useState(false);
    const router = useRouter();

    if (!isOpen) return null;

    async function handleCheckout() {
        setIsCheckingOut(true);
        try {
            const orderItems = items.map(item => ({
                productId: item.id,
                quantity: item.quantity
            }));

            const result = await createOrder(orderItems);

            if (result.success) {
                clearCart();
                setIsOpen(false);
                alert('Order placed successfully! (Mock Payment)');
                router.refresh(); // Update stock
                // Optionally redirect to order history
            } else {
                alert('Checkout failed: ' + result.error);
            }
        } catch (error) {
            console.error('Checkout error:', error);
            alert('An unexpected error occurred');
        } finally {
            setIsCheckingOut(false);
        }
    }

    return (
        <div className="fixed inset-0 z-50 flex justify-end">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-fadeIn"
                onClick={() => setIsOpen(false)}
            />

            {/* Drawer */}
            <div className="relative w-full max-w-md bg-health-card border-l border-health-border h-full shadow-2xl flex flex-col animate-slideInRight">
                <div className="p-4 border-b border-health-border flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <ShoppingBag className="w-5 h-5 text-primary-500" />
                        <h2 className="text-lg font-semibold text-health-text">Your Cart</h2>
                        <span className="text-sm text-health-muted">({items.length} items)</span>
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 hover:bg-health-border rounded-lg transition-colors text-health-muted hover:text-health-text"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                            <div className="w-16 h-16 bg-health-border/50 rounded-full flex items-center justify-center">
                                <ShoppingBag className="w-8 h-8 text-health-muted" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-health-text">Your cart is empty</h3>
                                <p className="text-health-muted">Looks like you haven&apos;t added anything yet.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-primary-500 hover:underline"
                            >
                                Continue Shopping
                            </button>
                        </div>
                    ) : (
                        items.map(item => (
                            <div key={item.id} className="flex gap-4 p-3 bg-health-bg/50 rounded-xl border border-health-border">
                                <div className="relative w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.title}
                                            fill
                                            className="object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center">
                                            <ShoppingBag className="w-6 h-6 text-gray-300" />
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 flex flex-col justify-between">
                                    <div>
                                        <h4 className="font-medium text-health-text line-clamp-1">{item.title}</h4>
                                        <div className="text-primary-600 font-bold">{formatCurrency(item.price)}</div>
                                    </div>

                                    <div className="flex items-center justify-between mt-2">
                                        <div className="flex items-center gap-2 bg-health-bg rounded-lg border border-health-border px-1 py-0.5">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 hover:text-primary-500 disabled:opacity-50"
                                                disabled={item.quantity <= 1}
                                            >
                                                <Minus className="w-3 h-3" />
                                            </button>
                                            <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 hover:text-primary-500 disabled:opacity-50"
                                                disabled={item.quantity >= item.stock}
                                            >
                                                <Plus className="w-3 h-3" />
                                            </button>
                                        </div>

                                        <button
                                            onClick={() => removeFromCart(item.id)}
                                            className="text-red-500 hover:bg-red-500/10 p-1.5 rounded-lg transition-colors"
                                        >
                                            <Trash className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {items.length > 0 && (
                    <div className="p-4 border-t border-health-border bg-health-card space-y-4">
                        <div className="flex items-center justify-between text-lg font-bold text-health-text">
                            <span>Total</span>
                            <span>{formatCurrency(cartTotal)}</span>
                        </div>
                        <GradientButton
                            onClick={handleCheckout}
                            disabled={isCheckingOut}
                            className="w-full h-12 text-lg"
                        >
                            {isCheckingOut ? (
                                <>
                                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                    Processing...
                                </>
                            ) : (
                                'Checkout'
                            )}
                        </GradientButton>
                    </div>
                )}
            </div>
        </div>
    );
}
