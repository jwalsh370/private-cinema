// src/components/MediaGallery.tsx
'use client';
import * as React from 'react';
import { useState, useEffect, useMemo, ReactNode } from 'react';
import { HLSVideoPlayer } from './HLSVideoPlayer';
import { FullScreenVideoPlayer } from './FullScreenVideoPlayer';

class ErrorBoundary extends React.Component<{children: ReactNode}, { hasError: boolean }> {
  constructor(props: {children: ReactNode}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return <div className="p-4 text-red-400">Failed to load media gallery</div>;
    }
    return this.props.children;
  }
}

interface VideoItem {
  Key: string;
  Url: string;
  Size?: number;
  LastModified?: Date;
  Category?: string;
  Duration?: number;
  Format?: string;
  Resolution?: string;
  PosterUrl?: string;
  Subtitles?: Array<{ lang: string; url: string }>;
}

// Helper functions (keep these the same)
const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Size unknown';
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDuration = (seconds?: number): string => {
  if (!seconds) return '--:--';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const formatDate = (date?: Date): string => {
  if (!date) return 'Date unknown';
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getCategoryIcon = (category: string): string => {
  const iconMap: Record<string, string> = {
    'movies': '🎬', 'tv-shows': '📺', 'documentaries': '🎥', 'personal': '👨‍👩‍👧',
    'vacations': '🏖️', 'family': '👪', 'events': '🎉', 'other': '📁',
    'uncategorized': '📁'
  };
  return iconMap[category.toLowerCase()] || '📁';
};

const highlightMatch = (text: string, query: string) => {
  if (!query) return text;
  
  const lowerText = text.toLowerCase();
  const lowerQuery = query.toLowerCase();
  const index = lowerText.indexOf(lowerQuery);
  
  if (index === -1) return text;
  
  return (
    <>
      {text.substring(0, index)}
      <span className="bg-blue-400/30 text-blue-300 px-1 rounded">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  );
};

function MediaGalleryContent() {
  const [videosByCategory, setVideosByCategory] = useState<Record<string, VideoItem[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  const [fullScreenVideo, setFullScreenVideo] = useState<VideoItem | null>(null);
  
  useEffect(() => {
    const loadVideos = async () => {
      try {
        setIsLoading(true);
        const res = await fetch('/api/videos');
        if (!res.ok) throw new Error('Failed to fetch videos');
        const data = await res.json();
        setVideosByCategory(data);
      } catch (error) {
        console.error('Error loading videos:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadVideos();
  }, []);

  // Get all videos from all categories
  const allVideos = useMemo(() => {
    return Object.values(videosByCategory).flat();
  }, [videosByCategory]);

  // Memoized derived data
  const categories = useMemo(() => {
    return ['All', ...Object.keys(videosByCategory)].filter(Boolean);
  }, [videosByCategory]);

  const categoryStats = useMemo(() => 
    Object.entries(videosByCategory).reduce((acc, [category, videos]) => {
      acc[category] = videos.length;
      return acc;
    }, {} as Record<string, number>),
  [videosByCategory]);

  const filteredVideos = useMemo(() => {
    let videosToShow = selectedCategory === 'All' 
      ? allVideos 
      : videosByCategory[selectedCategory] || [];

    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      videosToShow = videosToShow.filter(video => {
        const fileName = video.Key.split('/').pop() || '';
        return fileName.toLowerCase().includes(query) ||
               video.Category?.toLowerCase().includes(query) ||
               video.Key.toLowerCase().includes(query);
      });
    }

    return videosToShow.sort((a, b) => {
      const aDate = new Date(a.LastModified || 0).getTime();
      const bDate = new Date(b.LastModified || 0).getTime();
      switch (sortBy) {
        case 'newest': return bDate - aDate;
        case 'oldest': return aDate - bDate;
        case 'largest': return (b.Size || 0) - (a.Size || 0);
        case 'smallest': return (a.Size || 0) - (b.Size || 0);
        case 'name': return a.Key.localeCompare(b.Key);
        default: return 0;
      }
    });
  }, [allVideos, videosByCategory, selectedCategory, sortBy, searchQuery]);

  const allVisibleSelected = useMemo(
    () => filteredVideos.every(v => selectedVideos.has(v.Key)),
    [filteredVideos, selectedVideos]
  );

  // Event handlers
  const toggleVideoSelection = (videoKey: string) => {
    setSelectedVideos(prev => new Set(
      prev.has(videoKey) ? [...prev].filter(k => k !== videoKey) : [...prev, videoKey]
    ));
  };

  const selectAllVisible = () => 
    setSelectedVideos(new Set(filteredVideos.map(v => v.Key)));

  const clearSelection = () => setSelectedVideos(new Set());

  const playFullScreen = async (video: VideoItem) => {
    try {
      // Check if this is a poster file and skip full-screen playback
      if (video.Key.includes('posters') || video.Key.includes('subtitles')) {
        return;
      }
      
      setFullScreenVideo(video);
    } catch (error) {
      console.error('Error preparing full-screen playback:', error);
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (searchQuery) {
          setSearchQuery('');
        } else if (fullScreenVideo) {
          setFullScreenVideo(null);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery, fullScreenVideo]);

  return (
    <div className="min-h-screen bg-gray-900 p-4 sm:p-6">
      {/* Header Section */}
      <div className="mb-8">
        <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent animate-gradient">
          Media Library
        </h1>
        <p className="text-gray-300 mt-3 text-lg" aria-live="polite">
          {selectedVideos.size > 0 ? (
            <>{selectedVideos.size} of {filteredVideos.length} selected</>
          ) : searchQuery ? (
            <>Found {filteredVideos.length} results for "{searchQuery}"</>
          ) : (
            <>{filteredVideos.length} of {allVideos.length} videos</>
          )}
        </p>

        {selectedVideos.size > 0 && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={clearSelection}
              className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Selection
            </button>
          </div>
        )}
      </div>
      {/* Category Quick Actions */}
      {categories.length > 2 && (
        <div className="mb-6 flex flex-wrap gap-3">
          {categories.filter(cat => cat !== 'All').map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center px-4 py-2 rounded-full transition-all ${
                selectedCategory === category
                  ? 'bg-blue-500 text-white shadow-lg shadow-blue-500/30'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700 hover:shadow-md'
              }`}
              onKeyDown={(e) => e.key === 'Enter' && setSelectedCategory(category)}
              tabIndex={0}
            >
              <span className="mr-2 text-lg">{getCategoryIcon(category)}</span>
              {category}
              <span className="ml-2 bg-black/20 px-2 py-1 rounded-full text-sm">
                {categoryStats[category] || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Controls Section */}
      <div className="mb-8 bg-gray-800 p-4 rounded-xl shadow-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
          <div className="w-full sm:flex-1">
            <div className="relative">
              <input
                type="text"
                aria-label="Search videos"
                placeholder="Search videos by name or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-700 text-white px-4 py-3 pl-12 rounded-lg border-2 border-gray-600 placeholder-gray-400 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 transition-all"
              />
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-blue-400 transition-colors"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Category:</label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  clearSelection();
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 transition-all"
              >
                {categories.map(category => (
                  <option key={category} value={category} className="bg-gray-800">
                    {category}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2">
              <label className="text-gray-400 text-sm">Sort by:</label>
              <select
                value={sortBy}
                onChange={(e) => {
                  setSortBy(e.target.value);
                  clearSelection();
                }}
                className="bg-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-600 focus:border-blue-400 focus:ring-2 focus:ring-blue-300 transition-all"
              >
                <option value="newest">Newest</option>
                <option value='oldest'>Oldest</option>
                <option value='largest'>Largest</option>
                <option value='smallest'>Smallest</option>
                <option value='name'>Name</option>
              </select>
            </div>
          </div>
        </div>
        {/* Select All Checkbox */}
        {filteredVideos.length > 0 && (
          <div className="mt-4 flex items-center gap-2">
            <input
              type="checkbox"
              checked={allVisibleSelected}
              disabled={isLoading}
              onChange={allVisibleSelected ? clearSelection : selectAllVisible}
              className="w-5 h-5 text-blue-400 bg-gray-700 rounded border-2 border-gray-400 focus:ring-blue-300"
              id="selectAll"
            />
            <label htmlFor="selectAll" className="text-gray-300 text-sm">
              {isLoading ? 'Loading...' : allVisibleSelected ? 'Deselect all' : 'Select all visible'}
            </label>
          </div>
        )}
      </div>
      {/* Video Grid */}
      {!isLoading && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filteredVideos.map((video) => {
            const fileName = video.Key.split('/').pop() || 'Untitled';
            const isSelected = selectedVideos.has(video.Key);
            
            return (
              <div
                key={video.Key}
                className={`group relative bg-gray-800 rounded-xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 ${
                  isSelected ? 'ring-2 ring-blue-400' : ''
                }`}
                onClick={(e) => {
                  if (!(e.target as Element).closest('input[type="checkbox"]')) {
                    playFullScreen(video);
                  }
                }}
              >
                <div className="absolute top-4 left-4 z-20">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={() => toggleVideoSelection(video.Key)}
                    className="w-6 h-6 text-blue-400 bg-gray-900 rounded border-2 border-gray-400 checked:border-blue-400 focus:ring-blue-400 transition-all"
                  />
                </div>

                <div className="aspect-video bg-gray-700 relative cursor-pointer">
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent" />
                  <HLSVideoPlayer fileKey={video.Key} videoUrl={video.Url} />
                  
                  {/* Play Button Overlay */}
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-black/50 rounded-full p-3">
                      <span className="text-white text-2xl">▶</span>
                    </div>
                  </div>
                </div>

                <div className="p-4">
                  <h3 className="text-white font-medium truncate mb-2">
                    {searchQuery ? highlightMatch(fileName, searchQuery) : fileName}
                  </h3>
                  
                  {video.Category && (
                    <div className="flex items-center mb-3">
                      <span className="text-blue-400 text-sm font-medium bg-blue-400/10 px-3 py-1 rounded-full">
                        {getCategoryIcon(video.Category)} {video.Category}
                      </span>
                    </div>
                  )}

                  <div className="space-y-2 text-sm text-gray-300">
                    <div className="flex justify-between items-center">
                      <span>Size:</span>
                      <span className="font-mono">{formatFileSize(video.Size)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Added:</span>
                      <span className="font-mono">{formatDate(video.LastModified)}</span>
                    </div>
                    {video.Duration && (
                      <div className="flex justify-between items-center">
                        <span>Duration:</span>
                        <span className="font-mono">{formatDuration(video.Duration)}</span>
                      </div>
                    )}
                    {video.Format && (
                      <div className="flex justify-between items-center">
                        <span>Format:</span>
                        <span className="font-mono">{video.Format}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-800 to-gray-700 rounded-full flex items-center justify-center mb-6">
            <span className="text-4xl sm:text-6xl">🎥</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-white mb-3">
              {selectedCategory === 'All' 
                ? 'Your media library is empty'
                : `No videos found in ${selectedCategory}`
              }
            </h2>
            <p className="text-gray-400 max-w-md text-sm sm:text-base mb-6">
              {selectedCategory === 'All'
                ? 'Upload new videos or check your connection'
                : 'Try a different category or upload new content'
              }
            </p>
            {selectedCategory !== 'All' && (
              <button
                onClick={() => setSelectedCategory('All')}
                className="bg-blue-500 hover:bg-blue-400 text-white px-6 py-2 rounded-lg transition-colors"
              >
                Browse All Categories
              </button>
            )}
          </div>
        )}
  
        {/* Loading State */}
        {isLoading && (
          <div className="flex justify-center items-center py-16 sm:py-20 space-x-2">
            <div className="w-8 h-8 bg-blue-400 rounded-full animate-bounce" />
            <div className="w-8 h-8 bg-blue-400 rounded-full animate-bounce delay-100" />
            <div className="w-8 h-8 bg-blue-400 rounded-full animate-bounce delay-200" />
          </div>
        )}
  
        {/* Full Screen Video Player */}
        {fullScreenVideo && (
          <FullScreenVideoPlayer
            videoUrl={fullScreenVideo.Url}
            posterUrl={fullScreenVideo.PosterUrl}
            subtitles={fullScreenVideo.Subtitles}
            onClose={() => setFullScreenVideo(null)}
          />
        )}
      </div>
    );
  }
  
  export function MediaGallery() {
    return (
      <ErrorBoundary>
        <MediaGalleryContent />
      </ErrorBoundary>
    );
  }
  
  // Add gradient animation to your global CSS
  <style jsx global>{`
    @keyframes gradient {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    .animate-gradient {
      background-size: 200% 200%;
      animation: gradient 5s ease infinite;
    }
  `}</style>
  