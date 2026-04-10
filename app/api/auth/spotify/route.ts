import { NextRequest, NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import { cookies } from 'next/headers';
import { createOAuthState, getOAuthStateNonceCookieName } from '@/lib/security/oauth-state';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const identifier = getClientIdentifier(request);
    const rateLimit = await applyRateLimit({
      key: `auth-spotify:${identifier}`,
      limit: 30,
      windowMs: 60 * 1000,
    });

    if (!rateLimit.allowed) {
      return NextResponse.json(
        { error: 'Too many authentication attempts. Please retry shortly.' },
        {
          status: 429,
          headers: {
            'Retry-After': String(rateLimit.retryAfterSeconds),
            'X-RateLimit-Limit': String(rateLimit.limit),
            'X-RateLimit-Remaining': String(rateLimit.remaining),
            'X-RateLimit-Reset': String(rateLimit.resetAt),
          },
        }
      );
    }

    const { token: state, nonce, maxAge } = await createOAuthState('spotify');
    const cookieStore = await cookies();
    cookieStore.set(getOAuthStateNonceCookieName('spotify'), nonce, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge,
    });

    const authUrl = await getSpotifyAuthUrl(state);
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Spotify auth URL generation failed:', error);
    return NextResponse.redirect(new URL('/music?error=Failed to generate auth URL', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
