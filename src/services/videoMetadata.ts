// src/services/videoMetadata.ts
import ffmpeg from 'fluent-ffmpeg';
import { Readable } from 'stream';

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  format: string;
  bitrate: number;
  codec: string;
  audioCodec?: string;
  frameRate?: number;
}

export async function extractMetadata(fileBuffer: Buffer): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const stream = Readable.from(fileBuffer);
    
    ffmpeg(stream)
      .ffprobe((err, metadata) => {
        if (err) reject(err);
        
        const videoStream = metadata.streams.find(s => s.codec_type === 'video');
        const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
        
        resolve({
          duration: Math.floor(metadata.format.duration || 0),
          width: videoStream?.width || 0,
          height: videoStream?.height || 0,
          format: metadata.format.format_name?.split(',')[0] || 'unknown',
          bitrate: Math.floor((metadata.format.bit_rate || 0) / 1000), // kbps
          codec: videoStream?.codec_name || 'unknown',
          audioCodec: audioStream?.codec_name,
          frameRate: videoStream?.r_frame_rate ? eval(videoStream.r_frame_rate) : undefined
        });
      });
  });
}

// Fallback for browser-based metadata extraction
export async function extractBasicMetadata(file: File): Promise<Partial<VideoMetadata>> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    
    video.onloadedmetadata = () => {
      resolve({
        duration: Math.floor(video.duration),
        width: video.videoWidth,
        height: video.videoHeight
      });
    };
    
    video.onerror = () => resolve({});
    
    video.src = URL.createObjectURL(file);
  });
}
