import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { Movie } from '../types';
import { IMG_URL, GENRES } from '../constants';

interface MovieCardProps { movie: Movie; onSelect: (movie: Movie) => void; onToggleWatchlist: (e: React.MouseEvent, movie: Movie) => void; isWatchlisted: boolean; index: number; }

const MovieCard: React.FC<MovieCardProps> = ({ movie, onSelect, index }) => {
  const tiltRef = useRef<HTMLDivElement>(null);

  const getGenreNames = () => {
    return movie.genre_ids
      .map(id => GENRES.find(g => g.id === id)?.name)
      .filter(Boolean)
      .slice(0, 2)
      .join(' • ');
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!tiltRef.current || window.innerWidth < 1024) return;
    const { left, top, width, height } = tiltRef.current.getBoundingClientRect();
    const rotateX = ((e.clientY - top) / height - 0.5) * -15;
    const rotateY = ((e.clientX - left) / width - 0.5) * 15;
    gsap.to(tiltRef.current, { rotateX, rotateY, duration: 0.4, ease: "power2.out" });
  };

  const resetTilt = () => {
    if (!tiltRef.current) return;
    gsap.to(tiltRef.current, { rotateX: 0, rotateY: 0, duration: 0.8, ease: "elastic.out(1, 0.5)" });
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }} 
      animate={{ opacity: 1, y: 0 }} 
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ delay: Math.min(index * 0.03, 0.4), duration: 0.5 }} 
      className="scene aspect-[2/3]"
    >
      <div 
        ref={tiltRef} 
        onMouseMove={handleMouseMove} 
        onMouseLeave={resetTilt} 
        onClick={() => onSelect(movie)} 
        className="relative h-full glass-premium rounded-xl sm:rounded-2xl overflow-hidden preserve-3d cursor-pointer border border-white/5 group shadow-xl"
      >
        <img 
          src={movie.poster_path ? `${IMG_URL}${movie.poster_path}` : 'https://via.placeholder.com/500x750?text=No+Poster'} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
          alt={movie.title} 
        />

        {/* Rating Badge for filter verification */}
        <div className="absolute top-3 left-3 z-10">
          <div className="bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-red-600/30 flex items-center gap-1.5 shadow-lg">
            <i className="fas fa-star text-red-500 text-[8px]"></i>
            <span className="text-[10px] font-black text-white">{movie.vote_average.toFixed(1)}</span>
          </div>
        </div>
        
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/80 to-transparent p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-all duration-500 transform group-hover:translate-y-0 translate-y-4">
          <div className="space-y-4">
            <div className="space-y-1">
              <p className="text-[8px] font-black uppercase tracking-[0.3em] text-red-500">Intelligence</p>
              <h3 className="text-[14px] sm:text-[16px] font-black uppercase tracking-tighter leading-[0.9] text-white line-clamp-2">
                {movie.title || movie.name}
              </h3>
            </div>
            <p className="text-[9px] font-black uppercase tracking-widest text-white/40 truncate">
              {getGenreNames() || 'Cinematic Asset'}
            </p>
            <p className="description-text text-[10px] text-white/50 leading-relaxed line-clamp-3 font-medium border-l border-red-600/30 pl-3">
              {movie.overview}
            </p>
          </div>
        </div>

        <div className="lg:hidden absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black to-transparent pointer-events-none">
           <h3 className="text-[11px] font-black uppercase tracking-widest leading-tight truncate text-white">{movie.title || movie.name}</h3>
           <p className="text-[8px] font-bold text-red-500 uppercase tracking-tighter">{getGenreNames()}</p>
        </div>
      </div>
    </motion.div>
  );
};
export default MovieCard;