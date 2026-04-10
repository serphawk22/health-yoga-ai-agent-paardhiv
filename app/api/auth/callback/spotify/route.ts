import { NextRequest, NextResponse } from 'next/server';
import { exchangeSpotifyCode, saveSpotifyToken } from '@/lib/spotify';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';
import { cookies } from 'next/headers';
import { getOAuthStateNonceCookieName, verifyOAuthState } from '@/lib/security/oauth-state';

export const dynamic = 'force-dynamic';

function redirectWithMusicError(requestUrl: string, message: string) {
  const redirectUrl = new URL('/music', requestUrl);
  redirectUrl.searchParams.set('error', message);
  return NextResponse.redirect(redirectUrl);
}

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimit = applyRateLimit({
    key: `auth-spotify-callback:${identifier}`,
    limit: 40,
    windowMs: 60 * 1000,
  });

  if (!rateLimit.allowed) {
    return redirectWithMusicError(request.url, 'Too many authentication attempts');
  }

  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  const stateToken = url.searchParams.get('state');

  if (!stateToken) {
    return redirectWithMusicError(request.url, 'Invalid OAuth state');
  }

  const cookieStore = await cookies();
  const nonceCookieName = getOAuthStateNonceCookieName('spotify');
  const expectedNonce = cookieStore.get(nonceCookieName)?.value;
  cookieStore.delete(nonceCookieName);

  if (!expectedNonce) {
    return redirectWithMusicError(request.url, 'Invalid OAuth state');
  }

  const verifiedState = await verifyOAuthState(stateToken, 'spotify');
  if (!verifiedState || verifiedState.nonce !== expectedNonce) {
    return redirectWithMusicError(request.url, 'Invalid OAuth state');
  }

  if (error) {
    console.error('Spotify login error:', error);
    return redirectWithMusicError(request.url, error);
  }

  if (!code) {
    return redirectWithMusicError(request.url, 'No code provided');
  }

  try {
    const tokenData = await exchangeSpotifyCode(code);
    await saveSpotifyToken(tokenData);

    // Redirect to the music page after successful login
    return NextResponse.redirect(new URL('/music', request.url));
  } catch (err: any) {
    console.error('Spotify token exchange failed:', err);
    return redirectWithMusicError(request.url, err?.message || 'Authentication failed');
  }
}
