// src/app/api/videos/route.ts
import { listMediaObjects, getPresignedUrl } from '@/lib/s3-helpers';

export async function GET() {
  try {
    const media = await listMediaObjects();
    
    // Generate pre-signed URLs for each video
    const mediaWithPresignedUrls = await Promise.all(
      media.map(async (item) => {
        try {
          const presignedUrl = await getPresignedUrl(item.Key);
          return {
            ...item,
            Url: presignedUrl // Replace public URL with pre-signed URL
          };
        } catch (error) {
          console.error(`Error generating pre-signed URL for ${item.Key}:`, error);
          return item; // Fall back to public URL if pre-signed fails
        }
      })
    );
    
    return Response.json(mediaWithPresignedUrls);
  } catch (error) {
    console.error('API Error:', error);
    return Response.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
