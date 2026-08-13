import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcryptjs';
import jwt from "jsonwebtoken"
import * as Express from 'express';
import { UpdatePasswordDto } from './dto/updatePass.dto';
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService) { }

    async login(loginDto: LoginDto, response: Express.Response) {
        const { username, password } = loginDto;
        const user = await this.prisma.user.findUnique({
            where: { username: username },
            include: {
                role: true,
                managed_faculty: true
            }
        })
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }
        if (!user.is_active) {
            throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa!');
        }

        const faculty = await this.prisma.faculty.findUnique({
            where: { dean_id: user.user_id },
        })

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
                isDean: !!user.managed_faculty,
                faculty_id: faculty?.faculty_id,
                username: user.username,
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
                isDean: !!user.managed_faculty,
                faculty_id: faculty?.faculty_id,
                username: user.username,
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
                isDean: !!user.managed_faculty,
            },
            firstLogin: user.first_login,
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
                include: {
                    role: true,
                    managed_faculty: true
                }
            });

            if (!user || !user.is_active) {
                throw new UnauthorizedException('Tài khoản đã bị vô hiệu hóa hoặc không tồn tại');
            }
            const faculty = await this.prisma.faculty.findUnique({
                where: { dean_id: user.user_id },
            })

            // 💡 Nếu hợp lệ hoàn toàn -> Tạo cặp Token mới
            const newAccessToken = jwt.sign(
                {
                    id: user.user_id,
                    name: user.fullname,
                    email: user.email,
                    role: user.role.role_name,
                    isDean: !!user.managed_faculty,
                    faculty_id: faculty?.faculty_id,
                    username: user.username,
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
                    isDean: !!user.managed_faculty,
                    faculty_id: faculty?.faculty_id,
                    username: user.username,
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
    async updatePassword(updatePasswordDto: UpdatePasswordDto) {
        const { username, oldPassword, newPassword, confirmPassword } = updatePasswordDto;
        if (newPassword !== confirmPassword) {
            throw new UnauthorizedException('Mật khẩu không khớp');
        }
        const user = await this.prisma.user.findUnique({
            where: { username: username },
        })
        if (!user) {
            throw new UnauthorizedException('Username không tồn tại');
        }
        const isPasswordMatched = await bcrypt.compare(oldPassword, user.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Mật khẩu cũ không chính xác');
        }
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await this.prisma.user.update({
            where: { username: username },
            data: {
                password: hashedPassword,
                first_login: false
            },
        })
        return {
            message: 'Cập nhật mật khẩu thành công',
        }
    }
}
