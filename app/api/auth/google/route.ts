import { NextRequest, NextResponse } from 'next/server';
import { applyRateLimit, getClientIdentifier } from '@/lib/security/rate-limit';

export async function GET(request: NextRequest) {
  const identifier = getClientIdentifier(request);
  const rateLimit = applyRateLimit({
    key: `auth-google:${identifier}`,
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

  const url = new URL(request.url);
  const requestedRole = url.searchParams.get('role') || 'PATIENT';
  const role = ['PATIENT', 'DOCTOR', 'YOGA_INSTRUCTOR'].includes(requestedRole)
    ? requestedRole
    : 'PATIENT';
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
