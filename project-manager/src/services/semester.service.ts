import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getSemesterList() {
    const rawData = await prisma.semester.findMany({
        include: {
            academic_year: { select: { year_name: true } },
        },
        orderBy: [
            { created_at: 'desc' },
            { semester_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
