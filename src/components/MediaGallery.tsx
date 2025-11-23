// src/components/MediaGallery.tsx
'use client';


import { useState, useEffect, useMemo } from 'react';
import { HLSVideoPlayer } from './HLSVideoPlayer';

interface VideoItem {
  Key: string;
  Url: string;
  Size?: number;
  LastModified?: Date;
  Category?: string;
  Duration?: number;
  Format?: string;
  Resolution?: string;
}

// Helper functions
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
  const iconMap: { [key: string]: string } = {
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
      <span className="bg-yellow-600 text-white px-1 rounded">
        {text.substring(index, index + query.length)}
      </span>
      {text.substring(index + query.length)}
    </>
  );
};

export function MediaGallery() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [sortBy, setSortBy] = useState<string>('newest');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVideos, setSelectedVideos] = useState<Set<string>>(new Set());
  
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

  // Extract unique categories
  const categories = useMemo(() => {
    const allCategories = videos.map(video => video.Category || 'Uncategorized');
    return ['All', ...Array.from(new Set(allCategories))].filter(Boolean);
  }, [videos]);

  // Category statistics
  const categoryStats = useMemo(() => {
    const stats: { [category: string]: number } = {};
    videos.forEach(video => {
      const category = video.Category || 'Uncategorized';
      stats[category] = (stats[category] || 0) + 1;
    });
    return stats;
  }, [videos]);

  // Filter and sort videos
  const filteredVideos = useMemo(() => {
    let filtered = videos;
    
    // Filter by category
    if (selectedCategory !== 'All') {
      filtered = filtered.filter(video => 
        video.Category === selectedCategory || 
        (!video.Category && selectedCategory === 'Uncategorized')
      );
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(video => {
        const fileName = video.Key.split('/').pop() || '';
        return (
          fileName.toLowerCase().includes(query) ||
          (video.Category && video.Category.toLowerCase().includes(query)) ||
          video.Key.toLowerCase().includes(query)
        );
      });
    }
    
    // Sort videos
    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return new Date(b.LastModified || 0).getTime() - new Date(a.LastModified || 0).getTime();
        case 'oldest':
          return new Date(a.LastModified || 0).getTime() - new Date(b.LastModified || 0).getTime();
        case 'largest':
          return (b.Size || 0) - (a.Size || 0);
        case 'smallest':
          return (a.Size || 0) - (b.Size || 0);
        case 'name':
          return a.Key.localeCompare(b.Key);
        default:
          return 0;
      }
    });
  }, [videos, selectedCategory, sortBy, searchQuery]);

  // Selection functions - MOVE AFTER filteredVideos
  const toggleVideoSelection = (videoKey: string) => {
    setSelectedVideos(prev => {
      const newSelection = new Set(prev);
      if (newSelection.has(videoKey)) {
        newSelection.delete(videoKey);
      } else {
        newSelection.add(videoKey);
      }
      return newSelection;
    });
  };

  const selectAllVisible = () => {
    const allVisibleKeys = new Set(filteredVideos.map(video => video.Key));
    setSelectedVideos(allVisibleKeys);
  };

  const clearSelection = () => {
    setSelectedVideos(new Set());
  };

  const allVisibleSelected = useMemo(() => {
    if (filteredVideos.length === 0) return false;
    return filteredVideos.every(video => selectedVideos.has(video.Key));
  }, [filteredVideos, selectedVideos]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && searchQuery) {
        setSearchQuery('');
      }
    };
  
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [searchQuery]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-6">
      {/* Header with Selection Info */}
      <div className="mb-6 sm:mb-8">
        <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
          Media Library
        </h1>
        <p className="text-gray-400 mt-2 text-lg">
          {selectedVideos.size > 0 ? (
            <>
              <span className="text-white">{selectedVideos.size}</span> of{' '}
              <span className="text-white">{filteredVideos.length}</span> selected
            </>
          ) : searchQuery ? (
            <>
              Found <span className="text-white">{filteredVideos.length}</span> results for "
              <span className="text-red-400">"{searchQuery}"</span>"
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </>
          ) : (
            <>
              {filteredVideos.length} of {videos.length} videos
              {selectedCategory !== 'All' && ` in ${selectedCategory}`}
            </>
          )}
        </p>
        
        {/* Selection Actions */}
        {selectedVideos.size > 0 && (
          <div className="flex gap-3 mt-3">
            <button
              onClick={clearSelection}
              className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
            >
              Clear Selection
            </button>
            <span className="text-gray-500 text-sm flex items-center">
              • {selectedVideos.size} selected
            </span>
          </div>
        )}

        {/* Quick search tips */}
        {searchQuery && filteredVideos.length === 0 && selectedVideos.size === 0 && (
          <p className="text-gray-500 text-sm mt-1">
      Try different keywords or check your spelling
    </p>
  )}
      </div>

      {/* Quick Category Actions */}
      {categories.length > 2 && (
        <div className="mb-4 flex flex-wrap gap-2">
          {categories.filter(cat => cat !== 'All').map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex items-center px-3 py-1 rounded-full text-xs sm:text-sm transition-all ${
                selectedCategory === category
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
              }`}
            >
              <span className="mr-1">{getCategoryIcon(category)}</span>
              {category}
              <span className="ml-1 bg-black bg-opacity-30 px-1 rounded">
                {categoryStats[category] || 0}
              </span>
            </button>
          ))}
        </div>
      )}

      {/* Filters */}

{/* Filters */}
<div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center">
  {/* Search Input */}
  <div className="w-full sm:flex-1">
    <div className="relative">
      <input
        type="text"
        placeholder="Search videos by name or category..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg border border-gray-700 placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
      />
      <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
        <span className="text-gray-500">🔍</span>
      </div>
      {searchQuery && (
        <button
          onClick={() => setSearchQuery('')}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
        >
          ✕
        </button>
      )}
    </div>
  </div>

  {/* Category and Sort Filters */}
  <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
    <div>
      <label className="text-gray-400 text-sm mr-2">Category:</label>
      <select 
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
      >
        {categories.map(category => (
          <option key={category} value={category}>
            {category}
          </option>
        ))}
      </select>
    </div>

    <div>
      <label className="text-gray-400 text-sm mr-2">Sort by:</label>
      <select 
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value)}
        className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
      >
        <option value="newest">Newest</option>
        <option value="oldest">Oldest</option>
        <option value="largest">Largest</option>
        <option value="smallest">Smallest</option>
        <option value="name">Name</option>
      </select>
    </div>
  </div>
</div>


      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16 sm:py-20">
          <div className="animate-pulse text-gray-400 text-base sm:text-lg">Loading your videos...</div>
        </div>
      )}

      {/* Video Grid */}
      {!isLoading && filteredVideos.length > 0 && (
        <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredVideos.map((video) => {
            const fileName = video.Key.split('/').pop() || 'Untitled';
            
            return (
              <div className="min-h-screen bg-gradient-to-b from-black via-gray-900 to-black p-4 sm:p-6">
              {/* Header with Selection Info */}
              <div className="mb-6 sm:mb-8">
                <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-red-600 to-red-800 bg-clip-text text-transparent">
                  Media Library
                </h1>
                <p className="text-gray-400 mt-2 text-lg">
                  {selectedVideos.size > 0 ? (
                    <>
                      <span className="text-white">{selectedVideos.size}</span> of{' '}
                      <span className="text-white">{filteredVideos.length}</span> selected
                    </>
                  ) : searchQuery ? (
                    <>
                      Found <span className="text-white">{filteredVideos.length}</span> results for "
                      <span className="text-red-400">"{searchQuery}"</span>"
                      {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    </>
                  ) : (
                    <>
                      {filteredVideos.length} of {videos.length} videos
                      {selectedCategory !== 'All' && ` in ${selectedCategory}`}
                    </>
                  )}
                </p>
                
                {/* Selection Actions */}
                {selectedVideos.size > 0 && (
                  <div className="flex gap-3 mt-3">
                    <button
                      onClick={clearSelection}
                      className="bg-gray-600 hover:bg-gray-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Clear Selection
                    </button>
                    <span className="text-gray-500 text-sm flex items-center">
                      • {selectedVideos.size} selected
                    </span>
                  </div>
                )}
        
                {/* Quick search tips */}
                {searchQuery && filteredVideos.length === 0 && selectedVideos.size === 0 && (
                  <p className="text-gray-500 text-sm mt-1">
                    Try different keywords or check your spelling
                  </p>
                )}
              </div>
        
              {/* Quick Category Actions */}
              {categories.length > 2 && selectedVideos.size === 0 && (
                <div className="mb-4 flex flex-wrap gap-2">
                  {categories.filter(cat => cat !== 'All').map(category => (
                    <button
                      key={category}
                      onClick={() => setSelectedCategory(category)}
                      className={`flex items-center px-3 py-1 rounded-full text-xs sm:text-sm transition-all ${
                        selectedCategory === category
                          ? 'bg-red-600 text-white'
                          : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      <span className="mr-1">{getCategoryIcon(category)}</span>
                      {category}
                      <span className="ml-1 bg-black bg-opacity-30 px-1 rounded">
                        {categoryStats[category] || 0}
                      </span>
                    </button>
                  ))}
                </div>
              )}
        
              {/* Filters */}
              <div className="mb-6 flex flex-col sm:flex-row sm:flex-wrap gap-4 items-start sm:items-center">
                {/* Select All Checkbox (when videos are visible) */}
                {filteredVideos.length > 0 && (
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={allVisibleSelected}
                      onChange={allVisibleSelected ? clearSelection : selectAllVisible}
                      className="w-4 h-4 text-red-600 bg-gray-800 border-gray-700 rounded focus:ring-red-500"
                    />
                    <span className="text-gray-300 text-sm">
                      {allVisibleSelected ? 'Deselect All' : 'Select All'}
                    </span>
                  </label>
                )}
        
                {/* Search Input */}
                <div className="w-full sm:flex-1">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Search videos by name or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-gray-800 text-white px-4 py-2 pl-10 rounded-lg border border-gray-700 placeholder-gray-500 focus:border-red-500 focus:outline-none transition-colors"
                    />
                    <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                      <span className="text-gray-500">🔍</span>
                    </div>
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery('')}
                        className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-white"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                </div>
        
                {/* Category and Sort Filters */}
                <div className="flex flex-col xs:flex-row gap-4 w-full sm:w-auto">
                  <div>
                    <label className="text-gray-400 text-sm mr-2">Category:</label>
                    <select 
                      value={selectedCategory}
                      onChange={(e) => {
                        setSelectedCategory(e.target.value);
                        clearSelection(); // Clear selection when category changes
                      }}
                      className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
                    >
                      {categories.map(category => (
                        <option key={category} value={category}>
                          {category}
                        </option>
                      ))}
                    </select>
                  </div>
        
                  <div>
                    <label className="text-gray-400 text-sm mr-2">Sort by:</label>
                    <select 
                      value={sortBy}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        clearSelection(); // Clear selection when sort changes
                      }}
                      className="bg-gray-800 text-white px-3 py-2 rounded border border-gray-700"
                    >
                      <option value="newest">Newest</option>
                      <option value="oldest">Oldest</option>
                      <option value="largest">Largest</option>
                      <option value="smallest">Smallest</option>
                      <option value="name">Name</option>
                    </select>
                  </div>
                </div>
              </div>
        
              {/* Loading State */}
              {isLoading && (
                <div className="flex justify-center items-center py-16 sm:py-20">
                  <div className="animate-pulse text-gray-400 text-base sm:text-lg">Loading your videos...</div>
                </div>
              )}
        
              {/* Video Grid */}
              {!isLoading && filteredVideos.length > 0 && (
                <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
                  {filteredVideos.map((video) => {
                    const fileName = video.Key.split('/').pop() || 'Untitled';
                    const isSelected = selectedVideos.has(video.Key);
                    
                    return (
                      <div
                        key={video.Key}
                        className={`group relative cursor-pointer transition-all duration-300 hover:scale-105 ${
                          isSelected ? 'ring-2 ring-red-500 ring-offset-2 ring-offset-black rounded-lg' : ''
                        }`}
                        onClick={(e) => {
                          // Only toggle selection if not clicking on checkbox or video controls
                          if (!(e.target as Element).closest('input[type="checkbox"], video, button')) {
                            toggleVideoSelection(video.Key);
                          }
                        }}
                      >
                        {/* Selection Checkbox */}
                        <div className="absolute top-2 left-2 z-20">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={() => toggleVideoSelection(video.Key)}
                            onClick={(e) => e.stopPropagation()}
                            className="w-5 h-5 text-red-600 bg-gray-900 border-2 border-gray-600 rounded focus:ring-red-500"
                          />
                        </div>
        
                        {/* Video Card */}
                        <div className="aspect-video bg-gradient-to-br from-gray-900 to-gray-800 rounded-lg overflow-hidden shadow-2xl border border-gray-800 relative">
                          {/* Selection Overlay */}
                          {isSelected && (
                            <div className="absolute inset-0 bg-red-500 bg-opacity-20 z-10" />
                          )}
                          
                          <HLSVideoPlayer fileKey={video.Key} videoUrl={video.Url} />
                        </div>
        
                        {/* Video Info */}
                        <div className="mt-3">
                          <h3 className="text-white font-medium text-sm truncate mb-1">
                            {searchQuery ? highlightMatch(fileName, searchQuery) : fileName}
                          </h3>
                          
                          {/* Category Badge */}
                          {video.Category && (
                            <span className="inline-flex items-center bg-blue-600 text-white text-xs px-2 py-1 rounded mb-2">
                              <span className="mr-1">{getCategoryIcon(video.Category)}</span>
                              {video.Category}
                            </span>
                          )}
                          
                          {/* Enhanced Metadata */}
                          <div className="text-xs text-gray-400 mt-2 space-y-1">
                            <div className="flex justify-between">
                              <span>Size:</span>
                              <span className="text-gray-300">{formatFileSize(video.Size)}</span>
                            </div>
                            
                            <div className="flex justify-between">
                              <span>Added:</span>
                              <span className="text-gray-300">{formatDate(video.LastModified)}</span>
                            </div>
                            
                            {video.Duration && (
                              <div className="flex justify-between">
                                <span>Duration:</span>
                                <span className="text-gray-300">{formatDuration(video.Duration)}</span>
                              </div>
                            )}
                            
                            {video.Format && (
                              <div className="flex justify-between">
                                <span>Format:</span>
                                <span className="text-gray-300">{video.Format}</span>
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
                  <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
                    <span className="text-4xl sm:text-6xl">🎬</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
                    {selectedCategory === 'All' ? 'Your library is empty' : 'No videos in this category'}
                  </h2>
                  <p className="text-gray-400 max-w-md text-sm sm:text-lg mb-4 sm:mb-6">
                    {selectedCategory === 'All' 
                      ? 'Upload some videos to get started' 
                      : `Try selecting a different category or upload videos to "${selectedCategory}"`
                    }
                  </p>
                  {selectedCategory !== 'All' && (
                    <button
                      onClick={() => setSelectedCategory('All')}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded text-sm sm:text-base"
                    >
                      View All Videos
                    </button>
                  )}
                </div>
              )}
            </div>
            );
          })}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && filteredVideos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 sm:py-20 text-center">
          <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-br from-gray-900 to-gray-800 rounded-full flex items-center justify-center mb-4 sm:mb-6">
            <span className="text-4xl sm:text-6xl">🎬</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-3 sm:mb-4">
            {selectedCategory === 'All' ? 'Your library is empty' : 'No videos in this category'}
          </h2>
          <p className="text-gray-400 max-w-md text-sm sm:text-lg mb-4 sm:mb-6">
            {selectedCategory === 'All' 
              ? 'Upload some videos to get started' 
              : `Try selecting a different category or upload videos to "${selectedCategory}"`
            }
          </p>
          {selectedCategory !== 'All' && (
            <button
              onClick={() => setSelectedCategory('All')}
              className="bg-red-600 hover:bg-red-700 text-white px-4 sm:px-6 py-2 rounded text-sm sm:text-base"
            >
              View All Videos
            </button>
          )}
        </div>
      )}
    </div>
  );
}
