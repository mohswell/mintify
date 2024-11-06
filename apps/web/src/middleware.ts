import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_NAME } from "@/lib/constants";
import { decodeJWT } from "@/lib/utils";

export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;

  const authPages = [
    "/login",
    "/verify",
    "/forgot-password",
    "/password-reset",
  ];

  const isAuthPage = authPages.includes(pathname);
  const isSignupPage = pathname === "/signup";

  // Get the token from the session storage
  const token = request.cookies.get(SESSION_NAME)?.value;

  const handleLogout = () => {
    const response = NextResponse.redirect(new URL("/login", request.url));
    response.cookies.delete(SESSION_NAME);

    return response;
  };

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
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  } else if (!isAuthPage) {
    // No token and trying to access a protected route, but allow signup with valid token
    if (isSignupPage && searchParams.has("token")) {
      // Allow access to the signup page if a valid token is present in the URL
      return NextResponse.next();
    }
    return handleLogout();
  }

  // Allow access to auth pages if not logged in, or to protected routes if authenticated
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!api|_next/static|_next/image|favicon.ico|assets).*)",
  ],
};
