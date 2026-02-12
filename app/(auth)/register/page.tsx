// Register Page
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { signUp } from '@/lib/actions/auth';
import { Eye, EyeOff, Loader2, Mail, Lock, User, Stethoscope, Flower } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState<'PATIENT' | 'DOCTOR' | 'YOGA_INSTRUCTOR'>('PATIENT');
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setFieldErrors({});

    const formData = new FormData(e.currentTarget);
    const result = await signUp(formData);

    if (result.success) {
      // Force a hard navigation to ensure cookies are sent
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

  return (
    <div className="animate-fadeIn">
      {/* Mobile Logo */}
      <div className="lg:hidden flex items-center gap-3 mb-8">
        <div className="w-10 h-10 rounded-xl bg-primary-600 flex items-center justify-center">
          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <span className="text-xl font-bold text-health-text">Health Agent</span>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-bold text-health-text mb-2">Create your account</h1>
        <p className="text-health-muted">Start your personalized health journey today</p>
      </div>

      {error && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label htmlFor="name" className="label">Full Name</label>
          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              className="input pl-11"
              placeholder="John Doe"
            />
          </div>
          {fieldErrors.name && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.name[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="label">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="input pl-11"
              placeholder="you@example.com"
            />
          </div>
          {fieldErrors.email && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.email[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="password" className="label">Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              minLength={8}
              className="input pl-11 pr-11"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-health-muted hover:text-health-text"
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>
          <p className="mt-1 text-xs text-health-muted">Must be at least 8 characters</p>
          {fieldErrors.password && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.password[0]}</p>
          )}
        </div>

        <div>
          <label htmlFor="confirmPassword" className="label">Confirm Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-health-muted" />
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              className="input pl-11"
              placeholder="••••••••"
            />
          </div>
          {fieldErrors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600">{fieldErrors.confirmPassword[0]}</p>
          )}
        </div>

        <div>
          <label className="label mb-2 block">I am a...</label>
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => setRole('PATIENT')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${role === 'PATIENT'
                ? 'bg-primary-500/10 border-primary-500 text-primary-500'
                : 'bg-white/5 border-white/10 text-health-muted hover:bg-white/10'
                }`}
            >
              <User className="w-6 h-6" />
              <span className="text-xs font-medium">Patient</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('DOCTOR')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${role === 'DOCTOR'
                ? 'bg-blue-500/10 border-blue-500 text-blue-500'
                : 'bg-white/5 border-white/10 text-health-muted hover:bg-white/10'
                }`}
            >
              <Stethoscope className="w-6 h-6" />
              <span className="text-xs font-medium">Doctor</span>
            </button>
            <button
              type="button"
              onClick={() => setRole('YOGA_INSTRUCTOR')}
              className={`p-3 rounded-xl border flex flex-col items-center justify-center gap-2 transition-all ${role === 'YOGA_INSTRUCTOR'
                ? 'bg-green-500/10 border-green-500 text-green-500'
                : 'bg-white/5 border-white/10 text-health-muted hover:bg-white/10'
                }`}
            >
              <Flower className="w-6 h-6" />
              <span className="text-xs font-medium">Instructor</span>
            </button>
          </div>
          <input type="hidden" name="role" value={role} />
        </div>

        <div className="flex items-start">
          <input
            id="terms"
            name="terms"
            type="checkbox"
            required
            className="mt-1 h-4 w-4 rounded border-health-border text-primary-600 focus:ring-primary-500"
          />
          <label htmlFor="terms" className="ml-2 text-sm text-health-muted">
            I agree to the{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Terms of Service</a>
            {' '}and{' '}
            <a href="#" className="text-primary-600 hover:text-primary-700">Privacy Policy</a>
          </label>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="btn-primary w-full py-3"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin mr-2" />
              Creating account...
            </>
          ) : (
            'Create Account'
          )}
        </button>
      </form>

      <p className="mt-8 text-center text-health-muted">
        Already have an account?{' '}
        <Link href="/login" className="text-primary-600 hover:text-primary-700 font-medium">
          Sign in
        </Link>
      </p>
    </div>
  );
}
