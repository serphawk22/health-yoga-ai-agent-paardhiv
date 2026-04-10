// Authentication Library - JWT-based auth with bcrypt password hashing
import { SignJWT, jwtVerify, JWTPayload } from 'jose';
import { cookies } from 'next/headers';
import bcrypt from 'bcryptjs';
import prisma from './prisma';
import { getJwtSecretKey } from './jwt-config';

const COOKIE_NAME = 'health-agent-session';
const TOKEN_EXPIRY = '7d';
const TOKEN_EXPIRY_DAYS = 7;
const MAX_ACTIVE_SESSIONS_PER_USER = 5;

const globalForSessionCleanup = globalThis as unknown as {
  __healthAgentSessionCleanupAt?: number;
};

function getSessionExpiryDate() {
  const expiresAt = new Date();
  expiresAt.setDate(expiresAt.getDate() + TOKEN_EXPIRY_DAYS);
  return expiresAt;
}

async function cleanupExpiredSessionsIfNeeded() {
  const now = Date.now();
  const nextCleanupAt = globalForSessionCleanup.__healthAgentSessionCleanupAt ?? 0;

  if (now < nextCleanupAt) {
    return;
  }

  globalForSessionCleanup.__healthAgentSessionCleanupAt = now + 60 * 60 * 1000;
  await prisma.session.deleteMany({
    where: {
      expiresAt: { lt: new Date(now) },
    },
  });
}

async function enforceSessionLimitForUser(userId: string) {
  const overflowSessions = await prisma.session.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    skip: MAX_ACTIVE_SESSIONS_PER_USER,
    select: { id: true },
  });

  if (overflowSessions.length === 0) {
    return;
  }

  await prisma.session.deleteMany({
    where: {
      id: {
        in: overflowSessions.map((session) => session.id),
      },
    },
  });
}

// ==================== PASSWORD UTILITIES ====================

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// ==================== JWT UTILITIES ====================

interface TokenPayload extends JWTPayload {
  userId: string;
  email: string;
  name: string;
  role: string;
}

export async function createToken(payload: TokenPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime(TOKEN_EXPIRY)
    .sign(getJwtSecretKey());
}

export async function verifyToken(token: string): Promise<TokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtSecretKey());
    return payload as unknown as TokenPayload;
  } catch {
    return null;
  }
}

// ==================== SESSION MANAGEMENT ====================

export async function createSession(userId: string, email: string, name: string, role: string = 'PATIENT'): Promise<string> {
  const token = await createToken({ userId, email, name, role });
  const expiresAt = getSessionExpiryDate();

  await cleanupExpiredSessionsIfNeeded();

  // Cleanup expired sessions for this user before creating a new one.
  await prisma.session.deleteMany({
    where: {
      userId,
      expiresAt: { lt: new Date() },
    },
  });

  // Store session in database
  await prisma.session.create({
    data: {
      userId,
      token,
      expiresAt,
    },
  });

  // Keep only a small number of active sessions per user.
  await enforceSessionLimitForUser(userId);

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
    path: '/',
  });

  return token;
}

export async function getSession(): Promise<TokenPayload | null> {
  // console.log('Checking session...');
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) return null;

  await cleanupExpiredSessionsIfNeeded();

  // Verify token
  const payload = await verifyToken(token);
  if (!payload) {
    await prisma.session.deleteMany({ where: { token } });
    return null;
  }

  // Check if session exists in database
  const session = await prisma.session.findUnique({
    where: { token },
  });

  if (!session || session.expiresAt < new Date()) {
    await prisma.session.deleteMany({ where: { token } });
    // Session expired or doesn't exist
    // cannot delete cookie in server component
    return null;
  }

  return payload;
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (token) {
    // Remove from database
    await prisma.session.deleteMany({
      where: { token },
    });
  }

  // Clear cookie
  cookieStore.delete(COOKIE_NAME);
}

// ==================== USER UTILITIES ====================

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    include: {
      healthProfile: true,
    },
  });

  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error('Authentication required');
  }
  return user;
}
