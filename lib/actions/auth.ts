// Authentication Server Actions
'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createHash } from 'crypto';
import { SignJWT, jwtVerify, type JWTPayload } from 'jose';
import prisma from '@/lib/prisma';
import { hashPassword, verifyPassword, createSession, destroySession, getCurrentUser } from '@/lib/auth';
import { headers } from 'next/headers';
import { applyRateLimit, getClientIdentifierFromHeaders } from '@/lib/security/rate-limit';
import { logSecurityEvent } from '@/lib/security/audit-log';
import { getJwtSecretKey } from '@/lib/jwt-config';

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

const forgotPasswordSchema = z.object({
  email: z.string().email('Enter a valid email address'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Reset token is missing'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
}).refine((data: { password: string; confirmPassword: string }) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword'],
});

// ==================== ACTION TYPES ====================

export interface AuthActionResult {
  success: boolean;
  error?: string;
  fieldErrors?: Record<string, string[]>;
  role?: string;
}

interface PasswordResetPayload extends JWTPayload {
  purpose: 'password-reset';
  userId: string;
  email: string;
  passwordDigest: string;
}

const PASSWORD_RESET_EXPIRY = '30m';

function getEmailDomain(email: string): string {
  const atIndex = email.indexOf('@');
  if (atIndex === -1) {
    return 'invalid';
  }
  return email.slice(atIndex + 1).toLowerCase();
}

function getPasswordDigest(passwordHash: string): string {
  return createHash('sha256').update(passwordHash).digest('hex');
}

async function createPasswordResetToken(user: { id: string; email: string; password: string }) {
  return new SignJWT({
    purpose: 'password-reset',
    userId: user.id,
    email: user.email,
    passwordDigest: getPasswordDigest(user.password),
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(PASSWORD_RESET_EXPIRY)
    .sign(getJwtSecretKey());
}

async function verifyPasswordResetToken(token: string): Promise<PasswordResetPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    if (payload.purpose !== 'password-reset') {
      return null;
    }
    return payload as unknown as PasswordResetPayload;
  } catch {
    return null;
  }
}

function buildResetUrl(token: string, requestHeaders: Headers) {
  const configuredUrl = process.env.NEXT_PUBLIC_APP_URL;
  const origin = configuredUrl
    || requestHeaders.get('origin')
    || `${requestHeaders.get('x-forwarded-proto') || 'http'}://${requestHeaders.get('host') || 'localhost:3000'}`;

  const resetUrl = new URL('/reset-password', origin);
  resetUrl.searchParams.set('token', token);
  return resetUrl.toString();
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

async function sendPasswordResetEmail({
  to,
  name,
  resetUrl,
}: {
  to: string;
  name: string;
  resetUrl: string;
}) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.PASSWORD_RESET_FROM_EMAIL || process.env.RESEND_FROM_EMAIL;
  const safeName = escapeHtml(name);
  const safeResetUrl = escapeHtml(resetUrl);

  if (!apiKey || !from) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Password reset email is not configured');
    }
    console.info(`Password reset link for ${to}: ${resetUrl}`);
    return;
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to,
      subject: 'Reset your Yoga Women password',
      text: `Hi ${name},\n\nUse this link to reset your password. It expires in 30 minutes:\n${resetUrl}\n\nIf you did not request this, you can ignore this email.`,
      html: `
        <div style="font-family:Inter,Arial,sans-serif;line-height:1.5;color:#111827">
          <h1 style="font-size:20px;margin:0 0 12px">Reset your password</h1>
          <p>Hi ${safeName},</p>
          <p>Use the button below to reset your Yoga Women password. This link expires in 30 minutes.</p>
          <p>
            <a href="${safeResetUrl}" style="display:inline-block;background:#111827;color:#ffffff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:600">
              Reset password
            </a>
          </p>
          <p style="color:#6b7280;font-size:13px">If you did not request this, you can ignore this email.</p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    throw new Error(`Password reset email failed with status ${response.status}`);
  }
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

// ==================== PASSWORD RESET ====================

export async function requestPasswordReset(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    email: formData.get('email') as string,
  };

  const validationResult = forgotPasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { email } = validationResult.data;
  const incomingHeaders = await headers();
  const identifier = getClientIdentifierFromHeaders(incomingHeaders);
  const rateLimit = await applyRateLimit({
    key: `password-reset:${identifier}`,
    limit: 8,
    windowMs: 10 * 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return {
      success: false,
      error: 'Too many reset requests. Please try again later.',
    };
  }

  try {
    if (
      process.env.NODE_ENV === 'production'
      && (!process.env.RESEND_API_KEY || !(process.env.PASSWORD_RESET_FROM_EMAIL || process.env.RESEND_FROM_EMAIL))
    ) {
      return {
        success: false,
        error: 'Password reset email is not configured. Please contact support.',
      };
    }

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, name: true, password: true },
    });

    if (user) {
      const token = await createPasswordResetToken(user);
      const resetUrl = buildResetUrl(token, incomingHeaders);
      await sendPasswordResetEmail({
        to: user.email,
        name: user.name,
        resetUrl,
      });
    }

    return { success: true };
  } catch (error) {
    console.error('Password reset request error:', error);
    logSecurityEvent({
      event: 'password_reset_request_failed',
      severity: 'error',
      identifier,
      route: 'lib/actions/auth.requestPasswordReset',
      metadata: { emailDomain: getEmailDomain(email) },
    });

    return {
      success: false,
      error: 'Unable to process password reset right now. Please try again later.',
    };
  }
}

export async function resetPassword(formData: FormData): Promise<AuthActionResult> {
  const rawData = {
    token: formData.get('token') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
  };

  const validationResult = resetPasswordSchema.safeParse(rawData);

  if (!validationResult.success) {
    return {
      success: false,
      fieldErrors: validationResult.error.flatten().fieldErrors as Record<string, string[]>,
    };
  }

  const { token, password } = validationResult.data;
  const payload = await verifyPasswordResetToken(token);

  if (!payload) {
    return {
      success: false,
      error: 'This reset link is invalid or has expired.',
    };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, email: true, password: true },
    });

    if (!user || user.email !== payload.email || getPasswordDigest(user.password) !== payload.passwordDigest) {
      return {
        success: false,
        error: 'This reset link is invalid or has expired.',
      };
    }

    const hashedPassword = await hashPassword(password);

    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      }),
      prisma.session.deleteMany({
        where: { userId: user.id },
      }),
    ]);

    return { success: true };
  } catch (error) {
    console.error('Reset password error:', error);
    return {
      success: false,
      error: 'Unable to reset password right now. Please try again later.',
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
