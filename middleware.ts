// Middleware for authentication and route protection
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const JWT_SECRET = new TextEncoder().encode(
  process.env.AUTH_SECRET || 'health-agent-default-secret-key'
);

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
];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if it's a public route
  if (publicRoutes.includes(pathname)) {
    // If user is authenticated and trying to access login/register, redirect to dashboard
    const token = request.cookies.get(COOKIE_NAME)?.value;

    if (token && (pathname === '/login' || pathname === '/register')) {
      try {
        await jwtVerify(token, JWT_SECRET);
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
      return NextResponse.redirect(loginUrl);
    }

    try {
      // Verify token
      await jwtVerify(token, JWT_SECRET);
      return NextResponse.next();
    } catch {
      // Invalid token, redirect to login
      const response = NextResponse.redirect(new URL('/login', request.url));
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
