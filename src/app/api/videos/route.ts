import { NextResponse } from 'next/server';
import { S3Client, ListObjectsV2Command } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
});

export async function GET() {
  try {
    const command = new ListObjectsV2Command({
      Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
      Prefix: 'uploads/', // Only show files from the uploads folder
    });

    const { Contents } = await s3Client.send(command);
    
    // Map the S3 objects to a simpler format for the frontend
    const videos = Contents?.map((item) => ({
      key: item.Key,
      name: item.Key?.replace('uploads/', ''),
      lastModified: item.LastModified,
      size: item.Size,
    })) || [];

    return NextResponse.json(videos);
  } catch (error) {
    console.error('Error listing videos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
