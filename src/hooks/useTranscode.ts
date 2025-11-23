// src/hooks/useTranscode.ts
import { FFmpeg } from '@ffmpeg/ffmpeg';

export const useTranscode = () => {
  const convertToHLS = async (file: File) => {
    const ffmpeg = new FFmpeg();
    await ffmpeg.load();
    // Add transcoding logic
  };
  return { convertToHLS };
};
