'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { getInitials } from '@/lib/utils';
import { Bell, ChevronDown, User, Settings, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { useRouter } from 'next/navigation';
import { getNotifications, markAllNotificationsAsRead, markNotificationAsRead, clearAllNotifications } from '@/lib/actions/notification';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

interface UserCapsuleProps {
    user: {
        name: string;
        email: string;
        healthProfile?: {
            isComplete: boolean;
        } | null;
    };
}

export function UserCapsule({ user }: UserCapsuleProps) {
    const router = useRouter();
    const [showUserMenu, setShowUserMenu] = useState(false);
    const [showNotifications, setShowNotifications] = useState(false);
    const [notifications, setNotifications] = useState<any[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);

    const fetchNotifications = async () => {
        const result = await getNotifications();
        if (result.success && result.data) {
            const serverNotifications = result.data.map((n: any) => ({
                ...n,
                time: new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                read: n.isRead
            }));

            setNotifications(serverNotifications);
            setUnreadCount(result.data.filter((n: any) => !n.isRead).length);
        }
    };

    useEffect(() => {
        fetchNotifications();
        const interval = setInterval(fetchNotifications, 30000);
        return () => clearInterval(interval);
    }, []);

    const handleMarkAllAsRead = async () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        setUnreadCount(0);
        await markAllNotificationsAsRead();
        router.refresh();
        toast.success('All marked as read');
    };

    const handleClearAll = async () => {
        setNotifications([]);
        setUnreadCount(0);
        await clearAllNotifications();
        router.refresh();
        toast.success('Notifications cleared');
    };

    return (
        <div className="fixed top-6 right-8 z-[100] flex items-center gap-3">
            {/* Notifications Capsule */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowNotifications(!showNotifications)}
                    className={cn(
                        "h-12 px-4 rounded-full flex items-center justify-center gap-2 transition-all duration-300 border backdrop-blur-xl shadow-lg",
                        showNotifications
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    )}
                >
                    <Bell className="w-5 h-5" />
                    {unreadCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white ring-2 ring-black">
                            {unreadCount}
                        </span>
                    )}
                </motion.button>

                <AnimatePresence>
                    {showNotifications && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
                                onClick={() => setShowNotifications(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 12, scale: 0.98 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 12, scale: 0.98 }}
                                transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                                className="absolute right-0 mt-3 w-80 bg-zinc-50 dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-100 dark:border-zinc-800 z-50 flex flex-col overflow-hidden"
                            >
                                {/* Header */}
                                <div className="px-5 py-3.5 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between bg-zinc-100/50 dark:bg-zinc-800/30">
                                    <h3 className="text-sm font-semibold text-health-text">Notifications</h3>
                                    <span className="text-[10px] uppercase tracking-wider font-bold text-primary-600 dark:text-primary-400 bg-primary-500/10 px-2 py-0.5 rounded-full">
                                        {unreadCount} New
                                    </span>
                                </div>

                                {/* Content */}
                                <div className="max-h-[380px] overflow-y-auto custom-scrollbar divide-y divide-zinc-100 dark:divide-zinc-800">
                                    {notifications.length === 0 ? (
                                        <div className="py-12 px-6 text-center flex flex-col items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center">
                                                <Bell className="w-5 h-5 text-zinc-400 dark:text-zinc-600" />
                                            </div>
                                            <p className="text-xs text-zinc-500 font-medium tracking-tight">Everything is up to date.</p>
                                        </div>
                                    ) : (
                                        notifications.map((notification) => (
                                            <button
                                                key={notification.id}
                                                onClick={async () => {
                                                    await markNotificationAsRead(notification.id);
                                                    fetchNotifications();
                                                    setShowNotifications(false);
                                                }}
                                                className={cn(
                                                    "w-full p-4 text-left hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors flex gap-4 items-start",
                                                    !notification.read && "bg-primary-500/[0.03]"
                                                )}
                                            >
                                                <div className={cn(
                                                    "w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border",
                                                    notification.type === 'SUCCESS' ? "bg-green-500/10 border-green-500/20 text-green-500" :
                                                        notification.type === 'WARNING' ? "bg-amber-500/10 border-amber-500/20 text-amber-500" :
                                                            "bg-zinc-100 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 text-zinc-500"
                                                )}>
                                                    {notification.type === 'SUCCESS' ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-baseline mb-0.5 gap-2">
                                                        <h4 className={cn(
                                                            "text-[13px] font-semibold truncate leading-none",
                                                            !notification.read ? "text-health-text" : "text-zinc-500"
                                                        )}>
                                                            {notification.title}
                                                        </h4>
                                                        <span className="text-[9px] text-zinc-400 font-medium shrink-0 uppercase tracking-tighter">
                                                            {notification.time}
                                                        </span>
                                                    </div>
                                                    <p className="text-[11px] text-zinc-500 line-clamp-2 leading-relaxed">
                                                        {notification.message}
                                                    </p>
                                                </div>
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Footer Actions */}
                                <div className="p-2.5 bg-zinc-100/50 dark:bg-zinc-800/30 border-t border-zinc-100 dark:border-zinc-800 grid grid-cols-2 gap-2">
                                    <button
                                        onClick={handleMarkAllAsRead}
                                        disabled={notifications.length === 0}
                                        className="text-center text-[11px] font-semibold py-2 px-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-health-text hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all disabled:opacity-50"
                                    >
                                        Mark as read
                                    </button>
                                    <button
                                        onClick={handleClearAll}
                                        disabled={notifications.length === 0}
                                        className="text-center text-[11px] font-semibold py-2 px-3 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-xl border border-zinc-200 dark:border-zinc-800 transition-all disabled:opacity-50"
                                    >
                                        Clear all
                                    </button>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>

            {/* Profile Capsule */}
            <div className="relative">
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className={cn(
                        "h-12 pl-1.5 pr-4 rounded-full flex items-center gap-3 transition-all duration-300 border backdrop-blur-xl shadow-lg",
                        showUserMenu
                            ? "bg-white/10 border-white/20 text-white"
                            : "bg-zinc-900/80 border-white/5 text-zinc-400 hover:border-white/10 hover:text-white"
                    )}
                >
                    <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-primary-600 to-primary-400 p-[1px]">
                        <div className="w-full h-full rounded-full bg-zinc-900 flex items-center justify-center text-[13px] font-bold text-white">
                            {getInitials(user.name)}
                        </div>
                    </div>
                    <span className="text-sm font-bold truncate max-w-[100px] hidden sm:block">{user.name.split(' ')[0]}</span>
                    <ChevronDown className={cn("w-4 h-4 transition-transform duration-300", showUserMenu && "rotate-180")} />
                </motion.button>

                <AnimatePresence>
                    {showUserMenu && (
                        <>
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 z-40 bg-black/20"
                                onClick={() => setShowUserMenu(false)}
                            />
                            <motion.div
                                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                animate={{ opacity: 1, y: 0, scale: 1 }}
                                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                className="absolute right-0 mt-3 w-64 bg-zinc-950/90 backdrop-blur-3xl rounded-3xl shadow-2xl border border-white/10 z-50 p-2 overflow-hidden"
                            >
                                <div className="px-5 py-4 mb-2">
                                    <p className="text-xs font-bold text-zinc-600 uppercase tracking-widest mb-1">Account</p>
                                    <p className="font-bold text-white truncate">{user.name}</p>
                                    <p className="text-xs text-zinc-500 truncate">{user.email}</p>
                                </div>

                                <div className="space-y-1 px-1">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
                                            <User className="w-4 h-4" />
                                        </div>
                                        My Profile
                                    </Link>
                                    <Link
                                        href="/settings"
                                        className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-zinc-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all"
                                        onClick={() => setShowUserMenu(false)}
                                    >
                                        <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center">
                                            <Settings className="w-4 h-4" />
                                        </div>
                                        Settings
                                    </Link>
                                </div>

                                <div className="mt-4 p-2 bg-white/5 rounded-2xl">
                                    <form action={signOut}>
                                        <GradientButton
                                            variant="variant"
                                            className="w-full text-xs py-3 h-auto min-w-0 shadow-none hover:shadow-none"
                                        >
                                            <LogOut className="w-4 h-4 mr-2" />
                                            Sign Out
                                        </GradientButton>
                                    </form>
                                </div>
                            </motion.div>
                        </>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
