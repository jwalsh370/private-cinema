// app/page.tsx
import { HeroSection } from '@/components/hero-section';
import { MovieCard } from '@/components/movie-card';
import { CategoryRow } from '@/components/category-row';
import { mockMovies } from '@/lib/movies';
import { Movie } from '@/lib/movies';

export default function Home() {
  return (
    <main className="pt-16">
      <HeroSection movie={mockMovies.featured as Movie} />
      <section className="container space-y-8 py-12">
        <CategoryRow title="Trending Now">
          {mockMovies.trending.map((movie: Movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </CategoryRow>
      </section>
    </main>
  );
}

