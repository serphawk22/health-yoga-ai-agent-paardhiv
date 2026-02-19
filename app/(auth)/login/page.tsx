// Login Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signIn } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signIn(formData);

    if (result.success) {
      if (result.role === 'DOCTOR' || result.role === 'YOGA_INSTRUCTOR') {
        window.location.href = '/doctor';
      } else {
        window.location.href = '/dashboard';
      }
    } else {
      setError(result.error || 'An error occurred');
      setFieldErrors(result.fieldErrors || {});
      setIsLoading(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Brand */}
      <div className="text-center mb-12">
        <Link href="/" className="inline-block mb-8">
          <span className="text-lg font-semibold text-white tracking-tight">Health Agent</span>
        </Link>
        <h1 className="text-3xl font-light text-white tracking-tight mb-3">Welcome back</h1>
        <p className="text-sm text-zinc-500 font-light">Sign in to continue your journey</p>
      </div>

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

        <div className="space-y-2">
          <label htmlFor="password" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="current-password"
              required
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Enter your password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-600 hover:text-zinc-400 transition-colors"
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-400 pl-1">{fieldErrors.password[0]}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-8"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Signing in...
            </>
          ) : (
            <>
              Sign In
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Don&apos;t have an account?{' '}
        <Link href="/register" className="text-zinc-400 hover:text-white font-medium transition-colors">
          Create one
        </Link>
      </p>
    </motion.div>
  );
}
