'use client';
import { Movie } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Play } from 'lucide-react';
import { useRef } from 'react';

interface ContentRowsProps {
  title: string;
  movies: Movie[];
  onSelect: (movie: Movie) => void;
  onEditMetadata?: (movie: Movie) => void;
  variant?: 'slider' | 'grid';
}

export default function ContentRows({ 
  title, 
  movies, 
  onSelect, 
  onEditMetadata,
  variant = 'slider' 
}: ContentRowsProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const safeMovies = movies || [];

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 400;
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  if (safeMovies.length === 0) return null;

  return (
    <section className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold text-foreground">{title}</h2>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('left')}
            className="rounded-full"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll('right')}
            className="rounded-full"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="relative">
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth py-4"
        >
          {safeMovies.map((movie, index) => {
            // Safe access to properties with defaults
            const progress = movie.progress || 0;
            const duration = movie.duration || 1; // Avoid division by zero
            const title = movie.title || 'Unknown Title';
            const year = movie.year || new Date().getFullYear();
            const rating = movie.rating || 0;
            const posterPath = movie.posterPath || '/placeholder-poster.jpg';
            const progressPercentage = duration > 0 ? (progress / duration) * 100 : 0;

            return (
              <Card
                key={movie.id || index}
                className="flex-shrink-0 w-72 group cursor-pointer border-0 bg-card/50 backdrop-blur-md transition-all hover:scale-105 hover:shadow-xl"
                onClick={() => onSelect(movie)}
              >
                <CardContent className="p-0 overflow-hidden rounded-lg">
                  {/* Image with overlay */}
                  <div className="relative aspect-[2/3] overflow-hidden">
                    <img
                      src={posterPath}
                      alt={title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    
                    {/* Edit button */}
                    {onEditMetadata && (
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 z-50 bg-background/90 backdrop-blur-md border-2 border-primary/50 hover:bg-primary hover:text-primary-foreground shadow-lg"
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditMetadata(movie);
                        }}
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                    )}
                    
                    {/* Play button overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <Button className="rounded-full w-16 h-16">
                        <Play className="w-8 h-8" />
                      </Button>
                    </div>

                    {/* Progress bar */}
                    {progress > 0 && (
                      <div className="absolute bottom-0 left-0 right-0 bg-background/80">
                        <div 
                          className="bg-primary h-1 transition-all"
                          style={{ width: `${progressPercentage}%` }}
                        />
                      </div>
                    )}
                  </div>

                  {/* Movie info */}
                  <div className="p-4 bg-gradient-to-t from-background to-background/80">
                    <h3 className="font-semibold text-foreground truncate mb-1 text-shadow-sm">
                      {title}
                    </h3>
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span className="bg-background/80 px-2 py-1 rounded text-xs">
                        {year}
                      </span>
                      <span className="flex items-center gap-1 bg-background/80 px-2 py-1 rounded">
                        ⭐ {rating.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
