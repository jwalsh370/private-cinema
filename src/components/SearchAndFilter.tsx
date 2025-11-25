// components/SearchAndFilter.tsx
'use client';
import { useState } from 'react';
import { Search, Filter, X, SlidersHorizontal } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface SearchAndFilterProps {
  onSearch: (query: string) => void;
  onFilter: (filters: any) => void;
  categories: string[];
}

export default function SearchAndFilter({ onSearch, onFilter, categories }: SearchAndFilterProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    category: '',
    minRating: 0,
    maxDuration: 240,
    sortBy: 'date',
  });

  const handleSearch = (query: string) => {
    setSearchQuery(query);
    onSearch(query);
  };

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    onFilter(newFilters);
  };

  const clearFilters = () => {
    const defaultFilters = {
      category: '',
      minRating: 0,
      maxDuration: 240,
      sortBy: 'date',
    };
    setFilters(defaultFilters);
    onFilter(defaultFilters);
  };

  return (
    <div className="bg-gray-900/50 backdrop-blur-md rounded-xl p-6 mb-8 border border-gray-700/30">
      <div className="flex flex-col md:flex-row gap-4 items-center">
        {/* Search Input */}
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            placeholder="Search movies and shows..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full bg-gray-800/50 border border-gray-600/30 text-white px-12 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all"
          />
          {searchQuery && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter Toggle */}
        <button
          onClick={() => setIsFilterOpen(!isFilterOpen)}
          className="flex items-center space-x-2 bg-gray-800/50 border border-gray-600/30 text-white px-4 py-3 rounded-xl hover:bg-gray-700/50 transition-all"
        >
          <Filter size={20} />
          <span>Filters</span>
        </button>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 pt-4 border-t border-gray-700/30"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Category
                </label>
                <select
                  value={filters.category}
                  onChange={(e) => handleFilterChange('category', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="">All Categories</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rating Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Min Rating: {filters.minRating}%
                </label>
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="10"
                  value={filters.minRating}
                  onChange={(e) => handleFilterChange('minRating', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Duration Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Duration: {filters.maxDuration} min
                </label>
                <input
                  type="range"
                  min="30"
                  max="240"
                  step="30"
                  value={filters.maxDuration}
                  onChange={(e) => handleFilterChange('maxDuration', parseInt(e.target.value))}
                  className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              {/* Sort By */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Sort By
                </label>
                <select
                  value={filters.sortBy}
                  onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                  className="w-full bg-gray-800/50 border border-gray-600/30 text-white px-3 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500/50"
                >
                  <option value="date">Date Added</option>
                  <option value="rating">Rating</option>
                  <option value="title">Title</option>
                  <option value="duration">Duration</option>
                </select>
              </div>
            </div>

            {/* Clear Filters */}
            <div className="flex justify-end mt-4 pt-4 border-t border-gray-700/30">
              <button
                onClick={clearFilters}
                className="flex items-center space-x-2 text-gray-400 hover:text-white transition-colors px-4 py-2 rounded-lg hover:bg-gray-700/50"
              >
                <X size={16} />
                <span>Clear All Filters</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}