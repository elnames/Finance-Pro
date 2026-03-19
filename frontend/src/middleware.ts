import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isDashboard = request.nextUrl.pathname.startsWith('/dashboard');

  if (isDashboard && !token) {
    // Redirigir a login si no hay token (nota: en este MVP usaremos localStorage en cliente, 
    // pero el middleware es buena práctica para SSR si se usan cookies)
    // Para simplificar el MVP con localStorage, permitiremos el paso y el cliente manejará el redirect.
  }
  
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
