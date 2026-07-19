'use client';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, X as XIcon, ChevronDown, Check, ChevronRight } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { useCartStore } from '@/store/useCartStore';
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

  const cartItems = useCartStore(state => state.items);
  const cartTotal = cartItems.reduce((s, i) => s + i.price * i.quantity, 0);
  const cartCount = cartItems.reduce((s, i) => s + i.quantity, 0);

  const products: Product[] = useMemo(() => {
    if (!fetchedProducts) return [];
    return fetchedProducts.map((p: any) => ({
      ...p,
      id: p.id,
      name: p.name,
      description: p.description || "",
      category: p.categoryName || p.category || "Uncategorized",
      categoryName: p.categoryName,
      price: p.price,
      image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop",
      images: p.imageUrl ? [p.imageUrl] : ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop"],
      available: p.available !== false,
      rating: 4.5,
      reviewCount: 120,
      ingredients: [],
      prepTime: 15,
      tags: ["New"]
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

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen bg-background pt-16">
      <Navbar />

      {/* Sticky Header */}
      <div className="sticky top-16 z-40 bg-background/95 backdrop-blur-xl border-b border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-muted-foreground" />
              <input
                type="text" value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search menu items..."
                className="w-full pl-11 pr-4 py-3 rounded-2xl bg-input-background border border-border focus:outline-none focus:ring-2 focus:ring-accent/30 transition-all text-sm"
              />
              {search && (
                <button onClick={() => setSearch("")} className="absolute right-4 top-1/2 -translate-y-1/2">
                  <XIcon className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
            </div>
            {/* Custom Category Dropdown */}
            <div className="relative z-50 sm:w-[280px] flex-shrink-0">
              <button
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
                className="w-full flex items-center justify-between pl-4 pr-4 py-3.5 rounded-2xl bg-secondary/80 hover:bg-secondary text-foreground font-semibold border border-border/50 focus:outline-none transition-all shadow-sm"
              >
                <div className="flex items-center gap-2">
                  {activeCategory === "All" ? (
                    <span>All Categories</span>
                  ) : (
                    <>
                      <span>{CATEGORIES.find(c => c.name === activeCategory)?.emoji}</span>
                      <span>{activeCategory}</span>
                    </>
                  )}
                </div>
                <ChevronDown className={`w-5 h-5 text-muted-foreground transition-transform duration-300 ${isCategoryOpen ? "rotate-180" : ""}`} />
              </button>

              <AnimatePresence>
                {isCategoryOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setIsCategoryOpen(false)} />
                    <motion.div
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                      className="absolute top-full left-0 right-0 mt-2 p-2 bg-card border border-border rounded-2xl shadow-xl z-50 max-h-[60vh] overflow-y-auto scrollbar-hide"
                    >
                      <button
                        onClick={() => { setActiveCategory("All"); setIsCategoryOpen(false); }}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${activeCategory === "All" ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                      >
                        <span>All Categories</span>
                        {activeCategory === "All" && <Check className="w-4 h-4" />}
                      </button>
                      {CATEGORIES.map(cat => (
                        <button
                          key={cat.name}
                          onClick={() => { setActiveCategory(cat.name); setIsCategoryOpen(false); }}
                          className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-semibold transition-colors mt-1 ${activeCategory === cat.name ? "bg-primary text-primary-foreground" : "hover:bg-secondary text-foreground"}`}
                        >
                          <div className="flex items-center gap-2">
                            <span>{cat.emoji}</span>
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

      {/* Products Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[50vh]">
        {isLoading ? (
          <div className="flex items-center justify-center p-8">
            <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🔍</div>
            <h3 className="text-xl font-bold mb-2">Nothing found</h3>
            <p className="text-muted-foreground">Try a different search or category</p>
            <button onClick={() => { setSearch(""); setActiveCategory("All"); }}
              className="mt-6 px-6 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors">
              Clear Filters
            </button>
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-bold text-lg">{activeCategory === "All" ? "All Items" : activeCategory}
                <span className="text-muted-foreground font-normal text-sm ml-2">({filtered.length} items)</span>
              </h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
              {filtered.map(p => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </>
        )}
      </div>

      {/* Floating Cart */}
      {cartCount > 0 && (
        <motion.button initial={{ y: 100 }} animate={{ y: 0 }} onClick={() => router.push("/cart")}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-3 px-6 py-3.5 rounded-2xl bg-primary text-primary-foreground shadow-2xl hover:shadow-primary/30 transition-shadow z-50">
          <div className="w-6 h-6 rounded-lg bg-accent flex items-center justify-center text-xs font-bold text-white">{cartCount}</div>
          <span className="font-semibold">View Cart</span>
          <span className="font-bold text-accent">{fmtPrice(cartTotal)}</span>
          <ChevronRight className="w-4 h-4" />
        </motion.button>
      )}

      <Footer />
    </div>
  );
}
