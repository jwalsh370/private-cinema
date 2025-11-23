// src/app/api/upload/route.ts
import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3-helpers';

export async function POST(request: Request) {
  const { fileName, fileType } = await request.json();
  
  // Validation Check 1
  if (!fileName || !fileType) {
    return Response.json({ error: "Missing file metadata" }, { status: 400 });
  }

  const command = new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: `uploads/${Date.now()}-${fileName}`,
    ContentType: fileType,
  });

  // Validation Check 2
  const presignedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });
  
  return new Response(JSON.stringify({ url: presignedUrl, key: command.input.Key }), {
    headers: {
      'Access-Control-Allow-Origin': 'http://localhost:3000',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type'
    }
  });
}
