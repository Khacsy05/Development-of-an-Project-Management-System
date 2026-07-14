import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getCouncilList() {
    const rawData = await prisma.council.findMany({
        include: {
            semester: { select: { semester_name: true } },
            members: {
                include: {
                    lecturer: { select: { fullname: true, usercode: true } }
                }
            }
        },
        orderBy: [
            { created_at: 'desc' },
            { council_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
