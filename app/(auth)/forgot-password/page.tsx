'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, MailCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { requestPasswordReset } from '@/lib/actions/auth';

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await requestPasswordReset(formData);

    if (result.success) {
      setIsSubmitted(true);
    } else {
      setError(result.error || 'Unable to request a reset link');
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
        <h1 className="text-3xl font-light text-white tracking-tight mb-3">Reset your password</h1>
        <p className="text-sm text-zinc-500 font-light">
          Enter your account email and we&apos;ll send a secure reset link.
        </p>
      </div>

      {isSubmitted ? (
        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-5 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300">
            <MailCheck className="h-6 w-6" />
          </div>
          <h2 className="text-base font-semibold text-white">Check your email</h2>
          <p className="mt-2 text-sm leading-6 text-zinc-400">
            If an account exists for that address, a password reset link will arrive shortly. The link expires in 30 minutes.
          </p>
          <Link
            href="/login"
            className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to sign in
          </Link>
        </div>
      ) : (
        <>
          {error && (
            <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
                placeholder="you@example.com"
              />
              {fieldErrors.email && (
                <p className="text-xs text-red-400 pl-1">{fieldErrors.email[0]}</p>
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
                  Sending link...
                </>
              ) : (
                'Send reset link'
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-600">
            Remembered your password?{' '}
            <Link href="/login" className="text-zinc-400 hover:text-white font-medium transition-colors">
              Sign in
            </Link>
          </p>
        </>
      )}
    </motion.div>
  );
}
