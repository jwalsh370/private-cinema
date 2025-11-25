// src/types/index.ts
export interface Movie {
  id: string;
  title: string;
  s3Key: string;
  videoUrl: string;
  posterPath: string;
  progress: number;
  duration: number;
  metadataStatus: string;
  rating?: number;
  year?: number;
  genres?: Array<{ name: string }>;
  metadata?: any;
  // Add these if they exist in your data
  category?: string;
  Key?: string;
  Url?: string;
  tmdbMetadata?: any;
}


// Add other shared types used in your project
export type View = 'upload' | 'manage' | 'settings';

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user';
}
