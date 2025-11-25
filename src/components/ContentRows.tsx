// src/components/ContentRows.tsx (updated)
'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import  MovieCard  from './MovieCard';

interface ContentRowsProps {
  title: string;
  items: any[];
  type?: 'movie' | 'tv';
  onItemClick: (item: any) => void;
  onInfoClick?: (item: any) => void;
}

export default function ContentRows({ title, items, type = 'movie', onItemClick, onInfoClick }: ContentRowsProps) {
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolling, setIsScrolling] = useState(false);
  const rowRef = useRef<HTMLDivElement>(null);

  // Add safety check for undefined movies array
  const safeMovies = items || [];
  const hasMovies = safeMovies.length > 0;

  if (!hasMovies) {
    return null; // Or return a placeholder if you prefer
  }
  const scroll = (direction: 'left' | 'right') => {
    if (!rowRef.current) return;

    setIsScrolling(true);
    const scrollAmount = 500;
    const newPosition = direction === 'left' 
      ? Math.max(0, scrollPosition - scrollAmount)
      : scrollPosition + scrollAmount;

    rowRef.current.scrollTo({
      left: newPosition,
      behavior: 'smooth'
    });

    setScrollPosition(newPosition);
    setTimeout(() => setIsScrolling(false), 300);
  };

  const canScrollLeft = scrollPosition > 0;
  const canScrollRight = rowRef.current && 
    scrollPosition < rowRef.current.scrollWidth - rowRef.current.clientWidth;

  return (
    <div className="relative group">
      {/* Row Header */}
      <div className="flex items-center justify-between mb-6 px-4">
        <h2 className="text-xl md:text-2xl font-light text-soft-white font-playfair">
          {title}
        </h2>
        
        <div className="flex items-center space-x-4">
          <span className="text-silver text-sm font-light">
            {items.length} {type === 'movie' ? 'titles' : 'shows'}
          </span>
          
          {/* Navigation Arrows */}
          <div className="flex space-x-2">
            <button
              onClick={() => scroll('left')}
              disabled={!canScrollLeft || isScrolling}
              className={`p-2 rounded-full transition-all ${
                canScrollLeft 
                  ? 'text-silver hover:bg-gold-accent/20 hover:text-gold-accent' 
                  : 'text-charcoal cursor-not-allowed'
              }`}
            >
              <ChevronLeft size={22} />
            </button>
            
            <button
              onClick={() => scroll('right')}
              disabled={!canScrollRight || isScrolling}
              className={`p-2 rounded-full transition-all ${
                canScrollRight
                  ? 'text-silver hover:bg-gold-accent/20 hover:text-gold-accent'
                  : 'text-charcoal cursor-not-allowed'
              }`}
            >
              <ChevronRight size={22} />
            </button>
          </div>
        </div>
      </div>

      {/* Content Row */}
      <div className="relative">
        {/* Gradient Overlays */}
        <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-midnight-blue to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-midnight-blue to-transparent z-10 pointer-events-none" />

        {/* Scrollable Row */}
        <motion.div
          ref={rowRef}
          className="flex space-x-5 overflow-x-hidden px-4 scrollbar-hide"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <AnimatePresence>
            {items.map((item, index) => (
              <motion.div
                key={item.Key || item.id}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                className="flex-shrink-0 w-56 md:w-64"
              >
                <MovieCard
                  video={item}
                  onClick={() => onItemClick(item)}
                  onInfoClick={() => onInfoClick?.(item)}
                  showDetails={true}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* Loading Skeleton */}
      {items.length === 0 && (
        <div className="flex space-x-5 px-4">
          {[...Array(6)].map((_, index) => (
            <div
              key={index}
              className="flex-shrink-0 w-56 md:w-64 aspect-video bg-deep-navy rounded-xl border border-gold-accent/20 animate-pulse"
            />
          ))}
        </div>
      )}
    </div>
  );
}
