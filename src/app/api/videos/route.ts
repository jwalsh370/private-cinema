// src/app/api/videos/route.ts
import { listMediaObjects } from '@/lib/s3-helpers';

export async function GET() {
  try {
    const media = await listMediaObjects();
    return Response.json(media);
  } catch (error) {
    return Response.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
