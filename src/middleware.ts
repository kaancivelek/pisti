import NextAuth from 'next-auth';
import { authConfig } from './auth.config';
import { NextResponse } from 'next/server';

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;
  const role = (session?.user as any)?.role;

  // /admin rotaları sadece "admin" rolüne açık
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
    if (role !== 'admin') {
      return NextResponse.redirect(new URL('/', req.url));
    }
  }

  // /profile sadece giriş yapmış kullanıcılara açık
  if (pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/profile/:path*'],
};
