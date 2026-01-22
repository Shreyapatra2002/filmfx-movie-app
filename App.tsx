
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import MovieCard from './components/MovieCard';
import MovieModal from './components/MovieModal';
import { PageType, Movie } from './types';
import { fetchMoviesData } from './services/tmdbService';

const App: React.FC = () => {
  const [currentPage, setCurrentPage] = useState<PageType>(PageType.HOME);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [watchlist, setWatchlist] = useState<Movie[]>(() => JSON.parse(localStorage.getItem('vault') || '[]'));
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('');
  const [minRating, setMinRating] = useState(0);
  const [selected, setSelected] = useState<{ id: number; type: 'movie' | 'tv' } | null>(null);
  const [loading, setLoading] = useState(false);
  
  const pageRef = useRef(1);
  const hasMoreRef = useRef(true);
  const loadingRef = useRef(false);

  // Persistence for Watchlist
  useEffect(() => localStorage.setItem('vault', JSON.stringify(watchlist)), [watchlist]);

  const loadMovies = useCallback(async (isInitial = false) => {
    if (loadingRef.current || (!hasMoreRef.current && !isInitial)) return;
    
    setLoading(true);
    loadingRef.current = true;
    
    if (isInitial) {
      pageRef.current = 1;
      hasMoreRef.current = true;
    }

    const currentReqPage = pageRef.current;

    if (currentPage === PageType.WATCHLIST) {
      let filtered = [...watchlist];
      if (selectedGenre) filtered = filtered.filter(m => m.genre_ids.includes(parseInt(selectedGenre)));
      if (minRating > 0) filtered = filtered.filter(m => m.vote_average >= minRating);
      if (searchQuery) filtered = filtered.filter(m => (m.title || m.name)?.toLowerCase().includes(searchQuery.toLowerCase()));
      setMovies(filtered);
      hasMoreRef.current = false;
      setLoading(false);
      loadingRef.current = false;
    } else {
      try {
        const data = await fetchMoviesData({ 
          page: currentReqPage, 
          query: searchQuery, 
          pageType: currentPage,
          genre: selectedGenre,
          minRating: minRating
        });
        
        let newMovies = data.results || [];
        
        // TMDB Search API doesn't filter by rating/genre. 
        // If we are searching, we must filter locally.
        if (searchQuery) {
          if (minRating > 0) {
            newMovies = newMovies.filter((m: Movie) => m.vote_average >= minRating);
          }
          if (selectedGenre) {
            newMovies = newMovies.filter((m: Movie) => m.genre_ids.includes(parseInt(selectedGenre)));
          }
        }
        
        setMovies(prev => isInitial ? newMovies : [...prev, ...newMovies]);
        hasMoreRef.current = data.page < data.total_pages;
        pageRef.current = currentReqPage + 1;
      } catch (err) {
        console.error("Error loading movies:", err);
      } finally {
        setLoading(false);
        loadingRef.current = false;
      }
    }
  }, [currentPage, searchQuery, watchlist, selectedGenre, minRating]);

  // Reset and reload when filters change
  useEffect(() => {
    setMovies([]);
    loadMovies(true);
  }, [currentPage, searchQuery, selectedGenre, minRating, loadMovies]);

  // Infinite Scroll Observer
  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 1000) {
        if (!loadingRef.current && hasMoreRef.current && currentPage !== PageType.WATCHLIST) {
          loadMovies();
        }
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [loadMovies, currentPage]);

  const toggleVault = (e: any, movie: Movie) => {
    if (e) e.stopPropagation();
    const exists = watchlist.some(m => m.id === movie.id);
    setWatchlist(exists ? watchlist.filter(m => m.id !== movie.id) : [...watchlist, movie]);
  };

  return (
    <div className="bg-[#0a0000] min-h-screen text-white selection:bg-red-600/30">
      <Navbar 
        currentPage={currentPage} 
        setCurrentPage={setCurrentPage} 
        searchQuery={searchQuery} 
        setSearchQuery={setSearchQuery} 
        genreId={selectedGenre}
        setGenreId={setSelectedGenre}
        minRating={minRating}
        setMinRating={setMinRating}
      />

      <AnimatePresence mode="wait">
        {currentPage === PageType.HOME && !searchQuery && !selectedGenre && minRating === 0 && (
          <Hero 
            onSelect={m => setSelected({ id: m.id, type: 'movie' })} 
            onToggleWatchlist={toggleVault} 
            isWatchlisted={id => watchlist.some(m => m.id === id)} 
          />
        )}
      </AnimatePresence>

      <main className={`max-w-[2200px] mx-auto px-6 lg:px-24 pb-32 transition-all duration-700 ${currentPage === PageType.HOME && !searchQuery && !selectedGenre && minRating === 0 ? 'pt-12' : 'pt-40'}`}>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 gap-6">
          <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-[2px] bg-red-600 rounded-full"></span>
              <p className="text-[10px] font-black uppercase tracking-[0.4em] text-red-500">
                {minRating > 0 ? `${minRating}+ Intelligence Rating` : 'General Archives'}
              </p>
            </div>
            <h2 className="text-4xl sm:text-7xl font-black uppercase italic tracking-tighter leading-none">
              {searchQuery ? 'Results' : currentPage === PageType.WATCHLIST ? 'My Vault' : currentPage}
              {minRating > 0 && <span className="text-red-500">. {minRating.toFixed(0)}+</span>}
              <span className="text-red-600 ml-2">.</span>
            </h2>
          </motion.div>
          
          {(selectedGenre || minRating > 0) && (
            <button 
              onClick={() => { setSelectedGenre(''); setMinRating(0); setSearchQuery(''); }}
              className="px-6 py-3 rounded-xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-red-600/20 transition-all text-red-500 flex items-center gap-2 group"
            >
              <i className="fas fa-filter-circle-xmark group-hover:rotate-90 transition-transform"></i>
              Purge Threshold Filters
            </button>
          )}
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6">
          <AnimatePresence mode='popLayout'>
            {movies.map((m, i) => (
              <MovieCard 
                key={`${m.id}-${i}`} 
                movie={m} 
                index={i % 20} 
                onSelect={movie => setSelected({ id: movie.id, type: (movie as any).first_air_date ? 'tv' : 'movie' })} 
                onToggleWatchlist={toggleVault} 
                isWatchlisted={watchlist.some(v => v.id === m.id)} 
              />
            ))}
          </AnimatePresence>
        </div>

        {loading && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-6 mt-12">
            {[...Array(8)].map((_, i) => (
              <div key={i} className="aspect-[2/3] rounded-2xl skeleton opacity-30"></div>
            ))}
          </div>
        )}

        {movies.length === 0 && !loading && (
          <div className="py-40 text-center flex flex-col items-center justify-center space-y-6 opacity-50">
            <div className="w-24 h-24 rounded-full border border-white/10 flex items-center justify-center">
              <i className="fas fa-radar text-4xl text-red-600 animate-pulse"></i>
            </div>
            <div className="space-y-2">
              <p className="text-xl font-bold uppercase tracking-widest">Target Not Found</p>
              <p className="text-sm">No assets meet the {minRating}+ rating requirement in this sector.</p>
            </div>
            <button 
              onClick={() => setMinRating(0)}
              className="px-8 py-3 rounded-xl bg-red-600 text-[10px] font-black uppercase tracking-widest shadow-maroon"
            >
              Reset Threshold
            </button>
          </div>
        )}
      </main>

      <AnimatePresence>
        {selected && (
          <MovieModal 
            movieId={selected.id} 
            mediaType={selected.type} 
            onClose={() => setSelected(null)} 
            onToggleWatchlist={m => toggleVault(null, m)} 
            isWatchlisted={watchlist.some(v => v.id === selected.id)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
