'use client';
import { useState, useEffect } from 'react';
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Product } from '@/types';
import { ArrowUpRight, Sparkles } from 'lucide-react';
import { resolveImageUrl } from '@/lib/utils';

export function ProductCard({ product }: { product: Product }) {
  const router = useRouter();
  const [imgLoaded, setImgLoaded] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  useEffect(() => {
    // Detect mobile / touch devices to optimize physics and prevent scroll-wobble
    const touchSupported = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (window.innerWidth < 1024);
    setIsTouchDevice(touchSupported);
  }, []);

  // 3D Tilt Hover Effects (Desktop Only)
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 300, mass: 0.5 };
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [7, -7]), springConfig);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-7, 7]), springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isTouchDevice) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const xPct = (mouseX / width) - 0.5;
    const yPct = (mouseY / height) - 0.5;
    x.set(xPct);
    y.set(yPct);
  };

  const handleMouseLeave = () => {
    if (isTouchDevice) return;
    x.set(0);
    y.set(0);
  };

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 28, scale: 0.97 }} 
      whileInView={{ opacity: 1, y: 0, scale: 1 }} 
      viewport={{ once: true, margin: "-40px" }}
      whileTap={{ scale: 0.965, y: -2 }}
      transition={{ duration: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
      style={{ 
        rotateX: isTouchDevice ? 0 : rotateX, 
        rotateY: isTouchDevice ? 0 : rotateY, 
        transformStyle: isTouchDevice ? "flat" : "preserve-3d" 
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onClick={() => router.push(`/product/${product.id}`)}
      className="gpu-accelerated group relative bg-card dark:bg-[#241d18] rounded-3xl overflow-hidden border border-border/60 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.05)] hover:shadow-[0_22px_45px_rgba(198,134,66,0.18)] active:shadow-[0_22px_50px_rgba(198,134,66,0.28)] hover:-translate-y-1.5 active:-translate-y-1 active:border-accent/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
    >
      {/* Subtle Glow Overlay on Hover & Active Tap */}
      <div className="absolute -inset-px bg-gradient-to-tr from-accent/25 via-transparent to-primary/15 rounded-3xl opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-300 pointer-events-none z-10" />

      <div>
        {/* Product Image Showcase with Touch-Reactive Gentle Zoom */}
        <div className="relative aspect-[4/3] sm:aspect-[16/11] bg-secondary/50 overflow-hidden">
          {!imgLoaded && (
            <div className="absolute inset-0 shimmer-bg" />
          )}
          <img 
            src={resolveImageUrl(product.image || product.imageUrl) || 'https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=400&auto=format&fit=crop'} 
            alt={product.name} 
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            className={`w-full h-full object-cover group-hover:scale-110 group-active:scale-108 transition-transform duration-700 ease-out ${imgLoaded ? 'opacity-100' : 'opacity-0'}`} 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent opacity-40 group-hover:opacity-65 group-active:opacity-70 transition-opacity duration-300" />
          
          {/* Tags */}
          <div className="absolute top-3 left-3 flex gap-1.5 flex-wrap z-20">
            <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#1a1512]/95 backdrop-blur-md text-[11px] font-bold text-primary dark:text-accent shadow-sm flex items-center gap-1.5 border border-white/20">
              <Sparkles className="w-3 h-3 text-accent animate-pulse" />
              {product.category || product.categoryName || "Special"}
            </span>
          </div>

          {!product.available && (
            <div className="absolute inset-0 bg-black/75 backdrop-blur-sm flex items-center justify-center z-30 p-4 text-center">
              <span className="px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider bg-red-600 text-white shadow-xl border border-red-400/30">
                Currently Sold Out
              </span>
            </div>
          )}
        </div>

        {/* Product Details with Tactile Title Feedback */}
        <div className="p-5 sm:p-6 relative z-10">
          <h4 className="font-extrabold text-lg sm:text-xl leading-tight mb-2 line-clamp-1 text-foreground group-hover:text-accent group-active:text-accent transition-colors duration-200" style={{ fontFamily: 'var(--font-display)' }}>
            {product.name}
          </h4>
          <p className="text-muted-foreground text-xs sm:text-sm leading-relaxed mb-3 sm:mb-4 line-clamp-2">
            {product.description || "Handcrafted to perfection with premium pure veg ingredients."}
          </p>
        </div>
      </div>

      {/* Pricing & Interactive Touch Call-to-Action Footer */}
      <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0 relative z-10">
        <div className="flex items-center justify-between border-t border-border/60 dark:border-white/10 pt-3.5 sm:pt-4">
          <div>
            <span className="text-[10px] sm:text-xs font-bold text-muted-foreground uppercase tracking-wider block leading-none mb-1">Price</span>
            <span className="text-xl sm:text-2xl font-black text-primary dark:text-white tracking-tight">{fmtPrice(product.price)}</span>
          </div>
          
          <div className="flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-4 py-2.5 sm:py-2.5 rounded-2xl bg-secondary group-hover:bg-accent group-active:bg-accent group-hover:text-white group-active:text-white text-xs sm:text-xs font-extrabold text-foreground transition-all duration-300 shadow-sm group-hover:shadow-md group-active:shadow-lg group-hover:shadow-accent/40 group-active:shadow-accent/50 active:scale-95">
            <span>Explore Item</span>
            <ArrowUpRight className="w-4 h-4 text-accent group-hover:text-white group-active:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform duration-300" />
          </div>
        </div>
      </div>
    </motion.div>
  );
}

