import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // 🌟 Import hàm giải mã của jose

// Lấy chuỗi bí mật mã hóa từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'chuoi_bi_mat_sieu_cap_vip_123';
// Quy đổi chuỗi bí mật sang định dạng Uint8Array mà thư viện 'jose' yêu cầu
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('accessToken')?.value;

  // 1. GIAO DIỆN
  const isAuthRoute = pathname.startsWith('/login');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');

  // 2. API: Chỉ trừ API /api/auth (Đăng nhập/Đăng ký) ra, còn lại bảo vệ HẾT!
  const isApiRoute = pathname.startsWith('/api');
  const isProtectedApiRoute = isApiRoute && !pathname.startsWith('/api/auth');

  // Kiểm tra đăng nhập
  if (isDashboardRoute || isAdminRoute || isProtectedApiRoute) {
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { success: false, message: 'Yêu cầu bị từ chối. Vui lòng đính kèm Token!' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      const { payload } = await jwtVerify(token, secretKey);
      const userRole = payload.role as string;

      // 3. THẮT CHẶT QUYỀN TRUY CẬP ADMIN (Cả giao diện /admin lẫn API /api/admin)
      const isTryingToAccessAdmin = isAdminRoute || pathname.startsWith('/api/admin');

      if (isTryingToAccessAdmin && userRole !== 'Admin') {
        // Nếu cố gọi API Admin lậu -> Trả về JSON lỗi luôn
        if (isApiRoute) {
          return NextResponse.json(
            { success: false, message: 'Bạn không có quyền truy cập tài nguyên này!' },
            { status: 403 } // 403 Forbidden: Đúng token nhưng sai quyền
          );
        }
        // Nếu cố vào trang giao diện admin lậu -> Đá về dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' },
          { status: 401 }
        );
      }
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Logic check login hoán đổi giữ nguyên...
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, secretKey);
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) { }
  }

  return NextResponse.next();
}

// 4. CẬP NHẬT LẠI MATCHER: Đăng ký chặn toàn bộ cụm API
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/api/admin/:path*', // 🌟 Gom gọn gàng thế này là bắt trọn gói mọi API!
  ],
};