// Register Page
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, ArrowRight } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '@/lib/utils';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'YOGA_INSTRUCTOR'>('PATIENT');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error');
    if (errorParam) {
      setError(errorParam);
    }
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result.success) {
      if (role === 'PATIENT') {
        window.location.href = '/profile/setup';
      } else {
        window.location.href = '/doctor';
      }
    } else {
      setError(result.error || 'An error occurred');
      setFieldErrors(result.fieldErrors || {});
      setIsLoading(false);
    }
  }

  const roles = [
    { value: 'PATIENT' as const, label: 'Patient' },
    { value: 'DOCTOR' as const, label: 'Doctor' },
    { value: 'YOGA_INSTRUCTOR' as const, label: 'Instructor' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
    >
      {/* Brand */}
      <div className="text-center mb-10">
        <Link href="/" className="inline-block mb-6">
          <span className="text-lg font-semibold text-white tracking-tight">Health Agent</span>
        </Link>
        <h1 className="text-3xl font-light text-white tracking-tight mb-3">Create your account</h1>
        <p className="text-sm text-zinc-500 font-light">Start your personalized health journey</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div className="space-y-2">
          <label htmlFor="name" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            Full Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            autoComplete="name"
            required
            className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
            placeholder="Your full name"
          />
          {fieldErrors.name && (
            <p className="text-xs text-red-400 pl-1">{fieldErrors.name[0]}</p>
          )}
        </div>

        {/* Email */}
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

        {/* Password */}
        <div className="space-y-2">
          <label htmlFor="password" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Minimum 8 characters"
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

        {/* Confirm Password */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            Confirm Password
          </label>
          <div className="relative">
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className="w-full bg-zinc-900/80 border border-zinc-800 rounded-xl px-4 py-3.5 pr-12 text-sm text-white placeholder:text-zinc-600 focus:outline-none focus:border-zinc-600 transition-colors"
              placeholder="Re-enter your password"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="text-xs text-red-400 pl-1">{fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        {/* Role Selection */}
        <div className="space-y-3 pt-1">
          <label className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest pl-1">
            I am a
          </label>
          <div className="grid grid-cols-3 gap-2">
            {roles.map((r) => (
              <button
                key={r.value}
                type="button"
                onClick={() => setRole(r.value)}
                className={cn(
                  'py-3 rounded-xl border text-sm font-medium transition-all',
                  role === r.value
                    ? 'bg-white text-black border-white'
                    : 'bg-zinc-900/80 text-zinc-500 border-zinc-800 hover:border-zinc-700 hover:text-zinc-300'
                )}
              >
                {r.label}
              </button>
            ))}
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        {/* Terms */}
        <div className="flex items-start pt-2">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-0.5 h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-white focus:ring-0 focus:ring-offset-0 accent-white"
          />
          <label htmlFor="terms" className="ml-3 text-xs text-zinc-500 leading-relaxed">
            I agree to the{' '}
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-white text-black text-sm font-semibold hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-4"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Creating account...
            </>
          ) : (
            <>
              Create Account
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </form>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-zinc-800"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-[#050505] text-zinc-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6">
          <a
            href={`/api/auth/google?role=${role}`}
            className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl bg-zinc-900/80 border border-zinc-800 text-white text-sm font-medium hover:bg-zinc-800 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Sign up as {role === 'PATIENT' ? 'Patient' : role === 'DOCTOR' ? 'Doctor' : 'Instructor'} with Google
          </a>
        </div>
      </div>

      <p className="mt-8 text-center text-sm text-zinc-600">
        Already have an account?{' '}
        <Link href="/login" className="text-zinc-400 hover:text-white font-medium transition-colors">
          Sign in
        </Link>
      </p>
    </motion.div>
  );
}
