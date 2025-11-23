// src/app/api/videos/route.ts
import { listMediaObjects, getPresignedUrl } from '@/lib/s3-helpers';

export async function GET() {
  try {
    const media = await listMediaObjects();
    
    // Filter out non-video files and organize by category
    const videoFiles = media.filter(item => {
      const key = item.Key.toLowerCase();
      
      // Exclude system folders and non-video files
      const isSystemFolder = key.includes('posters/') || 
                             key.includes('subtitles/') ||
                             key.startsWith('uploads/');
      
      const isVideoFile = key.endsWith('.mp4') || 
                         key.endsWith('.mov') || 
                         key.endsWith('.avi') ||
                         key.endsWith('.mkv');
      
      return !isSystemFolder && isVideoFile;
    });

    // Group by category
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
        console.error(`Error generating pre-signed URL for ${item.Key}:`, error);
        videosByCategory[category].push(item);
      }
    }
    
    return Response.json(videosByCategory);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}

