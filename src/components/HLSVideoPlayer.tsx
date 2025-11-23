// src/components/HLSVideoPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';

interface HLSVideoPlayerProps {
  fileKey: string;
  videoUrl: string; // This now comes from the API (pre-signed URL)
}

export function HLSVideoPlayer({ fileKey, videoUrl }: HLSVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handlePlay = () => {
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.play().catch((err) => {
        console.error('Play failed:', err);
        setError('Failed to play video');
      });
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
    }
  };

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.error('Video error:', video.error);
    setError('Video playback failed. The URL may have expired.');
  };

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-col p-4">
        <div className="text-red-400 text-sm text-center mb-2">
          ❌ {error}
        </div>
        <button
          onClick={() => window.location.reload()}
          className="text-blue-400 text-xs underline hover:text-blue-300"
        >
          Reload page
        </button>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative group">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        preload="metadata"
        src={videoUrl} // Use the pre-signed URL from props
        onPlay={handlePlay}
        onPause={handlePause}
        onError={handleVideoError}
        onMouseEnter={(e) => {
          if (!isPlaying) {
            e.currentTarget.muted = true;
            e.currentTarget.play().catch(() => {});
          }
        }}
        onMouseLeave={(e) => {
          if (!e.currentTarget.controls) {
            e.currentTarget.pause();
            e.currentTarget.currentTime = 0;
          }
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Custom play button overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black bg-opacity-50">
          <button
            onClick={handlePlay}
            className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center transition-transform hover:scale-110"
          >
            <span className="text-2xl">▶</span>
          </button>
        </div>
      )}
    </div>
  );
}
