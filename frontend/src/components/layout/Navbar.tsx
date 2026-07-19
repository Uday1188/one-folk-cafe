'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Users, Menu as MenuIcon, X as XIcon, Coffee, Sun, Moon, LogOut } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { useDarkMode } from '@/hooks/useDarkMode';


export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { darkMode, toggleDark } = useDarkMode();

  const cartItems = useCartStore((state) => state.items);
  const cartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  const handleLogout = () => {
    router.push('/thank-you');
  };

  const isLanding = pathname === '/';

  return (
    <>
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${scrolled || !isLanding
        ? 'bg-white/90 dark:bg-card/90 backdrop-blur-xl shadow-sm border-b border-border'
        : 'bg-transparent'
        }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-md">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <div className="text-left">
                <span className="block text-lg leading-none font-bold" style={{ fontFamily: 'var(--font-display)' }}>
                  <span className="text-primary dark:text-accent">One Folk</span><span className="text-accent dark:text-primary-foreground"> Cafe</span>
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-6">
              {[
                { label: 'Menu', page: '/menu' },
                { label: 'About', page: '/' },
              ].map(({ label, page }) => (
                <Link key={label} href={page}
                  className="text-sm font-medium text-foreground/70 hover:text-accent transition-colors">
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Controls */}
              <div className="flex items-center gap-2">
                <button onClick={toggleDark} className="w-9 h-9 rounded-xl hover:bg-secondary transition-colors flex items-center justify-center">
                  {darkMode ? <Sun className="w-4.5 h-4.5 text-muted-foreground" /> : <Moon className="w-4.5 h-4.5 text-muted-foreground" />}
                </button>

              <Link href="/cart" className="relative w-10 h-10 rounded-xl bg-accent flex items-center justify-center hover:bg-accent/90 transition-colors">
                <ShoppingCart className="w-5 h-5 text-white" />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary text-white text-[11px] font-bold flex items-center justify-center">
                    {cartCount > 9 ? '9+' : cartCount}
                  </span>
                )}
              </Link>

              <button onClick={() => setMobileOpen(!mobileOpen)} className="md:hidden w-9 h-9 rounded-xl hover:bg-secondary flex items-center justify-center">
                {mobileOpen ? <XIcon className="w-5 h-5" /> : <MenuIcon className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
              className="md:hidden bg-white/95 dark:bg-card/95 backdrop-blur-xl border-t border-border px-4 py-4 space-y-2">
              {[
                { label: '🏠 Home', page: '/' },
                { label: '📋 Menu', page: '/menu' },
                { label: '🛒 Cart', page: '/cart' },
              ].map(({ label, page }) => (
                <Link key={label} href={page} onClick={() => setMobileOpen(false)}
                  className="block w-full text-left px-4 py-3 rounded-xl hover:bg-secondary text-sm font-semibold transition-colors">
                  {label}
                </Link>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
