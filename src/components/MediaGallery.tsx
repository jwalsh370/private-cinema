// src/components/MediaGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { HLSVideoPlayer } from './HLSVideoPlayer';

interface VideoItem {
  Key: string;
  Url: string;
}

export function MediaGallery() {
  const [videos, setVideos] = useState<VideoItem[]>([]);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error('Error loading videos:', error);
      }
    };

    loadVideos();
  }, []);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {videos.map((video) => (
        <div key={video.Key} className="border rounded-lg overflow-hidden">
          <HLSVideoPlayer fileKey={video.Key} />
          <div className="p-2 bg-gray-50">
            <p className="truncate">{video.Key.split('/').pop()}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
