import { getMovieMetadata } from '@/lib/metadata';

// Mock the TMDB service
jest.mock('@/lib/metadata/tmdbService', () => ({
  getEnhancedMovieMetadata: jest.fn().mockResolvedValue({
    id: 27205,
    title: 'Inception',
    release_date: '2010-07-16',
    vote_average: 8.4,
    overview: 'A thief who steals corporate secrets...'
  })
}));

describe('Metadata Integration', () => {
  test('should combine filename parsing with TMDB data', async () => {
    const result = await getMovieMetadata('Inception.2010.1080p.BluRay.mp4');
    
    expect(result.title).toBe('Inception');
    expect(result.year).toBe(2010);
    expect(result.tmdbMetadata).toBeDefined();
    expect(result.tmdbMetadata.title).toBe('Inception');
    expect(result.confidence).toBeGreaterThan(0);
  });
});
