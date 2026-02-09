'use client';

// Header Component

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { signOut } from '@/lib/actions/auth';
import { getInitials } from '@/lib/utils';
import { Bell, Menu, X, ChevronDown, User, Settings, LogOut, Heart } from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';

interface HeaderProps {
  user: {
    name: string;
    email: string;
    healthProfile?: {
      isComplete: boolean;
    } | null;
  };
}

export function Header({ user }: HeaderProps) {
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: 'Welcome to Health Agent',
      message: 'Start by completing your health profile.',
      time: 'Just now',
      read: false,
    },
  ]);

  useEffect(() => {
    if (user && !user.healthProfile?.isComplete) {
      setNotifications(prev => {
        if (prev.find(n => n.id === 0)) return prev;
        return [{
          id: 0,
          title: 'Complete your profile',
          message: 'Your health profile is incomplete. Complete it now to get personalized recommendations.',
          time: 'Action Required',
          read: false,
        }, ...prev];
      });
    }
  }, [user]);

  const markAllAsRead = () => {
    setNotifications([]);
    setShowNotifications(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-health-card border-b border-health-border">
      <div className="flex h-16 items-center justify-between px-6">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="lg:hidden p-2 text-health-muted hover:text-health-text"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
        >
          {showMobileMenu ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>

        {/* Mobile Logo */}
        <div className="lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-500 to-primary-600 flex items-center justify-center">
            <Heart className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-health-text">Health Agent</span>
        </div>

        {/* Search (Desktop) */}
        <div className="hidden lg:block flex-1 max-w-md">
          <p className="text-health-muted text-sm">
            Welcome back, <span className="text-health-text font-medium">{user.name}</span>
          </p>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="relative p-2 text-health-muted hover:text-health-text"
            >
              <Bell className="w-5 h-5" />
              {notifications.some(n => !n.read) && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse" />
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                />
                <div className="absolute right-0 mt-2 w-80 bg-health-card rounded-xl shadow-lg border border-health-border z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-health-border flex items-center justify-between">
                    <h3 className="font-semibold text-health-text">Notifications</h3>
                    <span className="text-xs text-primary-500 font-medium">{notifications.length} New</span>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="p-4 text-center text-health-muted text-sm">
                        No new notifications
                      </div>
                    ) : (
                      notifications.map((notification) => (
                        <div
                          key={notification.id}
                          className="p-4 hover:bg-health-muted/5 transition-colors border-b border-health-border last:border-0"
                        >
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="text-sm font-medium text-health-text">{notification.title}</h4>
                            <span className="text-[10px] text-health-muted">{notification.time}</span>
                          </div>
                          <p className="text-xs text-health-muted">{notification.message}</p>
                        </div>
                      ))
                    )}
                  </div>
                  <div className="p-2 border-t border-health-border bg-health-muted/5">
                    <button
                      onClick={markAllAsRead}
                      className="w-full text-center text-xs text-primary-500 font-medium hover:text-primary-600 py-1"
                    >
                      Mark all as read
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 p-1 rounded-lg hover:bg-health-muted/10 transition-colors"
            >
              <div className="w-8 h-8 rounded-full bg-primary-500/20 text-primary-400 flex items-center justify-center text-sm font-medium">
                {getInitials(user.name)}
              </div>
              <ChevronDown className="w-4 h-4 text-health-muted hidden sm:block" />
            </button>

            {showUserMenu && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowUserMenu(false)}
                />
                <div className="absolute right-0 mt-2 w-56 bg-health-card rounded-xl shadow-lg border border-health-border z-50 py-2">
                  <div className="px-4 py-2 border-b border-health-border">
                    <p className="font-medium text-health-text">{user.name}</p>
                    <p className="text-sm text-health-muted truncate">{user.email}</p>
                  </div>
                  <Link
                    href="/profile"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-health-text hover:bg-health-muted/10"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <User className="w-4 h-4" />
                    My Profile
                  </Link>
                  <Link
                    href="/settings"
                    className="flex items-center gap-3 px-4 py-2 text-sm text-health-text hover:bg-health-muted/10"
                    onClick={() => setShowUserMenu(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <div className="border-t border-health-border mt-2 pt-2 px-2">
                    <form action={signOut}>
                      <GradientButton variant="variant" className="w-full text-xs py-2 h-auto min-w-0">
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </GradientButton>
                    </form>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {
        showMobileMenu && (
          <div className="lg:hidden border-t border-health-border bg-health-card">
            <nav className="px-4 py-4 space-y-1">
              {[
                { name: 'Dashboard', href: '/dashboard' },
                { name: 'Health Chat', href: '/chat' },
                { name: 'Appointments', href: '/appointments' },
                { name: 'Diet Plan', href: '/diet' },
                { name: 'Exercise', href: '/exercise' },
                { name: 'Yoga', href: '/yoga' },
                { name: 'Health Assessment', href: '/assessment' },
                { name: 'Disease Management', href: '/conditions' },
                { name: 'Goal Planner', href: '/goals' },
                { name: 'Health Metrics', href: '/metrics' },
              ].map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 rounded-lg text-health-text hover:bg-health-muted/10"
                  onClick={() => setShowMobileMenu(false)}
                >
                  {item.name}
                </Link>
              ))}
            </nav>
          </div>
        )
      }
    </header >
  );
}
