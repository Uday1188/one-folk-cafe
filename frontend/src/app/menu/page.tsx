'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X as XIcon, ChevronDown, Check, Sparkles, Coffee, Utensils } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { ProductCard } from '@/components/shared/ProductCard';
import { Product } from '@/types';

export default function MenuPage() {
  const router = useRouter();

  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState<string>("All");
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);

  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const products: Product[] = useMemo(() => {
    if (!fetchedProducts) return [];
    return fetchedProducts.map((p: any) => ({
      ...p,
      id: p.id,
      name: p.name,
      description: p.description || "Freshly prepared to order with pure vegetarian ingredients.",
      category: p.categoryName || p.category || "Specialty",
      categoryName: p.categoryName,
      price: p.price,
      image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop",
      images: p.imageUrl ? [p.imageUrl] : ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"],
      available: p.available !== false,
      rating: 4.8,
      reviewCount: 118,
      ingredients: ["Artisanal Prep", "Pure Veg"],
      prepTime: 15,
      tags: ["Specialty"]
    }));
  }, [fetchedProducts]);

  const filtered = useMemo(() => {
    let list = products;
    if (activeCategory !== "All") list = list.filter(p => (p.category || p.categoryName) === activeCategory);
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description || "").toLowerCase().includes(q) || (p.category || p.categoryName || "").toLowerCase().includes(q));
    }
    return list;
  }, [products, activeCategory, search]);

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      <Navbar />

      {/* Cinematic Menu Title Header */}
      <section className="relative py-14 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-secondary/50 via-secondary/20 to-transparent border-b border-border/40">
        <div className="max-w-7xl mx-auto text-center">
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-black uppercase tracking-widest border border-accent/20 mb-4 shadow-2xs">
              <Sparkles className="w-3.5 h-3.5 text-accent" /> Curated Digital Showcase
            </span>
            <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
              Our Artisanal Menu
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-xl mx-auto mt-3.5 leading-relaxed font-normal">
              Explore our comprehensive range of specialty coffees, freshly baked bites, and gourmet vegetarian meals crafted right here in Nashik.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Sticky Filter Bar with Glassmorphism & Glow Focus */}
      <div className="sticky top-20 z-40 bg-white/80 dark:bg-[#1a1512]/80 backdrop-blur-2xl border-b border-border/60 shadow-[0_8px_30px_rgb(0,0,0,0.04)]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            {/* Search Input with Premium Interactive Glow */}
            <div className="relative flex-1 w-full group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-focus-within:text-accent transition-colors" />
              <input
                type="text" 
                value={search} 
                onChange={e => setSearch(e.target.value)}
                placeholder="Search specialty coffee, teas, bites, or ingredients..."
                className="w-full pl-12 pr-10 py-3.5 rounded-2xl bg-secondary/40 dark:bg-card/60 border border-border/70 focus:bg-white dark:focus:bg-card focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent transition-all duration-300 text-sm font-medium shadow-2xs"
              />
              {search && (
                <button 
                  onClick={() => setSearch("")} 
                  className="absolute right-4 top-1/2 -translate-y-1/2 p-1 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors"
                >
                  <XIcon className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Custom Category Dropdown */}
            <div className="relative z-50 w-full sm:w-[300px] flex-shrink-0">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between pl-5 pr-4 py-3.5 rounded-2xl bg-card dark:bg-[#241d18] hover:bg-secondary active:scale-[0.99] text-foreground font-bold text-sm border border-border focus:outline-none focus:ring-2 focus:ring-accent/40 transition-all shadow-sm hover:shadow-md"
                aria-expanded={isCategoryOpen}
              >
                <div className="flex items-center gap-2.5">
                  <Utensils className="w-4 h-4 text-accent" />
                  {activeCategory === "All" ? (
                    <span>All Specialties</span>
                  ) : (
                    <span className="flex items-center gap-2">
                      <span>{CATEGORIES.find(c => c.name === activeCategory)?.emoji}</span>
                      <span>{activeCategory}</span>
                    </span>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.96 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.96 }}
                      transition={{ duration: 0.2, ease: "easeOut" }}
                      className="absolute top-full left-0 right-0 mt-2 p-2.5 bg-white/95 dark:bg-[#241d18]/95 backdrop-blur-2xl border border-border rounded-3xl shadow-2xl z-50 max-h-[65vh] overflow-y-auto scrollbar-hide space-y-1"
                    >
                      <button
                        onClick={() => { setActiveCategory("All"); setIsCategoryOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                          activeCategory === "All" ? "bg-gradient-to-r from-primary to-[#7a553b] text-white shadow-md shadow-primary/20" : "hover:bg-secondary/70 text-foreground"
                        }`}
                      >
                        <span className="flex items-center gap-2.5">🍽️ All Specialties</span>
                        {activeCategory === "All" && <Check className="w-4 h-4" />}
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => { setActiveCategory(cat.name); setIsCategoryOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3.5 rounded-2xl text-sm font-bold transition-all active:scale-[0.98] ${
                            activeCategory === cat.name ? "bg-gradient-to-r from-primary to-[#7a553b] text-white shadow-md shadow-primary/20" : "hover:bg-secondary/70 text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2.5">
                            <span className="text-base">{cat.emoji}</span>
                            <span>{cat.name}</span>
                          </div>
                          {activeCategory === cat.name && <Check className="w-4 h-4" />}
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Products Grid with Smooth Motion Layout & Mobile Ergonomic Spacing */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 min-h-[60vh] flex-grow w-full">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-16 gap-3">
            <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
            <span className="text-sm font-bold text-muted-foreground animate-pulse">Loading culinary offerings...</span>
          </div>
        ) : filtered.length === 0 ? (
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-20 bg-secondary/20 rounded-3xl border border-border/50 my-6">
            <div className="text-6xl mb-4 animate-bounce" style={{ animationDuration: '2s' }}>☕</div>
            <h3 className="text-2xl font-bold mb-2">No menu delicacies matched your filter</h3>
            <p className="text-muted-foreground max-w-md mx-auto text-sm px-4">Try searching for something else or clearing your active category filter.</p>
            <button 
              onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-6 px-8 py-3.5 rounded-2xl bg-accent text-white font-bold text-sm shadow-lg hover:shadow-xl active:scale-95 transition-all"
            >
              Reset Filters
            </button>
          </motion.div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6 sm:mb-8 pb-3 border-b border-border/40">
              <h2 className="font-extrabold text-xl sm:text-2xl tracking-tight text-foreground flex items-center gap-2.5" style={{ fontFamily: 'var(--font-display)' }}>
                <span>{activeCategory === "All" ? "All Specialties" : activeCategory}</span>
                <span className="text-xs font-bold text-accent bg-accent/15 px-3 py-1 rounded-full border border-accent/20">
                  {filtered.length} {filtered.length === 1 ? 'item' : 'items'}
                </span>
              </h2>
            </div>
            <motion.div 
              layout
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5 sm:gap-7"
            >
              <AnimatePresence>
                {filtered.map(p => (
                  <motion.div
                    key={p.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ProductCard product={p} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
