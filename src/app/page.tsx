'use client';

import { useState, useEffect, useCallback } from 'react';
import { HlsVideoPlayer } from '@/components/hls-video-player';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';

// Add to lib/utils.ts
type SignedUrlResponse = {
  signedUrl: string;
  expiresAt: number;
} | { error: string };

export default function Home() {
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);

  // Cleanup on unmount
  useEffect(() => {
    return () => abortController?.abort();
  }, [abortController]);

  // Add to lib/utils.ts
  const sanitizeError = useCallback((message: string) => {
    return message
      .replace(/AWS_ACCESS_KEY_ID=.*?;/, '[REDACTED]')
      .replace(/at XMLHttpRequest.*/s, '');
  }, []);

  const fetchSignedUrl = useCallback(async () => {
    const controller = new AbortController();
    setAbortController(controller);
    setLoading(true);
    setError(null);

    try {
      const encodedKey = encodeURIComponent(
        'streamable/1763524418658-1763524414517-test2/1763524414517-test2.m3u8'
      );

      const response = await fetch(`/api/stream?key=${encodedKey}`, {
        signal: controller.signal,
        headers: { 'Content-Type': 'application/json' }
      });

      const data: SignedUrlResponse = await response.json();
      
      if (!response.ok || 'error' in data) {
        throw new Error('error' in data ? data.error : 'Invalid response');
      }

      setVideoUrl(`${data.signedUrl}?exp=${data.expiresAt}`);
      scheduleRefresh(data.expiresAt);

    } catch (err: any) {
      if (!controller.signal.aborted) {
        setError(sanitizeError(err.message));
      }
    } finally {
      setLoading(false);
    }
  }, [sanitizeError]);

  // Add to hooks/useRefresh.ts
  const scheduleRefresh = useCallback((expiresAt: number) => {
    const refreshTime = expiresAt - Date.now() - 60000;
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
          className="w-48 justify-center"
        >
          {videoUrl ? 'Refresh Stream' : 'Load Video'}
          {loading && <span className="ml-2 animate-spin">⟳</span>}
        </Button>

        {loading && <Progress className="w-48" indeterminate />}

        {error && (
          <div className="text-red-500 bg-red-50 p-4 rounded-lg text-center">
            <strong>Playback Error:</strong> {error}
          </div>
        )}

        {videoUrl && (
          <HlsVideoPlayer 
          videoUrl={streamUrl}
          autoPlay={true}
          onError={(error) => console.error('Player error:', error)}
          className="max-w-4xl mx-auto"
        />
        )}
      </div>
    </div>
  );
}
