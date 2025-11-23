// src/components/HLSVideoPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';

export function HLSVideoPlayer({ fileKey }: { fileKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadStreamUrl = async () => {
      try {
        const bucket = process.env.NEXT_PUBLIC_S3_BUCKET || 'private-cinema-uploads-jw';
        const region = process.env.NEXT_PUBLIC_AWS_REGION || 'us-east-2';
        
        // FIX: Don't encode the entire key - S3 needs the actual slashes
        // Only encode special characters but preserve forward slashes
        const encodedKey = fileKey.split('/').map(encodeURIComponent).join('/');
        const url = `https://${bucket}.s3.${region}.amazonaws.com/${encodedKey}`;
        
        console.log('🔄 Loading video from:', url);
        setStreamUrl(url);
        setError(null);
      } catch (error) {
        console.error('Error loading stream URL:', error);
        setError('Failed to load video URL');
      }
    };
    loadStreamUrl();
  }, [fileKey]);

  const handleVideoError = (e: React.SyntheticEvent<HTMLVideoElement>) => {
    const video = e.currentTarget;
    console.error('❌ Video error:', video.error);
    console.error('❌ Video src:', video.src);
    setError(`Video playback failed: ${video.error?.message || 'Unknown error'}`);
  };

  // Test the URL directly
  const testUrlDirectly = () => {
    if (streamUrl) {
      window.open(streamUrl, '_blank');
    }
  };

  if (error) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center flex-col p-4">
        <div className="text-red-400 text-sm text-center mb-2">
          ❌ Playback failed
        </div>
        <button
          onClick={testUrlDirectly}
          className="text-blue-400 text-xs underline hover:text-blue-300"
        >
          Test URL directly
        </button>
      </div>
    );
  }

  if (!streamUrl) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm">
          Loading preview...
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
      <video
        ref={videoRef}
        className="w-full h-full object-cover"
        controls
        preload="metadata"
        onError={handleVideoError}
        onMouseEnter={(e) => {
          e.currentTarget.muted = true;
          e.currentTarget.play().catch((err) => {
            console.log('Auto-play failed (expected):', err);
          });
        }}
        onMouseLeave={(e) => {
          e.currentTarget.pause();
          e.currentTarget.currentTime = 0;
        }}
      >
        <source src={streamUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      
      {/* Play overlay */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-50">
        <button
          onClick={() => {
            if (videoRef.current) {
              videoRef.current.play().catch(console.error);
            }
          }}
          className="bg-red-600 hover:bg-red-700 text-white rounded-full w-16 h-16 flex items-center justify-center"
        >
          <span className="text-2xl">▶</span>
        </button>
      </div>
    </div>
  );
}
