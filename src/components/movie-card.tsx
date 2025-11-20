'use client';

import { Button } from './ui/button';
import { Play, Info } from 'lucide-react';

type MovieCardProps = {
    movie: {
      id: string;
      title: string;
      poster: string; // S3 URL
      duration: string;
    };
    playUrl?: string; // S3 video URL
  };
  
  export const MovieCard = ({ movie, playUrl }: MovieCardProps) => (
    <div className="group relative aspect-video overflow-hidden rounded-lg">
      <img
        src={movie.poster}
        alt={movie.title}
        className="h-full w-full object-cover transition-transform group-hover:scale-105"
      />
      
      <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent p-4 flex flex-col justify-end">
        <h3 className="text-lg font-semibold text-white">{movie.title}</h3>
        <p className="text-sm text-gray-300">{movie.duration}</p>
        
        <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button size="sm" className="gap-2">
            <Play size={16} /> Play
          </Button>
          <Link href={`/movies/${movie.id}`}>
            <Button variant="secondary" size="sm" className="gap-2">
              <Info size={16} /> Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
  