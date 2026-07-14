import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getClassList() {
    const rawData = await prisma.class.findMany({
        include: {
            major: { select: { major_name: true } },
            lecturer: { select: { usercode: true, fullname: true } },
        },
        orderBy: [
            { created_at: 'desc' },
            { class_id: 'desc' }
        ]
    });
    return serialize(rawData);
}