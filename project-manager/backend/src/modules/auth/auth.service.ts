import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
import * as Express from 'express';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}

    async login(loginDto: LoginDto,response : Express.Response){
        const {username,password} = loginDto;
        const user = await this.prisma.user.findUnique({
            where: {username: username},
            include : {
                role: true
            }
        })
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }

        // 3. So sánh mật khẩu (Thực tế bạn nên dùng thư viện 'bcrypt' để hash mật khẩu)
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }

        const accessToken = jwt.sign(
            {
                id: user.user_id,
                name: user.fullname,
                email: user.email,
                role: user.role.role_name,
            },
            process.env.JWT_ACCESS_SECRET || "ACCESS_SECRET_KEY",
            { expiresIn: "15m" }
        )

        const refreshToken = jwt.sign(
            {
                id: user.user_id,
                name: user.fullname,
                email: user.email,
                role: user.role.role_name,
            },
            process.env.JWT_REFRESH_SECRET || "REFRESH_SECRET_KEY",
            { expiresIn: "7d" }
        )

        response.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            path: '/',
        });

        // 4. Nếu khớp hoàn toàn, trả về thông tin user (hoặc Access Token JWT)
        return {
            message: 'Đăng nhập thành công',
            accessToken,
            user: {
                id: user.user_id,
                name: user.fullname,
                email: user.email,
                role: user.role.role_name,
            },
        };
    }
    async refreshTokens(request: Express.Request, response: Express.Response) { 
        const refreshToken = request.cookies?.['refreshToken'];
        try {
            // 🔍 A. Kiểm tra chữ ký và hạn sử dụng của Refresh Toke

            const payload = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY'
            ) as any;

            // 🔍 B. (Tùy chọn) Kiểm tra User trong CSDL xem có còn tồn tại/bị khóa hay không
            const user = await this.prisma.user.findUnique({
                where: { user_id: BigInt(payload.id) },
                include: { role: true }
            });

            if (!user) {
                throw new UnauthorizedException('Người dùng không còn tồn tại');
            }

            // 💡 Nếu hợp lệ hoàn toàn -> Tạo cặp Token mới
            const newAccessToken = jwt.sign(
                {
                    id: user.user_id,
                    name: user.fullname,
                    email: user.email,
                    role: user.role.role_name,
                },
                process.env.JWT_ACCESS_SECRET || 'ACCESS_SECRET_KEY',
                { expiresIn: '15m' }
            );

            const newRefreshToken = jwt.sign(
            {
                id: user.user_id,
                name: user.fullname,
                email: user.email,
                role: user.role.role_name,
            },
            process.env.JWT_REFRESH_SECRET || 'REFRESH_SECRET_KEY',
            { expiresIn: '7d' }
            );

            response.cookie('refreshToken', newRefreshToken, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000,
                path: '/',
            });

            return {
                accessToken: newAccessToken,
            };
        } catch (error) {
            // ❌ Nếu token bị sai chữ ký hoặc HẾT HẠN (expired), jwt.verify sẽ văng lỗi vào đây
            throw new UnauthorizedException('Refresh Token không hợp lệ hoặc đã hết hạn');
        }
    }
}
