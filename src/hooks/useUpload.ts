import { useState, useCallback } from 'react';

const validTypes = [
  'video/mp4',
  'video/quicktime',
  'video/x-m4v',
  'video/mpeg',
  'video/avi',
  'video/x-msvideo'
];
const MAX_SIZE = 1024 * 1024 * 5; // 5GB
const CHUNK_SIZE = 1024 * 1024 * 50; // 50MB chunks

type UploadState = {
  progress: number;
  isLoading: boolean;
  error: string | null;
};

type PresignedResponse = {
  url: string;
  uploadId: string;
  chunkUrls: string[];
};

export const useUpload = () => {
  const [state, setState] = useState<UploadState>({
    progress: 0,
    isLoading: false,
    error: null
  });
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  const validateFile = (file: File) => {
    const extension = file.name.split('.').pop()?.toLowerCase();
    const isValidType = validTypes.includes(file.type) || 
      ['mp4', 'mov', 'm4v', 'mpeg', 'avi'].includes(extension || '');

    if (!isValidType) {
      throw new Error('Supported formats: MP4, MOV, M4V, MPEG, AVI');
    }

    if (file.size > MAX_SIZE) {
      throw new Error(`Max file size: ${MAX_SIZE / 1024 / 1024}MB`);
    }
  };

  const uploadChunk = async (
    chunk: Blob,
    url: string,
    retries = 3
  ): Promise<boolean> => {
    try {
      const response = await fetch(url, {
        method: 'PUT',
        body: chunk,
        signal: abortController?.signal,
        headers: {
          'Content-Type': 'application/octet-stream'
        }
      });

      if (!response.ok) throw new Error('Chunk upload failed');
      return true;
    } catch (error) {
      if (retries > 0) return uploadChunk(chunk, url, retries - 1);
      throw error;
    }
  };

  const startUpload = useCallback(async (file: File) => {
    const controller = new AbortController();
    setAbortController(controller);
    
    try {
      setState({ progress: 0, isLoading: true, error: null });
      validateFile(file);

      // Initiate multipart upload
      const { url, uploadId, chunkUrls } = await fetchPresignedUrl(file);
      
      const totalChunks = Math.ceil(file.size / CHUNK_SIZE);
      let uploadedChunks = 0;

      for (let i = 0; i < totalChunks; i++) {
        if (controller.signal.aborted) break;

        const start = i * CHUNK_SIZE;
        const end = Math.min(start + CHUNK_SIZE, file.size);
        const chunk = file.slice(start, end);

        await uploadChunk(chunk, chunkUrls[i]);
        
        uploadedChunks++;
        setState(prev => ({
          ...prev,
          progress: (uploadedChunks / totalChunks) * 100
        }));
      }

      if (!controller.signal.aborted) {
        await fetch(url, {
          method: 'POST',
          body: JSON.stringify({ uploadId }),
          signal: controller.signal
        });
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setState(prev => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Upload failed'
      }));
    } finally {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const cancelUpload = useCallback(() => {
    abortController?.abort();
    setState(prev => ({ ...prev, isLoading: false }));
  }, [abortController]);

  return {
    ...state,
    startUpload,
    cancelUpload
  };
};
