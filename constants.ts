export const API_KEY = '04c35731a5ee918f014970082a0088b1';
export const BASE_URL = 'https://api.themoviedb.org/3';
export const IMG_URL = 'https://image.tmdb.org/t/p/w500';
export const BACKDROP_URL = 'https://image.tmdb.org/t/p/original';

export const GENRES = [
  { id: 28, name: "Action" }, { id: 12, name: "Adventure" },
  { id: 16, name: "Animation" }, { id: 35, name: "Comedy" },
  { id: 80, name: "Crime" }, { id: 18, name: "Drama" },
  { id: 14, name: "Fantasy" }, { id: 27, name: "Horror" },
  { id: 10749, name: "Romance" }, { id: 878, name: "Sci-Fi" },
  { id: 53, name: "Thriller" }
];

export const SORT_OPTIONS = [
  { value: "popularity.desc", label: "Most Popular" },
  { value: "vote_average.desc", label: "Highest Rated" },
  { value: "release_date.desc", label: "Latest Release" }
];