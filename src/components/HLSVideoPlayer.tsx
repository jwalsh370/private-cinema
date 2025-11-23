// src/components/HLSVideoPlayer.tsx
'use client';

import { useRef, useState, useEffect } from 'react';

export function HLSVideoPlayer({ fileKey }: { fileKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadStreamUrl = async () => {
      try {
        // Your actual stream URL logic here
        // const url = await getStreamUrl(fileKey);
        // setStreamUrl(url);
        
        // Placeholder - replace with your actual implementation
        setStreamUrl(`https://private-cinema-uploads-jw.s3.us-east-2.amazonaws.com/${fileKey}`);
      } catch (error) {
        console.error('Error loading stream:', error);
      }
    };
    loadStreamUrl();
  }, [fileKey]);

  if (!streamUrl) {
    return (
      <div className="w-full h-full bg-gradient-to-br from-gray-900 to-gray-800 flex items-center justify-center">
        <div className="animate-pulse text-gray-500 text-sm">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-red-600 rounded-full animate-spin mb-2"></div>
          Loading...
        </div>
      </div>
    );
  }

  return (
    <video
      ref={videoRef}
      className="w-full h-full object-cover"
      preload="metadata"
      muted
      onMouseEnter={(e) => e.currentTarget.play()}
      onMouseLeave={(e) => {
        e.currentTarget.pause();
        e.currentTarget.currentTime = 0;
      }}
    >
      <source src={streamUrl} type="application/x-mpegURL" />
    </video>
  );
}
