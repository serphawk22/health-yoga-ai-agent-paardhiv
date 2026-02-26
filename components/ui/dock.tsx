'use client';

import { MotionValue, motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    MessageCircle,
    Apple,
    Dumbbell,
    Flower2,
    Calendar,
    Activity,
    Home,
    ShoppingBag,
    User,
    Settings
} from 'lucide-react';

export function Dock({ userRole = 'PATIENT' }: { userRole?: string }) {
    let mouseX = useMotionValue(Infinity);
    const pathname = usePathname();
    const [disableHoverExpand, setDisableHoverExpand] = useState(false);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        if (typeof window === 'undefined') return;
        const mq = window.matchMedia('(hover: none)');
        const mobileCheck = window.matchMedia('(max-width: 768px)');
        
        const update = () => {
            setDisableHoverExpand(Boolean(mq.matches));
            setIsMobile(Boolean(mobileCheck.matches));
        };
        
        update();
        mq.addEventListener('change', update);
        mobileCheck.addEventListener('change', update);
        return () => {
            mq.removeEventListener('change', update);
            mobileCheck.removeEventListener('change', update);
        };
    }, []);

    const allItems = [
        { name: 'Dashboard', icon: Home, href: '/dashboard' },
        { name: 'Store', icon: ShoppingBag, href: '/marketplace' },
        { name: 'AI Chat', icon: MessageCircle, href: '/chat' },
        { name: 'Diet', icon: Apple, href: '/diet' },
        { name: 'Exercise', icon: Dumbbell, href: '/exercise' },
        { name: 'Yoga', icon: Flower2, href: '/yoga' },
        { name: 'Schedule', icon: Calendar, href: '/appointments' },
        { name: 'Metrics', icon: Activity, href: '/metrics' },
        { name: 'Profile', icon: User, href: '/profile' },
    ];

    const items = userRole === 'PATIENT'
        ? allItems
        : [
            { name: 'Dashboard', icon: Home, href: '/doctor' },
            { name: 'Store', icon: ShoppingBag, href: '/marketplace' },
            { name: 'My Patients', icon: User, href: '/doctor/patients' },
            { name: 'Availability', icon: Calendar, href: '/doctor/availability' },
            { name: 'Profile', icon: Settings, href: '/doctor/profile' },
        ];

    return (
        <div
            className="fixed left-1/2 -translate-x-1/2 z-50 bottom-3 md:bottom-8"
            style={{ paddingBottom: 'calc(env(safe-area-inset-bottom) + 0.5rem)' }}
        >
            <motion.div
                onMouseMove={(e) => {
                    if (!disableHoverExpand && !isMobile) mouseX.set(e.pageX);
                }}
                onMouseLeave={() => {
                    if (!disableHoverExpand && !isMobile) mouseX.set(Infinity);
                }}
                className="mx-auto flex items-end justify-center md:justify-start gap-1 md:gap-3 rounded-2xl bg-white/10 dark:bg-black/80 border border-white/20 dark:border-white/10 px-2 md:px-4 pb-2 md:pb-3 pt-2 backdrop-blur-md shadow-2xl"
                style={{
                    width: isMobile ? 'min(calc(100vw - 1rem), 100%)' : 'auto',
                    maxWidth: isMobile ? 'calc(100vw - 1rem)' : 'none',
                    overflowX: isMobile ? 'auto' : 'visible',
                    overflowY: 'visible',
                }}
            >
                {items.map((item) => (
                    <DockIcon
                        key={item.name}
                        mouseX={mouseX}
                        {...item}
                        isActive={pathname === item.href || (item.href !== '/dashboard' && pathname?.startsWith(item.href))}
                        disableHoverExpand={disableHoverExpand || isMobile}
                    />
                ))}
            </motion.div>
        </div>
    );
}

function DockIcon({
    mouseX,
    icon: Icon,
    href,
    name,
    isActive,
    disableHoverExpand,
}: {
    mouseX: MotionValue;
    icon: any;
    href: string;
    name: string;
    isActive: boolean;
    disableHoverExpand: boolean;
}) {
    let ref = useRef<HTMLDivElement>(null);

    let distance = useTransform(mouseX, (val) => {
        let bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
        return val - bounds.x - bounds.width / 2;
    });

    let widthSync = useTransform(distance, [-150, 0, 150], [40, 100, 40]);
    let width = useSpring(widthSync, { mass: 0.1, stiffness: 150, damping: 12 });

    return (
        <Link href={href}>
            <motion.div
                ref={ref}
                style={disableHoverExpand ? undefined : { width }}
                whileHover={disableHoverExpand ? {} : { y: -6 }}
                whileTap={{ scale: 0.92 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={cn(
                    "relative aspect-square w-9 md:w-10 rounded-full flex items-center justify-center group shrink-0 cursor-pointer",
                    isActive
                        ? "bg-primary-100 dark:bg-primary-900/30"
                        : "bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700"
                )}
            >
                <Icon className={cn(
                    "h-4 w-4 md:h-5 md:w-5 transition-colors duration-150 pointer-events-none",
                    isActive
                        ? "text-primary-600 dark:text-primary-400"
                        : "text-zinc-600 dark:text-zinc-300"
                )} />

                {/* Active Indicator */}
                {isActive && (
                    <motion.span
                        layoutId="activeIndicator"
                        className="absolute -bottom-2 w-1 h-1 rounded-full bg-primary-500 dark:bg-primary-400"
                        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                    />
                )}

                {/* Tooltip */}
                <div className="absolute -top-10 left-1/2 -translate-x-1/2 hidden group-hover:block bg-black dark:bg-zinc-800 text-white text-xs px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-50">
                    {name}
                </div>
            </motion.div>
        </Link>
    );
}
