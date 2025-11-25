// src/app/api/videos/route.ts (enhanced)
import { NextResponse } from 'next/server';
import { listMediaObjects, getPresignedUrl } from '@/lib/s3-helpers';
import { getEnhancedMovieMetadata, extractMovieTitle } from '@/services/tmdb';

export async function GET() {
  try {
    console.log('Fetching videos from S3...');
    
    const media = await listMediaObjects();
    console.log('Raw S3 objects:', media);

    // Filter out non-video files
    const videoFiles = media.filter(item => {
      const key = item.Key.toLowerCase();
      return !key.includes('posters/') && 
             !key.includes('subtitles/') &&
             (key.endsWith('.mp4') || key.endsWith('.mov') || key.endsWith('.avi'));
    });

    console.log('Filtered video files:', videoFiles);

    // Group by category and generate presigned URLs with enhanced metadata
    const videosByCategory: Record<string, any[]> = {};
    
    for (const item of videoFiles) {
      const category = item.Category || 'other';
      if (!videosByCategory[category]) {
        videosByCategory[category] = [];
      }
      
      try {
        const presignedUrl = await getPresignedUrl(item.Key);
        
        // Extract movie title for TMDB lookup
        const fileName = item.Key.split('/').pop() || '';
        const movieTitle = fileName
          .replace(/\.[^/.]+$/, '')
          .replace(/[_-]/g, ' ')
          .replace(/\d{4}/, '')
          .trim();

        // Get enhanced metadata from TMDB
        let enhancedMetadata = null;
        try {
          enhancedMetadata = await getEnhancedMovieMetadata(movieTitle);
        } catch (error) {
          console.warn('TMDB metadata fetch failed:', error);
        }

        videosByCategory[category].push({
          ...item,
          Url: presignedUrl,
          metadata: enhancedMetadata,
          title: enhancedMetadata?.title || movieTitle,
          rating: enhancedMetadata?.vote_average || Math.random() * 5 + 5,
          duration: enhancedMetadata?.runtime || Math.floor(Math.random() * 60) + 60,
          year: enhancedMetadata?.release_date 
            ? new Date(enhancedMetadata.release_date).getFullYear()
            : new Date().getFullYear() - Math.floor(Math.random() * 10),
          genres: enhancedMetadata?.genres || [{ name: 'Unknown' }]
        });
      } catch (error) {
        console.error(`Error processing ${item.Key}:`, error);
        videosByCategory[category].push(item);
      }
    }

    console.log('Final organized videos with metadata:', videosByCategory);
    
    // Cache the response for 1 hour
    const response = NextResponse.json(videosByCategory);
    response.headers.set('Cache-Control', 's-maxage=3600, stale-while-revalidate');
    
    return response;

  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch videos' },
      { status: 500 }
    );
  }
}
