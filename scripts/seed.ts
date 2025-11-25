// This is for populating your database with real movie data
const sampleMovies = [
  {
    title: "The Shawshank Redemption",
    filename: "the.shawshank.redemption.1994.1080p.bluray.mp4",
    year: 1994,
    duration: 142,
    status: "processed" as const,
    metadata: {
      tmdbId: 278,
      rating: 9.3,
      genres: ["Drama"],
      director: "Frank Darabont",
      description: "Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency."
    }
  },
  {
    title: "The Godfather",
    filename: "the.godfather.1972.1080p.bluray.mp4", 
    year: 1972,
    duration: 175,
    status: "processed" as const,
    metadata: {
      tmdbId: 238,
      rating: 9.2,
      genres: ["Crime", "Drama"],
      director: "Francis Ford Coppola",
      description: "The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son."
    }
  },
  {
    title: "The Dark Knight",
    filename: "the.dark.knight.2008.1080p.bluray.mp4",
    year: 2008, 
    duration: 152,
    status: "processed" as const,
    metadata: {
      tmdbId: 155,
      rating: 9.0,
      genres: ["Action", "Crime", "Drama"],
      director: "Christopher Nolan",
      description: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    }
  },
  // Add 10-20 more diverse movies across genres
  {
    title: "Parasite",
    filename: "parasite.2019.1080p.bluray.mp4",
    year: 2019,
    duration: 132,
    status: "processed" as const,
    metadata: {
      tmdbId: 496243,
      rating: 8.6,
      genres: ["Comedy", "Drama", "Thriller"],
      director: "Bong Joon Ho",
      description: "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan."
    }
  },
  {
    title: "Spirited Away",
    filename: "spirited.away.2001.1080p.bluray.mp4",
    year: 2001,
    duration: 125,
    status: "processed" as const,
    metadata: {
      tmdbId: 129,
      rating: 8.6,
      genres: ["Animation", "Adventure", "Family"],
      director: "Hayao Miyazaki",
      description: "During her family's move to the suburbs, a sullen 10-year-old girl wanders into a world ruled by gods, witches, and spirits, and where humans are changed into beasts."
    }
  }
];

export async function seedDatabase() {
  // Your seeding logic here
  for (const movieData of sampleMovies) {
    await prisma.movie.create({
      data: movieData
    });
  }
}
