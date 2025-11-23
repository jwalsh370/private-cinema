// src/lib/s3-helpers.ts
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

export interface S3Object {
  Key: string;
  LastModified?: Date;
  Size?: number;
  Url: string;
}

// Configure AWS client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

export const getS3Url = (key: string): string => {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET not configured');
  // Preserve forward slashes in the key
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;
};

export async function listMediaObjects(): Promise<S3Object[]> {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET not configured');
  
  const objects: S3Object[] = [];
  let continuationToken: string | undefined;

  do {
    const response = await s3Client.send(new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: 'uploads/',
      ContinuationToken: continuationToken,
    }));

    objects.push(...(response.Contents || []).map(obj => ({
      Key: obj.Key!,
      LastModified: obj.LastModified,
      Size: obj.Size,
      Url: getS3Url(obj.Key!)
    })));

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}
