// src/components/MediaGallery.tsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ModernVideoPlayer } from './ModernVideoPlayer';
import { MovieCard } from './MovieCard';
import { Search, Filter, Grid, List } from 'lucide-react';

interface VideoItem {
  Key: string;
  Url: string;
  Size?: number;
  LastModified?: Date;
  Category?: string;
  Duration?: number;
  Format?: string;
  userId?: string;
}

export function MediaGallery() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error(`Server returned ${res.status}`);
        
        const data = await res.json();
        setVideosByCategory(data);
      } catch (err) {
        console.error('Failed to load videos:', err);
        setError('Failed to load videos. Please check the console for details.');
      } finally {
        setIsLoading(false);
      }
    };

    loadVideos();
  }, []);

  // Get all videos
  const allVideos = useMemo(() => {
    return Object.values(videosByCategory).flat();
  }, [videosByCategory]);

  // Get categories
  const categories = useMemo(() => {
    return ['All', ...Object.keys(videosByCategory)].filter(Boolean);
  }, [videosByCategory]);

  // Filter videos based on selection
  const filteredVideos = useMemo(() => {
    let videos = selectedCategory === 'All' 
      ? allVideos 
      : videosByCategory[selectedCategory] || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      videos = videos.filter(video => 
        video.Key.toLowerCase().includes(query) ||
        video.Category?.toLowerCase().includes(query)
      );
    }

    return videos.sort((a, b) => {
      const aDate = new Date(a.LastModified || 0).getTime();
      const bDate = new Date(b.LastModified || 0).getTime();
      return bDate - aDate;
    });
  }, [allVideos, videosByCategory, selectedCategory, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="flex justify-center space-x-2 mb-4">
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="w-8 h-8 bg-blue-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.2 }}
              className="w-8 h-8 bg-purple-500 rounded-full"
            />
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 1, repeat: Infinity, delay: 0.4 }}
              className="w-8 h-8 bg-pink-500 rounded-full"
            />
          </div>
          <p className="text-gray-300 text-lg">Loading your video collection...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <p className="text-gray-300 text-xl mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-all btn"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 p-4 sm:p-6">
      {/* Header */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent mb-4">
          Your Streaming Library
        </h1>
        <p className="text-gray-400 text-lg">
          {filteredVideos.length} {filteredVideos.length === 1 ? 'video' : 'videos'} available
        </p>
      </motion.div>

      {/* Search and Filter Bar */}
      <motion.div
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-gray-800/50 backdrop-blur-md rounded-2xl p-6 mb-8 border border-gray-700/30"
      >
        <div className="flex flex-col md:flex-row gap-4 items-center">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search movies and shows..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-gray-700/50 border border-gray-600/30 text-white px-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
            />
          </div>

          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter size={20} className="text-gray-400" />
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-700/50 border border-gray-600/30 text-white px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500/50 transition-all"
            >
              {categories.map(category => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-2 bg-gray-700/50 rounded-xl p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' 
                  ? 'bg-blue-600 text-white' 
                  : ' btn'
              }`}
            >
              <Grid size={20} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'list' 
                  ? 'bg-purple-600 text-white' 
                  : ' btn'
              }`}
            >
              <List size={20} />
            </button>
          </div>
        </div>
      </motion.div>

      {/* Video Grid */}
      <AnimatePresence>
        {filteredVideos.length > 0 ? (
          <motion.div
            layout
            className={`grid ${
              viewMode === 'grid' 
                ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
                : 'grid-cols-1'
            } gap-6`}
          >
            {filteredVideos.map((video, index) => (
              <motion.div
                key={video.Key}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                layout
              >
                <MovieCard 
                  video={video} 
                  onClick={() => setSelectedVideo(video)}
                />
              </motion.div>
            ))}
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-4">🎬</div>
            <h2 className="text-2xl text-white mb-4">No videos found</h2>
            <p className="text-gray-400 text-lg">
              {searchQuery 
                ? 'Try adjusting your search terms' 
                : 'Upload some videos to get started'
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Video Player Modal */}
      <AnimatePresence>
        {selectedVideo && (
          <ModernVideoPlayer
            videoUrl={selectedVideo.Url}
            title={selectedVideo.Key.split('/').pop()}
            onClose={() => setSelectedVideo(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}
