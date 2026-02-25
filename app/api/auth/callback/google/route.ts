import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { createSession, hashPassword } from '@/lib/auth';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const state = url.searchParams.get('state');
  
  if (!code) {
    return NextResponse.redirect(new URL('/login?error=No code provided', request.url));
  }

  let role = 'PATIENT';
  let isLogin = false;
  if (state) {
    try {
      const decodedState = JSON.parse(Buffer.from(state, 'base64').toString('utf-8'));
      if (decodedState.role) {
        role = decodedState.role;
      }
      if (decodedState.isLogin) {
        isLogin = decodedState.isLogin;
      }
    } catch (e) {
      console.error('Failed to parse state', e);
    }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  
  // Use the actual request origin to avoid redirecting to localhost in production
  const origin = url.origin.includes('localhost') && process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : url.origin;

  const redirectUri = `${origin}/api/auth/callback/google`;

  if (!clientId || !clientSecret) {
    return NextResponse.redirect(new URL('/login?error=Google OAuth not configured', request.url));
  }

  try {
    // Exchange code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token error:', tokenData);
      return NextResponse.redirect(new URL('/login?error=Failed to exchange token', request.url));
    }

    // Get user info
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    const userData = await userResponse.json();

    if (!userResponse.ok) {
      console.error('User info error:', userData);
      return NextResponse.redirect(new URL('/login?error=Failed to get user info', request.url));
    }

    const { email, name, picture } = userData;

    if (!email) {
      return NextResponse.redirect(new URL('/login?error=No email provided by Google', request.url));
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    let isNewUser = false;

    if (!user) {
      if (isLogin) {
        return NextResponse.redirect(new URL('/login?error=Account not found. Please register first.', request.url));
      }

      isNewUser = true;
      // Create new user
      // Generate a random password since they are using Google
      const randomPassword = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);
      const hashedPassword = await hashPassword(randomPassword);

      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            name: name || 'Google User',
            email: email.toLowerCase(),
            password: hashedPassword,
            role: role as any,
            avatar: picture,
            emailVerified: new Date(),
          },
        });

        // If role is DOCTOR or YOGA_INSTRUCTOR, create a doctor profile
        if (role === 'DOCTOR' || role === 'YOGA_INSTRUCTOR') {
          await tx.doctor.create({
            data: {
              userId: newUser.id,
              name: newUser.name,
              email: newUser.email,
              specialization: role === 'YOGA_INSTRUCTOR' ? 'Yoga Instructor' : 'General Practitioner',
              qualification: 'Pending Verification',
              experience: 0,
              consultationFee: 0,
              isActive: true,
            },
          });
        }

        return newUser;
      });
    }

    // Create session
    await createSession(user.id, user.email, user.name, user.role);

    // Redirect based on role and if new user
    if (user.role === 'DOCTOR' || user.role === 'YOGA_INSTRUCTOR') {
      return NextResponse.redirect(new URL('/doctor', request.url));
    } else {
      if (isNewUser) {
        return NextResponse.redirect(new URL('/profile/setup', request.url));
      } else {
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }
    }
  } catch (error) {
    console.error('Google OAuth error:', error);
    return NextResponse.redirect(new URL('/login?error=Authentication failed', request.url));
  }
}
