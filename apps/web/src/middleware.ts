import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { SESSION_NAME } from '@/lib/constants';
import { decodeJWT } from '@/lib/utils';

// Paths that should be accessible without authentication
const publicPaths = [
  '/',
  '/forgot-password',
  '/password-reset',
  '/signup',
  '/api/auth/callback/github', // NextAuth callback path
  '/auth/callback'
];

const isPublicPath = (pathname: string) => {
  return publicPaths.some(publicPath =>
    pathname === publicPath || pathname.startsWith('/api/auth/')
  );
};

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Allow public paths
    if (isPublicPath(pathname)) {
      return NextResponse.next();
    }

    const token = request.cookies.get(SESSION_NAME)?.value;
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value;

    // Check if user is authenticated
    const isAuthenticated = token || nextAuthToken;

    if (isAuthenticated) {
      if (token) {
        const decodedToken = decodeJWT(token);
        if (decodedToken?.exp && Date.now() >= decodedToken.exp * 1000) {
          // Token is expired, log out
          const response = NextResponse.redirect(new URL('/', request.url));
          response.cookies.delete(SESSION_NAME);
          response.cookies.delete('next-auth.session-token');
          return response;
        }
      }

      // Redirect authenticated users away from the login page
      if (pathname === '/') {
        return NextResponse.redirect(new URL('/home', request.url));
      }
    } else {
      // Redirect unauthenticated users to the login page with callbackUrl
      if (!isPublicPath(pathname)) {
        const signInUrl = new URL('/', request.url);
        signInUrl.searchParams.set('callbackUrl', request.url);
        return NextResponse.redirect(signInUrl);
      }
    }

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
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
};
