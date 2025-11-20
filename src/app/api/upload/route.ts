import { NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiError, sanitizeStreamError, validateS3Key } from '@/lib/utils';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function POST(request: Request) {
  try {
    const { fileName, fileType } = await request.json();
    const key = `uploads/${Date.now()}-${fileName}`;

    // Validate inputs
    if (!validateS3Key(key)) {
      throw new ApiError('Invalid file name', 400);
    }

    const command = new PutObjectCommand({
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
      Key: key,
      ContentType: fileType,
    });

    const url = await getSignedUrl(s3, command, { expiresIn: 3600 });
    
    return NextResponse.json({
      url,
      key,
      fields: {}, // Required for POST uploads
    });

  } catch (error) {
    console.error('Upload Error:', error);
    
    const message = sanitizeStreamError(
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return NextResponse.json(
      { error: message },
      { status: error instanceof ApiError ? error.statusCode : 500 }
    );
  }
}
