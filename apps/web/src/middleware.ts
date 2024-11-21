// src/middleware.ts
import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { SESSION_NAME } from '@/lib/constants'
import { decodeJWT } from '@/lib/utils'

// Paths that should be accessible without authentication
const publicPaths = [
  '/login',
  '/forgot-password',
  '/password-reset',
  '/signup',
  '/api/auth/callback/github',  // NextAuth callback path
  '/auth/callback'
]

// Helper to check if path matches any public paths
const isPublicPath = (pathname: string) => {
  return publicPaths.some(publicPath =>
    pathname === publicPath || pathname.startsWith('/api/auth/')
  )
}

export default withAuth(
  function middleware(request: NextRequest) {
    const { pathname, searchParams } = request.nextUrl

    // Allow all NextAuth paths
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    const isAuthPage = isPublicPath(pathname)
    const token = request.cookies.get(SESSION_NAME)?.value
    const nextAuthToken = request.cookies.get('next-auth.session-token')?.value

    // Handle logout
    const handleLogout = () => {
      const response = NextResponse.redirect(new URL('/', request.url))
      response.cookies.delete(SESSION_NAME)
      response.cookies.delete(nextAuthToken || 'Failed to delete token')
      return response
    }

    // If user has either token type, they're authenticated
    const isAuthenticated = token || nextAuthToken

    if (isAuthenticated) {
      // If using custom token, check expiration
      if (token) {
        const decodedToken = decodeJWT(token)
        if (
          decodedToken
          && decodedToken.exp
          && Date.now() >= decodedToken.exp * 1000
        ) {
          return handleLogout()
        }
      }

      // Redirect from auth pages to homepage if authenticated
      if (isAuthPage) {
        return NextResponse.redirect(new URL('/home', request.url))
      }
    } else {
      // Not authenticated and trying to access protected route--but allow signup with token
      if (!isAuthPage) {
        if (pathname === '/signup' && searchParams.has('token')) {
          return NextResponse.next()
        }
        return handleLogout()
      }
    }

    return NextResponse.next()
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        const { pathname } = req.nextUrl

        // Always allow public paths and NextAuth paths
        if (isPublicPath(pathname) || pathname.startsWith('/api/auth/')) {
          return true
        }

        // Check for either NextAuth token or custom token
        const customToken = req.cookies.get(SESSION_NAME)?.value
        return !!token || !!customToken
      },
    },
  }
)

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api/auth/* (NextAuth paths)
     * 2. /_next/* (Next.js internals)
     * 3. /static/* (static files)
     * 4. /favicon.ico, /assets (other static files)
     */
    '/((?!_next/static|_next/image|favicon.ico|assets).*)',
  ],
}