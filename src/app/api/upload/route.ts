// src/app/api/upload/route.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-helpers';
import { parseFilename } from '@/utils/filenameParser';
import { storeVideoInDatabase } from '@/lib/videoStorage';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;

    if (!file || !category || !type) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Parse filename for metadata
    const parsedFilename = parseFilename(file.name);
    
    const timestamp = Date.now();
    const safeFilename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const key = `${category}/${timestamp}-${safeFilename}`;

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        category,
        fileType: type,
        uploadDate: new Date().toISOString(),
        parsedTitle: parsedFilename.cleanTitle,
        parsedYear: parsedFilename.year || '',
        parsedQuality: parsedFilename.quality || '',
        parsedSource: parsedFilename.source || ''
      }
    });

    await s3Client.send(command);

    // Store in database
    const videoRecord = await storeVideoInDatabase({
      s3Key: key,
      originalFilename: file.name,
      category,
      fileType: type,
      fileSize: file.size,
      // userId: await getUserIdFromAuth() // Add this when you have authentication
    });

    return Response.json({ 
      success: true, 
      key,
      videoId: videoRecord.id,
      parsedMetadata: parsedFilename,
      message: `${type} uploaded successfully - metadata pending` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}
