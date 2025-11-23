// src/components/MovieCard.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Star, Clock, Calendar } from 'lucide-react';
import { getMovieMetadata, MovieMetadata } from '@/services/tmdb';

interface MovieCardProps {
  video: any;
  onClick: () => void;
}

export function MovieCard({ video, onClick }: MovieCardProps) {
  const [metadata, setMetadata] = useState<MovieMetadata | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchMetadata = async () => {
      const fileName = video.Key.split('/').pop() || '';
      const title = extractMovieTitle(fileName);
      
      const movieData = await getMovieMetadata(title);
      setMetadata(movieData);
      setIsLoading(false);
    };

    fetchMetadata();
  }, [video.Key]);

  const fileName = video.Key.split('/').pop() || '';
  const displayTitle = metadata?.title || extractMovieTitle(fileName);

  return (
    <motion.div
      whileHover={{ y: -8, scale: 1.02 }}
      transition={{ duration: 0.3 }}
      className="bg-gray-800 rounded-xl overflow-hidden group cursor-pointer relative"
      onClick={onClick}
    >
      {/* Poster Image with Gradient Overlay */}
      <div className="aspect-video relative overflow-hidden">
        {metadata?.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/w500${metadata.poster_path}`}
            alt={displayTitle}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900 flex items-center justify-center">
            <Play size={48} className="text-white/40" />
          </div>
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Play Button */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
          <div className="bg-white/20 backdrop-blur-sm rounded-full p-4">
            <Play size={24} className="text-white" />
          </div>
        </div>

        {/* Rating Badge */}
        {metadata?.vote_average && (
          <div className="absolute top-3 right-3 bg-black/80 rounded-full px-3 py-1 flex items-center space-x-1">
            <Star size={14} className="text-yellow-400 fill-current" />
            <span className="text-white text-sm font-semibold">
              {metadata.vote_average.toFixed(1)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        <h3 className="text-white font-semibold mb-2 line-clamp-2">
          {displayTitle}
        </h3>
        
        {/* Metadata */}
        <div className="space-y-2">
          {metadata?.release_date && (
            <div className="flex items-center text-gray-400 text-sm">
              <Calendar size={14} className="mr-2" />
              {new Date(metadata.release_date).getFullYear()}
            </div>
          )}
          
          {metadata?.runtime && (
            <div className="flex items-center text-gray-400 text-sm">
              <Clock size={14} className="mr-2" />
              {Math.floor(metadata.runtime / 60)}h {metadata.runtime % 60}m
            </div>
          )}
          
          {metadata?.genres && (
            <div className="flex flex-wrap gap-1">
              {metadata.genres.slice(0, 2).map(genre => (
                <span
                  key={genre.id}
                  className="bg-blue-600/20 text-blue-300 px-2 py-1 rounded text-xs"
                >
                  {genre.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
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
