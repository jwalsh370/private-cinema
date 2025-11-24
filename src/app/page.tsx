// app/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { LuxuryNavbar } from '@/components/LuxuryNavbar';
import { HeroSection } from '@/components/HeroSection';
import { FileUpload } from '@/components/FileUpload';
import { DetailedInfoModal } from '@/components/DetailedInfoModal';

export default function Home() {
  const [showUpload, setShowUpload] = useState(false);
  const [selectedMovie, setSelectedMovie] = useState<any>(null);
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false);

  // Mock data for demonstration - you'll replace this with actual data
  const featuredMovies = [
    {
      id: 1,
      title: "The Shawshank Redemption",
      overview: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.",
      poster_path: "/q6y0Go1tsGEsmtFryDOJo3dEmqu.jpg",
      vote_average: 8.7,
      release_date: "1994-09-23",
      runtime: 142
    }
  ];

  const handlePlay = (movie: any) => {
    console.log('Play movie:', movie);
    // Implement play functionality
  };

  const handleInfo = (movie: any) => {
    setSelectedMovie(movie);
    setIsInfoModalOpen(true);
  };

  const handleAddToCollection = () => {
    console.log('Add to collection:', selectedMovie);
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <LuxuryNavbar />
      
      {/* Hero Section */}
      {featuredMovies.length > 0 && (
        <div className="pt-20">
          <HeroSection 
            featuredMovies={featuredMovies}
            onPlay={handlePlay}
            onInfo={handleInfo}
          />
        </div>
      )}

      {/* Upload Section */}
      <div className="relative z-10 pb-20">
        <div className="flex justify-center mb-12 mt-8">
          <button
            onClick={() => setShowUpload(!showUpload)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-colors"
          >
            {showUpload ? 'Hide Upload' : 'Add to Collection'}
          </button>
        </div>

        {showUpload && (
          <div className="max-w-4xl mx-auto mb-12">
            <FileUpload />
          </div>
        )}
      </div>

      {/* Info Modal */}
      <DetailedInfoModal
        isOpen={isInfoModalOpen}
        onClose={() => setIsInfoModalOpen(false)}
        metadata={selectedMovie}
        onPlay={() => handlePlay(selectedMovie)}
        onAddToCollection={handleAddToCollection}
      />
    </main>
  );
}
