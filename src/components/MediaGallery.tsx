// src/components/MediaGallery.tsx
'use client';

import { useState, useEffect } from 'react';
import { HLSVideoPlayer } from './HLSVideoPlayer';

interface VideoItem {
  Key: string;
  Url: string;
  Size?: number;
  LastModified?: string;
  Duration?: number; // in seconds
  Width?: number;
  Height?: number;
  Format?: string;
  Bitrate?: number;
}

// Helper function to format duration
const formatDuration = (seconds?: number): string => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

// Helper function to format file size
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'N/A';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// Helper function to format bitrate
const formatBitrate = (bitrate?: number): string => {
  if (!bitrate) return 'N/A';
  return `${(bitrate / 1000).toFixed(0)} kbps`;
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
          {videos.length} videos • {formatFileSize(videos.reduce((total, video) => total + (video.Size || 0), 0))} total
        </p>
      </div>

      {/* Video Grid */}
      {!isLoading && videos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {videos.map((video) => {
            const fileName = video.Key.split('/').pop() || 'Untitled';
            const resolution = video.Width && video.Height ? 
              `${video.Width}x${video.Height}` : 'Unknown';
            
            return (
              <div
                key={video.Key}
                className="group relative cursor-pointer transition-all duration-300 hover:scale-105 hover:z-10"
              >
                {/* Video Card */}
                <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-800 group-hover:border-red-600 transition-colors duration-300">
                  <HLSVideoPlayer fileKey={video.Key} />
                  
                  {/* Duration Badge */}
                  {video.Duration && (
                    <div className="absolute top-3 right-3 bg-black bg-opacity-80 text-white px-2 py-1 rounded text-xs font-semibold">
                      {formatDuration(video.Duration)}
                    </div>
                  )}
                  
                  {/* Hover Overlay */}
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-70 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-full font-semibold text-sm">
                      ▶ Play
                    </button>
                  </div>
                </div>

                {/* Video Info */}
                <div className="mt-3">
                  <h3 className="text-white font-medium text-sm truncate group-hover:text-red-400 transition-colors duration-200">
                    {fileName}
                  </h3>
                  
                  {/* Metadata */}
                  <div className="text-xs text-gray-400 mt-2 space-y-1">
                    {video.Duration && (
                      <div className="flex justify-between">
                        <span>Duration:</span>
                        <span className="text-gray-300">{formatDuration(video.Duration)}</span>
                      </div>
                    )}
                    
                    {video.Size && (
                      <div className="flex justify-between">
                        <span>Size:</span>
                        <span className="text-gray-300">{formatFileSize(video.Size)}</span>
                      </div>
                    )}
                    
                    {resolution !== 'Unknown' && (
                      <div className="flex justify-between">
                        <span>Resolution:</span>
                        <span className="text-gray-300">{resolution}</span>
                      </div>
                    )}
                    
                    {video.Format && (
                      <div className="flex justify-between">
                        <span>Format:</span>
                        <span className="text-gray-300">{video.Format.toUpperCase()}</span>
                      </div>
                    )}
                    
                    {video.Bitrate && (
                      <div className="flex justify-between">
                        <span>Bitrate:</span>
                        <span className="text-gray-300">{formatBitrate(video.Bitrate)}</span>
                      </div>
                    )}
                  </div>
                  
                  {/* Quality Badges */}
                  <div className="flex flex-wrap gap-1 mt-3">
                    {video.Width && video.Width >= 3840 && (
                      <span className="text-xs bg-blue-600 text-white px-2 py-1 rounded">4K</span>
                    )}
                    {video.Width && video.Width >= 1920 && video.Width < 3840 && (
                      <span className="text-xs bg-green-600 text-white px-2 py-1 rounded">HD</span>
                    )}
                    {video.Duration && video.Duration > 300 && (
                      <span className="text-xs bg-purple-600 text-white px-2 py-1 rounded">Movie</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Loading and empty states remain the same */}
    </div>
  );
}
