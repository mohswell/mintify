import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_NAME } from "@/lib/constants";
import { decodeJWT } from "@/lib/utils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authPages = [
    "/",
    "/signup",
    "/forgot-password",
    "/password-reset",
  ];

  const oauthPaths = [
    '/auth/callback/github',
    '/api/auth/github-login'
  ];

  const isAuthPage = authPages.includes(pathname);
  const isOAuthPath = oauthPaths.some(path => pathname.includes(path));

  // Get the token from the session storage
  const token = request.cookies.get(SESSION_NAME)?.value;

  const handleLogout = () => {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(SESSION_NAME);
    return response;
  };

  // Special handling for OAuth and auth-related paths
  if (isOAuthPath) {
    return NextResponse.next();
  }

  if (token) {
    // Decode the token
    const decodedToken = decodeJWT(token);

    // Check if the token has expired
    if (
      decodedToken &&
      decodedToken.exp &&
      Date.now() >= decodedToken.exp * 1000
    ) {
      // Log the user out if the token has expired
      return handleLogout();
    }

    if (isAuthPage) {
      // If user is already logged in and tries to access auth pages, redirect to dashboard
      return NextResponse.redirect(new URL("/home", request.url));
    }
  } else if (!isAuthPage) {
    // Redirect to login if no token and trying to access protected routes
    return handleLogout();
  }

  // Allow access to all other routes
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};