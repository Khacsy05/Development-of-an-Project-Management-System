import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getExpertiseList() {
    const rawData = await prisma.expertise.findMany({
        orderBy: [
            { created_at: 'desc' },
            { expertise_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
