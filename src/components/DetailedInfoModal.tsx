// src/components/DetailedInfoModal.tsx
'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, Plus, Clock, Calendar, Star, Users, Award } from 'lucide-react';
import { MovieMetadata } from '@/services/tmdb';

interface DetailedInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  metadata: MovieMetadata | null;
  onPlay: () => void;
  onAddToCollection: () => void;
}

export function DetailedInfoModal({ isOpen, onClose, metadata, onPlay, onAddToCollection }: DetailedInfoModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (metadata) {
      setIsLoading(false);
    }
  }, [metadata]);

  if (!isOpen) return null;

  const directors = metadata?.credits?.crew.filter(person => person.job === 'Director') || [];
  const mainCast = metadata?.credits?.cast.slice(0, 6) || [];
  const trailer = metadata?.videos?.results.find(video => 
    video.type === 'Trailer' && video.official && video.site === 'YouTube'
  );

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass-effect rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <div className="p-8 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-salmon-pink" />
              </div>
            ) : metadata ? (
              <div className="p-8">
                {/* Header with close button */}
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-3xl font-light text-soft-white font-playfair">
                    {metadata.title}
                  </h2>
                  <button
                    onClick={onClose}
                    className="text-silver hover:text-salmon-pink transition-colors p-2"
                  >
                    <X size={24} />
                  </button>
                </div>

                {/* Main content */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Poster and actions */}
                  <div className="lg:col-span-1">
                    <img
                      src={`https://image.tmdb.org/t/p/w500${metadata.poster_path}`}
                      alt={metadata.title}
                      className="w-full rounded-lg shadow-2xl mb-4"
                    />
                    
                    <div className="space-y-3">
                      <button
                        onClick={onPlay}
                        className="luxury-button w-full flex items-center justify-center space-x-2"
                      >
                        <Play size={20} />
                        <span>Play Movie</span>
                      </button>
                      
                      {trailer && (
                        <button className="secondary-button w-full flex items-center justify-center space-x-2">
                          <Play size={16} />
                          <span>Watch Trailer</span>
                        </button>
                      )}
                      <button
                        onClick={onAddToCollection}
                        className="secondary-button w-full flex items-center justify-center space-x-2"
                      >
                        <Plus size={16} />
                        <span>Add to Collection</span>
                      </button>
                    </div>

                    {/* Quick facts */}
                    <div className="mt-6 space-y-3 text-sm text-silver">
                      {metadata.release_date && (
                        <div className="flex items-center space-x-2">
                          <Calendar size={16} className="text-salmon-pink" />
                          <span>Released: {new Date(metadata.release_date).getFullYear()}</span>
                        </div>
                      )}
                      {metadata.runtime && (
                        <div className="flex items-center space-x-2">
                          <Clock size={16} className="text-salmon-pink" />
                          <span>Runtime: {Math.floor(metadata.runtime / 60)}h {metadata.runtime % 60}m</span>
                        </div>
                      )}
                      {metadata.vote_average && (
                        <div className="flex items-center space-x-2">
                          <Star size={16} className="text-gold-accent" />
                          <span>Rating: {metadata.vote_average.toFixed(1)}/10</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Details and metadata */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Tagline */}
                    {metadata.tagline && (
                      <p className="text-gold-accent italic text-lg font-light">
                        "{metadata.tagline}"
                      </p>
                    )}

                    {/* Overview */}
                    {metadata.overview && (
                      <div>
                        <h3 className="text-xl font-light text-soft-white mb-3">Synopsis</h3>
                        <p className="text-silver leading-relaxed">{metadata.overview}</p>
                      </div>
                    )}

                    {/* Genres */}
                    {metadata.genres && metadata.genres.length > 0 && (
                      <div>
                        <h3 className="text-xl font-light text-soft-white mb-3">Genres</h3>
                        <div className="flex flex-wrap gap-2">
                          {metadata.genres.map(genre => (
                            <span
                              key={genre.id}
                              className="bg-deep-navy border border-gold-accent/30 text-gold-accent px-3 py-1 rounded-full text-sm"
                            >
                              {genre.name}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Directors */}
                    {directors.length > 0 && (
                      <div>
                        <h3 className="text-xl font-light text-soft-white mb-3">Directed By</h3>
                        <div className="flex flex-wrap gap-3">
                          {directors.map(director => (
                            <div key={director.id} className="flex items-center space-x-2">
                              <Users size={16} className="text-salmon-pink" />
                              <span className="text-silver">{director.name}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Cast */}
                    {mainCast.length > 0 && (
                      <div>
                        <h3 className="text-xl font-light text-soft-white mb-3">Cast</h3>
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                          {mainCast.map(actor => (
                            <div key={actor.id} className="flex items-center space-x-3">
                              {actor.profile_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${actor.profile_path}`}
                                  alt={actor.name}
                                  className="w-12 h-12 rounded-full object-cover border border-gold-accent/30"
                                />
                              ) : (
                                <div className="w-12 h-12 rounded-full bg-deep-navy border border-gold-accent/30 flex items-center justify-center">
                                  <Users size={20} className="text-gold-accent" />
                                </div>
                              )}
                              <div>
                                <p className="text-soft-white text-sm font-medium">{actor.name}</p>
                                <p className="text-silver text-xs">{actor.character}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Production Details */}
                    {metadata.production_companies && metadata.production_companies.length > 0 && (
                      <div>
                        <h3 className="text-xl font-light text-soft-white mb-3">Production</h3>
                        <div className="flex flex-wrap gap-4">
                          {metadata.production_companies.slice(0, 3).map(company => (
                            <div key={company.id} className="flex items-center space-x-2">
                              {company.logo_path ? (
                                <img
                                  src={`https://image.tmdb.org/t/p/w92${company.logo_path}`}
                                  alt={company.name}
                                  className="h-8 object-contain"
                                />
                              ) : (
                                <span className="text-silver text-sm">{company.name}</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Additional Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gold-accent/20">
                      {metadata.budget && metadata.budget > 0 && (
                        <div>
                          <h4 className="text-lg font-light text-soft-white mb-2">Budget</h4>
                          <p className="text-silver">
                            ${metadata.budget.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {metadata.revenue && metadata.revenue > 0 && (
                        <div>
                          <h4 className="text-lg font-light text-soft-white mb-2">Revenue</h4>
                          <p className="text-silver">
                            ${metadata.revenue.toLocaleString()}
                          </p>
                        </div>
                      )}
                      
                      {metadata.status && (
                        <div>
                          <h4 className="text-lg font-light text-soft-white mb-2">Status</h4>
                          <p className="text-silver">{metadata.status}</p>
                        </div>
                      )}
                      
                      {metadata.spoken_languages && metadata.spoken_languages.length > 0 && (
                        <div>
                          <h4 className="text-lg font-light text-soft-white mb-2">Languages</h4>
                          <p className="text-silver">
                            {metadata.spoken_languages.map(lang => lang.english_name).join(', ')}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center">
                <Award size={48} className="text-gold-accent mx-auto mb-4" />
                <h3 className="text-xl text-soft-white mb-2">Information Unavailable</h3>
                <p className="text-silver">No detailed information found for this title.</p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
