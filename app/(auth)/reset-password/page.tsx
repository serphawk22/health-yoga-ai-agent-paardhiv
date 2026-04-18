'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { resetPassword } from '@/lib/actions/auth';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setToken(params.get('token') || '');
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await resetPassword(formData);

    if (result.success) {
      setIsComplete(true);
    } else {
      setError(result.error || 'Unable to reset password');
      setFieldErrors(result.fieldErrors || {});
    }

    setIsLoading(false);
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
    >
      <div className="text-center mb-10">
        <Link href="/" className="inline-block mb-6">
          <span className="text-lg font-semibold text-white tracking-tight">Yoga Women</span>
        </Link>
        <h1 className="text-3xl font-light text-white tracking-tight mb-3">Create a new password</h1>
        <p className="text-sm text-zinc-500 font-light">
          Choose a password with at least 8 characters.
        </p>
      </div>

      {isComplete ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <ShieldCheck className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-white">Password updated</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            Your active sessions have been signed out. Use your new password to sign in.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            Sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          {!token ? (
            <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-center">
              <p className="text-sm leading-6 text-red-300">
                This reset link is missing a token. Request a new password reset link to continue.
              </p>
              <Link
                href="/forgot-password"
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Request new link
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <input type="hidden" name="token" value={token} />

              <div className="space-y-2">
                <label htmlFor="password" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  New Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="new-password"
                    minLength={8}
                    required
                    className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                    placeholder="Minimum 8 characters"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-xs text-red-400 pl-1">{fieldErrors.password[0]}</p>
                )}
              </div>

              <div className="space-y-2">
                <label htmlFor="confirmPassword" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                  Confirm Password
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  required
                  className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                  placeholder="Re-enter your password"
                />
                {fieldErrors.confirmPassword && (
                  <p className="text-xs text-red-400 pl-1">{fieldErrors.confirmPassword[0]}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Updating...
                  </>
                ) : (
                  'Update password'
                )}
              </button>
            </form>
          )}
        </>
      )}
    </motion.div>
  );
}
