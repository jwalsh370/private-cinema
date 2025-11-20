'use client';

export const HeroSection = () => (
  <section className="relative h-[80vh] bg-gradient-to-t from-black via-transparent to-black">
    <div className="absolute inset-0 z-0">
      <img
        src="/hero-banner.jpg"
        alt="Featured Movie"
        className="h-full w-full object-cover opacity-70"
      />
    </div>
    
    <div className="relative z-10 h-full flex items-center container">
      <div className="max-w-2xl space-y-4">
        <h1 className="text-6xl font-bold text-white">Oppenheimer</h1>
        <p className="text-lg text-gray-300 line-clamp-3">
          The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb.
        </p>
        <div className="flex gap-4">
          <button className="px-8 py-3 bg-white text-black rounded-full font-semibold hover:bg-gray-100 transition">
            ▶ Play
          </button>
          <button className="px-8 py-3 bg-gray-500/50 text-white rounded-full font-semibold hover:bg-gray-500 transition">
            ℹ More Info
          </button>
        </div>
      </div>
    </div>
  </section>
);
