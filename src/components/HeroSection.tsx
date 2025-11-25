'use client';
import { useState, useEffect } from 'react';
import { Movie } from '@/types';

interface HeroSectionProps {
  movies: Movie[];
  onPlayTrailer: (movie: Movie) => void;
}

export default function HeroSection({ movies, onPlayTrailer }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Add safety check for undefined movies array
  const featuredMovies = movies || [];
  const hasMovies = featuredMovies.length > 0;

  useEffect(() => {
    if (!hasMovies) return; // Don't run interval if no movies

    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => 
        (prevIndex + 1) % featuredMovies.length
      );
    }, 5000);

    return () => clearInterval(interval);
  }, [hasMovies, featuredMovies.length]); // Use hasMovies instead of movies.length

  if (!hasMovies) {
    return (
      <div className="relative h-screen bg-gradient-to-b from-deep-navy/80 to-deep-navy flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl text-silver mb-4">No Featured Movies</h1>
          <p className="text-silver/70">Add some movies to see them featured here</p>
        </div>
      </div>
    );
  }

  const currentMovie = featuredMovies[currentIndex];

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background image */}
      <div 
        className="absolute inset-0 bg-cover bg-center transition-opacity duration-1000"
        style={{ 
          backgroundImage: `url(${currentMovie.posterPath || '/placeholder-poster.jpg'})`,
          opacity: 0.3
        }}
      />
      
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-deep-navy/70 to-deep-navy" />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-8">
        <div className="text-center max-w-4xl">
          <h1 className="text-6xl font-bold text-silver mb-6">
            {currentMovie.title}
          </h1>
          
          <div className="flex justify-center space-x-4 mb-8">
            {currentMovie.genres?.slice(0, 3).map((genre, index) => (
              <span 
                key={index}
                className="px-4 py-2 bg-salmon-pink/20 text-salmon-pink rounded-full text-sm"
              >
                {genre.name}
              </span>
            ))}
          </div>

          <p className="text-silver/80 text-lg mb-8 max-w-2xl mx-auto">
            {currentMovie.metadata?.overview || 'No description available'}
          </p>

          <div className="flex justify-center space-x-6">
            <button 
              onClick={() => onPlayTrailer(currentMovie)}
              className="px-8 py-3 bg-salmon-pink text-deep-navy rounded-lg font-semibold hover:bg-salmon-pink/90 transition-colors"
            >
              Play Trailer
            </button>
            
            <button className="px-8 py-3 border-2 border-silver text-silver rounded-lg font-semibold hover:bg-silver/10 transition-colors">
              More Info
            </button>
          </div>
        </div>
      </div>

      {/* Navigation dots */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex space-x-2">
        {featuredMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-salmon-pink' 
                : 'bg-silver/50 hover:bg-silver/80'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
