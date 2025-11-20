'use client';

export function HeroSection({ movie }: { movie: Movie }) {
  <section className="relative h-screen w-full">
    <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black z-10" />
    
    <img
      src={movie.poster}
      alt={movie.title}
      className="absolute inset-0 w-full h-full object-cover object-center"
    />
    
    <div className="relative z-20 h-full flex items-end pb-32 container">
      <div className="max-w-3xl space-y-6">
        <h1 className="text-6xl font-black text-white drop-shadow-2xl">
          {movie.title}
        </h1>
        <p className="text-xl text-gray-300 line-clamp-3 font-medium">
          {movie.description}
        </p>
        <div className="flex gap-6">
          <button className="px-8 py-4 bg-white/90 text-black rounded-full font-bold hover:bg-white transition-all flex items-center gap-3">
            <Play className="w-6 h-6" /> Play Now
          </button>
          <button className="px-8 py-4 bg-gray-800/50 text-white rounded-full font-bold backdrop-blur-sm hover:bg-gray-800 transition-all">
            More Info
          </button>
        </div>
      </div>
    </div>
  </section>
}
