// src/components/ModernVideoPlayer.tsx
'use client';
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, Volume2, VolumeX, Maximize, Minimize, SkipBack, SkipForward } from 'lucide-react';

interface ModernVideoPlayerProps {
  videoUrl: string;
  posterUrl?: string;
  title?: string;
  metadata?: any;
  onClose: () => void;
}

export function ModernVideoPlayer({ videoUrl, posterUrl, title, metadata, onClose }: ModernVideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [volume, setVolume] = useState(1);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(true);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const updateProgress = () => setCurrentTime(video.currentTime);
    const updateDuration = () => setDuration(video.duration);

    video.addEventListener('timeupdate', updateProgress);
    video.addEventListener('loadedmetadata', updateDuration);

    return () => {
      video.removeEventListener('timeupdate', updateProgress);
      video.removeEventListener('loadedmetadata', updateDuration);
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

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

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
        <video
          ref={videoRef}
          className="w-full h-full object-contain"
          poster={posterUrl}
          onPlay={() => setIsPlaying(true)}
          onPause={() => setIsPlaying(false)}
          onEnded={() => setIsPlaying(false)}
        >
          <source src={videoUrl} type="video/mp4" />
        </video>

        {/* Controls Overlay */}
        {showControls && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-black/90 flex flex-col justify-between p-6"
          >
            {/* Top Bar */}
            <div className="flex justify-between items-center">
              <button
                onClick={onClose}
                className="text-white text-lg font-semibold hover:text-gray-300 transition-colors"
              >
                ← Back
              </button>
              <h2 className="text-white text-xl font-bold">{title}</h2>
              <div className="w-8" /> {/* Spacer */}
            </div>

            {/* Center Play Button */}
            <div className="flex items-center justify-center space-x-8">
              <button className="text-white/60 hover:text-white transition-colors">
                <SkipBack size={24} />
              </button>
              <button
                onClick={togglePlay}
                className="bg-white/20 hover:bg-white/30 rounded-full p-4 transition-all"
              >
                {isPlaying ? <Pause size={32} /> : <Play size={32} />}
              </button>
              <button className="text-white/60 hover:text-white transition-colors">
                <SkipForward size={24} />
              </button>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-4">
              {/* Progress Bar */}
              <div className="w-full bg-white/20 rounded-full h-2 cursor-pointer">
                <motion.div
                  className="bg-red-600 h-2 rounded-full"
                  initial={{ width: '0%' }}
                  animate={{ width: `${(currentTime / duration) * 100}%` }}
                  transition={{ duration: 0.2 }}
                />
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
                  <span className="text-white text-sm">
                    {formatTime(currentTime)} / {formatTime(duration)}
                  </span>
                </div>

                <div className="flex items-center space-x-4">
                  <button onClick={toggleFullscreen} className="text-white">
                    {isFullscreen ? <Minimize size={20} /> : <Maximize size={20} />}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Auto-show controls when not playing */}
        {!isPlaying && !showControls && (
          <div className="absolute inset-0 flex items-center justify-center">
            <button
              onClick={togglePlay}
              className="bg-white/20 hover:bg-white/30 rounded-full p-6 transition-all backdrop-blur-sm"
            >
              <Play size={48} className="text-white" />
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
