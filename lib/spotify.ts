// Spotify Helper Library
import { cookies } from 'next/headers';

const SPOTIFY_TOKEN_COOKIE = 'spotify-token-data';

export interface SpotifyTokenResponse {
  access_token: string;
  token_type: string;
  scope: string;
  expires_in: number;
  refresh_token: string;
}

export async function getSpotifyAuthUrl() {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;
  
  if (!clientId || !redirectUri) {
    throw new Error('Spotify credentials not configured');
  }

  // Debug log
  console.log('Generating Spotify Auth URL with Redirect:', redirectUri);

  const scopes = [
    'user-read-private',
    'user-read-email',
    'streaming',
    'user-read-playback-state',
    'user-modify-playback-state',
    'playlist-read-private',
    'playlist-read-collaborative'
  ].join(' ');

  const url = new URL('https://accounts.spotify.com/authorize');
  url.searchParams.set('response_type', 'code');
  url.searchParams.set('client_id', clientId);
  url.searchParams.set('scope', scopes);
  url.searchParams.set('redirect_uri', redirectUri);
  url.searchParams.set('show_dialog', 'true');

  return url.toString();
}

export async function exchangeSpotifyCode(code: string): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;
  const redirectUri = process.env.SPOTIFY_REDIRECT_URI;

  if (!clientId || !clientSecret || !redirectUri) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Spotify token exchange failed:', data);
    throw new Error(data.error_description || 'Failed to exchange Spotify code');
  }

  return data;
}

export async function refreshSpotifyToken(refreshToken: string): Promise<SpotifyTokenResponse> {
  const clientId = process.env.SPOTIFY_CLIENT_ID;
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('Spotify credentials not configured');
  }

  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic ' + Buffer.from(clientId + ':' + clientSecret).toString('base64'),
    },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  const data = await response.json();

  if (!response.ok) {
    console.error('Spotify token refresh failed:', data);
    throw new Error(data.error_description || 'Failed to refresh Spotify token');
  }

  return data;
}

export async function saveSpotifyToken(tokenData: SpotifyTokenResponse) {
  const cookieStore = await cookies();
  const expiresAt = new Date(Date.now() + tokenData.expires_in * 1000);
  
  cookieStore.set(SPOTIFY_TOKEN_COOKIE, JSON.stringify({
    ...tokenData,
    expires_at: expiresAt.getTime(),
  }), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Refresh token is longer lived
    path: '/',
  });
}

export async function getSpotifyToken() {
  const cookieStore = await cookies();
  const tokenCookie = cookieStore.get(SPOTIFY_TOKEN_COOKIE);

  if (!tokenCookie) return null;

  try {
    const data = JSON.parse(tokenCookie.value);
    
    // Check if close to expiry (within 5 minutes)
    if (Date.now() > data.expires_at - 5 * 60 * 1000) {
      console.log('Refreshing Spotify token...');
      const newData = await refreshSpotifyToken(data.refresh_token);
      
      // Update cookie
      const updatedData = {
        ...newData,
        refresh_token: newData.refresh_token || data.refresh_token, // Spotify might not always return a new refresh token
        expires_at: Date.now() + newData.expires_in * 1000,
      };
      
      await saveSpotifyToken(updatedData as any);
      return updatedData.access_token;
    }

    return data.access_token;
  } catch (e) {
    console.error('Error getting Spotify token:', e);
    return null;
  }
}
