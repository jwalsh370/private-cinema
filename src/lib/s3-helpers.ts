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
    console.log('S3 Bucket:', process.env.S3_BUCKET);
    console.log('AWS Region:', process.env.AWS_REGION);
    
    const prefix = category ? `${category}/` : '';
    const command = new ListObjectsV2Command({
      Bucket: process.env.S3_BUCKET,
      Prefix: prefix,
    });

    const response = await s3Client.send(command);
    console.log('S3 response:', response);

    if (!response.Contents || response.Contents.length === 0) {
      console.log('No objects found in S3 bucket');
      return [];
    }

    return response.Contents.map(item => {
      const key = item.Key!;
      const categoryMatch = key.split('/')[0];
      const category = categoryMatch && categoryMatch !== 'uploads' ? categoryMatch : 'other';
      
      return {
        Key: key,
        Size: item.Size,
        LastModified: item.LastModified,
        Category: category
      };
    });

  } catch (error) {
    console.error('S3 Error:', error);
    throw error;
  }
}

export async function getPresignedUrl(key: string) {
  try {
    const command = new GetObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
    });

    return await getSignedUrl(s3Client, command, { expiresIn: 3600 });
  } catch (error) {
    console.error('Presigned URL Error:', error);
    throw error;
  }
}
