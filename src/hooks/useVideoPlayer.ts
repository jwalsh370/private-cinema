// src/hooks/useVideoPlayer.ts
import { useState } from 'react';

interface VideoPlayerState {
  currentVideo: any | null;
  isPlaying: boolean;
  playVideo: (video: any) => void;
  pauseVideo: () => void;
}

export const useVideoPlayer = (): VideoPlayerState => {
  const [currentVideo, setCurrentVideo] = useState<any | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = (video: any) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    setIsPlaying(false);
    setCurrentVideo(null);
  };

  return {
    currentVideo,
    isPlaying,
    playVideo,
    pauseVideo
  };
};
