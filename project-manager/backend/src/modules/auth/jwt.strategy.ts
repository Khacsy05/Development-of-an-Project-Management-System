import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor() {
    super({
      // 1. Tự động bóc tách Token từ Header "Authorization: Bearer <token>"
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      
      // 2. Không chấp nhận các token đã hết hạn
      ignoreExpiration: false,
      
      // 3. Khóa bí mật dùng để giải mã và xác thực chữ ký của Token
      // ⚠️ Lưu ý: Thay chuỗi này bằng chuỗi Secret Key thực tế mà bạn dùng khi tạo Token lúc Login
      secretOrKey: process.env.JWT_SECRET || "SECRET_KEY", 
    });
  }

  /**
   * Hàm này sẽ TỰ ĐỘNG CHẠY ngay sau khi Passport đã verify Token thành công.
   * @param payload Dữ liệu đã được giải mã từ bên trong Token (chứa id, email, role_id...)
   */
  async validate(payload: any) {
    // Nếu token hợp lệ nhưng rỗng payload (trường hợp hy hữu)
    if (!payload) {
      throw new UnauthorizedException('Token không hợp lệ!');
    }

    // 🌟 TRẢ VỀ THÔNG TIN USER:
    // Bạn return dữ liệu gì ở đây, NestJS sẽ tự động đính dữ liệu đó vào "request.user".
    // Nhờ vậy, RolesGuard chạy phía sau chỉ cần lấy "request.user.role_id" ra để so khớp.
    return {
      id: payload.user_id,        // payload.sub thường là ID của user
      name: payload.fullname,
      email: payload.email,
      role: payload.role, // Truyền role_id để khớp với DB của bạn
    };
  }
}