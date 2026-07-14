import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getLecturerList() {
    const rawData = await prisma.user.findMany({
        where: { role_id: 2 },
        orderBy: [
            { created_at: 'desc' }, // Tầng 1: Ưu tiên ông nào mới tạo trước
            { user_id: 'desc' }
        ]
    });
    return serialize(rawData);
}