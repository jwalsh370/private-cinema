// src/components/HLSVideoPlayer.tsx
'use client';

import Hls from 'hls.js';
import { useEffect, useState, useRef } from 'react';

export function HLSVideoPlayer({ fileKey }: { fileKey: string }) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [streamUrl, setStreamUrl] = useState<string | null>(null);

  useEffect(() => {
    const loadStreamUrl = async () => {
      const res = await fetch(`/api/stream/${encodeURIComponent(fileKey)}`);
      const { url } = await res.json();
      setStreamUrl(url);
    };

    loadStreamUrl();
  }, [fileKey]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || !streamUrl) return;

    if (Hls.isSupported()) {
      const hls = new Hls();
      hls.loadSource(streamUrl);
      hls.attachMedia(video);
      
      return () => hls.destroy();
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
      video.src = streamUrl;
    }
  }, [streamUrl]);

  return <video ref={videoRef} controls className="w-full aspect-video" />;
}
