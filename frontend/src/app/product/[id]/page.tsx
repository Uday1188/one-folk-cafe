'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Sparkles, Coffee, ShieldCheck } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts } from '@/lib/api';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import * as React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Product } from '@/types';
import { resolveImageUrl } from '@/lib/utils';

export default function ProductDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const [activeImg, setActiveImg] = useState(0);
  const [imgLoaded, setImgLoaded] = useState(false);

  const { data: fetchedProducts, isLoading } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const product: Product | undefined = useMemo(() => {
    if (!fetchedProducts) return undefined;
    const p = fetchedProducts.find((item: any) => String(item.id) === id);
    if (!p) return undefined;
    
    return {
      ...p,
      id: p.id,
      name: p.name,
      description: p.description || "Freshly handcrafted with 100% pure vegetarian ingredients, made to order with expert care by our cafe artisans.",
      category: p.categoryName || p.category || "Specialty",
      categoryName: p.categoryName,
      price: p.price,
      image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop",
      images: p.imageUrl ? [p.imageUrl] : ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=800&auto=format&fit=crop"],
      available: p.available !== false,
      rating: 4.8,
      reviewCount: 124,
      ingredients: ["Fresh Espresso", "Pure Milk", "Artisanal Syrup", "Love"],
      prepTime: 12,
      tags: ["Chef's Recommendation"]
    };
  }, [fetchedProducts, id]);

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-3 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-sm font-bold text-muted-foreground animate-pulse">Crafting experience...</span>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background pt-20 flex flex-col items-center justify-center gap-4">
        <div className="text-5xl">☕</div>
        <h2 className="text-2xl font-bold">Menu Item Not Found</h2>
        <button 
          onClick={() => router.push("/menu")} 
          className="px-6 py-3 rounded-2xl bg-accent text-white font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all"
        >
          Return to Menu Showcase
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-20 flex flex-col">
      <Navbar />
      
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 flex-grow w-full">
        <motion.button 
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0 }}
          whileTap={{ scale: 0.96 }}
          onClick={() => router.push("/menu")} 
          className="inline-flex items-center gap-2 px-5 py-2.5 sm:px-4 sm:py-2 rounded-2xl bg-secondary/70 hover:bg-secondary border border-border/60 text-sm font-bold text-foreground hover:text-accent active:scale-95 transition-all duration-200 shadow-sm mb-7 sm:mb-10 group"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Back to Menu Showcase
        </motion.button>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-start">
          {/* High-Resolution Image Gallery */}
          <motion.div 
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="lg:col-span-6 space-y-4"
          >
            <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square rounded-3xl overflow-hidden bg-secondary border border-border shadow-[0_12px_40px_rgba(0,0,0,0.08)] group">
              {!imgLoaded && <div className="absolute inset-0 shimmer-bg" />}
              <motion.img 
                key={activeImg}
                initial={{ scale: 1.05, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4 }}
                src={resolveImageUrl(product.images?.[activeImg] || product.image)} 
                alt={product.name} 
                onLoad={() => setImgLoaded(true)}
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out" 
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-40 sm:opacity-30 group-hover:opacity-60 transition-opacity" />
              
              <div className="absolute bottom-4 left-4 right-4 sm:right-auto">
                <span className="inline-flex items-center gap-1.5 px-3.5 py-2 sm:py-1.5 rounded-full bg-black/75 backdrop-blur-md text-white font-semibold text-xs border border-white/15 shadow-sm">
                  <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" /> 
                  <span>100% Pure Vegetarian & Fresh</span>
                </span>
              </div>
            </div>

            {product.images && product.images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                {product.images.map((img, i) => (
                  <button 
                    key={i} 
                    onClick={() => setActiveImg(i)}
                    className={`w-20 h-20 sm:w-22 sm:h-22 rounded-2xl overflow-hidden bg-secondary border-2 flex-shrink-0 transition-all duration-300 shadow-sm hover:scale-105 active:scale-95 ${
                      activeImg === i ? "border-accent shadow-md shadow-accent/20 ring-2 ring-accent/30" : "border-border/60 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </motion.div>

          {/* Cinematic Information Showcase */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: "easeOut" }}
            className="lg:col-span-6 flex flex-col justify-between h-full space-y-8"
          >
            <div className="space-y-4 sm:space-y-5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3.5 py-1 rounded-full bg-accent/15 text-accent text-xs font-extrabold uppercase tracking-widest border border-accent/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-accent" /> {product.category}
                </span>
                {!product.available ? (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-red-500/10 text-red-500 border border-red-500/20">
                    Temporarily Unavailable
                  </span>
                ) : (
                  <span className="px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-500/15 text-green-500 border border-green-500/20 flex items-center gap-1">
                    <Coffee className="w-3 h-3" /> Ready at Cafe
                  </span>
                )}
              </div>

              <h1 className="text-3xl sm:text-5xl font-extrabold text-foreground leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {product.name}
              </h1>

              <p className="text-muted-foreground leading-relaxed text-sm sm:text-base pt-1 whitespace-pre-line font-normal">
                {product.description}
              </p>
            </div>

            {/* Glassmorphism Luxury Pricing & Mobile GPS Navigation Box */}
            <motion.div 
              whileHover={{ y: -2 }}
              className="p-6 sm:p-8 rounded-3xl bg-white/90 dark:bg-[#241d18]/95 backdrop-blur-2xl border border-border/80 dark:border-white/10 shadow-[0_15px_40px_rgba(198,134,66,0.12)] transition-all duration-300"
            >
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 sm:gap-6">
                <div>
                  {product.halfPlateAvailable ? (
                    <>
                      <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">Cafe Dining Price (Half / Full)</span>
                      <div className="flex items-baseline gap-2">
                        <span className="text-xl sm:text-2xl font-black text-muted-foreground">{fmtPrice(product.halfPlatePrice || 0)}</span>
                        <span className="text-muted-foreground/40 text-lg px-0.5">/</span>
                        <span className="text-3xl sm:text-4xl font-black text-primary dark:text-white tracking-tight">{fmtPrice(product.fullPlatePrice || product.price)}</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-xs font-bold text-accent uppercase tracking-widest block mb-1">Cafe Dining Price</span>
                      <div className="text-3xl sm:text-4xl font-black text-primary dark:text-white tracking-tight">{fmtPrice(product.fullPlatePrice || product.price)}</div>
                    </>
                  )}
                  <span className="text-[11px] text-muted-foreground mt-1 block">Taxes & presentation included</span>
                </div>
                
                <div className="w-full sm:w-auto">
                  <a 
                    href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427"
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto px-7 py-4 rounded-2xl bg-gradient-to-r from-primary via-accent to-[#d48c3d] hover:opacity-95 text-white font-bold text-sm shadow-xl shadow-accent/25 flex items-center justify-center gap-2.5 border border-white/20 active:scale-[0.98] transition-all duration-300"
                  >
                    <Coffee className="w-4.5 h-4.5 text-white animate-bounce" style={{ animationDuration: '3s' }} />
                    <span>Savour at One Folk Cafe (Directions)</span>
                  </a>
                </div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

