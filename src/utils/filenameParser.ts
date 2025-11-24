// src/utils/filenameParser.ts
export interface ParsedFilename {
  rawName: string;
  cleanTitle: string;
  year: string | null;
  quality: string | null;
  source: string | null;
  codec: string | null;
  group: string | null;
}

export function parseFilename(filename: string): ParsedFilename {
  // Remove extension
  const nameWithoutExt = filename.replace(/\.[^/.]+$/, '');
  
  // Common patterns for movie filenames
  const patterns = [
    // Pattern: Movie.Name.2020.1080p.BluRay.x264-GROUP
    /^(.*?)\.(\d{4})\.(1080p|720p|2160p|4K)\.?(BluRay|WEB-DL|DVD|HDTV)\.?([a-zA-Z0-9]+)?\-?([a-zA-Z0-9]+)?$/i,
    
    // Pattern: Movie Name (2020) [1080p] [BluRay] [x264]
    /^(.*?)\s\((\d{4})\)\s\[(1080p|720p|2160p|4K)\]\s?\[([^\]]+)\]\s?\[([^\]]+)\]?/i,
    
    // Pattern: Movie.Name.2020.1080p.BluRay
    /^(.*?)\.(\d{4})\.(1080p|720p|2160p|4K)\.?([a-zA-Z]+)?/i,
    
    // Simple pattern: Movie.Name.2020
    /^(.*?)\.(\d{4})/i,
    
    // Fallback: Just try to extract year
    /^(.*?)(\d{4})/i
  ];

  for (const pattern of patterns) {
    const match = nameWithoutExt.match(pattern);
    if (match) {
      return {
        rawName: filename,
        cleanTitle: match[1].replace(/[._]/g, ' ').trim(),
        year: match[2] || null,
        quality: match[3] || null,
        source: match[4] || null,
        codec: match[5] || null,
        group: match[6] || null
      };
    }
  }

  // Fallback: return the filename as title
  return {
    rawName: filename,
    cleanTitle: nameWithoutExt.replace(/[._]/g, ' ').trim(),
    year: null,
    quality: null,
    source: null,
    codec: null,
    group: null
  };
}

// Example usage:
// parseFilename("The.Matrix.1999.1080p.BluRay.x264-YTS.mp4")
// Returns: { cleanTitle: "The Matrix", year: "1999", quality: "1080p", source: "BluRay", codec: "x264", group: "YTS" }
