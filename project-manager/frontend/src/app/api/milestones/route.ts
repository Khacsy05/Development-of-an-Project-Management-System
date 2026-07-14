import { getMilestoneList } from "../../../services/milestone.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getMilestoneList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching milestone list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch milestone list' }, { status: 500 });
    }
}
