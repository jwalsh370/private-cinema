import { getEnhancedMovieMetadata } from '@/lib/metadata/tmdbService';

// Mock fetch
const mockFetch = global.fetch as jest.Mock;

describe('TMDB Service', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  test('should fetch movie metadata successfully', async () => {
    const mockResponse = {
      results: [
        {
          id: 27205,
          title: 'Inception',
          release_date: '2010-07-16',
          vote_average: 8.4,
          overview: 'A thief who steals corporate secrets...'
        }
      ]
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockResponse,
    } as Response);

    const result = await getEnhancedMovieMetadata('Inception');
    
    expect(result).toEqual(mockResponse.results[0]);
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining('api.themoviedb.org/3/search/movie')
    );
  });

  test('should return null when no results found', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ results: [] }),
    } as Response);

    const result = await getEnhancedMovieMetadata('Nonexistent Movie');
    expect(result).toBeNull();
  });

  test('should handle API errors', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    } as Response);

    await expect(getEnhancedMovieMetadata('Inception')).rejects.toThrow('TMDB API error');
  });
});
