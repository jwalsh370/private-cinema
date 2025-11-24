// src/app/api/videos/metadata/pending/route.ts
import { NextResponse } from 'next/server';
import { getVideosWithPendingMetadata } from '@/lib/videoStorage';

export async function GET() {
  try {
    const videos = await getVideosWithPendingMetadata();
    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error fetching pending metadata:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
