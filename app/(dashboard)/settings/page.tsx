// Settings Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { logout } from '@/lib/actions/auth';
import {
  Settings,
  Bell,
  Shield,
  Moon,
  Sun,
  LogOut,
  Trash2,
  User,
  Lock,
  Globe,
  HelpCircle,
  ChevronRight,
  AlertCircle,
  Check,
} from 'lucide-react';
import { GradientButton } from '@/components/ui/gradient-button';
import { motion } from 'motion/react';

export default function SettingsPage() {
  const router = useRouter();
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Settings state (these would typically be stored in database/preferences)
  const [notifications, setNotifications] = useState({
    appointments: true,
    reminders: true,
    recommendations: false,
    email: false,
  });

  async function handleLogout() {
    setIsLoggingOut(true);
    await logout();
    router.push('/');
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="max-w-2xl mx-auto pb-20 lg:pb-6"
    >
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-health-text">Settings</h1>
        <p className="text-health-muted">Manage your account and preferences</p>
      </div>

      <div className="space-y-6">
        {/* Account Section */}
        <div className="card">
          <h2 className="font-semibold text-health-text mb-4 flex items-center gap-2">
            <User className="w-5 h-5 text-primary-600" />
            Account
          </h2>

          <div className="space-y-2">
            <SettingsItem
              icon={User}
              label="Edit Profile"
              description="Update your health information"
              onClick={() => router.push('/profile')}
            />
            <SettingsItem
              icon={Lock}
              label="Change Password"
              description="Update your account password"
              onClick={() => { }}
              disabled
            />
          </div>
        </div>

        {/* Notifications Section */}
        <div className="card">
          <h2 className="font-semibold text-health-text mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5 text-primary-600" />
            Notifications
          </h2>

          <div className="space-y-4">
            <ToggleSetting
              label="Appointment Reminders"
              description="Get notified about upcoming appointments"
              enabled={notifications.appointments}
              onChange={(v) => setNotifications({ ...notifications, appointments: v })}
            />
            <ToggleSetting
              label="Daily Reminders"
              description="Reminders to log your health metrics"
              enabled={notifications.reminders}
              onChange={(v) => setNotifications({ ...notifications, reminders: v })}
            />
            <ToggleSetting
              label="Health Recommendations"
              description="Personalized health tips and suggestions"
              enabled={notifications.recommendations}
              onChange={(v) => setNotifications({ ...notifications, recommendations: v })}
            />
            <ToggleSetting
              label="Email Notifications"
              description="Receive updates via email"
              enabled={notifications.email}
              onChange={(v) => setNotifications({ ...notifications, email: v })}
            />
          </div>
        </div>

        {/* Appearance Section */}
        <div className="card">
          <h2 className="font-semibold text-health-text mb-4 flex items-center gap-2">
            <Sun className="w-5 h-5 text-primary-600" />
            Appearance
          </h2>

          <div className="space-y-2">
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Sun className="w-5 h-5 text-health-muted" />
                </div>
                <div>
                  <p className="font-medium text-health-text">Theme</p>
                  <p className="text-sm text-health-muted">Dark mode (default)</p>
                </div>
              </div>
              <span className="text-sm text-health-muted">Active</span>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
                  <Globe className="w-5 h-5 text-health-muted" />
                </div>
                <div>
                  <p className="font-medium text-health-text">Language</p>
                  <p className="text-sm text-health-muted">English</p>
                </div>
              </div>
              <span className="text-sm text-health-muted">Coming soon</span>
            </div>
          </div>
        </div>

        {/* Privacy & Security Section */}
        <div className="card">
          <h2 className="font-semibold text-health-text mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-primary-600" />
            Privacy & Security
          </h2>

          <div className="space-y-2">
            <SettingsItem
              icon={Shield}
              label="Privacy Policy"
              description="Read our privacy policy"
              onClick={() => { }}
            />
            <SettingsItem
              icon={HelpCircle}
              label="Terms of Service"
              description="Read our terms of service"
              onClick={() => { }}
            />
          </div>
        </div>

        {/* Support Section */}
        <div className="card">
          <h2 className="font-semibold text-health-text mb-4 flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-primary-600" />
            Support
          </h2>

          <div className="space-y-2">
            <SettingsItem
              icon={HelpCircle}
              label="Help Center"
              description="Get help with the app"
              onClick={() => { }}
            />
            <SettingsItem
              icon={HelpCircle}
              label="Contact Support"
              description="Reach out to our support team"
              onClick={() => { }}
            />
          </div>
        </div>

        {/* Danger Zone */}
        <div className="card border-red-200">
          <h2 className="font-semibold text-red-600 mb-4 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            Danger Zone
          </h2>

          <div className="space-y-3">
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-health-border hover:bg-white/5 transition-colors"
            >
              <div className="flex items-center gap-3">
                <LogOut className="w-5 h-5 text-health-muted" />
                <span className="font-medium text-health-text">
                  {isLoggingOut ? 'Logging out...' : 'Log Out'}
                </span>
              </div>
              <ChevronRight className="w-5 h-5 text-health-muted" />
            </button>

            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="w-full flex items-center justify-between p-3 rounded-lg border border-red-500/20 bg-red-500/10 hover:bg-red-500/20 transition-colors"
            >
              <div className="flex items-center gap-3">
                <Trash2 className="w-5 h-5 text-red-600" />
                <span className="font-medium text-red-600">Delete Account</span>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </button>
          </div>
        </div>

        {/* App Info */}
        <div className="text-center py-6">
          <p className="text-sm text-health-muted">Health Agent v1.0.0</p>
          <p className="text-xs text-health-muted mt-1">Made with ❤️ for your health</p>
        </div>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-health-card border border-health-border rounded-2xl shadow-xl max-w-md w-full p-6">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center mx-auto mb-4">
                <Trash2 className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-xl font-semibold text-health-text mb-2">Delete Account?</h3>
              <p className="text-health-muted mb-6">
                This action cannot be undone. All your data, including your health profile,
                chat history, and appointments will be permanently deleted.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  className="btn-secondary flex-1"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    // TODO: Implement account deletion
                    setShowDeleteConfirm(false);
                  }}
                  className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-red-700 transition-colors"
                >
                  Delete Account
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function SettingsItem({
  icon: Icon,
  label,
  description,
  onClick,
  disabled = false,
}: {
  icon: any;
  label: string;
  description: string;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`w-full flex items-center justify-between p-3 rounded-lg transition-colors ${disabled
        ? 'opacity-50 cursor-not-allowed'
        : 'hover:bg-white/5'
        }`}
    >
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-white/5 flex items-center justify-center">
          <Icon className="w-5 h-5 text-health-muted" />
        </div>
        <div className="text-left">
          <p className="font-medium text-health-text">{label}</p>
          <p className="text-sm text-health-muted">{description}</p>
        </div>
      </div>
      <ChevronRight className="w-5 h-5 text-health-muted" />
    </button>
  );
}

function ToggleSetting({
  label,
  description,
  enabled,
  onChange
}: {
  label: string;
  description: string;
  enabled: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-white/5 transition-colors">
      <div>
        <p className="font-medium text-health-text">{label}</p>
        <p className="text-sm text-health-muted">{description}</p>
      </div>
      <button
        onClick={() => onChange(!enabled)}
        className={`w-12 h-6 rounded-full transition-colors relative ${enabled ? 'bg-primary-600' : 'bg-white/20'
          }`}
      >
        <span
          className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${enabled ? 'translate-x-7' : 'translate-x-1'
            }`}
        />
      </button>
    </div>
  );
}
