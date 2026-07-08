import { NextRequest, NextResponse } from 'next/server';
import { getTopicList } from '@/services/topic.service';

export async function GET(request: NextRequest) {
    const isAvailable =request.nextUrl.searchParams.get('isAvailable');
    try {
        const topics = await getTopicList(isAvailable === 'true' ? true : isAvailable === 'false' ? false : undefined);
        return NextResponse.json(topics);
    } catch (error) {
        console.error('Error fetching topic list:', error);
        return NextResponse.json({ error: 'Failed to fetch topic list' }, { status: 500 });
    }
}