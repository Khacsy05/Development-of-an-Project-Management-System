import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose'; // 🌟 Import hàm giải mã của jose

// Lấy chuỗi bí mật mã hóa từ biến môi trường
const JWT_SECRET = process.env.JWT_SECRET || 'chuoi_bi_mat_sieu_cap_vip_123';
// Quy đổi chuỗi bí mật sang định dạng Uint8Array mà thư viện 'jose' yêu cầu
const secretKey = new TextEncoder().encode(JWT_SECRET);

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Lấy token từ trong Cookie gửi kèm theo request
  const token = request.cookies.get('token')?.value;

  // 2. Định nghĩa các tuyến đường cần bảo vệ
  const isAuthRoute = pathname.startsWith('/login');
  const isDashboardRoute = pathname.startsWith('/dashboard');
  const isAdminRoute = pathname.startsWith('/admin');
  const isProtectedApiRoute = pathname.startsWith('/api/capstones') || pathname.startsWith('/api/topics');

  // Nếu người dùng vào các trang quản lý hoặc gọi API được bảo vệ cần đăng nhập
  if (isDashboardRoute || isAdminRoute || isProtectedApiRoute) {
    if (!token) {
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { success: false, message: 'Yêu cầu bị từ chối. Vui lòng đính kèm Token!' },
          { status: 401 }
        );
      }
      // Chưa có token? Đá ngay về trang login kèm theo trang đích để đăng nhập xong quay lại
      return NextResponse.redirect(new URL(`/login?callbackUrl=${pathname}`, request.url));
    }

    try {
      // 3. Tiến hành giải mã Token bằng thư viện 'jose'
      const { payload } = await jwtVerify(token, secretKey);

      const userRole = payload.role as string; // Lấy ra quyền (Admin, Student, Lecturer)

      // 4. Phân quyền thắt chặt: Nếu cố tình vào trang Admin mà không phải quyền Admin
      if (isAdminRoute && userRole !== 'Admin') {
        // Trả về trang lỗi từ chối truy cập hoặc đá về dashboard thường
        return NextResponse.redirect(new URL('/dashboard', request.url));
      }

    } catch (error) {
      // Token giả mạo hoặc hết hạn?
      if (isProtectedApiRoute) {
        return NextResponse.json(
          { success: false, message: 'Token không hợp lệ hoặc đã hết hạn!' },
          { status: 401 }
        );
      }
      // Xóa cookie rác và đá về trang login
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.cookies.delete('token');
      return response;
    }
  }

  // Nếu người dùng ĐÃ ĐĂNG NHẬP rồi mà vẫn cố tình vào lại trang `/login`
  if (isAuthRoute && token) {
    try {
      await jwtVerify(token, secretKey);
      // Đang yên đang lành thì phi thẳng vào trang chủ/dashboard luôn, không cho login nữa
      return NextResponse.redirect(new URL('/dashboard', request.url));
    } catch (e) {
      // Token lỗi thì cho họ ở lại trang login bình thường
    }
  }

  return NextResponse.next();
}

// 5. Cấu hình "Matcher" để báo cho Next.js biết Middleware chỉ cần chạy ở những trang nào
// Né các file hệ thống, hình ảnh, icon ra để web chạy cho nhanh
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/api/capstones/:path*',
    '/api/topics/:path*',
  ],
};