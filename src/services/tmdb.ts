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
}

export async function getMovieMetadata(title: string): Promise<MovieMetadata | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(title)}&language=en-US`
    );

    if (!response.ok) throw new Error('TMDB API error');

    const data = await response.json();
    if (data.results && data.results.length > 0) {
      return data.results[0];
    }

    return null;
  } catch (error) {
    console.error('Error fetching movie metadata:', error);
    return null;
  }
}

export async function getMovieDetails(movieId: number): Promise<MovieMetadata | null> {
  try {
    const response = await fetch(
      `${TMDB_BASE_URL}/movie/${movieId}?api_key=${TMDB_API_KEY}&language=en-US`
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
  // Remove extensions and special characters
  return filename
    .replace(/\.[^/.]+$/, '') // Remove extension
    .replace(/[_-]/g, ' ') // Replace underscores and dashes with spaces
    .replace(/\d{4}/, '') // Remove years
    .trim();
}
