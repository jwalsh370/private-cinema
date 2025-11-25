// components/MovieCard.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Plus, Info, Star, Clock, Calendar, Eye } from 'lucide-react';
import { getEnhancedMovieMetadata } from '@/services/tmdb';
import { useVideoPlayer } from '@/hooks/useVideoPlayer';

interface MovieCardProps {
  video: any;
  onClick: () => void;
  onInfoClick?: () => void;
  showDetails?: boolean;
}

export default function MovieCard({ video, onClick, onInfoClick, showDetails = true }: MovieCardProps) {
  const [metadata, setMetadata] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const { playVideo } = useVideoPlayer();

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        const fileName = video.Key.split('/').pop() || '';
        const title = fileName.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');
        
        const movieData = await getEnhancedMovieMetadata(title);
        setMetadata(movieData);
      } catch (error) {
        console.error('Error fetching metadata:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [video.Key]);

  const displayTitle = metadata?.title || video.Key.split('/').pop()?.replace(/\.[^/.]+$/, '').replace(/[_-]/g, ' ');

  if (isLoading) {
    return (
      <div className="aspect-video bg-gradient-to-br from-deep-navy to-charcoal rounded-xl border border-gold-accent/20 animate-pulse">
        <div className="w-full h-full flex items-center justify-center">
          <Eye className="text-gold-accent/30" size={32} />
        </div>
      </div>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      transition={{ duration: 0.4 }}
      className="relative group cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Poster Image */}
      <div className="aspect-video relative overflow-hidden rounded-xl bg-gradient-to-br from-deep-navy to-charcoal border border-gold-accent/20">
        {metadata?.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${metadata.poster_path}`}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Eye size={48} className="text-gold-accent/40" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
        
        {/* Rating Badge */}
        {metadata?.vote_average && (
          <div className="absolute top-3 right-3 bg-black/80 rounded-full px-3 py-1 flex items-center space-x-1 border border-gold-accent/30">
            <Star size={14} className="text-gold-accent" />
            <span className="text-soft-white text-sm font-medium">
              {metadata.vote_average.toFixed(1)}
            </span>
          </div>
        )}

        {/* Hover Overlay */}
        {isHovered && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 bg-black/80 flex items-center justify-center space-x-3 p-4"
          >
            <button
             onClick={(e) => {
              e.stopPropagation();
              playVideo(video);  // Hook integration
              onClick();         // Existing prop
            }}
            className="bg-salmon-pink text-white rounded-full p-3 hover:bg-salmon-pink/90 transition-colors transform hover:scale-110"
            >
              <Play size={20} fill="currentColor" />
            </button>
            
            <button
              onClick={onInfoClick}
              className="border-2 border-gold-accent text-gold-accent rounded-full p-3 hover:bg-gold-accent/10 transition-colors transform hover:scale-110"
            >
              <Info size={20} />
            </button>
            
            <button className="border-2 border-silver text-silver rounded-full p-3 hover:bg-silver/10 transition-colors transform hover:scale-110">
              <Plus size={20} />
            </button>
          </motion.div>
        )}
      </div>

      {/* Content */}
      {showDetails && (
        <div className="mt-3 space-y-2">
          <h3 className="text-soft-white font-light text-sm line-clamp-2 leading-tight">
            {displayTitle}
          </h3>
          
          {/* Metadata Row */}
          <div className="flex items-center space-x-3 text-xs text-silver">
            {metadata?.release_date && (
              <div className="flex items-center space-x-1">
                <Calendar size={12} className="text-salmon-pink" />
                <span>{new Date(metadata.release_date).getFullYear()}</span>
              </div>
            )}
            
            {metadata?.runtime && (
              <div className="flex items-center space-x-1">
                <Clock size={12} className="text-salmon-pink" />
                <span>{Math.floor(metadata.runtime / 60)}h {metadata.runtime % 60}m</span>
              </div>
            )}
            
            {metadata?.genres && metadata.genres.length > 0 && (
              <span className="bg-deep-navy border border-gold-accent/30 text-gold-accent px-2 py-1 rounded text-xs">
                {metadata.genres[0].name}
              </span>
            )}
          </div>

          {/* Progress Bar (for continue watching) */}
          {video.progress && (
            <div className="w-full bg-deep-navy rounded-full h-1">
              <div 
                className="bg-salmon-pink h-1 rounded-full"
                style={{ width: `${(video.progress / video.duration) * 100}%` }}
              />
            </div>
          )}
        </div>
      )}
    </motion.div>
  );
}

// Helper function
function extractMovieTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[_-]/g, ' ')
    .replace(/\d{4}/, '')
    .trim();
}
