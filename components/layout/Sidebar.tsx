'use client';

// Sidebar Component

import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { signOut } from '@/lib/actions/auth';
import {
  Heart,
  LayoutDashboard,
  MessageCircle,
  Apple,
  Dumbbell,
  Activity,
  Calendar,
  User,
  BarChart3,
  Target,
  LogOut,
  Settings,
  Stethoscope,
  Pill,
  Flower,
  ShoppingBag,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { Typewriter } from '@/components/ui/typewriter';
import { cn } from '@/lib/utils';

interface SidebarProps {
  user: {
    name: string;
    email: string;
    role: string;
    healthProfile?: {
      isComplete: boolean;
    } | null;
  };
}

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Health Chat', href: '/chat', icon: MessageCircle },
  { name: 'Appointments', href: '/appointments', icon: Calendar },
  { name: 'Store', href: '/marketplace', icon: ShoppingBag },
  { name: 'Diet Plan', href: '/diet', icon: Apple },
  { name: 'Exercise', href: '/exercise', icon: Dumbbell },
  { name: 'Health Assessment', href: '/assessment', icon: BarChart3 },
  { name: 'Yoga', href: '/yoga', icon: Flower },
  { name: 'Goal Planner', href: '/goals', icon: Target },
  { name: 'Health Metrics', href: '/metrics', icon: Activity },
];

const bottomNavigation = [
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:z-50 lg:flex lg:w-64 lg:flex-col">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-health-card border-r border-[#27272a] px-6 pb-4">
          {/* Logo */}
          <div className="flex h-16 shrink-0 items-center gap-3">

            <div className="flex flex-col">
              <span className="text-xl font-bold text-health-text leading-tight">Health</span>
              <div className="text-sm font-medium text-primary-500">
                <Typewriter
                  text={["Agent", "Partner", "Advisor"]}
                  speed={70}
                  waitTime={1500}
                  deleteSpeed={40}
                  cursorChar={"_"}
                />
              </div>
            </div>
          </div>

          {/* Profile Completion Warning */}
          {!user.healthProfile?.isComplete && (
            <GradientButton asChild className="w-full justify-start px-3 py-2 h-auto">
              <Link
                href="/profile/setup"
                className="flex items-center gap-3"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                  <User className="w-4 h-4 text-white" />
                </div>
                <div className="text-left">
                  <div className="font-medium text-white text-xs">Complete Profile</div>
                  <div className="text-[10px] text-white/80">For personalized advice</div>
                </div>
              </Link>
            </GradientButton>
          )}

          {/* Main Navigation */}
          <nav className="flex flex-1 flex-col">
            <ul role="list" className="flex flex-1 flex-col gap-y-1">
              {navigation.map((item) => {
                // Role-based filtering
                const isDoctorOrInstructor = user.role === 'DOCTOR' || user.role === 'YOGA_INSTRUCTOR';

                // Items allowed for doctors/instructors
                const doctorAllowedItems = ['Dashboard', 'Appointments', 'Store'];

                let href = item.href;

                if (isDoctorOrInstructor) {
                  if (!doctorAllowedItems.includes(item.name)) {
                    return null;
                  }
                  // Remap Dashboard link for doctors
                  if (item.name === 'Dashboard') {
                    href = '/doctor';
                  }
                  // Remap Store link for doctors
                  if (item.name === 'Store') {
                    href = '/doctor/products';
                  }
                }

                // Check if active.
                let isActive = pathname === href;

                if (item.name === 'Yoga') {
                  isActive = pathname === '/yoga';
                }

                return (
                  <li key={item.name}>
                    <Link
                      href={href}
                      className={cn(
                        isActive
                          ? 'bg-primary-600/20 text-primary-400'
                          : item.name === 'Yoga'
                            ? 'text-purple-400 bg-purple-500/10 hover:bg-purple-500/20 hover:text-purple-300'
                            : 'text-health-muted hover:text-health-text hover:bg-white/5',
                        'group flex gap-x-3 rounded-md p-2 text-sm leading-6 font-semibold'
                      )}
                    >
                      <item.icon className="w-5 h-5 shrink-0" />
                      {item.name}
                      {item.name === 'Yoga' && (
                        <span className="ml-auto flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-2 w-2 rounded-full bg-purple-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>

            {/* Bottom Navigation */}
            <ul role="list" className="mt-auto space-y-1 border-t border-health-border pt-4">
              {bottomNavigation.map((item) => {
                const isActive = pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className={isActive ? 'nav-link-active' : 'nav-link'}
                    >
                      <item.icon className="w-5 h-5" />
                      {item.name}
                    </Link>
                  </li>
                );
              })}
              <li>
                <form action={signOut}>
                  <button
                    type="submit"
                    className="nav-link w-full text-red-500 hover:text-red-400 hover:bg-red-500/10"
                  >
                    <LogOut className="w-5 h-5" />
                    Sign Out
                  </button>
                </form>
              </li>
            </ul>
          </nav>
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-[#09090b] border-t border-[#27272a]">
        <div className="flex justify-around py-2">
          {[
            { name: 'Home', href: '/dashboard', icon: LayoutDashboard },
            { name: 'Chat', href: '/chat', icon: MessageCircle },
            { name: 'Diet', href: '/diet', icon: Apple },
            { name: 'Exercise', href: '/exercise', icon: Dumbbell },
            { name: 'Profile', href: '/profile', icon: User },
          ].map((item) => {
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 px-3 py-1 text-xs ${isActive ? 'text-primary-600' : 'text-health-muted'
                  }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            );
          })}
        </div>
      </nav>
    </>
  );
}
