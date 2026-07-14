import { getSemesterList } from "../../../services/semester.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getSemesterList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching semester list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch semester list' }, { status: 500 });
    }
}
