import { getFacultyList } from '../../../services/faculty.service';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    try {
        const faculty = await getFacultyList();
        return NextResponse.json({ success: true, data: faculty });
    } catch (error) {
        console.error('Error fetching faculty list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch faculty list' }, { status: 500 });
    }
}