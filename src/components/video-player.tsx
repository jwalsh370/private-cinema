'use client';

import { useState, useRef } from 'react';

interface VideoPlayerProps {
  src: string;
  className?: string;
}

export function VideoPlayer({ src, className = '' }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className={`relative ${className}`}>
      <video
        ref={videoRef}
        className="w-full h-full rounded-lg"
        controls
        autoPlay
        onError={() => setError('Failed to play video')}
      >
        <source src={src} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
      {error && (
  <div className="absolute inset-0 bg-black/80 flex items-center justify-center rounded-lg p-4">
    <div className="text-center">
      <p className="text-red-400 font-medium mb-2">Could not play video</p>
      <p className="text-slate-400 text-sm">
        This file format may not be supported. Transcoding will be available soon!
      </p>
    </div>
  </div>
)}
    </div>
  );
}
