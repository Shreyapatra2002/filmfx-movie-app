import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Movie } from '../types';
import { BACKDROP_URL, BASE_URL, API_KEY } from '../constants';

interface HeroProps { onSelect: (movie: Movie) => void; onToggleWatchlist: (e: React.MouseEvent, movie: Movie) => void; isWatchlisted: (id: number) => boolean; }

const Hero: React.FC<HeroProps> = ({ onSelect, onToggleWatchlist, isWatchlisted }) => {
  const [trending, setTrending] = useState<Movie[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    fetch(`${BASE_URL}/trending/all/week?api_key=${API_KEY}`)
      .then(res => res.json()).then(data => setTrending(data.results.filter((m: any) => m.backdrop_path).slice(0, 5)))
      .catch(console.error);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => setCurrentIndex(prev => (prev + 1) % trending.length), 10000);
    return () => clearInterval(timer);
  }, [trending]);

  if (trending.length === 0) return null;
  const current = trending[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-[#0a0000]">
      <AnimatePresence mode="wait">
        <motion.div key={current.id} initial={{ opacity: 0, scale: 1.1 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }} transition={{ duration: 1.5 }} className="absolute inset-0">
          <img src={`${BACKDROP_URL}${current.backdrop_path}`} alt={current.title} className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0a0000] via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0a0000] via-transparent to-transparent" />
        </motion.div>
      </AnimatePresence>
      <div className="absolute inset-0 flex flex-col justify-center px-6 sm:px-12 lg:px-24 z-10 pt-20">
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} key={current.id} className="max-w-4xl space-y-6">
          <p className="text-[10px] font-black uppercase tracking-[0.6em] text-red-500">Trending Now</p>
          <h1 className="text-5xl sm:text-7xl lg:text-9xl font-black tracking-tighter uppercase italic leading-[0.8] drop-shadow-2xl">{current.title || current.name}</h1>
          <p className="text-white/60 text-lg sm:text-xl line-clamp-3 max-w-2xl">{current.overview}</p>
          <div className="flex flex-wrap gap-4 pt-4">
            <button onClick={() => onSelect(current)} className="px-10 py-5 bg-red-600 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] shadow-maroon">Watch Trailer</button>
            <button onClick={(e) => onToggleWatchlist(e, current)} className="px-10 py-5 bg-white/5 border border-white/10 text-white rounded-2xl font-black uppercase tracking-widest text-[11px] backdrop-blur-xl">Add to Vault</button>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
export default Hero;