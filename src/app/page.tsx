import { HeroSection } from '@/components/hero-section';
import { MovieCard } from '@/components/movie-card';
import { CategoryRow } from '@/components/category-row';
import { mockMovies } from '@/lib/movies';

export default function Home() {
  return (
    <main className="pt-16">
      <HeroSection movie={mockMovies.featured} />
      
      <section className="container space-y-8 py-12">
        <CategoryRow title="Trending Now">
          {mockMovies.trending.map(movie => (
            <MovieCard 
              key={movie.id} 
              movie={movie}
              playUrl={getS3Url(`videos/${movie.id}/master.m3u8`)}
            />
          ))}
        </CategoryRow>
      </section>
    </main>
  );
}
