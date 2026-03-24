import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * The primary auth store is localStorage (client-side).
 * The middleware checks for a `token` cookie as an optional
 * server-side fast-path; the DashboardLayout's useEffect
 * provides the authoritative client-side guard.
 *
 * To enable the cookie fast-path in production, set the
 * `token` cookie (httpOnly, Secure, SameSite=Strict) when
 * issuing JWTs on the server.
 */
export function proxy(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  // If a cookie token is present but malformed, clear it and redirect to login
  // to prevent broken UI state or replay of tampered tokens.
  if (isDashboard && token !== undefined) {
    const parts = token.split('.');
    if (parts.length !== 3) {
      const loginUrl = new URL('/login', request.url);
      const response = NextResponse.redirect(loginUrl);
      response.cookies.delete('token');
      return response;
    }
  }

  // Only redirect when a server-side cookie is explicitly an empty string.
  // If no cookie is present we let the client-side guard in
  // DashboardLayout handle it (localStorage-based auth).
  if (isDashboard && token === '') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
