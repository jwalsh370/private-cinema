'use client';
import { useState, useEffect } from 'react';
import { Movie } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Play, Info } from 'lucide-react';

interface HeroSectionProps {
  movies: Movie[];
  onPlayTrailer: (movie: Movie) => void;
}

export default function HeroSection({ movies, onPlayTrailer }: HeroSectionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const safeMovies = movies || [];
  const hasMovies = safeMovies.length > 0;

  useEffect(() => {
    if (!hasMovies) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % safeMovies.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [hasMovies, safeMovies.length]);

  if (!hasMovies) return null;

  const currentMovie = safeMovies[currentIndex];

  return (
    <div className="relative h-screen overflow-hidden">
      {/* Background with parallax effect */}
      <div 
        className="absolute inset-0 bg-cover bg-center bg-fixed scale-105 transition-transform duration-1000"
        style={{ 
          backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.8)), url(${currentMovie.posterPath})`,
        }}
      />
      
      {/* Content */}
      <div className="relative z-10 h-full flex items-center justify-center px-6">
        <Card className="bg-background/90 backdrop-blur-md border-0 shadow-2xl max-w-4xl mx-auto">
          <CardContent className="p-12 text-center">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                {currentMovie.title}
              </h1>
              
              <div className="flex flex-wrap justify-center gap-2">
                {currentMovie.genres?.slice(0, 3).map((genre, index) => (
                  <span 
                    key={index}
                    className="px-4 py-2 bg-primary/20 text-primary rounded-full text-sm font-medium"
                  >
                    {genre.name}
                  </span>
                ))}
              </div>

              <p className="text-muted-foreground text-lg leading-relaxed max-w-2xl mx-auto">
                {currentMovie.metadata?.overview || 'Experience cinematic excellence'}
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  size="lg"
                  className="gap-2 bg-primary hover:bg-primary/90"
                  onClick={() => onPlayTrailer(currentMovie)}
                >
                  <Play className="w-5 h-5" />
                  Play Trailer
                </Button>
                
                <Button 
                  size="lg" 
                  variant="outline"
                  className="gap-2 border-primary text-primary hover:bg-primary/10"
                >
                  <Info className="w-5 h-5" />
                  More Info
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Navigation */}
      <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 flex gap-2">
        {safeMovies.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentIndex(index)}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex 
                ? 'bg-primary' 
                : 'bg-muted hover:bg-primary/50'
            }`}
          />
        ))}
      </div>
    </div>
  );
}
