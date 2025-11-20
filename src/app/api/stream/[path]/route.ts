import { NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { ApiError, sanitizeStreamError, validateS3Key, validateExpiration } from '@/lib/utils';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function GET(request: Request, { params }: { params: { path: string[] } }) {
  try {
    const key = params.path.join('/');
    
    // Validate inputs
    if (!validateS3Key(key)) {
      throw new ApiError('Invalid media path', 400);
    }

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
      Key: key,
    });

    const expiresIn = 3600; // 1 hour
    if (!validateExpiration(expiresIn)) {
      throw new ApiError('Invalid expiration time', 400);
    }

    const url = await getSignedUrl(s3, command, { expiresIn });
    
    return NextResponse.json({
      signedUrl: url,
      expiresAt: Date.now() + expiresIn * 1000
    });

  } catch (error) {
    console.error('Stream Error:', error);
    
    if (error instanceof ApiError) {
      return NextResponse.json(
        { error: error.message },
        { status: error.statusCode }
      );
    }
    
    const message = sanitizeStreamError(
      error instanceof Error ? error.message : 'Unknown error'
    );
    
    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
