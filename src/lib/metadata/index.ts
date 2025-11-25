// Main metadata module exports
export * from './filenameParser';
export * from './tmdbService';
export * from './metadataManager';

// Re-export types for convenience
export type { MovieMetadata } from './tmdbService';
export type { ParsedFilename } from './filenameParser';

// Main metadata service function
import { getEnhancedMovieMetadata } from './tmdbService';
import { extractMovieTitle, parseFilename } from './filenameParser';

/**
 * Main function to get complete metadata for a movie file
 * Combines filename parsing with TMDB lookup
 */
export async function getMovieMetadata(filename: string, filePath?: string) {
  try {
    // Parse filename to extract basic info
    const parsed = parseFilename(filename);
    
    // Get enhanced metadata from TMDB
    const tmdbMetadata = await getEnhancedMovieMetadata(parsed.title);
    
    return {
      ...parsed,
      tmdbMetadata,
      filePath,
      extractedAt: new Date().toISOString(),
      confidence: calculateConfidence(parsed, tmdbMetadata)
    };
  } catch (error) {
    console.error('Error getting movie metadata:', error);
    return {
      ...parseFilename(filename),
      tmdbMetadata: null,
      filePath,
      extractedAt: new Date().toISOString(),
      confidence: 0
    };
  }
}

/**
 * Calculate confidence score for metadata match
 */
function calculateConfidence(parsed: any, tmdbMetadata: any | null): number {
  if (!tmdbMetadata) return 0;
  
  let confidence = 0;
  
  // Year match (high confidence)
  if (parsed.year && tmdbMetadata.release_date) {
    const tmdbYear = new Date(tmdbMetadata.release_date).getFullYear();
    if (parsed.year === tmdbYear) {
      confidence += 40;
    } else if (Math.abs(parsed.year - tmdbYear) <= 1) {
      confidence += 20;
    }
  }
  
  // Title similarity (medium confidence)
  const parsedTitle = parsed.title.toLowerCase();
  const tmdbTitle = tmdbMetadata.title.toLowerCase();
  
  if (parsedTitle === tmdbTitle) {
    confidence += 30;
  } else if (tmdbTitle.includes(parsedTitle) || parsedTitle.includes(tmdbTitle)) {
    confidence += 20;
  } else {
    // Use string similarity algorithm (simple version)
    const similarity = calculateStringSimilarity(parsedTitle, tmdbTitle);
    confidence += Math.floor(similarity * 25);
  }
  
  // Additional factors
  if (tmdbMetadata.popularity > 50) confidence += 10;
  if (tmdbMetadata.vote_count > 1000) confidence += 10;
  
  return Math.min(confidence, 100);
}

/**
 * Simple string similarity calculation (Jaccard index)
 */
function calculateStringSimilarity(str1: string, str2: string): number {
  const set1 = new Set(str1.split(''));
  const set2 = new Set(str2.split(''));
  
  const intersection = new Set([...set1].filter(x => set2.has(x)));
  const union = new Set([...set1, ...set2]);
  
  return intersection.size / union.size;
}

/**
 * Batch process multiple files
 */
export async function batchProcessFiles(files: Array<{ filename: string; path?: string }>) {
  const results = [];
  
  for (const file of files) {
    try {
      const metadata = await getMovieMetadata(file.filename, file.path);
      results.push({
        file: file.filename,
        metadata,
        success: true
      });
    } catch (error) {
      results.push({
        file: file.filename,
        error: error.message,
        success: false
      });
    }
  }
  
  return results;
}

/**
 * Export commonly used utilities
 */
export const MetadataUtils = {
  // Filename parsing
  extractTitle: extractMovieTitle,
  parseFilename,
  
  // TMDB operations
  searchTMDB: getEnhancedMovieMetadata,
  
  // Validation
  isValidMovieFile(filename: string): boolean {
    return /\.(mp4|mkv|avi|mov|wmv|flv|webm)$/i.test(filename);
  },
  
  // Formatting
  formatDuration(minutes: number): string {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  },
  
  formatFileSize(bytes: number): string {
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    if (bytes === 0) return '0 Bytes';
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i];
  }
};

// Default export
export default {
  getMovieMetadata,
  batchProcessFiles,
  ...MetadataUtils
};
