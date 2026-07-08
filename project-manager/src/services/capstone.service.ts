import { CapstoneStatus } from '@/generated/prisma';
import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getCapstoneList(status?: CapstoneStatus) {
    const rawData = await prisma.capstone.findMany({
        where: { status },
        include: {
            student: { select: { usercode: true, fullname: true} },
            topic: { select: { title: true } },
            lecturer: { select: { usercode: true, fullname: true } },
        },
        orderBy: { created_at: 'desc' }
    });
    return serialize(rawData);
}