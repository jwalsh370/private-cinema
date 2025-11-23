// src/app/api/upload/route.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { s3Client } from '@/lib/s3-helpers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;
    const type = formData.get('type') as string;
    const videoKey = formData.get('videoKey') as string;

    console.log('Upload request received:', { 
      fileName: file?.name, 
      category, 
      type, 
      fileSize: file?.size 
    });

    if (!file || !category || !type) {
      console.error('Missing required fields');
      return Response.json({ error: "Missing required fields" }, { status: 400 });
    }

    // Generate unique filename
    const timestamp = Date.now();
    const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_'); // Sanitize filename
    const fileExtension = originalName.split('.').pop();
    
    let key: string;
    
    if (type === 'video') {
      key = `${category}/${timestamp}-${originalName}`;
    } else if (type === 'poster') {
      key = `${category}/posters/${timestamp}-${originalName}`;
    } else if (type === 'subtitle') {
      // Use the original video key to associate subtitles
      const baseName = videoKey ? videoKey.split('/').pop()?.split('.')[0] : timestamp.toString();
      key = `${category}/subtitles/${baseName}-${timestamp}-${originalName}`;
    } else {
      return Response.json({ error: "Invalid file type" }, { status: 400 });
    }

    console.log('Uploading to S3 with key:', key);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const command = new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: file.type,
      Metadata: {
        originalName: file.name,
        category,
        fileType: type,
        uploadDate: new Date().toISOString()
      }
    });

    await s3Client.send(command);
    console.log('File uploaded successfully to S3');

    return Response.json({ 
      success: true, 
      key,
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
