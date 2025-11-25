// src/components/MetadataManager.tsx
'use client';
import { useState, useEffect } from 'react';
import { Search, RefreshCw } from 'lucide-react';

interface VideoWithMetadata {
  id: string;
  s3Key: string;
  originalFilename: string;
  parsedMetadata: any;
  tmdbMetadata: any | null;
  metadataStatus: 'pending' | 'matched' | 'manual' | 'error';
  category: string;
  uploadDate: string;
}

export default function MetadataManager() {
  const [videos, setVideos] = useState<VideoWithMetadata[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [editingVideo] = useState<VideoWithMetadata | null>(null);
  const [manualSearch, setManualSearch] = useState('');

  useEffect(() => {
    loadVideos();
  }, []);

  const loadVideos = async () => {
    try {
      const response = await fetch('/api/videos/metadata/pending');
      const data = await response.json();
      setVideos(data);
    } catch (error) {
      console.error('Failed to load videos:', error);
    } finally {
      setLoading(false);
    }
  };

  const searchTMDB = async (video: VideoWithMetadata, query: string) => {
    try {
      const response = await fetch(`/api/tmdb/search?query=${encodeURIComponent(query)}`);
      const results = await response.json();
      
      // Update UI with search results
      setVideos(prev => prev.map(v => 
        v.id === video.id ? { ...v, searchResults: results } : v
      ));
    } catch (error) {
      console.error('TMDB search failed:', error);
    }
  };

  const assignMetadata = async (video: VideoWithMetadata, tmdbId: number) => {
    try {
      const response = await fetch('/api/videos/metadata/assign', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ videoId: video.id, tmdbId })
      });

      if (response.ok) {
        // Refresh the list
        loadVideos();
      }
    } catch (error) {
      console.error('Failed to assign metadata:', error);
    }
  };

  const filteredVideos = videos.filter(video =>
    video.originalFilename.toLowerCase().includes(searchQuery.toLowerCase()) ||
    video.parsedMetadata.cleanTitle.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return <div className="p-8 text-center">Loading...</div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Metadata Management</h2>
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={loadVideos}
            className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
          >
            <RefreshCw size={20} />
            <span>Refresh</span>
          </button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredVideos.map((video) => (
          <div key={video.id} className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-lg">{video.originalFilename}</h3>
              <div className={`px-2 py-1 rounded text-xs ${
                video.metadataStatus === 'matched' ? 'bg-green-100 text-green-800' :
                video.metadataStatus === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                'bg-red-100 text-red-800'
              }`}>
                {video.metadataStatus}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-2">Parsed from filename:</h4>
                <div className="text-sm text-gray-600 space-y-1">
                  <div>Title: {video.parsedMetadata.cleanTitle}</div>
                  {video.parsedMetadata.year && <div>Year: {video.parsedMetadata.year}</div>}
                  {video.parsedMetadata.quality && <div>Quality: {video.parsedMetadata.quality}</div>}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium text-gray-700 mb-2">TMDB Match:</h4>
                {video.tmdbMetadata ? (
                  <div className="text-sm space-y-1">
                    <div className="text-green-600">✓ {video.tmdbMetadata.title}</div>
                    <div>{new Date(video.tmdbMetadata.release_date).getFullYear()}</div>
                  </div>
                ) : (
                  <div className="text-gray-500 text-sm">No match yet</div>
                )}
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => searchTMDB(video, video.parsedMetadata.cleanTitle)}
                className="flex items-center space-x-2 bg-gray-100 text-gray-700 px-3 py-1 rounded text-sm hover:bg-gray-200"
              >
                <Search size={16} />
                <span>Search TMDB</span>
              </button>

              <input
                type="text"
                placeholder="Manual search..."
                value={manualSearch}
                onChange={(e) => setManualSearch(e.target.value)}
                className="flex-1 border border-gray-300 rounded px-3 py-1 text-sm"
              />
              
              <button
                onClick={() => searchTMDB(video, manualSearch)}
                className="bg-blue-100 text-blue-700 px-3 py-1 rounded text-sm hover:bg-blue-200"
              >
                Search
              </button>

              {video.searchResults && (
                <select
                  onChange={(e) => assignMetadata(video, parseInt(e.target.value))}
                  className="border border-gray-300 rounded px-3 py-1 text-sm"
                >
                  <option value="">Select match...</option>
                  {video.searchResults.map((result: any) => (
                    <option key={result.id} value={result.id}>
                      {result.title} ({new Date(result.release_date).getFullYear()})
                    </option>
                  ))}
                </select>
              )}
            </div>
          </div>
        ))}
      </div>

      {filteredVideos.length === 0 && (
        <div className="text-center py-12 text-gray-500">
          {videos.length === 0 ? 'No videos need metadata assignment' : 'No matching videos found'}
        </div>
      )}
    </div>
  );
}
