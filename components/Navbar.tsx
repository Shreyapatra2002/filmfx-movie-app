
import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { PageType } from '../types';
import { GENRES } from '../constants';

interface NavbarProps {
  currentPage: PageType;
  setCurrentPage: (page: PageType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  genreId: string;
  setGenreId: (val: string) => void;
  minRating: number;
  setMinRating: (val: number) => void;
}

const Navbar: React.FC<NavbarProps> = ({ 
  currentPage, setCurrentPage, searchQuery, setSearchQuery, genreId, setGenreId, minRating, setMinRating
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Discover', type: PageType.HOME, icon: 'fa-clapperboard' },
    { label: 'Movies', type: PageType.MOVIES, icon: 'fa-film' },
    { label: 'Series', type: PageType.SERIES, icon: 'fa-tv' },
    { label: 'Vault', type: PageType.WATCHLIST, icon: 'fa-bookmark' },
  ];

  const activeFiltersCount = (genreId ? 1 : 0) + (minRating > 0 ? 1 : 0);

  const getRatingLabel = (val: number) => {
    if (val === 0) return "All Ratings";
    if (val < 5) return "Unclassified";
    if (val < 7) return "Standard Ops";
    if (val < 8.5) return "High Priority";
    return "Elite Asset";
  };

  return (
    <>
      <motion.nav 
        initial={{ y: -100 }} animate={{ y: 0 }}
        className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${scrolled ? 'py-2' : 'py-4 sm:py-6'} px-4 sm:px-12 pointer-events-none`}
      >
        <div className="max-w-[2400px] mx-auto space-y-3 pointer-events-auto">
          {/* Main Navigation Bar */}
          <div className={`glass-premium rounded-2xl sm:rounded-[3rem] px-4 sm:px-10 py-3 sm:py-4 flex items-center justify-between w-full border border-white/5 shadow-2xl transition-all duration-500 ${scrolled ? 'bg-[#0a0000]/95 border-red-900/30' : ''}`}>
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => { setCurrentPage(PageType.HOME); setIsMenuOpen(false); }}>
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-red-600 rounded-xl flex items-center justify-center shadow-maroon"><i className="fas fa-clapperboard text-white"></i></div>
              <span className="text-xl sm:text-2xl font-black tracking-tighter uppercase italic hidden xs:block">FILM<span className="text-red-500">FX</span></span>
            </div>

            {/* Desktop Nav Items */}
            <div className="hidden lg:flex gap-1 bg-black/40 p-1 rounded-full border border-white/5">
              {navItems.map(item => (
                <button 
                  key={item.type} 
                  onClick={() => setCurrentPage(item.type)} 
                  className={`px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all ${currentPage === item.type ? 'bg-red-600 text-white shadow-lg' : 'text-white/40 hover:text-white'}`}
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Search and Action Buttons */}
            <div className="flex items-center gap-3">
              <div className="relative group hidden md:block">
                <input 
                  type="text" 
                  placeholder="Search archives..." 
                  value={searchQuery} 
                  onChange={(e) => setSearchQuery(e.target.value)} 
                  className="bg-black/40 border border-white/10 rounded-xl px-6 py-2.5 text-[11px] font-bold outline-none focus:border-red-500/50 w-48 transition-all focus:w-64 text-white" 
                />
                <i className="fas fa-search absolute right-4 top-1/2 -translate-y-1/2 text-white/20 text-[10px]"></i>
              </div>
              
              <button 
                onClick={() => setShowFilters(!showFilters)} 
                className={`w-11 h-11 flex items-center justify-center rounded-xl border transition-all relative ${showFilters ? 'bg-red-600 border-red-500' : 'bg-white/5 border-white/10 hover:bg-white/15'}`}
              >
                <i className="fas fa-sliders-h text-[12px]"></i>
                {activeFiltersCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full border-2 border-[#0a0000] text-[8px] font-black flex items-center justify-center animate-pulse">
                    {activeFiltersCount}
                  </span>
                )}
              </button>

              <button 
                onClick={() => setIsMenuOpen(true)} 
                className="w-11 h-11 flex items-center justify-center rounded-xl bg-white/5 border border-white/10 lg:hidden hover:bg-white/10"
              >
                <i className="fas fa-bars"></i>
              </button>
            </div>
          </div>

          {/* Enhanced Filter Panel */}
          <AnimatePresence>
            {showFilters && (
              <motion.div 
                initial={{ opacity: 0, y: -10, scale: 0.98 }} 
                animate={{ opacity: 1, y: 0, scale: 1 }} 
                exit={{ opacity: 0, y: -10, scale: 0.98 }} 
                className="glass-premium rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl overflow-hidden relative"
              >
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-red-500 to-transparent opacity-50"></div>
                
                <div className="flex flex-col lg:flex-row gap-8">
                  <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-8">
                    {/* Genre Selection */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Archive Classification</label>
                        {genreId && <span className="text-[9px] font-bold text-red-500 uppercase tracking-widest">Selected</span>}
                      </div>
                      <div className="relative group">
                        <select 
                          value={genreId} 
                          onChange={(e) => setGenreId(e.target.value)} 
                          className="w-full bg-black/60 border border-white/10 rounded-2xl px-5 py-4 text-[11px] font-bold outline-none text-white appearance-none cursor-pointer focus:border-red-500/50 transition-all group-hover:border-white/20"
                        >
                          <option value="">Search All Sectors</option>
                          {GENRES.map(g => <option key={g.id} value={g.id.toString()} className="bg-[#0a0000]">{g.name}</option>)}
                        </select>
                        <i className="fas fa-chevron-down absolute right-5 top-1/2 -translate-y-1/2 text-white/20 text-[10px] pointer-events-none"></i>
                      </div>
                    </div>

                    {/* Precise Rating Search (1-10) */}
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <label className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 ml-1">Intelligence Rating Search</label>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-black text-red-500 uppercase tracking-tighter bg-red-500/10 px-2 py-0.5 rounded">
                            {getRatingLabel(minRating)}
                          </span>
                          <span className="text-sm font-black text-white">{minRating.toFixed(1)}<span className="text-white/30 ml-0.5">+</span></span>
                        </div>
                      </div>
                      <div className="relative flex flex-col gap-2">
                        <div className="relative flex items-center bg-black/40 border border-white/10 rounded-2xl px-6 py-5">
                          <input 
                            type="range" min="0" max="9.5" step="0.5" 
                            value={minRating} 
                            onChange={(e) => setMinRating(parseFloat(e.target.value))} 
                            className="flex-1 accent-red-600 h-1 cursor-pointer" 
                          />
                        </div>
                        <div className="flex justify-between px-2 opacity-30">
                          {[0, 2, 4, 6, 8, 10].map(v => (
                            <button 
                              key={v} 
                              onClick={() => setMinRating(v)}
                              className={`text-[9px] font-black transition-all hover:text-red-500 ${minRating === v ? 'text-red-500 opacity-100 scale-125' : ''}`}
                            >
                              {v}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 self-end lg:self-center pt-4 lg:pt-0">
                    <button 
                      onClick={() => { setGenreId(""); setMinRating(0); setSearchQuery(""); }} 
                      className="px-8 py-4 rounded-2xl bg-white/5 text-[10px] font-black uppercase tracking-widest text-white/40 hover:text-red-500 hover:bg-red-500/10 transition-all border border-white/5"
                    >
                      Clear All
                    </button>
                    <button 
                      onClick={() => setShowFilters(false)} 
                      className="px-12 py-4 rounded-2xl bg-red-600 text-[10px] font-black uppercase tracking-widest shadow-maroon hover:bg-red-500 transition-all text-white flex items-center gap-2"
                    >
                      <i className="fas fa-search text-[9px]"></i>
                      Scan Archives
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMenuOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setIsMenuOpen(false)} 
              className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200]" 
            />
            <motion.div 
              initial={{ x: '100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 right-0 w-[85%] max-w-sm h-full bg-[#0a0000] z-[300] p-8 border-l border-white/10 flex flex-col shadow-2xl"
            >
              <div className="flex justify-between items-center mb-12">
                <span className="text-2xl font-black uppercase italic tracking-tighter">FILM<span className="text-red-500">FX</span></span>
                <button onClick={() => setIsMenuOpen(false)} className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 hover:bg-red-600 transition-all">
                  <i className="fas fa-times"></i>
                </button>
              </div>

              <div className="flex flex-col gap-4">
                {navItems.map((item, i) => (
                  <motion.button 
                    key={item.type} 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 }}
                    onClick={() => { setCurrentPage(item.type); setIsMenuOpen(false); }} 
                    className={`p-6 rounded-2xl border flex items-center gap-6 transition-all ${currentPage === item.type ? 'bg-red-600 border-red-500 shadow-maroon' : 'bg-white/5 border-white/5 hover:bg-white/10'}`}
                  >
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${currentPage === item.type ? 'bg-white/20' : 'bg-white/5'}`}>
                       <i className={`fas ${item.icon} text-sm ${currentPage === item.type ? 'text-white' : 'text-white/30'}`}></i>
                    </div>
                    <span className="text-[12px] font-black uppercase tracking-widest">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              <div className="mt-auto p-6 bg-white/5 rounded-3xl border border-white/5 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-red-600/30 animate-pulse"></div>
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/20 mb-2">Network Protocol</p>
                <p className="text-xs font-bold text-red-500 uppercase">Encrypted Connection Active</p>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
