'use client';

import { useState } from 'react';
import axios from 'axios';

interface UploadResponse {
  signedUrl: string;
  fileKey: string;
}

export function useUpload() {
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const uploadFile = async (file: File): Promise<UploadResponse | null> => {
    setIsUploading(true);
    setUploadProgress(0);
    setError(null);

    try {
      // 1. Get signed URL from our API
      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fileName: file.name,
          fileType: file.type,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to get upload URL');
      }

      const { signedUrl, fileKey } = await response.json();

      // 2. Upload file to S3 using Axios for progress tracking
      await axios.put(signedUrl, file, {
        headers: {
          'Content-Type': file.type,
        },
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          }
        },
      });

      return { signedUrl, fileKey };
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
      return null;
    } finally {
      setIsUploading(false);
      // Keep the progress at 100% for a moment before resetting
      setTimeout(() => setUploadProgress(0), 1000);
    }
  };

  return { uploadFile, isUploading, uploadProgress, error };
}
