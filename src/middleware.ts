import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { COOKIE_NAME, decrypt } from './lib/auth';

const publicRoutes = ['/login', '/favicon.ico', '/manifest.json', '/sw.js', '/RTX LOGO.png'];

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  
  if (publicRoutes.includes(path) || path.startsWith('/_next') || path.startsWith('/api') || path.startsWith('/icons/')) {
    return NextResponse.next();
  }

  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const payload = await decrypt(token);
  if (!payload) {
    // Invalid or expired token
    const response = NextResponse.redirect(new URL('/login', request.url));
    response.cookies.delete(COOKIE_NAME);
    return response;
  }

  // Basic authorization for manager-only routes
  if (path.startsWith('/users-list') && payload.role !== 'MANAGER') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}
