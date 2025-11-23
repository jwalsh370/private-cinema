// src/app/api/upload/route.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-helpers';
import { extractMetadata } from '@/services/videoMetadata';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const videoKey = formData.get('videoKey') as string;

    // Authentication check
    const token = request.headers.get('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify token (you'd use JWT verification here)
    // const user = verifyToken(token);

    if (!file || !category || !type) {
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let metadata = {};
    if (type === 'video') {
      try {
        metadata = await extractMetadata(buffer);
      } catch (error) {
        console.warn('Metadata extraction failed:', error);
        // Fallback to basic extraction
        metadata = await extractBasicMetadata(file);
      }
    }

    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    
    let key: string;
    if (type === 'video') {
      key = `${category}/${timestamp}-${originalName}`;
    } else if (type === 'poster') {
      key = `${category}/posters/${timestamp}-${originalName}`;
    } else {
      const baseName = videoKey ? videoKey.split('/').pop()?.split('.')[0] : timestamp.toString();
      key = `${category}/subtitles/${baseName}-${timestamp}-${originalName}`;
    }

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
        ...(type === 'video' && { 
          duration: metadata.duration?.toString(),
          resolution: `${metadata.width}x${metadata.height}`,
          codec: metadata.codec
        })
      }
    });

    await s3Client.send(command);

    // Store enhanced metadata in database (you'd implement this)
    if (type === 'video') {
      await storeVideoMetadata(key, metadata, token);
    }

    return Response.json({ 
      success: true, 
      key,
      metadata: type === 'video' ? metadata : undefined,
      message: `${type} uploaded successfully` 
    });

  } catch (error) {
    console.error('Upload error:', error);
    return Response.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    );
  }
}

async function storeVideoMetadata(key: string, metadata: any, token: string) {
  // Store in your database
  await fetch('/api/videos/metadata', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      s3Key: key,
      metadata
    })
  });
}
