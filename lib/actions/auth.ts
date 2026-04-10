// Authentication Server Actions
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, getCurrentUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { applyRateLimit, getClientIdentifierFromHeaders } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit-log';

// ==================== VALIDATION SCHEMAS ====================

const signUpSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  role: z.enum(['PATIENT', 'DOCTOR', 'YOGA_INSTRUCTOR']).optional(),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

const signInSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

// ==================== ACTION TYPES ====================

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  role?: string;
}

function getEmailDomain(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return 'invalid';
  }
  return email.slice(atIndex + 1).toLowerCase();
}


export async function signUp(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    name: formData.get('name') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    role: (formData.get('role') as any) || 'PATIENT',
  };

  // Validate input
  const validationResult = signUpSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { name, email, password, role } = validationResult.data;

  const incomingHeaders = await headers();
  const identifier = getClientIdentifierFromHeaders(incomingHeaders);
  const rateLimit = await applyRateLimit({
    key: `signup:${identifier}`,
    limit: 10,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    logSecurityEvent({
      event: 'signup_rate_limited',
      severity: 'warn',
      identifier,
      route: 'lib/actions/auth.signUp',
    });
    return {
      success: false,
      error: 'Too many sign up attempts. Please try again later.',
    };
  }

  try {
    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (existingUser) {
      return {
        success: false,
        error: 'An account with this email already exists',
      };
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user with transaction to ensure doctor profile is created if needed
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: hashedPassword,
          role: role || 'PATIENT',
        },
      });

      // If role is DOCTOR or YOGA_INSTRUCTOR, create a doctor profile
      if (role === 'DOCTOR' || role === 'YOGA_INSTRUCTOR') {
        await tx.doctor.create({
          data: {
            userId: newUser.id,
            name: newUser.name,
            email: newUser.email,
            specialization: role === 'YOGA_INSTRUCTOR' ? 'Yoga Instructor' : 'General Practitioner', // Default, can be updated later
            qualification: 'Pending Verification',
            experience: 0,
            consultationFee: 0,
            isActive: true, // Auto-activate for now, maybe require verify later
          },
        });
      }

      return newUser;
    });

    // Create session (now might include role if we update createSession, but basic session is fine)
    await createSession(user.id, user.email, user.name, user.role);

    return { success: true };
  } catch (error) {
    console.error('Sign up error:', error);
    return {
      success: false,
      error: 'An error occurred during sign up. Please try again.',
    };
  }
}

// ==================== SIGN IN ====================

export async function signIn(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  // Validate input
  const validationResult = signInSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email, password } = validationResult.data;

  const incomingHeaders = await headers();
  const identifier = getClientIdentifierFromHeaders(incomingHeaders);
  const rateLimit = await applyRateLimit({
    key: `signin:${identifier}`,
    limit: 20,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    logSecurityEvent({
      event: 'signin_rate_limited',
      severity: 'warn',
      identifier,
      route: 'lib/actions/auth.signIn',
    });
    return {
      success: false,
      error: 'Too many login attempts. Please try again later.',
    };
  }

  try {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      logSecurityEvent({
        event: 'signin_invalid_credentials',
        severity: 'warn',
        identifier,
        route: 'lib/actions/auth.signIn',
        metadata: { emailDomain: getEmailDomain(email) },
      });
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Verify password
    const isValidPassword = await verifyPassword(password, user.password);

    if (!isValidPassword) {
      logSecurityEvent({
        event: 'signin_invalid_credentials',
        severity: 'warn',
        identifier,
        route: 'lib/actions/auth.signIn',
        userId: user.id,
        metadata: { emailDomain: getEmailDomain(email) },
      });
      return {
        success: false,
        error: 'Invalid email or password',
      };
    }

    // Create session
    await createSession(user.id, user.email, user.name, user.role);

    return { success: true, role: user.role };
  } catch (error) {
    console.error('Sign in error:', error);
    return {
      success: false,
      error: 'An error occurred during sign in. Please try again.',
    };
  }
}

// ==================== SIGN OUT ====================

export async function signOut(): Promise<void> {
  await destroySession();
  redirect('/login');
}

// Alias for signOut (used by settings page)
export const logout = signOut;

export async function getUser() {
  return await getCurrentUser();
}
