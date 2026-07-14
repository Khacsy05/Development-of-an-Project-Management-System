import { getMajorList } from "../../../services/major.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getMajorList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching major list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch major list' }, { status: 500 });
    }
}
