import { getS3Url } from './s3-helpers';

export interface Movie {
  id: string;
  title: string;
  poster: string;
  duration: string;
}

export const mockMovies = {
  featured: {
    id: 'oppenheimer',
    title: 'Oppenheimer',
    description: 'The story of American scientist J. Robert Oppenheimer...',
    poster: getS3Url('posters/oppenheimer-lg.jpg'),
    trailer: getS3Url('trailers/oppenheimer-trailer.m3u8'),
    duration: '181 min'
  },
  trending: [
    {
      id: 'barbie',
      title: 'Barbie',
      poster: getS3Url('posters/barbie.jpg'),
      duration: '114 min'
    },
    {
      id: 'dune',
      title: 'Dune: Part Two',
      poster: getS3Url('posters/dune2.jpg'), 
      duration: '166 min'
    }
  ]
};
