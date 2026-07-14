import { getStudentList } from '../../../services/student.servicce';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    const isAvailable =request.nextUrl.searchParams.get('isAvailable');
    try {
        const students = await getStudentList();
        return NextResponse.json({ success: true, data: students });
    } catch (error) {
        console.error('Error fetching student list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch student list' }, { status: 500 });
    }
}