// src/services/tmdb.ts
const TMDB_API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY;
const TMDB_BASE_URL = 'https://api.themoviedb.org/3';

export interface MovieMetadata {
  id: number;
  title: string;
  overview: string;
  release_date: string;
  vote_average: number;
  vote_count: number;
  genres: { id: number; name: string }[];
  runtime: number;
  poster_path: string;
  backdrop_path: string;
  imdb_id?: string;
  budget?: number;
  revenue?: number;
  production_companies?: Array<{
    id: number;
    name: string;
    logo_path?: string;
    origin_country: string;
  }>;
  production_countries?: Array<{
    iso_3166_1: string;
    name: string;
  }>;
  spoken_languages?: Array<{
    english_name: string;
    iso_639_1: string;
    name: string;
  }>;
  status: string;
  tagline?: string;
  credits?: {
    cast: Array<{
      id: number;
      name: string;
      character: string;
      profile_path?: string;
      order: number;
    }>;
    crew: Array<{
      id: number;
      name: string;
      job: string;
      department: string;
      profile_path?: string;
    }>;
  };
  videos?: {
    results: Array<{
      id: string;
      key: string;
      name: string;
      site: string;
      type: string;
      official: boolean;
    }>;
  };
}

export async function getEnhancedMovieMetadata(title: string): Promise<MovieMetadata | null> {
  try {
    // First search for the movie
    const searchResponse = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`
    );

    if (!searchResponse.ok) throw new Error('TMDB API error');

    const searchData = await searchResponse.json();
    
    if (searchData.results && searchData.results.length > 0) {
      const movieId = searchData.results[0].id;
      
      // Get detailed information including credits and videos
      const detailedResponse = await fetch(
        `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`
      );

      if (!detailedResponse.ok) throw new Error('TMDB API error');

      return await detailedResponse.json();
    }

    return null;
  } catch (error) {
    console.error('Error fetching enhanced movie metadata:', error);
    return null;
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieMetadata | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US&append_to_response=credits,videos`
    );

    if (!response.ok) throw new Error('TMDB API error');

    return await response.json();
  } catch (error) {
    console.error('Error fetching movie details:', error);
    return null;
  }
}

// Helper to extract movie title from filename
export function extractMovieTitle(filename: string): string {
  return filename
    .replace(/\.[^/.]+$/, '')
    .replace(/[._-]/g, ' ')
    .replace(/(\d{4})/, ' $1 ')
    .replace(/\s+/g, ' ')
    .trim();
}
