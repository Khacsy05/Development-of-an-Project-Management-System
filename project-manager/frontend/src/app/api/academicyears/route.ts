import { getAcademicYearList } from "../../../services/academicyear.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getAcademicYearList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching academic year list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch academic year list' }, { status: 500 });
    }
}
