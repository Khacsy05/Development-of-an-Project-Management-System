import { getExpertiseList } from "@/services/expertise.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    try {
        const data = await getExpertiseList();
        return NextResponse.json({ success: true, data });
    } catch (error) {
        console.error('Error fetching expertise list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch expertise list' }, { status: 500 });
    }
}
