// src/app/api/stream/[fileKey]/route.ts
import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { s3Client } from '@/lib/s3-helpers';

export async function GET(
  request: Request,
  { params }: { params: { fileKey: string } }
) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: params.fileKey,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return Response.json({ url });
}
