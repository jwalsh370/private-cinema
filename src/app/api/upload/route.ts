import { NextRequest, NextResponse } from 'next/server';
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

// Configure the S3 client using environment variables
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
    },
});

export async function POST(request: NextRequest) {
    console.log('Upload API endpoint called!'); // This will help us debug
    try {
    const { fileName, fileType } = await request.json();
    console.log('Request data:', { fileName, fileType });

    if (!fileName || !fileType) {
        return NextResponse.json(
        { error: 'FileName and FileType are required' },
        { status: 400 }
        );
    }

    // Generate a unique file key to avoid overwrites
    const fileKey = `uploads/${Date.now()}-${fileName}`;

    // Create the command for S3
    const putCommand = new PutObjectCommand({
        Bucket: process.env.AWS_S3_UPLOAD_BUCKET,
        Key: fileKey,
        ContentType: fileType,
    });

    // Generate a URL that allows uploads, valid for 15 minutes
    const signedUrl = await getSignedUrl(s3Client, putCommand, {
        expiresIn: 900, // 15 minutes
    });

    console.log('Successfully generated signed URL for:', fileKey);
    return NextResponse.json({
        signedUrl,
        fileKey,
    });

    } catch (error) {
    // This will print the detailed error to your terminal where you run 'npm run dev'
    console.error('Error in upload API:', error);
    return NextResponse.json(
        { error: 'Failed to generate upload URL' },
        { status: 500 }
    );
    }
}
