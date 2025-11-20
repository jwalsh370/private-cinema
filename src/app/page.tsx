'use client';

import { useState, useEffect, useCallback } from 'react';
import { HlsVideoPlayer } from '@/components/hls-video-player';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { sanitizeStreamError, type SignedUrlResponse } from '@/lib/utils';

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  useEffect(() => {
    return () => abortController?.abort();
  }, [abortController]);

  const fetchSignedUrl = useCallback(async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setError(null);
    setVideoUrl(null);

    try {
      // Replace with dynamic key generation logic
      const objectKey = 'streamable/1763524418658-1763524414517-test2/1763524414517-test2.m3u8';
      const encodedKey = encodeURIComponent(objectKey);

      const response = await fetch(`/api/stream?key=${encodedKey}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      
      const data = await response.json() as SignedUrlResponse;
      
      if ('error' in data) throw new Error(data.error);
      if (data.expiresAt <= Date.now()) throw new Error('URL expired');

      setVideoUrl(data.signedUrl);
      scheduleRefresh(data.expiresAt);

    } catch (err: unknown) {
      if (!controller.signal.aborted) {
        const message = err instanceof Error ? err.message : 'Unknown error';
        setError(sanitizeStreamError(message));
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const scheduleRefresh = useCallback((expiresAt: number) => {
    const refreshTime = expiresAt - Date.now() - 60000; // 1 minute before expiration
    if (refreshTime > 0) {
      setTimeout(fetchSignedUrl, refreshTime);
    }
  }, [fetchSignedUrl]);

  return (
    <div className="max-w-4xl mx-auto p-4 space-y-4">
      <div className="flex flex-col items-center gap-4">
        <Button
          onClick={fetchSignedUrl}
          disabled={loading}
          variant={videoUrl ? 'secondary' : 'default'}
          className="w-48 justify-center"
        >
          {loading ? (
            <span className="flex items-center gap-2">
              {videoUrl ? 'Refreshing...' : 'Loading...'}
              <span className="animate-spin">⟳</span>
            </span>
          ) : videoUrl ? 'Refresh Stream' : 'Load Video'}
        </Button>

        {loading && <Progress className="w-48" indeterminate />}

        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center max-w-xl">
            <strong>Playback Error:</strong> {error}
            <div className="mt-2 text-sm">Try refreshing the page</div>
          </div>
        )}

        {videoUrl && (
          <HlsVideoPlayer 
            videoUrl={videoUrl}
            autoPlay={true}
            onError={(error) => setError(sanitizeStreamError(error.message))}
            className="w-full"
          />
        )}
      </div>
    </div>
  );
}
