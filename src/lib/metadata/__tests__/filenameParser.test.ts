import { extractMovieTitle, parseFilename } from '@/lib/metadata/filenameParser';

describe('Filename Parser', () => {
  describe('extractMovieTitle', () => {
    const testCases = [
      { input: "The.Shawshank.Redemption.1994.1080p.BluRay.mp4", expected: "The Shawshank Redemption" },
      { input: "Inception (2010) [1080p].mp4", expected: "Inception" },
      { input: "pulp-fiction-1994.mp4", expected: "Pulp Fiction" },
      { input: "2015 - Mad Max Fury Road.mp4", expected: "Mad Max Fury Road" },
      { input: "The.Dark.Knight.2008.720p.BluRay.x264.mp4", expected: "The Dark Knight" },
      { input: "Avatar (2009) Extended Cut.mp4", expected: "Avatar" },
      { input: "forrest-gump-1994.mp4", expected: "Forrest Gump" },
      { input: "The Godfather Part II (1974).mp4", expected: "The Godfather Part II" },
      { input: "2017 - Blade Runner 2049.mp4", expected: "Blade Runner 2049" },
      { input: "The.Matrix.1999.4K.Remastered.mp4", expected: "The Matrix" },
      { input: "movie.name.2020.1080p.mp4", expected: "Movie Name" },
      { input: "Movie Name (2020) [1080p].mp4", expected: "Movie Name" },
      { input: "movie-name-2020.mp4", expected: "Movie Name" },
      { input: "2020 - Movie Name.mp4", expected: "Movie Name" }
    ];

    testCases.forEach(({ input, expected }) => {
      test(`should parse "${input}" correctly`, () => {
        expect(extractMovieTitle(input)).toBe(expected);
      });
    });

    test('should return "Unknown Title" for empty input', () => {
      expect(extractMovieTitle('')).toBe('Unknown Title');
    });

    test('should handle undefined input', () => {
      expect(extractMovieTitle(undefined as any)).toBe('Unknown Title');
    });
  });

  describe('parseFilename', () => {
    test('should extract all components from filename', () => {
      const result = parseFilename('Inception.2010.1080p.BluRay.x264.mp4');
      
      expect(result.title).toBe('Inception');
      expect(result.year).toBe(2010);
      expect(result.quality).toBe('1080p');
      expect(result.source).toBe('BluRay');
      expect(result.codec).toBe('x264');
      expect(result.extension).toBe('mp4');
    });

    test('should handle files without year', () => {
      const result = parseFilename('Some.Movie.1080p.mp4');
      expect(result.title).toBe('Some Movie');
      expect(result.year).toBeUndefined();
    });
  });
});
