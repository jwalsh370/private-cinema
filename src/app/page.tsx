'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useUpload } from '@/hooks/useUpload';
import { VideoModal } from '@/components/video-modal';
import { toast } from 'sonner';
import { Progress } from '@/components/ui/progress';




// Simple function to fetch videos - we'll add this directly to avoid creating a new hook file
async function fetchVideos() {
  try {
    const response = await fetch('/api/videos');
    if (!response.ok) throw new Error('Failed to fetch videos');
    return await response.json();
  } catch (error) {
    console.error('Error fetching videos:', error);
    return [];
  }
}

export default function Home() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [videos, setVideos] = useState<any[]>([]);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const { uploadFile, isUploading, uploadProgress, error } = useUpload();

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    const result = await uploadFile(selectedFile);
    if (result) {
      console.log('Upload successful!', result);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      // Show success toast
      toast.success('Upload Successful!', {
        description: `${selectedFile.name} has been added to your library.`,
      });
      // Refresh the video list after successful upload
      loadVideos();
    }
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
  };

  const loadVideos = async () => {
    setIsLoadingVideos(true);
    const videoData = await fetchVideos();
    setVideos(videoData);
    setIsLoadingVideos(false);
  };
  const [selectedVideo, setSelectedVideo] = useState<{ url: string; name: string } | null>(null);

  // Load videos when component mounts
  useState(() => {
    loadVideos();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white">
      {/* Header */}
      <div className="border-b border-slate-700/50 bg-gradient-to-r from-slate-900/70 to-slate-800/50 backdrop-blur-sm">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Private Cinema
              </h1>
              <p className="text-slate-400 text-sm mt-1">Your personal theater</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-8 py-12">
        <div className="text-center mb-16">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-slate-700/50 mb-6">
            <svg className="w-8 h-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
            </svg>
          </div>
          <h2 className="text-4xl font-bold mb-4">Your Personal Streaming Library</h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            Upload and organize your movie collection. Stream anywhere, anytime.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2 max-w-6xl mx-auto">
          {/* Upload Card */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                </svg>
                Add Content
              </CardTitle>
              <CardDescription className="text-slate-400">
                Upload your movies and shows
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div 
                className="border-2 border-dashed border-slate-600/50 rounded-xl p-8 text-center hover:border-blue-400/50 transition-all duration-300 group cursor-pointer"
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onClick={() => fileInputRef.current?.click()}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  className="hidden"
                  onChange={handleFileSelect}
                  accept="video/*"
                />
                
                <div className="mb-6">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50 group-hover:bg-blue-500/20 transition-colors duration-300">
                    <svg className="w-8 h-8 text-slate-400 group-hover:text-blue-400 transition-colors duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6"/>
                    </svg>
                  </div>
                </div>
                
                {selectedFile ? (
                  <>
                    <p className="text-blue-400 font-medium mb-2">Selected file:</p>
                    <p className="text-sm text-slate-300 mb-4 truncate">{selectedFile.name}</p>
                    <p className="text-xs text-slate-500 mb-6">
                      {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-slate-400 mb-6">
                    Drag and drop video files here, or click to browse
                  </p>
                )}
                
                <Button 
  className="bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 border-0 text-white w-full relative overflow-hidden"
  onClick={(e) => {
    e.stopPropagation();
    handleUpload();
  }}
  disabled={!selectedFile || isUploading}
>
  {isUploading ? (
    <div className="flex items-center justify-center w-full relative">
      {/* Animated progress bar background */}
      <div className="absolute left-0 top-0 h-full bg-blue-600/30 transition-all duration-150"
           style={{ width: `${uploadProgress}%` }} />
      
      {/* Progress text */}
      <span className="relative z-10 font-medium">
        {uploadProgress === 100 ? 'Processing...' : `Uploading ${uploadProgress}%`}
      </span>
    </div>
  ) : (
    'Start Upload'
  )}
</Button>
{isUploading && (
  <div className="mt-4">
    <Progress value={uploadProgress} className="h-2" />
    <p className="text-xs text-slate-400 mt-2 text-center">
      {uploadProgress === 100 ? 'Finalizing...' : `Uploading your video`}
    </p>
  </div>
)}

                
                {error && (
                  <p className="text-red-400 text-sm mt-4">{error}</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Library Card */}
          <Card className="bg-slate-800/50 border-slate-700/50 backdrop-blur-sm">
            <CardHeader>
              <CardTitle className="text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-purple-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M4 4h16a2 2 0 012 2v12a2 2 0 01-2 2H4a2 2 0 01-2-2V6a2 2 0 012-2zm0 2v12h16V6H4zm2 2h12v2H6V8zm0 4h12v2H6v-2z"/>
                </svg>
                Your Library
              </CardTitle>
              <CardDescription className="text-slate-400">
                {videos.length} movies • 0 shows
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingVideos ? (
                <div className="text-center py-12">
                  <p className="text-slate-400">Loading your library...</p>
                </div>
              ) : videos.length === 0 ? (
                <div className="text-center py-12">
                  <div className="mb-6">
                    <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-slate-700/50">
                      <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                      </svg>
                    </div>
                  </div>
                  <p className="text-slate-400 mb-4">Your collection is empty</p>
                  <p className="text-sm text-slate-500">
                    Upload your first movie to get started
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {videos.map((video) => (
                    <div key={video.key} className="flex items-center justify-between p-3 rounded-lg bg-slate-700/30">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-200 truncate">
                          {video.name}
                        </p>
                        <p className="text-xs text-slate-400">
                          {video.size ? (video.size / (1024 * 1024)).toFixed(1) + ' MB' : 'Unknown size'}
                        </p>
                      </div>
                      <Button 
  variant="outline" 
  size="sm"
  className="border-slate-600 text-slate-300 hover:bg-slate-600"
  onClick={() => setSelectedVideo({
    url: `https://private-cinema-uploads-jw.s3.us-east-2.amazonaws.com/${video.key}`,
    name: video.name
  })}
>
  Play
</Button>

                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
      <VideoModal
  isOpen={!!selectedVideo}
  onClose={() => setSelectedVideo(null)}
  videoUrl={selectedVideo?.url || ''}
  videoName={selectedVideo?.name || ''}
/>
    </div>
    
  );
}
