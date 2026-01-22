import React, { useEffect, useState, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie, Video } from '../types';
import { fetchMovieDetails } from '../services/tmdbService';
import { BASE_URL, API_KEY, IMG_URL } from '../constants';

interface Props { movieId: number; mediaType: 'movie' | 'tv'; onClose: () => void; onToggleWatchlist: (movie: Movie) => void; isWatchlisted: boolean; }

const MovieModal: React.FC<Props> = ({ movieId, mediaType, onClose, onToggleWatchlist, isWatchlisted }) => {
  const [data, setData] = useState<{ movie: Movie; trailer: Video | undefined } | null>(null);
  const [loading, setLoading] = useState(true);
  const [similar, setSimilar] = useState<Movie[]>([]);
  const [similarPage, setSimilarPage] = useState(1);
  const [loadingSimilar, setLoadingSimilar] = useState(false);
  const [hasMoreSimilar, setHasMoreSimilar] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  const fetchSimilar = useCallback(async (page: number) => {
    if (loadingSimilar || !hasMoreSimilar) return;
    setLoadingSimilar(true);
    try {
      const res = await fetch(`${BASE_URL}/${mediaType}/${movieId}/recommendations?api_key=${API_KEY}&page=${page}`);
      const result = await res.json();
      setSimilar(prev => [...prev, ...result.results]);
      setHasMoreSimilar(result.page < result.total_pages);
      setSimilarPage(prev => prev + 1);
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingSimilar(false);
    }
  }, [movieId, mediaType, loadingSimilar, hasMoreSimilar]);

  useEffect(() => {
    document.body.style.overflow = 'hidden';
    setData(null);
    setLoading(true);
    setSimilar([]);
    setSimilarPage(1);
    setHasMoreSimilar(true);
    
    fetchMovieDetails(movieId, mediaType).then(setData).finally(() => setLoading(false));
    fetchSimilar(1);
    
    return () => { document.body.style.overflow = 'unset'; };
  }, [movieId, mediaType]);

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollTop + clientHeight >= scrollHeight - 800) {
      fetchSimilar(similarPage);
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-2 sm:p-4 lg:p-8">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="absolute inset-0 bg-black/98 backdrop-blur-2xl" onClick={onClose} />
      
      <motion.div 
        initial={{ y: 50, opacity: 0, scale: 0.95 }} 
        animate={{ y: 0, opacity: 1, scale: 1 }} 
        exit={{ y: 50, opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-7xl h-[95vh] sm:h-[90vh] rounded-[2rem] sm:rounded-[3rem] glass-premium overflow-hidden border border-white/10 shadow-2xl flex flex-col"
      >
        <button onClick={onClose} className="absolute top-4 right-4 sm:top-8 sm:right-8 z-[210] w-10 h-10 sm:w-14 sm:h-14 rounded-2xl bg-black/60 hover:bg-red-600 transition-all flex items-center justify-center backdrop-blur-md border border-white/10 group">
          <i className="fas fa-times text-white group-hover:scale-110 transition-transform"></i>
        </button>

        {loading ? (
          <div className="flex-1 flex flex-col items-center justify-center gap-6">
            <div className="w-16 h-16 border-[5px] border-white/5 border-t-red-600 rounded-full animate-spin"></div>
            <p className="text-[10px] font-black uppercase tracking-[0.5em] text-red-500 animate-pulse">Syncing Network</p>
          </div>
        ) : data && (
          <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto custom-modal-scrollbar">
            <div className="relative aspect-video sm:h-[65vh] bg-black">
              {data.trailer ? (
                <iframe 
                  src={`https://www.youtube.com/embed/${data.trailer.key}?autoplay=1&modestbranding=1&rel=0`} 
                  className="w-full h-full" 
                  allow="autoplay; encrypted-media" 
                  allowFullScreen
                ></iframe>
              ) : (
                <img src={`https://image.tmdb.org/t/p/original${data.movie.backdrop_path}`} className="w-full h-full object-cover opacity-60" />
              )}
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0a0000] to-transparent"></div>
            </div>

            <div className="px-6 py-10 sm:px-16 sm:py-20 lg:px-24">
              <div className="max-w-5xl space-y-12">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <span className="w-12 h-[3px] bg-red-600 rounded-full"></span>
                    <p className="text-[11px] font-black uppercase tracking-[0.4em] text-red-500">Asset Record</p>
                  </div>
                  <h2 className="text-4xl sm:text-7xl lg:text-9xl font-black uppercase italic tracking-tighter leading-[0.85]">
                    {data.movie.title || data.movie.name}
                  </h2>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-8 border-y border-white/5">
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Intelligence Rating</p>
                    <div className="flex items-center gap-2 text-2xl font-black">
                      <i className="fas fa-star text-red-600"></i> {data.movie.vote_average.toFixed(1)}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/30">Archive Date</p>
                    <span className="text-2xl font-black">{data.movie.release_date || data.movie.first_air_date || 'TBD'}</span>
                  </div>
                </div>

                <p className="description-text text-white/70 text-lg sm:text-2xl leading-relaxed font-medium">
                  {data.movie.overview || 'Mission synopsis classified.'}
                </p>

                <div className="flex gap-4">
                  <button 
                    onClick={() => onToggleWatchlist(data.movie)} 
                    className={`px-12 py-6 rounded-3xl font-black uppercase tracking-widest text-[12px] transition-all flex items-center gap-4 ${
                      isWatchlisted ? 'bg-white text-black' : 'bg-red-600 text-white shadow-maroon'
                    }`}
                  >
                    <i className={`fas ${isWatchlisted ? 'fa-check' : 'fa-plus'}`}></i>
                    {isWatchlisted ? 'Secured in Vault' : 'Secure Vault Access'}
                  </button>
                </div>

                <div className="pt-24 space-y-12">
                  <h4 className="text-[12px] font-black uppercase tracking-[0.5em] text-white">Recommended Ops</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                    {similar.map((m, idx) => (
                      <motion.div 
                        initial={{ opacity: 0 }} whileInView={{ opacity: 1 }}
                        key={`${m.id}-${idx}`} 
                        className="group relative aspect-[2/3] rounded-2xl overflow-hidden cursor-pointer border border-white/5"
                        onClick={() => {
                          scrollRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
                        }}
                      >
                        <img src={m.poster_path ? `${IMG_URL}${m.poster_path}` : 'https://via.placeholder.com/500x750'} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black p-4 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity">
                           <p className="text-[10px] font-black uppercase truncate text-white">{m.title || m.name}</p>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
      <style>{`
        .custom-modal-scrollbar::-webkit-scrollbar { width: 5px; }
        .custom-modal-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-modal-scrollbar::-webkit-scrollbar-thumb { background: rgba(255, 31, 31, 0.3); border-radius: 10px; }
      `}</style>
    </div>
  );
};
export default MovieModal;