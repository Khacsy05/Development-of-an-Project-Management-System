import { prisma } from '@/lib/prisma';

function serialize(data: any) {
    return JSON.parse(JSON.stringify(data, (_, v) => typeof v === 'bigint' ? v.toString() : v));
}

export async function getAcademicYearList() {
    const rawData = await prisma.academicYear.findMany({
        orderBy: [
            { created_at: 'desc' },
            { year_id: 'desc' }
        ]
    });
    return serialize(rawData);
}
