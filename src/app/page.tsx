// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

import { HeroSection, ContentRows, MediaGallery, LuxuryNavbar, FullScreenVideoPlayer, ProtectedRoute } from '@/components';
import { getVideosWithPendingMetadata } from '@/lib/videoStorage';


export default function CinemaDashboard() {
  const { user } = useAuth();
  const { currentVideo, isPlaying, playVideo, pauseVideo } = useVideoPlayer();
  const [featuredMovies, setFeaturedMovies] = useState<Movie[]>([]);
  const [recentUploads, setRecentUploads] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadMedia = async () => {
      try {
        const [pendingResponse, allVideosResponse] = await Promise.all([
          fetch('/api/videos/metadata/pending'),
          fetch('/api/videos')
        ]);
    
        // Add detailed error logging
        if (!pendingResponse.ok) {
          console.error('Pending videos API error:', pendingResponse.status, pendingResponse.statusText);
          throw new Error(`Pending videos API error: ${pendingResponse.status}`);
        }
        
        if (!allVideosResponse.ok) {
          console.error('All videos API error:', allVideosResponse.status, allVideosResponse.statusText);
          throw new Error(`All videos API error: ${allVideosResponse.status}`);
        }
    
        const [pending, allVideosData] = await Promise.all([
          pendingResponse.json(),
          allVideosResponse.json()
        ]);
    
        console.log('Pending videos:', pending);
        console.log('All videos data:', allVideosData);
    
        // Extract featured videos from the API response
        const featuredVideos = Object.values(allVideosData)
          .flat()
          .filter((video: any) => 
            video.rating > 7 || // High rating
            video.metadata?.vote_average > 7 || // TMDB high rating
            video.category?.toLowerCase().includes('featured') // Or by category
          )
          .slice(0, 10);
    
        setRecentUploads(pending.map(enrichMovieData));
        setFeaturedMovies(featuredVideos.map(enrichMovieData));
      } catch (err) {
        console.error('Media load error details:', err);
        setError('Failed to load media library');
      } finally {
        setLoading(false);
      }
    };
    

    loadMedia();
  }, []);

  const enrichMovieData = (movie: any): Movie => ({
    ...movie,
    s3Key: movie.Key || movie.s3Key,
    videoUrl: movie.Url || movie.videoUrl, // Make sure this exists for video playback
    posterPath: movie.metadata?.poster_path || movie.posterPath || '',
    progress: movie.progress || 0,
    duration: movie.metadata?.runtime || movie.duration || 0,
    metadataStatus: movie.metadataStatus || 'PENDING',
    title: movie.metadata?.title || movie.title || 'Unknown Title',
    rating: movie.metadata?.vote_average || movie.rating || 0
  });

  if (error) {
    return (
      <div className="min-h-screen luxury-gradient flex items-center justify-center p-8">
        <div className="text-center bg-deep-navy/90 rounded-xl p-8 border border-salmon-pink/30">
          <h2 className="text-2xl text-salmon-pink mb-4">Library Unavailable</h2>
          <p className="text-silver">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <ProtectedRoute>
      <div className="luxury-gradient min-h-screen">
        <LuxuryNavbar user={user} />
        
        <main className="relative overflow-hidden">
          {!loading ? (
            <>
              <HeroSection 
                movies={featuredMovies}
                onPlayTrailer={playVideo}
              />

              <div className="space-y-16 pb-24 px-8">
                <ContentRows
                  title="Continue Watching"
                  movies={recentUploads.filter(m => m.progress > 0)}
                  onSelect={playVideo}
                  variant="slider"
                />

                <ContentRows
                  title="Recently Added"
                  movies={recentUploads}
                  onSelect={playVideo}
                  variant="slider"
                />

                <MediaGallery
                  title="Your Collection"
                  movies={featuredMovies}
                  onSelect={playVideo}
                  gridVariant="cinematic"
                />
              </div>
            </>
          ) : (
            <div className="h-screen flex items-center justify-center">
              <div className="animate-pulse text-gold-accent/60">
                <div className="flex space-x-4">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="w-64 h-96 bg-deep-navy/80 rounded-xl" />
                  ))}
                </div>
              </div>
            </div>
          )}

          {isPlaying && currentVideo && (
            <FullScreenVideoPlayer
              video={currentVideo}
              onClose={pauseVideo}
              className="salmon-glow"
            />
          )}
        </main>
      </div>
    </ProtectedRoute>
  );
}
