import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const role = url.searchParams.get('role') || 'PATIENT';
  const isLogin = url.searchParams.get('isLogin') === 'true';
  
  const clientId = process.env.GOOGLE_CLIENT_ID;
  
  // Use the actual request origin to avoid redirecting to localhost in production
  const origin = url.origin.includes('localhost') && process.env.NEXT_PUBLIC_APP_URL 
    ? process.env.NEXT_PUBLIC_APP_URL 
    : url.origin;
    
  const redirectUri = `${origin}/api/auth/callback/google`;
  
  if (!clientId) {
    return NextResponse.json({ error: 'Google Client ID not configured' }, { status: 500 });
  }

  const state = Buffer.from(JSON.stringify({ role, isLogin })).toString('base64');

  const googleAuthUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  googleAuthUrl.searchParams.append('client_id', clientId);
  googleAuthUrl.searchParams.append('redirect_uri', redirectUri);
  googleAuthUrl.searchParams.append('response_type', 'code');
  googleAuthUrl.searchParams.append('scope', 'openid email profile');
  googleAuthUrl.searchParams.append('access_type', 'offline');
  googleAuthUrl.searchParams.append('prompt', 'consent');
  googleAuthUrl.searchParams.append('state', state);

  return NextResponse.redirect(googleAuthUrl.toString());
}
