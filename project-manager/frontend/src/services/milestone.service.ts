import { prisma } from '../../../backend/src/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getMilestoneList() {
    const rawData = await prisma.milestone.findMany({
        include: {
            semester: { select: { semester_name: true } },
        },
        orderBy: [
            { created_at: 'desc' },
            { milestone_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
