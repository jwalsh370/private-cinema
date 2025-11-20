import Link from 'next/link';
import { Button } from './ui/button';
import { Play, Info } from 'lucide-react';

export function MovieCard({ movie }: { movie: Movie }) {
  <div className="group relative aspect-[2/3] overflow-hidden rounded-xl shadow-xl transition-all duration-300 hover:z-10 hover:scale-105">
    <img
      src={movie.poster}
      alt={movie.title}
      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
    />
    
    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-6 flex flex-col justify-end">
      <div className="space-y-2">
        <h3 className="text-2xl font-bold text-white">{movie.title}</h3>
        <p className="text-sm text-gray-300 font-mono">{movie.duration}</p>
      </div>
      
      <div className="mt-6 flex gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button 
          size="lg" 
          className="gap-2 bg-white/10 backdrop-blur-sm hover:bg-white/20 text-white"
        >
          <Play className="w-5 h-5" /> Play
        </Button>
        <Link href={`/movies/${movie.id}`}>
          <Button 
            variant="ghost"
            size="lg" 
            className="gap-2 bg-black/30 backdrop-blur-sm hover:bg-black/50 text-white"
          >
            <Info className="w-5 h-5" /> Details
          </Button>
        </Link>
      </div>
    </div>
  </div>
}
