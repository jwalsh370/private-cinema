// src/components/MediaGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { HLSVideoPlayer } from './HLSVideoPlayer';

interface VideoItem {
  Key: string;
  Url: string;
  Size?: number;
  LastModified?: Date;
}

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Size unknown';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper function to format date
const formatDate = (date?: Date): string => {
  if (!date) return 'Date unknown';
  return new Date(date).toLocaleDateString();
};

export function MediaGallery() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        setVideos(data);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Media Library
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          {videos.length} videos available
        </p>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-20">
          <div className="animate-pulse text-gray-400 text-lg">Loading your videos...</div>
        </div>
      )}

      {/* Video Grid */}
      {!isLoading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.map((video) => {
            const fileName = video.Key.split('/').pop() || 'Untitled';
            
            return (
              <div
                key={video.Key}
                className="group relative cursor-pointer transition-all duration-300 hover:scale-105"
              >
                {/* Video Card */}
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-800">
                  {/* Pass both fileKey and the pre-signed videoUrl */}
                  <HLSVideoPlayer fileKey={video.Key} videoUrl={video.Url} />
                </div>

                {/* Video Info */}
                <div className="mt-3">
                  <h3 className="text-white font-medium text-sm truncate">
                    {fileName}
                  </h3>
                  
                  {/* Basic Metadata */}
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span className="text-gray-300">{formatFileSize(video.Size)}</span>
                    </div>
                    
                    <div className="flex justify-between">
                      <span>Added:</span>
                      <span className="text-gray-300">{formatDate(video.LastModified)}</span>
                    </div>
                  </div>
                  
                  {/* Play Badge */}
                  <div className="flex gap-1 mt-3">
                    <span className="text-xs bg-red-600 text-white px-2 py-1 rounded">Play</span>
                    <span className="text-xs bg-gray-700 text-gray-300 px-2 py-1 rounded">Video</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && videos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="w-32 h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mb-6">
            <span className="text-6xl">🎬</span>
          </div>
          <h2 className="text-2xl font-bold text-white mb-4">Your library is empty</h2>
          <p className="text-gray-400 max-w-md text-lg">
            Upload some videos to get started
          </p>
        </div>
      )}
    </div>
  );
}
