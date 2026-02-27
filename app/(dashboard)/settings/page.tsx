'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import { updateUserPreferences, deleteAccount, getUser, updateAvatarConfig, updateProfileVisibility, getAvatarConfig } from '@/lib/actions/user';
import {
  LogOut,
  Trash2,
  ChevronRight,
  AlertTriangle,
  Check,
  Moon,
  Sun,
  Eye,
  EyeOff,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/components/theme-provider';
import { toast } from 'sonner';
import { AvatarCustomizer, DEFAULT_AVATAR } from '@/components/ui/avatar-builder';
import type { AvatarConfig } from '@/components/ui/avatar-builder';
import { AvatarPreview } from '@/components/ui/avatar-builder';

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showAvatarEditor, setShowAvatarEditor] = useState(false);
  const [isSavingAvatar, setIsSavingAvatar] = useState(false);
  const { theme, setTheme } = useTheme();

  const [avatarConfig, setAvatarConfig] = useState<AvatarConfig>(DEFAULT_AVATAR);
  const [isProfilePublic, setIsProfilePublic] = useState(true);
  const [userName, setUserName] = useState('');

  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    recommendations: false,
    email: false,
  });

  useEffect(() => {
    async function loadData() {
      const user = await getUser();
      if ((user as any)?.preferences) {
        setNotifications((user as any).preferences);
      }

      const avatarData = await getAvatarConfig();
      if (avatarData) {
        if (avatarData.avatarConfig) {
          setAvatarConfig(avatarData.avatarConfig as unknown as AvatarConfig);
        }
        setIsProfilePublic(avatarData.isProfilePublic ?? true);
        setUserName(avatarData.name || '');
      }
    }
    loadData();
  }, []);

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  }

  async function handlePreferenceChange(key: string, value: boolean) {
    const newPreferences = { ...notifications, [key]: value };
    setNotifications(newPreferences);
    try {
      await updateUserPreferences(newPreferences);
      toast.success('Preferences updated');
    } catch (error) {
      toast.error('Failed to update preferences');
      setNotifications(notifications);
    }
  }

  async function handleSaveAvatar() {
    setIsSavingAvatar(true);
    try {
      const result = await updateAvatarConfig(avatarConfig);
      if ('error' in result && result.error) {
        toast.error(result.error);
      } else {
        toast.success('Avatar updated');
        setShowAvatarEditor(false);
      }
    } catch {
      toast.error('Failed to save avatar');
    }
    setIsSavingAvatar(false);
  }

  async function handleVisibilityChange() {
    const newValue = !isProfilePublic;
    setIsProfilePublic(newValue);
    try {
      const result = await updateProfileVisibility(newValue);
      if ('error' in result && result.error) {
        toast.error(result.error);
        setIsProfilePublic(!newValue);
      } else {
        toast.success(newValue ? 'Profile is now public' : 'Profile is now private');
      }
    } catch {
      toast.error('Failed to update visibility');
      setIsProfilePublic(!newValue);
    }
  }

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await deleteAccount();
      await logout();
      router.push('/');
      toast.success('Account deleted successfully');
    } catch (error) {
      toast.error('Failed to delete account');
      setIsDeleting(false);
    }
  }

  return (
    <div className="relative pb-24">
      <div className="max-w-2xl mx-auto pt-4 space-y-10">

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-zinc-500 font-medium text-sm uppercase tracking-wider mb-1">Preferences</p>
          <h1 className="text-3xl font-light text-health-text">
            Settings
          </h1>
        </motion.div>

        {/* ═══ Avatar Section ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.03 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Avatar</h2>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 overflow-hidden">
            {/* Avatar preview + edit toggle */}
            <div className="px-5 py-5 flex items-center gap-5">
              <AvatarPreview config={avatarConfig} className="w-[72px] h-[72px] rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800/50" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-health-text truncate">
                  {userName || 'Your Avatar'}
                </p>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Customize your profile avatar
                </p>
              </div>
              <button
                onClick={() => setShowAvatarEditor(!showAvatarEditor)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-zinc-100 dark:bg-zinc-800 text-health-text hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-colors border border-zinc-200 dark:border-zinc-700"
              >
                {showAvatarEditor ? 'Close' : 'Customize'}
              </button>
            </div>

            {/* Inline editor — Two-column layout */}
            <AnimatePresence>
              {showAvatarEditor && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
                  className="overflow-hidden"
                >
                  <div className="border-t border-zinc-100 dark:border-zinc-800">
                    <div className="px-6 py-8">
                      <div className="flex flex-col md:flex-row gap-8">

                        {/* ── Left: Avatar Preview (focal point) ── */}
                        <div className="md:w-[55%] flex flex-col items-center justify-center">
                          <div className="w-full aspect-[4/5] rounded-3xl overflow-hidden bg-gradient-to-b from-zinc-100 to-zinc-50 dark:from-zinc-800/60 dark:to-zinc-900/80 border border-zinc-200 dark:border-zinc-700/40 shadow-[inset_0_1px_12px_rgba(0,0,0,0.04)] dark:shadow-[inset_0_1px_12px_rgba(0,0,0,0.2)] flex items-center justify-center p-8">
                            <AvatarPreview config={avatarConfig} size={250} className="w-full max-w-[250px] aspect-square shadow-2xl ring-1 ring-black/5 dark:ring-white/10" />
                          </div>
                        </div>

                        {/* ── Right: Customization Controls ── */}
                        <div className="md:w-[45%] flex flex-col">
                          <div className="flex-1 md:max-h-[480px] md:overflow-y-auto md:pr-1 [&::-webkit-scrollbar]:w-1 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-thumb]:bg-zinc-700/40 [&::-webkit-scrollbar-thumb]:rounded-full">
                            <AvatarCustomizer config={avatarConfig} onChange={setAvatarConfig} />
                          </div>

                          {/* Save button */}
                          <button
                            onClick={handleSaveAvatar}
                            disabled={isSavingAvatar}
                            className="w-full mt-5 py-3 rounded-2xl bg-white text-zinc-900 text-sm font-semibold transition-all duration-200 hover:bg-zinc-100 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm focus:outline-none focus-visible:ring-2 focus-visible:ring-white/30"
                          >
                            {isSavingAvatar ? 'Saving...' : 'Save Avatar'}
                          </button>
                        </div>

                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        {/* ═══ Account ═══ */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.05 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Account</h2>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            <button
              onClick={() => router.push('/profile')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div>
                <p className="text-sm font-medium text-health-text text-left">Edit Profile</p>
                <p className="text-xs text-zinc-500 text-left">Update your health information</p>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-400" />
            </button>

            {/* Profile Visibility */}
            <button
              onClick={handleVisibilityChange}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="flex items-center gap-3">
                {isProfilePublic ? (
                  <Eye className="w-4 h-4 text-zinc-500" />
                ) : (
                  <EyeOff className="w-4 h-4 text-zinc-500" />
                )}
                <div className="text-left">
                  <p className="text-sm font-medium text-health-text">Profile Visibility</p>
                  <p className="text-xs text-zinc-500">
                    {isProfilePublic ? 'Your profile is public' : 'Your profile is private'}
                  </p>
                </div>
              </div>
              <div className={`w-11 h-6 rounded-full relative transition-colors ${isProfilePublic ? 'bg-primary-600' : 'bg-zinc-700'}`}>
                <div className={`absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all ${isProfilePublic ? 'left-[22px]' : 'left-0.5'}`} />
              </div>
            </button>

            <div className="w-full flex items-center justify-between px-5 py-4 opacity-40 cursor-not-allowed">
              <div>
                <p className="text-sm font-medium text-health-text">Change Password</p>
                <p className="text-xs text-zinc-500">Update your account password</p>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">Soon</span>
            </div>
          </div>
        </motion.div>

        {/* Notifications */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Notifications</h2>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            <CheckRow
              label="Appointment Reminders"
              description="Get notified about upcoming appointments"
              checked={notifications.appointments}
              onChange={(v) => handlePreferenceChange('appointments', v)}
            />
            <CheckRow
              label="Daily Reminders"
              description="Reminders to log your health metrics"
              checked={notifications.reminders}
              onChange={(v) => handlePreferenceChange('reminders', v)}
            />
            <CheckRow
              label="Health Recommendations"
              description="Personalized health tips and suggestions"
              checked={notifications.recommendations}
              onChange={(v) => handlePreferenceChange('recommendations', v)}
            />
            <CheckRow
              label="Email Notifications"
              description="Receive updates via email"
              checked={notifications.email}
              onChange={(v) => handlePreferenceChange('email', v)}
            />
          </div>
        </motion.div>

        {/* Appearance */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.15 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider">Appearance</h2>

          <div className="rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800 divide-y divide-zinc-100 dark:divide-zinc-800 overflow-hidden">
            <button
              onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
            >
              <div className="text-left">
                <p className="text-sm font-medium text-health-text">Theme</p>
                <p className="text-xs text-zinc-500">
                  {theme === 'dark' ? 'Dark mode' : 'Light mode'}
                </p>
              </div>
              <div className="flex items-center gap-1.5 bg-zinc-200 dark:bg-zinc-800 rounded-full p-0.5">
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${theme === 'light' ? 'bg-white dark:bg-zinc-700 text-health-text shadow-sm' : 'text-zinc-500'}`}>
                  <Sun className="w-3.5 h-3.5 inline-block" />
                </span>
                <span className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${theme === 'dark' ? 'bg-white dark:bg-zinc-700 text-health-text shadow-sm' : 'text-zinc-500'}`}>
                  <Moon className="w-3.5 h-3.5 inline-block" />
                </span>
              </div>
            </button>

            <div className="w-full flex items-center justify-between px-5 py-4">
              <div>
                <p className="text-sm font-medium text-health-text">Language</p>
                <p className="text-xs text-zinc-500">English</p>
              </div>
              <span className="text-[10px] text-zinc-400 bg-zinc-200 dark:bg-zinc-800 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">Soon</span>
            </div>
          </div>
        </motion.div>

        {/* Danger Zone */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-xs font-semibold text-red-500/60 uppercase tracking-wider">Danger Zone</h2>

          <div className="rounded-2xl border border-red-500/15 bg-red-500/[0.03] divide-y divide-red-500/10 overflow-hidden">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/5 transition-colors disabled:opacity-50"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-4 h-4 text-zinc-500" />
                <span className="text-sm font-medium text-health-text">
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </span>
              </div>
              <ChevronRight className="w-4 h-4 text-zinc-500" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between px-5 py-4 hover:bg-red-500/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-4 h-4 text-red-400" />
                <span className="text-sm font-medium text-red-400">Delete Account</span>
              </div>
              <ChevronRight className="w-4 h-4 text-red-400/40" />
            </button>
          </div>
        </motion.div>


      </div>

      {/* Delete Confirmation Modal */}
      <AnimatePresence>
        {showDeleteConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-2xl max-w-sm w-full p-6"
            >
              <div className="text-center">
                <div className="w-12 h-12 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                  <AlertTriangle className="w-6 h-6 text-red-500" />
                </div>
                <h3 className="text-base font-semibold text-health-text mb-1">Delete Account?</h3>
                <p className="text-xs text-zinc-500 mb-6 leading-relaxed">
                  This cannot be undone. All data including health profile,
                  chat history, and appointments will be permanently deleted.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowDeleteConfirm(false)}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 text-sm font-medium hover:bg-zinc-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleDeleteAccount}
                    disabled={isDeleting}
                    className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-60"
                  >
                    {isDeleting ? 'Deleting...' : 'Delete'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ──── Checkbox-style row ──── */

function CheckRow({
  label,
  description,
  checked,
  onChange,
}: {
  label: string;
  description: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <button
      onClick={() => onChange(!checked)}
      className="w-full flex items-center justify-between px-5 py-4 hover:bg-zinc-100 dark:hover:bg-zinc-800/60 transition-colors"
    >
      <div className="text-left">
        <p className="text-sm font-medium text-health-text">{label}</p>
        <p className="text-xs text-zinc-500">{description}</p>
      </div>
      <div
        className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all duration-200 shrink-0 ${checked
          ? 'bg-primary-600 border-primary-600'
          : 'border-zinc-300 dark:border-zinc-600 bg-transparent'
          }`}
      >
        {checked && (
          <Check className="w-3 h-3 text-white" strokeWidth={3} />
        )}
      </div>
    </button>
  );
}
