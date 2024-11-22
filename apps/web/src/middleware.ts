import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequestWithAuth } from 'next-auth/middleware';
import { SESSION_NAME } from '@/lib/constants';
import { decodeJWT } from '@/lib/utils';

// Paths that should be accessible without authentication
const publicPaths = [
  '/',
  '/forgot-password',
  '/password-reset',
  '/signup',
  '/api/auth/callback/github',
  '/auth/callback'
];

// Paths that should redirect to home if user is authenticated
const authOnlyPaths = [
  '/',
  '/signup',
  '/forgot-password',
  '/password-reset'
];

const isPublicPath = (pathname: string) => {
  return publicPaths.some(publicPath =>
    pathname === publicPath || pathname.startsWith('/api/auth/')
  );
};

const isAuthOnlyPath = (pathname: string) => {
  return authOnlyPaths.some(path => pathname === path);
};

export default withAuth(
  function middleware(request: NextRequestWithAuth) {
    const { pathname } = request.nextUrl;

    const token = request.cookies.get(SESSION_NAME)?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;
    const isAuthenticated = token || nextAuthToken;

    // Check for expired token
    if (token) {
      const decodedToken = decodeJWT(token);
      if (decodedToken?.exp && Date.now() >= decodedToken.exp * 1000) {
        // Token is expired, log out and redirect to login
        const response = NextResponse.redirect(new URL('/', request.url));
        response.cookies.delete(SESSION_NAME);
        response.cookies.delete('next-auth.session-token');
        return response;
      }
    }

    // If user is authenticated and tries to access auth-only pages (login, signup, etc.)
    // redirect them to the home page
    if (isAuthenticated && isAuthOnlyPath(pathname)) {
      return NextResponse.redirect(new URL('/home', request.url));
    }

    // If user is not authenticated and tries to access protected routes
    if (!isAuthenticated && !isPublicPath(pathname)) {
      const signInUrl = new URL('/', request.url);
      signInUrl.searchParams.set('callbackUrl', request.url);
      return NextResponse.redirect(signInUrl);
    }

    // Allow the request to proceed
    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl;
        if (isPublicPath(pathname)) return true;
        const customToken = req.cookies.get(SESSION_NAME)?.value;
        return !!token || !!customToken;
      },
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - assets (public assets)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};