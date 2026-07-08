import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getTopicList(isAvailable?: boolean) {
    const rawData = await prisma.topic.findMany({
        where: {
            is_available:  isAvailable !== undefined ? isAvailable : undefined,
        },
        include: {
            expertise: { select: { name: true } },
        },
        orderBy: { created_at: 'desc' }
    });
    return serialize(rawData);
}