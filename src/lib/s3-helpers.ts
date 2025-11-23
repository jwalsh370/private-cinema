// src/lib/s3-helpers.ts
import { S3Client, ListObjectsV2Command, HeadObjectCommand } from '@aws-sdk/client-s3';

// Type definitions
export interface S3Object {
  Key: string;
  LastModified?: Date;
  Size?: number;
  Url: string;
  Duration?: number;
  Width?: number;
  Height?: number;
  Format?: string;
  Bitrate?: number;
}

// Configure AWS client - make sure this is properly exported
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
  return `https://${process.env.S3_BUCKET}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};

export async function getVideoMetadata(key: string): Promise<Partial<S3Object>> {
  try {
    const command = new HeadObjectCommand({
      Bucket: process.env.S3_BUCKET!,
      Key: key,
    });
    
    const response = await s3Client.send(command);
    
    const metadata: Partial<S3Object> = {};
    
    // Extract duration from metadata (if stored during upload)
    if (response.Metadata?.duration) {
      metadata.Duration = parseFloat(response.Metadata.duration);
    }
    
    if (response.Metadata?.width) {
      metadata.Width = parseInt(response.Metadata.width);
    }
    
    if (response.Metadata?.height) {
      metadata.Height = parseInt(response.Metadata.height);
    }
    
    if (response.Metadata?.format) {
      metadata.Format = response.Metadata.format;
    }
    
    if (response.Metadata?.bitrate) {
      metadata.Bitrate = parseInt(response.Metadata.bitrate);
    }
    
    return metadata;
  } catch (error) {
    console.error('Error fetching video metadata:', error);
    return {};
  }
}

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

    for (const obj of response.Contents || []) {
      if (!obj.Key) continue;
      
      const metadata = await getVideoMetadata(obj.Key);
      const baseObject: S3Object = {
        Key: obj.Key,
        LastModified: obj.LastModified,
        Size: obj.Size,
        Url: getS3Url(obj.Key),
        Duration: metadata.Duration,
        Width: metadata.Width,
        Height: metadata.Height,
        Format: metadata.Format,
        Bitrate: metadata.Bitrate,
      };
      
      objects.push(baseObject);
    }

    continuationToken = response.NextContinuationToken;
  } while (continuationToken);

  return objects;
}
