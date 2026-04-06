import { NextResponse } from 'next/server';
import { getSpotifyAuthUrl } from '@/lib/spotify';

export async function GET() {
  try {
    const authUrl = await getSpotifyAuthUrl();
    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('Spotify auth URL generation failed:', error);
    return NextResponse.redirect(new URL('/music?error=Failed to generate auth URL', process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'));
  }
}
