import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getAdminList() {
    const rawData = await prisma.user.findMany({
        where: { role_id: 1 },
        orderBy: { created_at: 'desc' }
    });
    return serialize(rawData);
}