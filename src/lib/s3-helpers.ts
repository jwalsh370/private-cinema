// src/lib/s3-helpers.ts
import { S3Client, ListObjectsV2Command, GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function listMediaObjects(category?: string) {
  try {
    const prefix = category ? `${category}/` : '';
    
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    
    return response.Contents?.map(item => {
      const key = item.Key!;
      
      // Extract category from the first folder in the path
      const pathParts = key.split('/');
      let category = 'other';
      
      // If the file is in a folder (not in root), use the folder name as category
      if (pathParts.length > 1 && pathParts[0] !== 'uploads') {
        category = pathParts[0];
      }
      
      return {
        Key: key,
        Size: item.Size,
        LastModified: item.LastModified,
        Category: category
      };
    }) || [];
  } catch (error) {
    console.error('Error listing objects:', error);
    throw error;
  }
}

export async function getPresignedUrl(key: string) {
  const command = new GetObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
  });

  return getSignedUrl(s3Client, command, { expiresIn: 3600 });
}
