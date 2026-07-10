import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getMajorList() {
    const rawData = await prisma.major.findMany({
        include: {
            faculty: { select: { name: true } },
        },
        orderBy: [
            { created_at: 'desc' },
            { major_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
