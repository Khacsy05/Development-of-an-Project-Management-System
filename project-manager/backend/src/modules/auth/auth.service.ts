import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import * as bcrypt from 'bcrypt';
import jwt from "jsonwebtoken"
@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService){}

    async login(loginDto: LoginDto){
        const {username,password} = loginDto;
        const user = await this.prisma.user.findUnique({
            where: {username: username}
        })
        if (!user) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }

        // 3. So sánh mật khẩu (Thực tế bạn nên dùng thư viện 'bcrypt' để hash mật khẩu)
        const isPasswordMatched = await bcrypt.compare(password, user.password);
        if (!isPasswordMatched) {
            throw new UnauthorizedException('Email hoặc mật khẩu không chính xác!');
        }

        const token = jwt.sign(
            {
                id: user.user_id,
                name: user.fullname,
                email: user.email,
            },
            process.env.JWT_SECRET || "SECRET_KEY",
            { expiresIn: "15m" }
        )

        // 4. Nếu khớp hoàn toàn, trả về thông tin user (hoặc Access Token JWT)
        return {
        message: 'Đăng nhập thành công',
        token,
        user: {
            id: user.user_id,
            name: user.fullname,
            email: user.email,
        },
        };
    }
}
