// src/app/api/videos/metadata/assign/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { updateVideoMetadata } from '@/lib/videoStorage';

async function fetchTMDBMovieDetails(tmdbId: number) {
  const TMDB_API_KEY = process.env.TMDB_API_KEY;
  if (!TMDB_API_KEY) {
    throw new Error('TMDB API key not configured');
  }

  const response = await fetch(
    `https://api.themoviedb.org/3/movie/${tmdbId}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
  );
  
  if (!response.ok) {
    throw new Error(`TMDB API error: ${response.status}`);
  }
  
  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const { videoId, tmdbId } = await request.json();
    
    if (!videoId || !tmdbId) {
      return NextResponse.json(
        { error: 'videoId and tmdbId are required' },
        { status: 400 }
      );
    }

    // Get detailed metadata from TMDB
    const tmdbData = await fetchTMDBMovieDetails(tmdbId);
    
    // Update video with TMDB metadata
    const updatedVideo = await updateVideoMetadata(videoId, tmdbData);

    return NextResponse.json({ 
      success: true, 
      message: 'Metadata assigned successfully',
      video: updatedVideo
    });

  } catch (error) {
    console.error('Error assigning metadata:', error);
    return NextResponse.json(
      { error: 'Failed to assign metadata' },
      { status: 500 }
    );
  }
}
