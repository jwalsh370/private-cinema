// src/lib/videoStorage.ts
import { PrismaClient } from '@prisma/client';
import { parseFilename } from '@/utils/filenameParser';

const prisma = new PrismaClient();

export async function storeVideoInDatabase(data: {
  s3Key: string;
  originalFilename: string;
  category: string;
  fileType: string;
  fileSize: number;
}) {
  const parsedMetadata = parseFilename(data.originalFilename);
  
  return await prisma.video.create({
    data: {
      s3Key: data.s3Key,
      originalName: data.originalFilename,
      fileSize: data.fileSize,
      category: data.category,
      fileType: data.fileType,
      
      // Parsed metadata
      parsedTitle: parsedMetadata.cleanTitle,
      parsedYear: parsedMetadata.year ? parseInt(parsedMetadata.year) : null,
      parsedQuality: parsedMetadata.quality,
      parsedSource: parsedMetadata.source,
      
      // Default status
      metadataStatus: 'PENDING',
    }
  });
}

export async function getVideosWithPendingMetadata() {
  return await prisma.video.findMany({
    where: { metadataStatus: 'PENDING' },
    orderBy: { uploadDate: 'desc' },
    // REMOVE the user include since we don't have users yet
  });
}

export async function updateVideoMetadata(videoId: string, tmdbData: any) {
  return await prisma.video.update({
    where: { id: videoId },
    data: {
      tmdbId: tmdbData.id,
      tmdbMetadata: tmdbData,
      metadataStatus: 'MATCHED',
      matchedAt: new Date(),
    }
  });
}
