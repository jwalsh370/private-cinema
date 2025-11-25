// src/types/index.ts
export interface Movie {
  id: string;
  s3Key: string;
  originalName: string;
  posterPath?: string;
  progress?: number;
  duration?: number;
  category: string;
  metadataStatus: 'PENDING' | 'MATCHED' | 'ERROR';
  parsedMetadata?: {
    cleanTitle: string;
    year?: number;
    quality?: string;
    source?: string;
  };
  tmdbMetadata?: {
    id?: number;
    title?: string;
    overview?: string;
    release_date?: string;
    vote_average?: number;
    runtime?: number;
    genres?: Array<{ id: number; name: string }>;
    poster_path?: string;
  };
}

// Add other shared types used in your project
export type View = 'upload' | 'manage' | 'settings';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
