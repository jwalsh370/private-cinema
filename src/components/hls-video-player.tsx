'use client';

import { useRef, useEffect, useState, useCallback } from 'react';
import Hls from 'hls.js';

interface VideoProps {
  videoUrl: string;
  className?: string;
  autoPlay?: boolean;
  onError?: (error: Error) => void;
}

export function HlsVideoPlayer({ 
  videoUrl, 
  className = '', 
  autoPlay = true,
  onError
}: VideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const hlsRef = useRef<Hls | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [qualityLevels, setQualityLevels] = useState<Hls.Level[]>([]);
  const [currentQuality, setCurrentQuality] = useState<number>(-1); // -1 for auto

  const destroyHls = useCallback(() => {
    if (hlsRef.current) {
      hlsRef.current.destroy();
      hlsRef.current = null;
    }
  }, []);

  const initializeHls = useCallback(() => {
    if (!videoUrl || !videoRef.current) return;

    destroyHls();
    setIsLoading(true);
    setHasError(false);

    const handleError = (error: Error) => {
      console.error('HLS Error:', error);
      setHasError(true);
      setIsLoading(false);
      onError?.(error);
    };

    if (Hls.isSupported()) {
      try {
        hlsRef.current = new Hls({
          enableWorker: true,
          lowLatencyMode: true,
          autoStartLoad: true,
          capLevelToPlayerSize: true,
        });

        hlsRef.current.attachMedia(videoRef.current);
        
        hlsRef.current.on(Hls.Events.MEDIA_ATTACHED, () => {
          hlsRef.current?.loadSource(videoUrl);
        });

        hlsRef.current.on(Hls.Events.MANIFEST_PARSED, (_, data) => {
          setQualityLevels(data.levels);
          setIsLoading(false);
          
          if (autoPlay && videoRef.current?.paused) {
            videoRef.current.play().catch((err) => {
              handleError(new Error(`Autoplay failed: ${err.message}`));
            });
          }
        });

        hlsRef.current.on(Hls.Events.LEVEL_LOADED, (_, data) => {
          setCurrentQuality(data.level);
        });

        hlsRef.current.on(Hls.Events.ERROR, (_, data) => {
          if (data.fatal) {
            const error = new Error(data.details);
            handleError(error);
            destroyHls();
          }
        });

      } catch (err) {
        handleError(err as Error);
      }
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = videoUrl;
      videoRef.current.addEventListener('loadedmetadata', () => {
        setIsLoading(false);
        if (autoPlay) videoRef.current?.play();
      });
      videoRef.current.addEventListener('error', () => {
        handleError(new Error('Native HLS playback failed'));
      });
    } else {
      handleError(new Error('HLS is not supported in this browser'));
    }
  }, [videoUrl, autoPlay, destroyHls, onError]);

  useEffect(() => {
    initializeHls();
    return () => destroyHls();
  }, [initializeHls, destroyHls]);

  const handleQualityChange = (level: number) => {
    if (hlsRef.current) {
      hlsRef.current.currentLevel = level;
      setCurrentQuality(level);
    }
  };

  const retryPlayback = useCallback(() => {
    initializeHls();
  }, [initializeHls]);

  return (
    <div className={`relative ${className}`}>
      <video 
        ref={videoRef} 
        controls 
        className="w-full h-auto rounded-lg"
        aria-label="Video player"
      />
      
      {/* Loading overlay */}
      {isLoading && !hasError && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
          <div className="animate-spin size-12 border-4 border-blue-500 border-t-transparent rounded-full" />
        </div>
      )}

      {/* Error overlay */}
      {hasError && (
        <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center gap-4">
          <p className="text-white text-center">Playback failed</p>
          <button 
            onClick={retryPlayback}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Retry Playback
          </button>
        </div>
      )}

      {/* Quality selector */}
      {qualityLevels.length > 0 && !hasError && (
        <div className="absolute bottom-16 right-4 bg-black/70 rounded-lg p-2">
          <select
            value={currentQuality}
            onChange={(e) => handleQualityChange(Number(e.target.value))}
            className="bg-white/10 text-white rounded px-3 py-1"
          >
            <option value={-1}>Auto</option>
            {qualityLevels.map((level, index) => (
              <option key={index} value={index}>
                {level.height}p
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
