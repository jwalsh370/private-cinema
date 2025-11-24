// src/components/FileUpload.tsx
'use client';

import { useState, useRef } from 'react';

interface UploadCategory {
  name: string;
  bucketPath: string;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  speed: number;
  estimatedTime: number;
  uploadedBytes: number;
  totalBytes: number;
}

interface TMDBResult {
  id: number;
  title: string;
  release_date: string;
  // Add other TMDB fields as needed
}

const categories: UploadCategory[] = [
  { name: 'Movies', bucketPath: 'movies' },
  { name: 'TV Shows', bucketPath: 'tv-shows' },
  { name: 'Documentaries', bucketPath: 'documentaries' },
  { name: 'Personal', bucketPath: 'personal' },
  { name: 'Other', bucketPath: 'other' }
];

export function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('other');
  const [selectedFiles, setSelectedFiles] = useState<{
    video: File | null;
    poster: File | null;
    subtitles: File[];
  }>({ video: null, poster: null, subtitles: [] });
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const uploadStartTime = useRef<number>(0);
  const [movieTitle, setMovieTitle] = useState('');
  const [year, setYear] = useState('');
  const [manualSearch, setManualSearch] = useState(false);
  const [searchResults, setSearchResults] = useState<TMDBResult[]>([]);
  const [selectedMovie, setSelectedMovie] = useState<TMDBResult | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const formatTime = (seconds: number): string => {
    if (seconds < 60) return `${Math.ceil(seconds)}s`;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}m ${secs}s`;
  };

  const formatSpeed = (bytesPerSecond: number): string => {
    if (bytesPerSecond < 1024) return `${bytesPerSecond.toFixed(0)} B/s`;
    if (bytesPerSecond < 1024 * 1024) return `${(bytesPerSecond / 1024).toFixed(1)} KB/s`;
    return `${(bytesPerSecond / (1024 * 1024)).toFixed(1)} MB/s`;
  };

  const validateFile = (file: File, type: 'video' | 'image' | 'subtitle'): string | null => {
    const maxSize = {
      video: 500 * 1024 * 1024, // 500MB
      image: 10 * 1024 * 1024,  // 10MB
      subtitle: 5 * 1024 * 1024 // 5MB
    }[type];

    if (file.size > maxSize) {
      return `File too large. Maximum size: ${formatFileSize(maxSize)}`;
    }

    const validExtensions = {
      video: ['.mp4', '.mov', '.avi', '.mkv', '.webm'],
      image: ['.jpg', '.jpeg', '.png', '.gif', '.webp'],
      subtitle: ['.srt', '.vtt', '.ass']
    }[type];

    const extension = '.' + file.name.split('.').pop()?.toLowerCase();
    if (extension && !validExtensions.includes(extension)) {
      return `Invalid file type. Allowed: ${validExtensions.join(', ')}`;
    }

    return null;
  };

  const uploadWithProgress = async (formData: FormData, fileName: string, totalSize: number): Promise<any> => {
    uploadStartTime.current = Date.now();
    
    return new Promise((resolve, reject) => {
      const xhr = new XMLHttpRequest();
      
      xhr.upload.addEventListener('progress', (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          const elapsedTime = (Date.now() - uploadStartTime.current) / 1000;
          const uploadSpeed = event.loaded / elapsedTime;
          const remainingBytes = event.total - event.loaded;
          const estimatedTime = remainingBytes / uploadSpeed;
          
          setUploadProgress({
            fileName,
            progress,
            speed: uploadSpeed,
            estimatedTime,
            uploadedBytes: event.loaded,
            totalBytes: event.total
          });
        }
      });

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText);
            resolve(response);
          } catch (error) {
            resolve({});
          }
        } else {
          reject(new Error(`Upload failed: ${xhr.statusText}`));
        }
      });

      xhr.addEventListener('error', () => {
        reject(new Error('Network error'));
      });

      xhr.open('POST', '/api/upload');
      xhr.send(formData);
    });
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setIsDragging(true);
    } else if (e.type === 'dragleave') {
      setIsDragging(false);
    }
  };

  const handleDrop = (e: React.DragEvent, fileType: 'video' | 'poster' | 'subtitles') => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files, fileType);
    }
  };

  const handleFileSelection = (files: File[], fileType: 'video' | 'poster' | 'subtitles') => {
    const file = files[0];
    let validationError: string | null = null;

    if (fileType === 'video') {
      validationError = validateFile(file, 'video');
      if (!validationError) {
        setSelectedFiles(prev => ({ ...prev, video: file }));
        extractTitleAndYear(file.name);
      }
    } else if (fileType === 'poster') {
      validationError = validateFile(file, 'image');
      if (!validationError) {
        setSelectedFiles(prev => ({ ...prev, poster: file }));
      }
    } else {
      // For subtitles, validate each file
      const validFiles: File[] = [];
      for (const subFile of files) {
        validationError = validateFile(subFile, 'subtitle');
        if (validationError) break;
        validFiles.push(subFile);
      }
      if (!validationError) {
        setSelectedFiles(prev => ({ ...prev, subtitles: validFiles }));
      }
    }

    if (validationError) {
      setError(validationError);
    } else {
      setError(null);
    }
  };

  const extractTitleAndYear = (filename: string) => {
    // Pattern: Movie.Name.2020.1080p.BluRay.mp4
    const pattern = /^(.*?)(\.(\d{4}))?\./;
    const match = filename.match(pattern);
    
    if (match) {
      const title = match[1].replace(/[._]/g, ' ').trim();
      const year = match[3] || '';
      setMovieTitle(title);
      setYear(year);
      
      // Auto-search TMDB
      searchTMDB(title, year);
    }
  };

  const searchTMDB = async (title: string, year: string = '') => {
    try {
      const response = await fetch(
        `/api/tmdb/search?query=${encodeURIComponent(title)}${year ? `&year=${year}` : ''}`
      );
      const results = await response.json();
      setSearchResults(results);
    } catch (error) {
      console.error('TMDB search failed:', error);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, fileType: 'video' | 'poster' | 'subtitles') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    handleFileSelection(Array.from(files), fileType);
  };

  const handleFileUpload = async () => {
    if (!selectedFiles.video) {
      setError('Please select a video file');
      return;
    }

    setUploading(true);
    setError(null);
    setSuccess(null);
    setUploadProgress(null);

    try {
      console.log('Starting upload process...');
      
      // Upload video file
      const videoFormData = new FormData();
      videoFormData.append('file', selectedFiles.video);
      videoFormData.append('category', selectedCategory);
      videoFormData.append('type', 'video');
      
      // Add TMDB metadata if available
      if (selectedMovie) {
        videoFormData.append('tmdbId', selectedMovie.id.toString());
        videoFormData.append('title', selectedMovie.title);
        if (selectedMovie.release_date) {
          videoFormData.append('year', new Date(selectedMovie.release_date).getFullYear().toString());
        }
      }

      console.log('Uploading video file:', selectedFiles.video.name);
      
      const videoData = await uploadWithProgress(videoFormData, selectedFiles.video.name, selectedFiles.video.size);
      console.log('Video uploaded successfully:', videoData);

      // Upload poster if provided
      if (selectedFiles.poster) {
        console.log('Uploading poster file:', selectedFiles.poster.name);
        const posterFormData = new FormData();
        posterFormData.append('file', selectedFiles.poster);
        posterFormData.append('category', selectedCategory);
        posterFormData.append('type', 'poster');
        posterFormData.append('videoKey', videoData.key);

        await uploadWithProgress(posterFormData, selectedFiles.poster.name, selectedFiles.poster.size);
        console.log('Poster uploaded successfully');
      }

      // Upload subtitles if provided
      if (selectedFiles.subtitles && selectedFiles.subtitles.length > 0) {
        console.log('Uploading subtitle files');
        for (const subtitle of selectedFiles.subtitles) {
          const subtitleFormData = new FormData();
          subtitleFormData.append('file', subtitle);
          subtitleFormData.append('category', selectedCategory);
          subtitleFormData.append('type', 'subtitle');
          subtitleFormData.append('videoKey', videoData.key);

          await uploadWithProgress(subtitleFormData, subtitle.name, subtitle.size);
        }
        console.log('Subtitles uploaded successfully');
      }

      setSuccess('Files uploaded successfully!');
      setSelectedFiles({ video: null, poster: null, subtitles: [] });
      setUploadProgress(null);
      setSearchResults([]);
      setSelectedMovie(null);
      setMovieTitle('');
      setYear('');
      
      // Refresh the gallery after successful upload
      setTimeout(() => window.location.reload(), 2000);
      
    } catch (err) {
      console.error('Upload error:', err);
      setError(err instanceof Error ? err.message : 'Upload failed');
      setUploadProgress(null);
    } finally {
      setUploading(false);
    }
  };

  const clearSelection = () => {
    setSelectedFiles({ video: null, poster: null, subtitles: [] });
    setError(null);
    setSuccess(null);
    setSearchResults([]);
    setSelectedMovie(null);
    setMovieTitle('');
    setYear('');
  };

  const renderDragDropArea = (fileType: 'video' | 'poster' | 'subtitles', label: string, accept: string) => (
    <div
      className={`border-2 border-dashed rounded-lg p-6 text-center transition-colors cursor-pointer ${
        isDragging ? 'border-blue-400 bg-blue-500/10' : 'border-gray-600 hover:border-gray-500'
      }`}
      onDragEnter={handleDrag}
      onDragOver={handleDrag}
      onDragLeave={handleDrag}
      onDrop={(e) => handleDrop(e, fileType)}
    >
      <div className="text-gray-400 mb-2">📁</div>
      <p className="text-gray-300">Drag & drop {label} here</p>
      <p className="text-gray-500 text-sm mt-1">or click to browse</p>
      <p className="text-gray-400 text-xs mt-2">Accepted: {accept}</p>
    </div>
  );

  return (
    <div className="space-y-6 p-6 bg-gray-800/50 backdrop-blur-md rounded-2xl border border-gray-700/30">
      <h2 className="text-2xl font-bold text-white">Upload Media</h2>
      
      {/* Category Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Category
        </label>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="w-full bg-gray-700 text-white px-4 py-2 rounded-lg border-2 border-gray-600"
          disabled={uploading}
        >
          {categories.map((cat) => (
                      <option key={cat.bucketPath} value={cat.bucketPath}>
                      {cat.name}
                    </option>
                  ))}
                </select>
              </div>
          
              {/* TMDB Search Section */}
              {selectedFiles.video && (
                <div className="space-y-4 p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-white">Movie Identification</h3>
                    <button
                      onClick={() => setManualSearch(!manualSearch)}
                      className="text-blue-400 hover:text-blue-300 text-sm"
                    >
                      {manualSearch ? 'Hide Search' : 'Manual Search'}
                    </button>
                  </div>
          
                  {manualSearch && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-3">
                        <input
                          type="text"
                          value={movieTitle}
                          onChange={(e) => setMovieTitle(e.target.value)}
                          placeholder="Movie title"
                          className="bg-gray-600 text-white px-3 py-2 rounded border border-gray-500"
                        />
                        <input
                          type="text"
                          value={year}
                          onChange={(e) => setYear(e.target.value)}
                          placeholder="Year (optional)"
                          className="bg-gray-600 text-white px-3 py-2 rounded border border-gray-500"
                        />
                      </div>
                      <button
                        onClick={() => searchTMDB(movieTitle, year)}
                        disabled={!movieTitle}
                        className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                      >
                        Search TMDB
                      </button>
                    </div>
                  )}
          
                  {/* Search Results */}
                  {searchResults.length > 0 && (
                    <div className="space-y-2">
                      <p className="text-sm text-gray-300">Select the correct movie:</p>
                      <div className="max-h-40 overflow-y-auto space-y-1">
                        {searchResults.map((result) => (
                          <div
                            key={result.id}
                            onClick={() => setSelectedMovie(result)}
                            className={`p-2 rounded cursor-pointer text-sm ${
                              selectedMovie?.id === result.id
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-600 text-gray-300 hover:bg-gray-500'
                            }`}
                          >
                            {result.title} ({new Date(result.release_date).getFullYear()})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
          
                  {/* Selected Movie */}
                  {selectedMovie && (
                    <div className="p-3 bg-green-600/20 rounded border border-green-400/30">
                      <p className="text-green-300 text-sm">
                        ✓ Selected: {selectedMovie.title} ({new Date(selectedMovie.release_date).getFullYear()})
                      </p>
                    </div>
                  )}
                </div>
              )}
          
              {/* File Inputs */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Video File (Required)
                  </label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, 'video')}
                  >
                    <input
                      type="file"
                      accept="video/*"
                      onChange={(e) => handleFileChange(e, 'video')}
                      className="hidden"
                      id="video-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="video-upload" className="cursor-pointer">
                      {renderDragDropArea('video', 'a video file', 'MP4, MOV, AVI, MKV, WEBM')}
                    </label>
                  </div>
                  {selectedFiles.video && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-green-500/10 rounded">
                      <span className="text-sm text-green-400">
                        ✓ {selectedFiles.video.name} ({formatFileSize(selectedFiles.video.size)})
                      </span>
                      <button
                        onClick={() => {
                          setSelectedFiles(prev => ({ ...prev, video: null }));
                          setSearchResults([]);
                          setSelectedMovie(null);
                          setMovieTitle('');
                          setYear('');
                        }}
                        className="text-red-400 hover:text-red-300 text-sm"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
          
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Poster Image (Optional)
                  </label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, 'poster')}
                  >
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileChange(e, 'poster')}
                      className="hidden"
                      id="poster-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="poster-upload" className="cursor-pointer">
                      {renderDragDropArea('poster', 'a poster image', 'JPG, PNG, GIF, WEBP')}
                    </label>
                  </div>
                  {selectedFiles.poster && (
                    <div className="flex items-center justify-between mt-2 p-2 bg-blue-500/10 rounded">
                      <span className="text-sm text-blue-400">
                        ✓ {selectedFiles.poster.name} ({formatFileSize(selectedFiles.poster.size)})
                      </span>
                      <button
                        onClick={() => setSelectedFiles(prev => ({ ...prev, poster: null }))}
                        className="text-red-400 hover:text-red-300 text-sm"
                        disabled={uploading}
                      >
                        Remove
                      </button>
                    </div>
                  )}
                </div>
          
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Subtitles (Optional)
                  </label>
                  <div 
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={(e) => handleDrop(e, 'subtitles')}
                  >
                    <input
                      type="file"
                      accept=".srt,.vtt,.ass"
                      multiple
                      onChange={(e) => handleFileChange(e, 'subtitles')}
                      className="hidden"
                      id="subtitle-upload"
                      disabled={uploading}
                    />
                    <label htmlFor="subtitle-upload" className="cursor-pointer">
                      {renderDragDropArea('subtitles', 'subtitle files', 'SRT, VTT, ASS')}
                    </label>
                  </div>
                  {selectedFiles.subtitles.length > 0 && (
                    <div className="mt-2 p-2 bg-purple-500/10 rounded">
                      <span className="text-sm text-purple-400">
                        ✓ {selectedFiles.subtitles.length} subtitle file(s) selected
                      </span>
                      <button
                        onClick={() => setSelectedFiles(prev => ({ ...prev, subtitles: [] }))}
                        className="text-red-400 hover:text-red-300 text-sm ml-4"
                        disabled={uploading}
                      >
                        Clear
                      </button>
                    </div>
                  )}
                </div>
              </div>
          
              {/* Progress Bar */}
              {uploadProgress && (
                <div className="bg-gray-700 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-sm font-medium text-white">
                      Uploading: {uploadProgress.fileName}
                    </span>
                    <span className="text-sm text-gray-300">
                      {Math.round(uploadProgress.progress)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-600 rounded-full h-2.5 mb-2">
                    <div 
                      className="bg-blue-500 h-2.5 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress.progress}%` }}
                    />
                  </div>
                  
                  <div className="flex justify-between text-xs text-gray-400">
                    <span>
                      {formatFileSize(uploadProgress.uploadedBytes)} / {formatFileSize(uploadProgress.totalBytes)}
                    </span>
                    <span>
                      {uploadProgress.speed > 0 ? (
                        <>
                          {formatSpeed(uploadProgress.speed)} • 
                          ETA: {formatTime(uploadProgress.estimatedTime)}
                        </>
                      ) : 'Calculating...'}
                    </span>
                  </div>
                </div>
              )}
          
              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  onClick={handleFileUpload}
                  disabled={uploading || !selectedFiles.video}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white py-3 rounded-lg transition-colors flex items-center justify-center"
                >
                  {uploading ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Uploading...
                    </>
                  ) : (
                    'Start Upload'
                  )}
                </button>
                
                {!uploading && (selectedFiles.video || selectedFiles.poster || selectedFiles.subtitles.length > 0) && (
                  <button
                    onClick={clearSelection}
                    className="px-4 bg-gray-600 hover:bg-gray-500 text-white py-3 rounded-lg transition-colors"
                  >
                    Clear All
                  </button>
                )}
              </div>
          
              {/* Status Messages */}
              {error && (
                <div className="p-3 bg-red-500/20 text-red-300 rounded-lg">
                  <span className="font-medium">Error:</span> {error}
                </div>
              )}
          
              {success && (
                <div className="p-3 bg-green-500/20 text-green-300 rounded-lg">
                  <span className="font-medium">Success:</span> {success}
                </div>
              )}
          
              {/* File Summary */}
              {(selectedFiles.video || selectedFiles.poster || selectedFiles.subtitles.length > 0) && !uploading && (
                <div className="p-3 bg-gray-700/50 rounded-lg">
                  <h4 className="font-medium text-gray-300 mb-2">Selected Files:</h4>
                  <ul className="text-sm text-gray-400 space-y-1">
                    {selectedFiles.video && (
                      <li>🎥 Video: {selectedFiles.video.name} ({formatFileSize(selectedFiles.video.size)})</li>
                    )}
                    {selectedFiles.poster && (
                      <li>🖼️ Poster: {selectedFiles.poster.name} ({formatFileSize(selectedFiles.poster.size)})</li>
                    )}
                    {selectedFiles.subtitles.length > 0 && (
                      <li>📝 Subtitles: {selectedFiles.subtitles.length} file(s)</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          );
        }