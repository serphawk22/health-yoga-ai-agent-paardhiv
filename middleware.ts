// Middleware for authentication and route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';
import { getJwtSecretKey } from './lib/jwt-config';

const COOKIE_NAME = 'health-agent-session';

// Routes that don't require authentication
const publicRoutes = ['/', '/login', '/register'];

// Routes that require authentication
const protectedRoutes = [
  '/dashboard',
  '/chat',
  '/appointments',
  '/diet',
  '/exercise',
  '/yoga',
  '/assessment',
  '/conditions',
  '/goals',
  '/metrics',
  '/profile',
  '/settings',
  '/doctor',
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and trying to access login/register, redirect to dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (token && (pathname === '/login' || pathname === '/register')) {
      // Avoid redirect loop: if we were redirected here by the layout (source=layout),
      // it means the session is invalid despite the token being valid (e.g. user deleted from DB).
      // We should let them access the login page and clear the invalid cookie.
      if (request.nextUrl.searchParams.get('source') === 'layout') {
        const response = NextResponse.next();
        response.cookies.delete(COOKIE_NAME);
        return response;
      }

      try {
        await jwtVerify(token, getJwtSecretKey(), { clockTolerance: 15 });
        return NextResponse.redirect(new URL('/dashboard', request.url));
      } catch {
        // Invalid token, let them access login/register
      }
    }

    return NextResponse.next();
  }

  // Check if it's a protected route
  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname === route || pathname.startsWith(`${route}/`)
  );

  if (isProtectedRoute) {
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (!token) {
      // No token, redirect to login
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      loginUrl.searchParams.set('source', 'middleware');
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      await jwtVerify(token, getJwtSecretKey(), { clockTolerance: 15 });
      return NextResponse.next();
    } catch (error: any) {
      console.error("Middleware Auth Error:", error);
      // Invalid token, redirect to login
      const url = new URL('/login', request.url);
      url.searchParams.set('source', 'middleware_invalid');

      // Add safe debug info
      url.searchParams.set('error_name', error.name);
      url.searchParams.set('error_msg', error.message.replace(/[^a-zA-Z0-9 ]/g, '')); // Sanitize
      url.searchParams.set('code', error.code || 'unknown');

      // Debug Env Var presence (DO NOT EXPOSE THE KEY)
      // Just check if it's the default or custom
      const secret = process.env.AUTH_SECRET || 'health-agent-default-secret-key-change-me-in-prod';
      url.searchParams.set('slen', secret.length.toString());
      url.searchParams.set('is_default', secret.includes('health-agent-default') ? 'true' : 'false');

      const response = NextResponse.redirect(url);

      // Force clearing the cookie by setting it to expire immediately
      response.cookies.set({
        name: COOKIE_NAME,
        value: '',
        expires: new Date(0),
        path: '/',
      });
      // Also strictly delete it
      response.cookies.delete(COOKIE_NAME);

      return response;
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\..*|public).*)',
  ],
};
