'use server';

import prisma from '@/lib/prisma';
import { getCurrentUser } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import { Product, Order, OrderItem } from '@prisma/client';

export type ActionState = {
    success: boolean;
    data?: any;
    error?: string;
    fieldErrors?: Record<string, string[]>;
};

// ==================== PRODUCT ACTIONS ====================

export async function createProduct(formData: FormData): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user || (user.role !== 'DOCTOR' && user.role !== 'YOGA_INSTRUCTOR')) {
            return { success: false, error: 'Unauthorized' };
        }

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const category = formData.get('category') as string;
        const stock = parseInt(formData.get('stock') as string);
        const imageUrl = formData.get('imageUrl') as string; // Assume handled by client upload for now

        if (!title || !description || isNaN(price) || !category) {
            return { success: false, error: 'Missing required fields' };
        }

        const product = await prisma.product.create({
            data: {
                sellerId: user.id,
                title,
                description,
                price,
                category,
                stock,
                images: imageUrl ? [imageUrl] : [],
            },
        });

        revalidatePath('/doctor/products');
        revalidatePath('/marketplace');
        return { success: true, data: product };
    } catch (error) {
        console.error('Create product error:', error);
        return { success: false, error: 'Failed to create product' };
    }
}

export async function updateProduct(id: string, formData: FormData): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.sellerId !== user.id) {
            return { success: false, error: 'Product not found or unauthorized' };
        }

        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const price = parseFloat(formData.get('price') as string);
        const category = formData.get('category') as string;
        const stock = parseInt(formData.get('stock') as string);
        const imageUrl = formData.get('imageUrl') as string;

        await prisma.product.update({
            where: { id },
            data: {
                title,
                description,
                price,
                category,
                stock,
                images: imageUrl ? [imageUrl] : product.images,
            },
        });

        revalidatePath('/doctor/products');
        revalidatePath('/marketplace');
        return { success: true };
    } catch (error) {
        console.error('Update product error:', error);
        return { success: false, error: 'Failed to update product' };
    }
}

export async function deleteProduct(id: string): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const product = await prisma.product.findUnique({ where: { id } });
        if (!product || product.sellerId !== user.id) {
            return { success: false, error: 'Product not found or unauthorized' };
        }

        await prisma.product.delete({ where: { id } });

        revalidatePath('/doctor/products');
        revalidatePath('/marketplace');
        return { success: true };
    } catch (error) {
        console.error('Delete product error:', error);
        return { success: false, error: 'Failed to delete product' };
    }
}

export async function getSellerProducts(): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const products = await prisma.product.findMany({
            where: { sellerId: user.id },
            orderBy: { createdAt: 'desc' },
        });

        return { success: true, data: products };
    } catch (error) {
        console.error('Get seller products error:', error);
        return { success: false, error: 'Failed to fetch products' };
    }
}

export async function getMarketplaceProducts(
    category?: string,
    search?: string
): Promise<ActionState> {
    try {
        const where: any = {};

        if (category && category !== 'All') {
            where.category = category;
        }

        if (search) {
            where.OR = [
                { title: { contains: search, mode: 'insensitive' } },
                { description: { contains: search, mode: 'insensitive' } },
            ];
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
            include: {
                seller: {
                    select: {
                        name: true,
                        role: true,
                    }
                }
            }
        });

        return { success: true, data: products };
    } catch (error) {
        console.error('Get marketplace products error:', error);
        return { success: false, error: 'Failed to fetch products' };
    }
}

export async function getProduct(id: string): Promise<ActionState> {
    try {
        const product = await prisma.product.findUnique({
            where: { id },
            include: {
                seller: {
                    select: {
                        name: true,
                        role: true,
                        avatar: true,
                    }
                }
            }
        });

        if (!product) return { success: false, error: 'Product not found' };

        return { success: true, data: product };
    } catch (error) {
        console.error('Get product error:', error);
        return { success: false, error: 'Failed to fetch product' };
    }
}

// ==================== ORDER ACTIONS ====================

export async function createOrder(items: { productId: string; quantity: number }[]): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        if (!items.length) return { success: false, error: 'No items in cart' };

        // Calculate total and verify stock
        let totalAmount = 0;
        const orderItemsData = [];

        for (const item of items) {
            const product = await prisma.product.findUnique({ where: { id: item.productId } });
            if (!product) throw new Error(`Product ${item.productId} not found`);
            if (product.stock < item.quantity) throw new Error(`Insufficient stock for ${product.title}`);

            totalAmount += product.price * item.quantity;
            orderItemsData.push({
                productId: item.productId,
                quantity: item.quantity,
                price: product.price,
            });

            // Update stock
            await prisma.product.update({
                where: { id: item.productId },
                data: { stock: product.stock - item.quantity },
            });
        }

        const order = await prisma.order.create({
            data: {
                buyerId: user.id,
                totalAmount,
                status: 'COMPLETED', // Auto-complete for mock payment
                items: {
                    create: orderItemsData,
                },
            },
            include: {
                items: true,
            }
        });

        revalidatePath('/marketplace');
        revalidatePath('/doctor/products'); // To update stock views
        return { success: true, data: order };
    } catch (error: any) {
        console.error('Create order error:', error);
        return { success: false, error: error.message || 'Failed to create order' };
    }
}

export async function getUserOrders(): Promise<ActionState> {
    try {
        const user = await getCurrentUser();
        if (!user) return { success: false, error: 'Unauthorized' };

        const orders = await prisma.order.findMany({
            where: { buyerId: user.id },
            orderBy: { createdAt: 'desc' },
            include: {
                items: {
                    include: {
                        product: true,
                    }
                }
            }
        });

        return { success: true, data: orders };
    } catch (error) {
        console.error('Get user orders error:', error);
        return { success: false, error: 'Failed to fetch orders' };
    }
}
