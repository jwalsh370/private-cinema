'use client';
import { useState, useEffect } from 'react';
import { Movie, MovieMetadata } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Search, Film, Star, Calendar, Clock, Loader2 } from 'lucide-react';
import { getEnhancedMovieMetadata } from '@/services/tmdb';

interface MovieMetadataModalProps {
  movie: Movie | null;
  isOpen: boolean;
  onClose: () => void;
  onMetadataAssign: (movieId: string, metadata: MovieMetadata) => void;
}

export default function MovieMetadataModal({ 
  movie, 
  isOpen, 
  onClose, 
  onMetadataAssign 
}: MovieMetadataModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MovieMetadata[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedMetadata, setSelectedMetadata] = useState<MovieMetadata | null>(null);

  useEffect(() => {
    if (movie && isOpen) {
      setSearchQuery(movie.title);
      setSelectedMetadata(null);
      setSearchResults([]);
    }
  }, [movie, isOpen]);

  const searchTMDB = async (query: string) => {
    if (!query.trim()) return;
    
    setIsSearching(true);
    try {
      const metadata = await getEnhancedMovieMetadata(query);
      if (metadata) {
        setSearchResults([metadata]);
      } else {
        setSearchResults([]);
      }
    } catch (error) {
      console.error('TMDB search error:', error);
      setSearchResults([]);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    searchTMDB(searchQuery);
  };

  const handleAssignMetadata = () => {
    if (movie && selectedMetadata) {
      onMetadataAssign(movie.id, selectedMetadata);
      onClose();
    }
  };

  if (!movie) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Movie Metadata</DialogTitle>
          <DialogDescription>
            Search TMDB to assign proper metadata for "{movie.title}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Search Form */}
          <form onSubmit={handleSearch} className="flex gap-2">
            <Input
              placeholder="Search for movie on TMDB..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="flex-1"
            />
            <Button type="submit" disabled={isSearching}>
              {isSearching ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Search
            </Button>
          </form>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="space-y-4">
              <h3 className="font-semibold">Search Results</h3>
              {searchResults.map((result) => (
                <Card 
                  key={result.id} 
                  className={`cursor-pointer transition-all hover:border-primary ${
                    selectedMetadata?.id === result.id ? 'border-primary bg-primary/10' : ''
                  }`}
                  onClick={() => setSelectedMetadata(result)}
                >
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={result.poster_path ? `https://image.tmdb.org/t/p/w200${result.poster_path}` : 'https://fastly.picsum.photos/id/14/200/300.jpg?hmac=FMdb1SH_oeEo4ibDe66-ORzb8p0VYJUS3xWfN3h2qDU'}
                        alt={result.title}
                        className="w-16 h-24 object-cover rounded"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold">{result.title} ({new Date(result.release_date).getFullYear()})</h4>
                        <p className="text-sm text-muted-foreground line-clamp-2">{result.overview}</p>
                        <div className="flex items-center gap-4 mt-2 text-sm">
                          <span className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" />
                            {result.vote_average.toFixed(1)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {result.runtime} min
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {result.release_date}
                          </span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {searchResults.length === 0 && searchQuery && !isSearching && (
            <div className="text-center text-muted-foreground">
              <Film className="w-12 h-12 mx-auto mb-2 opacity-50" />
              <p>No results found for "{searchQuery}"</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleAssignMetadata} 
              disabled={!selectedMetadata}
            >
              Assign Metadata
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
