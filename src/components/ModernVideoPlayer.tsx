'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward, Heart, Plus } from 'lucide-react';

interface EnhancedModernVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  metadata?: any;
  onClose: () => void;
}

export default function EnhancedModernVideoPlayer({ videoUrl, posterUrl, title, metadata, onClose }: EnhancedModernVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isLiked, setIsLiked] = useState(false);
  const [isInList, setIsInList] = useState(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateDuration);

    // Auto-hide controls
    let controlsTimeout: NodeJS.Timeout;
    const resetControlsTimeout = () => {
      clearTimeout(controlsTimeout);
      setShowControls(true);
      controlsTimeout = setTimeout(() => setShowControls(false), 3000);
    };

    resetControlsTimeout();

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateDuration);
      clearTimeout(controlsTimeout);
    };
  }, []);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;

    if (isPlaying) {
      video.pause();
    } else {
      video.play();
    }
    setIsPlaying(!isPlaying);
  };

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;

    if (!isFullscreen) {
      await containerRef.current.requestFullscreen();
    } else {
      await document.exitFullscreen();
    }
    setIsFullscreen(!isFullscreen);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;

    video.muted = !video.muted;
    setVolume(video.muted ? 0 : 1);
  };

  const seek = (time: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime = time;
    setCurrentTime(time);
  };

  const skip = (seconds: number) => {
    const video = videoRef.current;
    if (!video) return;

    video.currentTime += seconds;
    setCurrentTime(video.currentTime);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <motion.div
      ref={containerRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 flex items-center justify-center"
      onMouseMove={() => {
        setShowControls(true);
        setTimeout(() => setShowControls(false), 3000);
      }}
      onClick={togglePlay}
    >
      {/* Background Parallax Layer */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/40 to-black/80"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 0.8 }}
      />
      
      {/* Video Container */}
      <motion.div
        className="relative w-full h-full max-w-6xl mx-auto"
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        {/* Video Element */}
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={posterUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
          onClick={(e) => e.stopPropagation()}
        >
          <source src={videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Metadata Overlay (Left Side) */}
        {showControls && metadata && (
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="absolute left-8 top-8 max-w-md bg-black/70 backdrop-blur-md rounded-xl p-6"
          >
            <h2 className="text-2xl font-bold text-white mb-2">{title}</h2>
            
            <div className="flex items-center space-x-4 mb-4 text-sm text-gray-300">
              {metadata.vote_average && (
                <span className="text-green-400 font-semibold">
                  {(metadata.vote_average * 10).toFixed(0)}% Match
                </span>
              )}
              {metadata.release_date && (
                <span>{new Date(metadata.release_date).getFullYear()}</span>
              )}
              {metadata.runtime && (
                <span>{Math.floor(metadata.runtime / 60)}h {metadata.runtime % 60}m</span>
              )}
              {metadata.genres?.[0] && (
                <span className="border border-gray-400 px-2 py-1 rounded text-xs">
                  {metadata.genres[0].name}
                </span>
              )}
            </div>

            {metadata.overview && (
              <p className="text-gray-300 text-sm leading-relaxed mb-4">
                {metadata.overview}
              </p>
            )}

            <div className="flex items-center space-x-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="netflix-button flex items-center space-x-2"
              >
                {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                <span>{isPlaying ? 'Pause' : 'Play'}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsInList(!isInList);
                }}
                className={`p-2 rounded-full border-2 ${
                  isInList 
                    ? 'border-green-400 text-green-400' 
                    : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                } transition-colors`}
              >
                <Plus size={16} />
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsLiked(!isLiked);
                }}
                className={`p-2 rounded-full border-2 ${
                  isLiked 
                    ? 'border-red-400 text-red-400' 
                    : 'border-gray-400 text-gray-400 hover:border-white hover:text-white'
                } transition-colors`}
              >
                <Heart size={16} fill={isLiked ? 'currentColor' : 'none'} />
              </button>
            </div>
          </motion.div>
        )}

        {/* Controls Overlay */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/90 flex flex-col justify-between p-6"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-white text-lg font-semibold hover:text-gray-300 transition-colors flex items-center space-x-2"
              >
                <span>✕</span>
                <span>Back to Browse</span>
              </button>
              
              <div className="flex items-center space-x-4">
                <span className="text-white text-sm">{title}</span>
              </div>
            </div>

            {/* Center Play Button */}
            <div className="flex items-center justify-center space-x-8">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  skip(-10);
                }}
                className="text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
              >
                <SkipBack size={24} />
              </button>
              
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  togglePlay();
                }}
                className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  skip(10);
                }}
                className="text-white/60 hover:text-white transition-colors p-3 rounded-full hover:bg-white/10"
              >
                <SkipForward size={24} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 cursor-pointer relative">
                <motion.div
                  className="bg-red-600 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.2 }}
                />
                
                {/* Buffer Bar */}
                <div className="absolute top-0 left-0 h-2 bg-white/10 rounded-full w-full" />
                
                {/* Time Tooltip on Hover */}
                <div className="absolute top-0 h-2 w-full group">
                  <div className="absolute top-0 left-0 h-2 w-full cursor-pointer"
                    onClick={(e) => {
                      const rect = e.currentTarget.getBoundingClientRect();
                      const clickX = e.clientX - rect.left;
                      const percentage = clickX / rect.width;
                      seek(percentage * duration);
                    }}
                  />
                </div>
              </div>

              {/* Control Bar */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <button onClick={togglePlay} className="text-white">
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  
                  <button onClick={toggleMute} className="text-white">
                    {volume > 0 ? <Volume2 size={20} /> : <VolumeX size={20} />}
                  </button>
                  
                  <div className="flex items-center space-x-2">
                    <span className="text-white text-sm">
                      {formatTime(currentTime)}
                    </span>
                    <span className="text-gray-400">/</span>
                    <span className="text-gray-400 text-sm">
                      {formatTime(duration)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-gray-400 text-sm">
                    {Math.round(progressPercentage)}%
                  </span>
                  
                  <button onClick={toggleFullscreen} className="text-white">
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>

              {/* Additional Info */}
              {metadata && (
                <div className="flex items-center space-x-4 text-xs text-gray-400">
                  {metadata.resolution && (
                    <span>Resolution: {metadata.resolution}</span>
                  )}
                  {metadata.bitrate && (
                    <span>Bitrate: {Math.round(metadata.bitrate / 1000)} Mbps</span>
                  )}
                  {metadata.codec && (
                    <span>Codec: {metadata.codec.toUpperCase()}</span>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* Auto-show controls when not playing */}
        {!isPlaying && !showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={(e) => {
                e.stopPropagation();
                togglePlay();
              }}
              className="bg-white/20 hover:bg-white/30 rounded-full p-6 transition-all backdrop-blur-sm"
            >
              <Play size={48} className="text-white" />
            </button>
          </div>
        )}

        {/* Loading State */}
        {!videoRef.current?.readyState && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/50">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-600" />
          </div>
        )}

        {/* Error State */}
        {videoRef.current?.error && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/70">
            <div className="text-center">
              <div className="text-red-400 text-4xl mb-4">⚠️</div>
              <p className="text-white text-lg mb-2">Playback Error</p>
              <p className="text-gray-400 text-sm">
                Unable to play this video. The file may be corrupted or unsupported.
              </p>
              <button
                onClick={onClose}
                className="mt-4 netflix-button"
              >
                Close Player
              </button>
            </div>
          </div>
        )}
      </motion.div>

      {/* Keyboard Shortcuts */}
      <div className="hidden">
        {/* Space to play/pause */}
        {/* Arrow keys for seeking */}
        {/* M to mute */}
        {/* F for fullscreen */}
        {/* Esc to exit fullscreen */}
      </div>
    </motion.div>
  );
}