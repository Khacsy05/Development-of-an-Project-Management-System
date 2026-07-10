import { getCouncilList } from "@/services/council.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getCouncilList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching council list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch council list' }, { status: 500 });
    }
}
