import { getClassList } from "../../../services/class.service";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
    const data = await getClassList();
    return NextResponse.json({ success: true, data: data });
}