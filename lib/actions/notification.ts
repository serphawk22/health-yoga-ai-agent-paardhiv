'use server';

import { revalidatePath } from 'next/cache';
import prisma from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { NotificationType } from '@prisma/client';

export interface NotificationActionResult {
    success: boolean;
    error?: string;
    data?: any;
}

export async function createNotification(
    userId: string,
    title: string,
    message: string,
    type: NotificationType = 'INFO',
    resourceId?: string,
    resourceType?: string
): Promise<NotificationActionResult> {
    try {
        await prisma.notification.create({
            data: {
                userId,
                title,
                message,
                type,
                resourceId,
                resourceType,
            },
        });

        // revalidatePath('/dashboard'); // Too aggressive?
        return { success: true };
    } catch (error) {
        console.error('Create notification error:', error);
        return { success: false, error: 'Failed to create notification' };
    }
}

export async function getNotifications(): Promise<NotificationActionResult> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: 'Not authenticated' };

        const notifications = await prisma.notification.findMany({
            where: {
                userId: session.userId,
            },
            orderBy: { createdAt: 'desc' },
            take: 20, // Limit to recent notifications
        });

        return { success: true, data: notifications };
    } catch (error) {
        console.error('Get notifications error:', error);
        return { success: false, error: 'Failed to get notifications' };
    }
}

export async function markNotificationAsRead(id: string): Promise<NotificationActionResult> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: 'Not authenticated' };

        await prisma.notification.update({
            where: {
                id,
                userId: session.userId, // Ensure ownership
            },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error('Mark notification read error:', error);
        return { success: false, error: 'Failed to mark notification as read' };
    }
}

export async function markAllNotificationsAsRead(): Promise<NotificationActionResult> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: 'Not authenticated' };

        await prisma.notification.updateMany({
            where: {
                userId: session.userId,
                isRead: false,
            },
            data: { isRead: true },
        });

        return { success: true };
    } catch (error) {
        console.error('Mark all notifications read error:', error);
        return { success: false, error: 'Failed to mark notifications as read' };
    }
}
export async function clearAllNotifications(): Promise<NotificationActionResult> {
    try {
        const session = await getSession();
        if (!session) return { success: false, error: 'Not authenticated' };

        await prisma.notification.deleteMany({
            where: {
                userId: session.userId,
            },
        });

        revalidatePath('/dashboard');
        return { success: true };
    } catch (error) {
        console.error('Clear all notifications error:', error);
        return { success: false, error: 'Failed to clear notifications' };
    }
}
