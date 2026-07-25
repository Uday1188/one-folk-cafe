'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu as MenuIcon, X as XIcon, Coffee, Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';

export function Navbar() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDark } = useDarkMode();

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const isLanding = pathname === '/';
  const isTransparent = isLanding && !scrolled && !mobileOpen;

  return (
    <>
      <motion.nav 
        initial={{ y: -20, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${!isTransparent
          ? 'bg-white/90 dark:bg-[#1a1512]/90 backdrop-blur-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] border-b border-border/60'
          : 'bg-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20 transition-all duration-300">
            {/* Animated Logo */}
            <Link href="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-primary via-[#7a553b] to-accent flex items-center justify-center shadow-lg shadow-accent/20 group-hover:scale-105 group-hover:shadow-accent/40 transition-all duration-300">
                <Coffee className="w-5 h-5 text-white group-hover:rotate-12 transition-transform duration-300" />
              </div>
              <div className="text-left">
                <span className="block text-xl leading-none font-bold tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className={`transition-colors duration-300 ${
                    isTransparent ? 'text-white group-hover:text-accent' : 'text-primary dark:text-white group-hover:text-accent group-hover:dark:text-accent'
                  }`}>One Folk</span>
                  <span className="text-accent dark:text-[#f0a552]"> Cafe</span>
                </span>
                <span className={`text-[10px] uppercase font-bold tracking-widest block mt-1 transition-colors duration-300 ${
                  isTransparent ? 'text-white/80 group-hover:text-white' : 'text-muted-foreground group-hover:text-foreground'
                }`}>
                  Nashik • 100% Pure Veg
                </span>
              </div>
            </Link>

            {/* Desktop Nav with LayoutId Active Indicator */}
            <div className="hidden md:flex items-center gap-8">
              {[
                { label: 'Home', page: '/' },
                { label: 'Menu & Showcase', page: '/menu' },
              ].map(({ label, page }) => {
                const isActive = pathname === page;
                return (
                  <Link 
                    key={label} 
                    href={page}
                    className={`relative py-2 text-sm transition-colors duration-300 tracking-wide ${
                      isTransparent 
                        ? 'text-white font-bold drop-shadow-[0_1px_2px_rgba(0,0,0,0.4)] hover:text-accent' 
                        : 'text-foreground/80 font-semibold hover:text-accent'
                    }`}
                  >
                    {label}
                    {isActive && (
                      <motion.div 
                        layoutId="navbar-active-underline"
                        className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-accent rounded-full shadow-[0_0_8px_rgba(198,134,66,0.6)]"
                        transition={{ type: "spring", stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* Right Controls */}
            <div className="flex items-center gap-2.5 sm:gap-3">
              <button 
                onClick={toggleDark} 
                className={`w-11 h-11 sm:w-10 sm:h-10 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95 group ${
                  isTransparent 
                    ? 'bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md shadow-md' 
                    : 'bg-secondary/70 hover:bg-secondary border border-border/60 shadow-sm'
                }`}
                title="Toggle theme"
              >
                {darkMode ? (
                  <Sun className="w-5 h-5 text-accent group-hover:rotate-45 transition-transform duration-300" />
                ) : (
                  <Moon className={`w-5 h-5 group-hover:-rotate-12 transition-transform duration-300 ${
                    isTransparent ? 'text-white' : 'text-primary'
                  }`} />
                )}
              </button>

              <button 
                onClick={() => setMobileOpen(!mobileOpen)} 
                className={`md:hidden w-11 h-11 rounded-2xl transition-all duration-300 flex items-center justify-center active:scale-95 ${
                  isTransparent 
                    ? 'bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-md shadow-md' 
                    : 'bg-secondary/70 hover:bg-secondary border border-border/60 shadow-sm'
                }`}
                aria-label="Toggle Navigation Menu"
              >
                {mobileOpen ? (
                  <XIcon className="w-5 h-5 text-accent" /> 
                ) : (
                  <MenuIcon className={`w-5 h-5 transition-colors ${isTransparent ? 'text-white' : 'text-foreground'}`} />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Cinematic & Tactile Mobile Menu Drawer */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div 
              initial={{ opacity: 0, height: 0 }} 
              animate={{ opacity: 1, height: 'auto' }} 
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.35, ease: [0.25, 0.1, 0.25, 1] }}
              className="md:hidden bg-white/95 dark:bg-[#1a1512]/95 backdrop-blur-2xl border-b border-border/80 px-5 py-6 overflow-hidden shadow-2xl space-y-3.5"
            >
              {[
                { label: '🏠 Home', page: '/', desc: 'Return to cafe presentation' },
                { label: '☕ Menu & Showcase', page: '/menu', desc: 'Browse 100% pure veg selections' },
              ].map(({ label, page, desc }, idx) => (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: idx * 0.08 }}
                >
                  <Link 
                    href={page} 
                    onClick={() => setMobileOpen(false)}
                    className={`group flex items-center justify-between p-4 rounded-2xl font-extrabold text-base transition-all duration-200 active:scale-[0.98] ${
                      pathname === page 
                        ? 'bg-gradient-to-r from-accent to-[#d48c3d] text-white shadow-xl shadow-accent/25 border border-white/20' 
                        : 'bg-secondary/50 hover:bg-secondary text-foreground border border-border/50'
                    }`}
                  >
                    <div>
                      <div className="text-base tracking-tight">{label}</div>
                      <div className={`text-[11px] font-normal mt-0.5 ${pathname === page ? 'text-white/80' : 'text-muted-foreground'}`}>
                        {desc}
                      </div>
                    </div>
                    <span className="text-sm font-bold opacity-80 group-hover:translate-x-1 transition-transform">→</span>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Quick Direction Badge */}
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="pt-2 border-t border-border/60 mt-4"
              >
                <a 
                  href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" 
                  target="_blank" 
                  rel="noreferrer"
                  className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-black/5 dark:bg-white/5 border border-border text-foreground font-bold text-xs uppercase tracking-wider shadow-inner active:scale-[0.98] transition-all"
                >
                  <span>📍 Nashik Cafe Location & Maps</span>
                </a>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.nav>
    </>
  );
}

