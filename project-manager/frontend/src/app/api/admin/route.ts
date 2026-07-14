
import { getAdminList } from '../../../services/admin.service';
import { NextRequest, NextResponse } from 'next/server';


export async function GET(request: NextRequest) {
    
    try {
        const admins = await getAdminList();
        return NextResponse.json({ success: true, data: admins });
    } catch (error) {
        console.error('Error fetching admin list:', error);
        return NextResponse.json({ success: false, error: 'Failed to fetch admin list' }, { status: 500 });
    }
}