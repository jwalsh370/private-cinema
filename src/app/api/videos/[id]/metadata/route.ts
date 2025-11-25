// src/app/api/videos/[id]/metadata/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateVideoMetadata } from '@/lib/videoStorage';


export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { metadata } = await request.json();
    const videoId = decodeURIComponent(params.id);

    console.log('Updating metadata for video:', videoId);
    console.log('Metadata to assign:', metadata);

    // Update the video metadata in your database
    const updatedVideo = await updateVideoMetadata(videoId, metadata);
    
    return NextResponse.json({ 
      success: true, 
      message: 'Metadata updated successfully',
      video: updatedVideo
    });

  } catch (error) {
    console.error('Error updating metadata:', error);
    return NextResponse.json(
      { error: 'Failed to update metadata' },
      { status: 500 }
    );
  }
}
