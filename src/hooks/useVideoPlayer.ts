// Create a hooks/useVideoPlayer.ts
export const useVideoPlayer = () => {
  const [currentVideo, setCurrentVideo] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const playVideo = (video: any) => {
    setCurrentVideo(video);
    setIsPlaying(true);
  };

  const pauseVideo = () => {
    setIsPlaying(false);
  };

  return {
    currentVideo,
    isPlaying,
    playVideo,
    pauseVideo
  };
};

// Usage in components
const { playVideo, pauseVideo } = useVideoPlayer();

// In MovieCard:
<button onClick={() => playVideo(movie)}>
  <PlayIcon />
</button>
