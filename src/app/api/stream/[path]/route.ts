import { NextRequest, NextResponse } from 'next/server';
import { S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { validateS3Key, sanitizeStreamError, ApiError } from '@/lib/utils';

const s3 = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: process.env.AWS_ACCESS_KEY_ID ? {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

interface SignedUrlRequest {
  ID1: string;
  ID2: string;
  filename: string;
}

export async function GET(request: NextRequest) {
  try {
    // Validate query parameters
    const searchParams = Object.fromEntries(request.nextUrl.searchParams);
    const { ID1, ID2, filename } = validateRequestParams(searchParams);

    // Construct and validate object key
    const objectKey = buildObjectKey(ID1, ID2, filename);
    if (!validateS3Key(objectKey)) {
      throw new ApiError('Invalid media identifier format', 400, 'Invalid request parameters');
    }

    // Generate signed URL
    const signedUrl = await generatePresignedUrl(objectKey);
    
    return NextResponse.json({
      url: signedUrl,
      expiresAt: Date.now() + (Number(process.env.URL_EXPIRATION) || 60) * 1000
    });

  } catch (error) {
    if (error instanceof ApiError) {
      return error.toResponse();
    }
    return handleServerError(error);
  }
}

// Helper functions
function validateRequestParams(params: Record<string, string>): SignedUrlRequest {
  const ID1 = params.ID1?.trim();
  const ID2 = params.ID2?.trim();
  const filename = params.filename?.replace(/[^a-zA-Z0-9-_]/g, '');

  if (!ID1 || !ID2 || !filename) {
    throw new ApiError('Missing required parameters', 400);
  }

  if (!/^\d+$/.test(ID1) || !/^\d+$/.test(ID2)) {
    throw new ApiError('Invalid ID format', 400);
  }

  return { ID1, ID2, filename };
}

function buildObjectKey(ID1: string, ID2: string, filename: string): string {
  return `streamable/${ID1}-${ID2}-${filename}/${ID2}-${filename}.m3u8`;
}

async function generatePresignedUrl(objectKey: string): Promise<string> {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
      Key: objectKey,
      ResponseContentType: 'application/vnd.apple.mpegurl',
    });

    return await getSignedUrl(s3, command, {
      expiresIn: Number(process.env.URL_EXPIRATION) || 60
    });
  } catch (error) {
    throw new ApiError(
      sanitizeStreamError(error.message),
      500,
      'Failed to generate secure stream URL'
    );
  }
}

function handleServerError(error: unknown): NextResponse {
  console.error('URL Generation Error:', error);
  const message = error instanceof Error 
    ? sanitizeStreamError(error.message)
    : 'Unknown server error';
    
  return NextResponse.json(
    { error: message },
    { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store',
        'CDN-Cache-Control': 'no-cache'
      }
    }
  );
}
