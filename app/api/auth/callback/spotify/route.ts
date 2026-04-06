import { NextResponse } from 'next/server';
import { exchangeSpotifyCode, saveSpotifyToken } from '@/lib/spotify';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    console.error('Spotify login error:', error);
    return NextResponse.redirect(new URL('/music?error=' + error, request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/music?error=No code provided', request.url));
  }

  try {
    const tokenData = await exchangeSpotifyCode(code);
    await saveSpotifyToken(tokenData);

    // Redirect to the music page after successful login
    return NextResponse.redirect(new URL('/music', request.url));
  } catch (err: any) {
    console.error('Spotify token exchange failed:', err);
    return NextResponse.redirect(new URL('/music?error=' + (err.message || 'Authentication failed'), request.url));
  }
}
