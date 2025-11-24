// app/api/tmdb/search/route.ts
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get('query');
    const year = searchParams.get('year');

    if (!query) {
      return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
    }

    const TMDB_API_KEY = process.env.TMDB_API_KEY;
    if (!TMDB_API_KEY) {
      return NextResponse.json({ error: 'TMDB API key not configured' }, { status: 500 });
    }

    // Build the TMDB API URL
    const tmdbUrl = new URL('https://api.themoviedb.org/3/search/movie');
    tmdbUrl.searchParams.set('api_key', TMDB_API_KEY);
    tmdbUrl.searchParams.set('query', query);
    tmdbUrl.searchParams.set('language', 'en-US');
    tmdbUrl.searchParams.set('page', '1');
    
    if (year) {
      tmdbUrl.searchParams.set('year', year);
    }

    const response = await fetch(tmdbUrl.toString());
    
    if (!response.ok) {
      throw new Error(`TMDB API error: ${response.status}`);
    }

    const data = await response.json();
    
    // Filter out results without release dates or titles and limit to 10 results
    const filteredResults = data.results
      .filter((movie: any) => movie.title && movie.release_date)
      .slice(0, 10);

    return NextResponse.json(filteredResults);

  } catch (error) {
    console.error('TMDB search error:', error);
    return NextResponse.json(
      { error: 'Failed to search TMDB' },
      { status: 500 }
    );
  }
}
