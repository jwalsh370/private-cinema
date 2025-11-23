// src/app/api/videos/route.ts
import { NextResponse } from 'next/server';
import { listMediaObjects, getPresignedUrl } from '@/lib/s3-helpers';

export async function GET() {
  try {
    console.log('Fetching videos from S3...');
    
    const media = await listMediaObjects();
    console.log('Raw S3 objects:', media);

    // Filter out non-video files
    const videoFiles = media.filter(item => {
      const key = item.Key.toLowerCase();
      return !key.includes('posters/') && 
             !key.includes('subtitles/') &&
             (key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.avi'));
    });

    console.log('Filtered video files:', videoFiles);

    // Group by category and generate presigned URLs
    const videosByCategory: Record<string, any[]> = {};
    
    for (const item of videoFiles) {
      const category = item.Category || 'other';
      if (!videosByCategory[category]) {
        videosByCategory[category] = [];
      }
      
      try {
        const presignedUrl = await getPresignedUrl(item.Key);
        videosByCategory[category].push({
          ...item,
          Url: presignedUrl
        });
      } catch (error) {
        console.error(`Error generating URL for ${item.Key}:`, error);
        videosByCategory[category].push(item);
      }
    }

    console.log('Final organized videos:', videosByCategory);
    return NextResponse.json(videosByCategory);

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
