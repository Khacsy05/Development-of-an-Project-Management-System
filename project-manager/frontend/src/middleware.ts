import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Chuỗi secret key giải mã refreshToken (Cần giống với JWT_REFRESH_SECRET bên NestJS)
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'day_la_khoa_rat_bi_mat_refresh_token';
const secretKey = new TextEncoder().encode(JWT_REFRESH_SECRET);

export async function middleware(request: NextRequest) {
  const {pathname} = request.nextUrl;
  const refreshToken = request.cookies.get("refreshToken")?.value
  const isAuthRouter = pathname.startsWith('/auth/login')
  const isProtectedRouter = pathname.startsWith("/dashboard") || pathname.startsWith('/admin');
  const isAdminRoute = pathname.startsWith('/admin');

  if(isProtectedRouter && !refreshToken){
    const loginUrl = new URL('/auth/login',request.url);
    loginUrl.searchParams.set('callbackUrl',pathname)
    return NextResponse.redirect(loginUrl)
  }
  if(refreshToken){
    try {
      const {payload} = await jwtVerify(refreshToken,secretKey)
      const userRole = payload.role as string

      if(isAuthRouter){
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

      if(isAdminRoute && userRole !== "Admin"){
        return NextResponse.redirect(new URL('/dashboard', request.url))
      }

    } catch (error) {
      if (isProtectedRouter) {
        const response = NextResponse.redirect(new URL('/auth/login', request.url));
        response.cookies.delete('refreshToken');
        return response;
      }
    }
  }
}

// 4. Config Matcher: CHỈ BẮT CÁC TRANG GIAO DIỆN (Bỏ hoàn toàn /api)
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
  ],
};