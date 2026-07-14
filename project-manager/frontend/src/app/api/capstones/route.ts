import { NextRequest, NextResponse } from 'next/server';
import { getCapstoneList } from '../../../services/capstone.service';

export async function GET(request: NextRequest) {
    const capstones = request.nextUrl.searchParams.get('status') as any;
    if(capstones && !['PENDING_APPROVAL', 'DOING', 'SUBMITTED_FINAL', 'DEFENSE_ELIGIBLE', 'COMPLETED', 'FAILED'].includes(capstones)) {
        return NextResponse.json({ success: false, message: 'Invalid status parameter' }, { status: 400 });
    }
    const data = await getCapstoneList(capstones);
    return NextResponse.json({ success: true, data: data });
}