// src/lib/s3-helpers.ts
import { S3Client } from '@aws-sdk/client-s3';

// Configure AWS credentials from environment variables
export const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'us-east-2',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
  }
});

// Helper function to generate S3 object URL
export const getS3Url = (bucket: string, key: string) => {
  return `https://${bucket}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`;
};
