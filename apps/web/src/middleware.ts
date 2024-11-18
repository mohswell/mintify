import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SESSION_NAME } from "@/lib/constants";
import { decodeJWT } from "@/lib/utils";

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const authPages = ["/"];

  const isAuthPage = authPages.includes(pathname);

  // Get the token from the session storage
  const token = request.cookies.get(SESSION_NAME)?.value;

  const handleLogout = () => {
    const response = NextResponse.redirect(new URL("/", request.url));
    response.cookies.delete(SESSION_NAME);

    return response;
  };

  if (token) {
    try{
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
        // If user is already logged in and tries to access auth pages, redirect to homepage
        return NextResponse.redirect(new URL("/home", request.url));
      }
    } catch(error){
      return handleLogout();
    }
  } else if (!isAuthPage) {
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