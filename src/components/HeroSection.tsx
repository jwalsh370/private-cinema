// src/components/HeroSection.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Play, Info, Volume2, VolumeX } from 'lucide-react';

interface HeroSectionProps {
  featuredMovies: any[];
  onPlay: (movie: any) => void;
  onInfo: (movie: any) => void;
}

export function HeroSection({ featuredMovies, onPlay, onInfo }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % featuredMovies.length);
    }, 8000);

    return () => clearInterval(interval);
  }, [featuredMovies.length]);

  const currentMovie = featuredMovies[currentIndex];

  return (
    <div className="relative h-screen">
      {/* Background */}
      <div className="absolute inset-0">
        {currentMovie.poster_path ? (
          <img
            src={`https://image.tmdb.org/t/p/original${currentMovie.poster_path}`}
            alt={currentMovie.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-blue-900 to-purple-900" />
        )}
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-4">
              {currentMovie.title}
            </h1>
            
            <div className="flex items-center justify-center space-x-4 mb-6 text-lg">
              {currentMovie.vote_average && (
                <span className="text-green-400 font-semibold">
                  {(currentMovie.vote_average * 10).toFixed(0)}% Match
                </span>
              )}
              {currentMovie.release_date && (
                <span>{new Date(currentMovie.release_date).getFullYear()}</span>
              )}
              {currentMovie.runtime && (
                <span>{Math.floor(currentMovie.runtime / 60)}h {currentMovie.runtime % 60}m</span>
              )}
            </div>

            {currentMovie.overview && (
              <p className="text-lg md:text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
                {currentMovie.overview}
              </p>
            )}

            <div className="flex justify-center space-x-4">
              <button 
                onClick={() => onPlay(currentMovie)}
                className="bg-white text-black px-8 py-3 rounded-lg font-semibold hover:bg-gray-200 transition-colors flex items-center space-x-2"
              >
                <Play size={20} fill="currentColor" />
                <span>Play</span>
              </button>
              
              <button 
                onClick={() => onInfo(currentMovie)}
                className="bg-gray-600/70 text-white px-6 py-3 rounded-lg hover:bg-gray-500/70 transition-colors flex items-center space-x-2"
              >
                <Info size={20} />
                <span>More Info</span>
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-gray-600/70 text-white p-3 rounded-lg hover:bg-gray-500/70 transition-colors"
              >
                {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? 'bg-white' : 'bg-white/30'
            }`}
          />
        ))}
           </div>
    </div>
  );
}

