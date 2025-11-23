// src/lib/s3-helpers.ts
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export interface S3Object {
  Key: string;
  LastModified?: Date;
  Size?: number;
  Url: string;
  Category?: string;
  Duration?: number;
  Resolution?: string;
  Format?: string;
  ThumbnailUrl?: string;
}

// Configure AWS client
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// Helper function to generate S3 object URL
export const getS3Url = (key: string): string => {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET not configured');
  const encodedKey = key.split('/').map(encodeURIComponent).join('/');
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${encodedKey}`;
};

// Helper to extract category from S3 key
const extractCategory = (key: string): string => {
  const parts = key.split('/');
  const meaningfulParts = parts.filter(part => part && part !== 'uploads');
  if (meaningfulParts.length >= 2) {
    return meaningfulParts[0];
  }
  return 'Uncategorized';
};

// Helper to guess video format
const getFileFormat = (key: string): string => {
  const extension = key.split('.').pop()?.toLowerCase() || '';
  const formatMap: { [key: string]: string } = {
    'mp4': 'MP4', 'mov': 'MOV', 'avi': 'AVI', 'mkv': 'MKV', 'webm': 'WebM', 'm4v': 'M4V'
  };
  return formatMap[extension] || extension.toUpperCase();
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

    // FILTER OUT FOLDERS - Only include actual files
    const filesOnly = (response.Contents || []).filter(obj => {
      return obj.Key && !obj.Key.endsWith('/') && obj.Size && obj.Size > 0;
    });

    objects.push(...filesOnly.map(obj => ({
      Key: obj.Key!,
      LastModified: obj.LastModified,
      Size: obj.Size,
      Url: getS3Url(obj.Key!),
      Category: extractCategory(obj.Key!),
      Format: getFileFormat(obj.Key!),
      Duration: undefined,
      Resolution: undefined,
      ThumbnailUrl: undefined
    })));

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}

export async function getPresignedUrl(key: string): Promise<string> {
  if (!process.env.S3_BUCKET) throw new Error('S3_BUCKET not configured');
  
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  const url = await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  return url;
}
