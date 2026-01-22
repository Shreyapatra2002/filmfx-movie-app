import { API_KEY, BASE_URL } from '../constants';
import { Movie, Video, PageType } from '../types';

interface FetchParams { 
  page: number; 
  query?: string; 
  sort?: string; 
  genre?: string; 
  minRating?: number;
  pageType: PageType; 
}

export const fetchMoviesData = async ({ 
  page, 
  query, 
  sort = 'popularity.desc', 
  genre, 
  minRating = 0, 
  pageType 
}: FetchParams) => {
  let url = '';
  
  // Adjusted vote_count.gte to 10 for a better balance of quantity and quality.
  const ratingFilter = minRating > 0 ? `&vote_average.gte=${minRating}&vote_count.gte=10` : '';
  const genreFilter = genre ? `&with_genres=${genre}` : '';
  const filterParams = `${ratingFilter}${genreFilter}`;

  if (query) {
    // TMDB Search API doesn't support genre or rating filters directly.
    // Local filtering is implemented in App.tsx to handle this limitation.
    url = `${BASE_URL}/search/movie?api_key=${API_KEY}&query=${encodeURIComponent(query)}&page=${page}`;
  } else if (pageType === PageType.TRENDING) {
    if (genre || minRating > 0) {
      url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sort}&page=${page}${filterParams}`;
    } else {
      url = `${BASE_URL}/trending/all/week?api_key=${API_KEY}&page=${page}`;
    }
  } else if (pageType === PageType.SERIES) {
    url = `${BASE_URL}/discover/tv?api_key=${API_KEY}&sort_by=${sort}&page=${page}${filterParams}`;
  } else if (pageType === PageType.MOVIES) {
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sort}&page=${page}${filterParams}`;
  } else {
    // HOME page discovery
    url = `${BASE_URL}/discover/movie?api_key=${API_KEY}&sort_by=${sort}&page=${page}${filterParams}`;
  }
  
  const response = await fetch(url);
  if (!response.ok) throw new Error('Failed to fetch data');
  return await response.json();
};

export const fetchMovieDetails = async (id: number, type: 'movie' | 'tv' = 'movie') => {
  const [detailsRes, videosRes] = await Promise.all([
    fetch(`${BASE_URL}/${type}/${id}?api_key=${API_KEY}`),
    fetch(`${BASE_URL}/${type}/${id}/videos?api_key=${API_KEY}`)
  ]);
  if (!detailsRes.ok || !videosRes.ok) throw new Error('Details fetch failed');
  const movie: Movie = await detailsRes.json();
  const videosData = await videosRes.json();
  const trailer: Video | undefined = videosData.results.find((v: Video) => v.type === 'Trailer' && v.site === 'YouTube') || videosData.results[0];
  return { movie, trailer };
};