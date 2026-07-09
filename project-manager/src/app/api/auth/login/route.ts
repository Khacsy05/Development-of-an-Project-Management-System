import { NextResponse } from "next/server";
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
async function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function POST(request: Request) {
    const { username, password } = await request.json();

    const user = await prisma.user.findUnique({
        where: { username },
        include: {
            role: { select: { role_name: true } },
        },
    });

    if (!user) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    // Here you would typically compare the provided password with the hashed password stored in the database
    // For demonstration purposes, we'll assume the password is correct
    if (user.password !== password) {
        return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const serializedUser = await serialize(user);
    const token = jwt.sign(
            { 
                userId: user.user_id.toString(), 
                role: user.role.role_name
            },
            process.env.JWT_SECRET!,
            { expiresIn: "1d" } // Token có tác dụng trong 1 ngày
        );

    return NextResponse.json({ user: serializedUser, token });
}