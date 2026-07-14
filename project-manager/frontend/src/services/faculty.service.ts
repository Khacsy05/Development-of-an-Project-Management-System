import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getUserFacultyList() {
    const rawData = await prisma.user.findMany({
        where: { role_id: 4n },
        include: {
            faculty: { select: { name: true } },
        },
        orderBy: [
            { created_at: 'desc' }, // Tầng 1: Ưu tiên ông nào mới tạo trước
            { user_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
export async function getFacultyList() {
    const rawData = await prisma.faculty.findMany({
        orderBy: [
            { created_at: 'desc' }, // Tầng 1: Ưu tiên ông nào mới tạo trước
            { faculty_id: 'desc' }
        ]
    });
    return serialize(rawData);
}