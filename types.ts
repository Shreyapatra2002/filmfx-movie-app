export interface Movie {
  id: number;
  title?: string;
  name?: string;
  poster_path: string | null;
  backdrop_path: string | null;
  vote_average: number;
  overview: string;
  release_date?: string;
  first_air_date?: string;
  genre_ids: number[];
  genres?: Genre[];
}

export interface Genre { id: number; name: string; }
export interface Video { key: string; site: string; type: string; }
export enum PageType { HOME = 'home', MOVIES = 'movies', SERIES = 'series', TRENDING = 'trending', WATCHLIST = 'watchlist' }
export type Theme = 'dark' | 'light';