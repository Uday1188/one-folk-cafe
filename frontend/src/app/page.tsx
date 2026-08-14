'use client';
import { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ScanLine, Utensils, Users, Sparkles, ChefHat, ChevronRight, ArrowUpRight, Heart, Phone, MapPin, Coffee, Clock, Mail, Leaf, ShieldCheck, Maximize2, X as XIcon, Star } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchSettings } from '@/lib/api';
import { Product } from '@/types';
import { GamesSection } from '@/features/games/components/GamesSection';

const formatTimeLabel = (time?: string) => {
  if (!time) return "";
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

const GALLERY_PHOTOS = [
  { id: 1, src: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1000&auto=format&fit=crop', title: 'Warm Cafe Atmosphere', category: 'Interior & Vibe', colSpan: 'lg:col-span-8' },
  { id: 2, src: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?q=80&w=800&auto=format&fit=crop', title: 'Artisanal Latte Art', category: 'Specialty Coffee', colSpan: 'lg:col-span-4' },
  { id: 3, src: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=800&auto=format&fit=crop', title: 'Gourmet Pure Veg Pizza', category: 'Handcrafted Food', colSpan: 'lg:col-span-4' },
  { id: 4, src: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?q=80&w=800&auto=format&fit=crop', title: 'Refreshing Summer Beverages', category: 'Mocktails & Chillers', colSpan: 'lg:col-span-4' },
  { id: 5, src: 'https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?q=80&w=1000&auto=format&fit=crop', title: 'Cozy Corner Dining', category: 'Community & Conversations', colSpan: 'lg:col-span-4' },
];

export default function Home() {
  const router = useRouter();
  const [lightboxImg, setLightboxImg] = useState<{ src: string; title: string; category: string } | null>(null);

  const { data: fetchedProducts = [] } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const resolveImageUrl = (src: string) => {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://')) return src;
    const backendBase = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080/api').replace(/\/api$/, '');
    return backendBase + src;
  };

  const galleryPhotos = useMemo(() => {
    if (settings && settings.galleryItems && settings.galleryItems.length > 0) {
      return settings.galleryItems.slice(0, 6).map((item, idx) => ({
        id: idx + 1,
        src: resolveImageUrl(item.src),
        title: item.title,
        category: item.category,
        colSpan: idx % 5 === 0 ? 'lg:col-span-8' : 'lg:col-span-4'
      }));
    }
    return GALLERY_PHOTOS;
  }, [settings]);

  const handleExplore = () => {
    router.push("/menu");
  };

  const products: Product[] = fetchedProducts ? fetchedProducts.map((p: any) => ({
    ...p,
    id: p.id,
    name: p.name,
    description: p.description || "Freshly prepared with authentic 100% pure vegetarian ingredients.",
    category: p.categoryName || p.category || "Specialty",
    categoryName: p.categoryName,
    price: p.price,
    image: p.imageUrl || "https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop",
    images: p.imageUrl ? [p.imageUrl] : ["https://images.unsplash.com/photo-1541167760496-1628856ab772?q=80&w=600&auto=format&fit=crop"],
    available: p.available !== false,
    rating: 4.8,
    reviewCount: 124,
    ingredients: [],
    prepTime: 15,
    tags: ["Chef's Favorite"]
  })) : [];

  const featured = settings?.featuredProductIds?.length
    ? settings.featuredProductIds
      .map(id => products.find(p => p.id === id))
      .filter((p): p is Product => p !== undefined)
      .slice(0, 4)
    : products.slice(0, 4);

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen selection:bg-accent selection:text-white overflow-x-hidden">
      <Navbar />

      {/* Hero Section with Parallax Zoom & Floating Elegance */}
      <section className="relative min-h-screen flex items-center overflow-hidden bg-[#160e0a]">
        <div className="absolute inset-0 z-0">
          <motion.img
            initial={{ scale: 1.15 }}
            animate={{ scale: 1 }}
            transition={{ duration: 10, ease: "easeOut" }}
            src="https://images.unsplash.com/photo-1611323128401-faa8f1b6de24?w=1600&h=900&fit=crop&auto=format"
            alt="One Folk Cafe interior"
            className="w-full h-full object-cover opacity-45"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#160e0a] via-[#160e0a]/80 to-transparent z-10" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#160e0a] via-transparent to-transparent z-10" />
        </div>

        {/* Floating Decorative Elements */}
        <div className="absolute top-1/4 right-10 z-10 hidden lg:block pointer-events-none opacity-25 animate-float">
          <div className="w-64 h-64 rounded-full bg-accent/20 blur-3xl" />
        </div>
        <div className="absolute bottom-1/3 left-1/2 z-10 hidden lg:block pointer-events-none opacity-20 animate-float-slow">
          <div className="w-96 h-96 rounded-full bg-orange-400/20 blur-[100px]" />
        </div>

        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-20">
          <div className="max-w-3xl">
            <motion.div
              initial={{ opacity: 0, y: 35 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: [0.25, 0.1, 0.25, 1] }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-1.5 sm:px-5 sm:py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white text-[11px] sm:text-xs font-extrabold uppercase tracking-widest mb-6 sm:mb-8 shadow-lg">
                <ShieldCheck className="w-4 h-4 text-green-400 flex-shrink-0" />
                <span>100% Pure Veg & Artisanal Coffee in Nashik</span>
              </div>

              <h1 className="text-[42px] sm:text-7xl lg:text-8xl font-black text-white leading-[1.06] tracking-tight mb-6 sm:mb-8" style={{ fontFamily: 'var(--font-display)' }}>
                Where Every<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-[#e6a86c] to-[#f4d1ad]">Sip</span> Tells a<br />
                Story.
              </h1>

              <p className="text-base sm:text-xl text-white/85 leading-relaxed mb-8 sm:mb-10 max-w-xl font-normal">
                Experience Nashik's premier culinary refuge. Handcrafted gourmet vegetarian dining, rich espresso brews, and unforgettable conversational ambiance.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4">
                <button
                  onClick={handleExplore}
                  className="group relative w-full sm:w-auto justify-center inline-flex items-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-accent via-accent to-[#d48c3d] text-white font-extrabold text-base shadow-xl shadow-accent/30 hover:shadow-2xl hover:shadow-accent/50 hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-300"
                >
                  <Utensils className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" />
                  <span>Explore Digital Showcase</span>
                  <ArrowUpRight className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </button>

                <a
                  href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto justify-center inline-flex items-center gap-2.5 px-8 py-4 rounded-2xl bg-white/15 hover:bg-white/25 text-white font-extrabold text-base backdrop-blur-xl border border-white/25 transition-all duration-300 active:scale-[0.97] hover:-translate-y-0.5"
                >
                  <MapPin className="w-5 h-5 text-accent flex-shrink-0" />
                  <span>Visit Our Cafe</span>
                </a>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Animated Downward Scroll Indicator */}
        <div className="absolute bottom-5 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-2 pointer-events-none opacity-60">
          <span className="text-[10px] uppercase font-bold tracking-widest text-white">Scroll to Discover</span>
          <div className="w-5 h-8 sm:w-6 sm:h-10 rounded-full border-2 border-white/40 flex justify-center pt-1.5">
            <div className="w-1.5 h-2.5 sm:h-3 bg-accent rounded-full animate-bounce" style={{ animationDuration: '2s' }} />
          </div>
        </div>
      </section>

      {/* Experience Flow: "Experience Our Cafe in 3 Simple Steps" */}
      <section className="py-20 sm:py-28 bg-secondary/30 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center mb-14 sm:mb-20">
            <motion.div initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 text-accent font-extrabold text-xs tracking-widest uppercase bg-accent/10 px-4 py-1.5 rounded-full border border-accent/20">
                <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Seamless Dining Flow
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-3.5 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Experience One Folk in 3 Steps
              </h2>
              <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm sm:text-base px-4">
                We have perfected the balance between digital freedom and warm table hospitality.
              </p>
            </motion.div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                step: "01",
                icon: <ScanLine className="w-8 h-8 text-accent group-active:text-white transition-colors" />,
                title: "Scan & Explore",
                desc: "Scan our table QR or visit our showcase on your phone to immerse yourself in high-resolution photography and menu descriptions."
              },
              {
                step: "02",
                icon: <Leaf className="w-8 h-8 text-green-500 group-active:text-white transition-colors" />,
                title: "Discover Pure Veg Delights",
                desc: "Browse Nashik's finest selection of 100% pure vegetarian gourmet appetizers, authentic pastas, and artisanal espresso creations."
              },
              {
                step: "03",
                icon: <Coffee className="w-8 h-8 text-amber-500 group-active:text-white transition-colors" />,
                title: "Savour Table Hospitality",
                desc: "Place your order with our friendly cafe hosts at your table or counter. Sit back as our kitchen crafts everything hot and fresh."
              },
            ].map((step, i) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-40px" }}
                whileTap={{ scale: 0.965, y: -4 }}
                transition={{ delay: i * 0.15, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                className="gpu-accelerated group relative bg-card dark:bg-[#241d18] rounded-3xl p-7 sm:p-8 shadow-sm border border-border/60 dark:border-white/10 hover:shadow-2xl active:shadow-[0_20px_45px_rgba(198,134,66,0.22)] hover:shadow-accent/12 active:border-accent/60 hover:-translate-y-1.5 active:-translate-y-1 transition-all duration-300 overflow-hidden flex flex-col justify-between cursor-pointer"
              >
                <div className="absolute -inset-px bg-gradient-to-br from-accent/15 via-transparent to-transparent opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-400 pointer-events-none" />

                <div>
                  <div className="flex items-center justify-between mb-6 sm:mb-8">
                    <motion.div
                      initial={{ scale: 0.7, opacity: 0, rotate: -10 }}
                      whileInView={{ scale: 1, opacity: 1, rotate: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.15 + 0.15, type: "spring", stiffness: 350, damping: 20 }}
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl bg-accent/15 group-active:bg-accent flex items-center justify-center shadow-inner group-hover:scale-110 group-active:scale-115 group-hover:rotate-6 group-active:rotate-6 transition-all duration-300"
                    >
                      {step.icon}
                    </motion.div>
                    <span className="text-4xl sm:text-5xl font-black text-muted/30 dark:text-white/10 tracking-tighter" style={{ fontFamily: 'var(--font-display)' }}>
                      {step.step}
                    </span>
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold mb-3 text-foreground group-hover:text-accent group-active:text-accent transition-colors duration-200" style={{ fontFamily: 'var(--font-display)' }}>
                    {step.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">{step.desc}</p>
                </div>

                <div className="w-12 h-1 bg-accent/30 group-hover:w-full group-active:w-full group-hover:bg-accent group-active:bg-accent transition-all duration-500 rounded-full mt-7 sm:mt-8" />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Fan Favourites: Featured Culinary Art Showcase */}
      <section className="py-20 sm:py-28 bg-background relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between mb-12 sm:mb-16 gap-5"
          >
            <div>
              <span className="inline-flex items-center gap-1 text-accent font-bold text-xs tracking-widest uppercase bg-accent/10 px-3.5 py-1.5 rounded-full border border-accent/20 mb-3">
                <Star className="w-3.5 h-3.5 fill-accent" /> Culinary Art & Curated Selections
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                Most Loved Creations
              </h2>
            </div>
            <button
              onClick={() => router.push("/menu")}
              className="group w-full sm:w-auto justify-center inline-flex items-center gap-2 px-6 py-3.5 sm:py-3 rounded-2xl bg-secondary hover:bg-accent active:bg-accent hover:text-white active:text-white font-extrabold text-sm transition-all duration-300 shadow-sm self-start sm:self-auto active:scale-95"
            >
              <span>Explore Entire Showcase</span>
              <ArrowUpRight className="w-4 h-4 text-accent group-hover:text-white group-active:text-white group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
            </button>
          </motion.div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            {featured.map((p, i) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, y: 32, scale: 0.96 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                whileTap={{ scale: 0.965, y: -2 }}
                transition={{ delay: i * 0.12, duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => router.push(`/product/${p.id}`)}
                className="gpu-accelerated group relative bg-card dark:bg-[#241d18] rounded-3xl overflow-hidden shadow-sm hover:shadow-2xl active:shadow-[0_22px_45px_rgba(198,134,66,0.22)] hover:shadow-accent/15 border border-border/60 dark:border-white/10 hover:-translate-y-1.5 active:-translate-y-1 active:border-accent/60 transition-all duration-300 cursor-pointer flex flex-col justify-between"
              >
                <div>
                  <div className="relative aspect-square sm:aspect-[4/3] lg:aspect-square bg-secondary overflow-hidden">
                    <img
                      src={p.image}
                      alt={p.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-110 group-active:scale-108 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent opacity-40 sm:opacity-30 group-hover:opacity-65 group-active:opacity-70 transition-opacity duration-300" />

                    {p.tags && p.tags.filter(t => t !== "New").length > 0 && (
                      <div className="absolute top-3 left-3 z-20">
                        <span className="px-3 py-1 rounded-full bg-white/95 dark:bg-[#1a1512]/95 backdrop-blur-md text-xs font-bold text-primary dark:text-accent shadow-sm flex items-center gap-1 border border-white/20">
                          <Sparkles className="w-3 h-3 text-accent animate-pulse" />
                          {p.tags.filter(t => t !== "New")[0]}
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 sm:p-6">
                    <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.12 + 0.1 }} className="text-xs text-accent font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
                      {p.category}
                    </motion.div>
                    <h4 className="font-extrabold text-lg leading-tight mb-2 text-foreground group-hover:text-accent group-active:text-accent transition-colors duration-200" style={{ fontFamily: 'var(--font-display)' }}>
                      {p.name}
                    </h4>
                    <p className="text-muted-foreground text-xs leading-relaxed line-clamp-2 mb-2">
                      {p.description}
                    </p>
                  </div>
                </div>

                <div className="px-5 sm:px-6 pb-5 sm:pb-6 pt-0">
                  <div className="flex items-center justify-between border-t border-border/50 pt-3.5 sm:pt-4 mt-1 sm:mt-2">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block mb-0.5">Cafe Price</span>
                      <span className="text-xl font-black text-primary dark:text-white">{fmtPrice(p.price)}</span>
                    </div>
                    <div className="w-10 h-10 rounded-2xl bg-secondary group-hover:bg-accent group-active:bg-accent text-foreground group-hover:text-white group-active:text-white flex items-center justify-center transition-all duration-300 shadow-sm group-hover:shadow-md group-active:shadow-lg group-hover:shadow-accent/40 group-active:shadow-accent/50 active:scale-90">
                      <ArrowUpRight className="w-5 h-5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-active:translate-x-1 group-active:-translate-y-1 transition-transform" />
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* NEW: Cafe Atmosphere & Culinary Art Gallery Section */}
      <section className="py-20 sm:py-28 bg-secondary/20 border-y border-border/40 relative overflow-hidden" id="gallery">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto mb-12 sm:mb-16"
          >
            <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-accent/15 text-accent text-xs font-bold uppercase tracking-widest border border-accent/20 mb-3">
              <Sparkles className="w-3.5 h-3.5 animate-pulse" /> Visual Hospitality
            </span>
            <h2 className="text-3xl sm:text-5xl font-extrabold text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Cafe Atmosphere & Culinary Art
            </h2>
            <p className="text-muted-foreground mt-3 text-sm sm:text-base px-2">
              Immerse yourself in our serene warmth. Tap any photograph on your screen to interact with our handcrafted culinary presentation and cozy interior spaces.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6">
            {galleryPhotos.map((photo, index) => (
              <motion.div
                key={photo.id}
                initial={{ opacity: 0, y: 36, scale: 0.94 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-30px" }}
                whileTap={{ scale: 0.965 }}
                transition={{ delay: index * 0.1, duration: 0.55, ease: [0.25, 0.1, 0.25, 1] }}
                onClick={() => setLightboxImg(photo)}
                className={`gpu-accelerated ${photo.colSpan} relative rounded-3xl overflow-hidden border border-border/60 bg-secondary group cursor-pointer aspect-[16/10] lg:aspect-auto min-h-[240px] sm:min-h-[340px] shadow-sm hover:shadow-2xl active:shadow-[0_22px_45px_rgba(198,134,66,0.25)] hover:shadow-accent/15 active:border-accent/60 hover:-translate-y-1 active:-translate-y-0.5 transition-all duration-500`}
              >
                <img
                  src={photo.src}
                  alt={photo.title}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-110 group-active:scale-108 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/25 to-transparent opacity-70 group-hover:opacity-85 group-active:opacity-90 transition-opacity duration-300" />

                <div className="absolute top-4 right-4 sm:top-5 sm:right-5 w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-black/60 backdrop-blur-md flex items-center justify-center text-white opacity-85 sm:opacity-0 group-hover:opacity-100 group-active:opacity-100 transition-all duration-300 group-hover:scale-105 group-active:scale-110 border border-white/25 shadow-md">
                  <Maximize2 className="w-4 h-4 text-white" />
                </div>

                <div className="absolute bottom-5 left-5 right-5 sm:bottom-6 sm:left-6 sm:right-6 z-10 transform group-hover:-translate-y-1 group-active:-translate-y-1 transition-transform duration-300">
                  <span className="px-3 py-1 rounded-full bg-accent text-white text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider mb-2 inline-block shadow-sm">
                    {photo.category}
                  </span>
                  <h4 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                    {photo.title}
                  </h4>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Lightbox Modal Animation (Optimized for mobile thumbs and safe areas) */}
        <AnimatePresence>
          {lightboxImg && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setLightboxImg(null)}
              className="fixed inset-0 z-50 bg-black/95 backdrop-blur-2xl flex items-center justify-center p-3 sm:p-8 cursor-pointer"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                transition={{ type: "spring", stiffness: 350, damping: 25 }}
                onClick={(e) => e.stopPropagation()}
                className="gpu-accelerated relative max-w-5xl w-full bg-[#1c1510] rounded-3xl overflow-hidden border border-white/25 shadow-[0_25px_80px_rgba(0,0,0,0.9)] max-h-[90vh] flex flex-col justify-between"
              >
                <button
                  onClick={() => setLightboxImg(null)}
                  className="absolute top-3.5 right-3.5 sm:top-4 sm:right-4 w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-black/75 hover:bg-black text-white border border-white/30 flex items-center justify-center z-30 transition-all active:scale-90"
                  aria-label="Close Preview"
                >
                  <XIcon className="w-6 h-6" />
                </button>
                <div className="aspect-[16/10] sm:aspect-[16/9] bg-black flex items-center justify-center overflow-hidden">
                  <img src={lightboxImg.src} alt={lightboxImg.title} className="w-full h-full object-contain max-h-[70vh]" />
                </div>
                <div className="p-5 sm:p-8 bg-gradient-to-r from-[#241d18] to-[#1c1510] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 border-t border-white/10">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-widest text-accent mb-0.5 block">{lightboxImg.category}</span>
                    <h3 className="text-xl sm:text-3xl font-extrabold text-white" style={{ fontFamily: 'var(--font-display)' }}>{lightboxImg.title}</h3>
                  </div>
                  <button
                    onClick={() => { setLightboxImg(null); router.push('/menu'); }}
                    className="w-full sm:w-auto justify-center px-6 py-3.5 rounded-2xl bg-accent hover:bg-accent/90 text-white font-extrabold text-sm transition-all shadow-lg flex items-center gap-2 active:scale-95"
                  >
                    <span>Experience in Cafe</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </section>

      {/* Categories Marquee */}
      <section className="py-16 sm:py-20 bg-gradient-to-b from-primary via-[#452f20] to-primary overflow-hidden relative">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/15 via-transparent to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10 sm:mb-12 text-center relative z-10">
          <span className="text-accent font-extrabold text-xs tracking-widest uppercase mb-2 block">100% Pure Vegetarian Offerings</span>
          <h2 className="text-2xl sm:text-4xl font-black text-white tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>Explore by Culinary Specialty</h2>
        </div>

        {/* Marquee Track with Gradient Fade on Edges */}
        <div className="relative w-full overflow-hidden flex z-10">
          <div className="absolute left-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-r from-primary to-transparent z-20 pointer-events-none" />
          <div className="absolute right-0 top-0 bottom-0 w-12 sm:w-20 bg-gradient-to-l from-primary to-transparent z-20 pointer-events-none" />

          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marquee 38s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}} />

          <div className="marquee-track gap-5 sm:gap-8 py-4">
            {[...CATEGORIES, ...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <button
                key={cat.name + i}
                onClick={() => router.push(`/menu?category=${encodeURIComponent(cat.name)}`)}
                className="gpu-accelerated flex flex-col items-center gap-3 sm:gap-4 p-5 sm:p-6 rounded-3xl bg-white/5 hover:bg-white/15 active:bg-white/20 active:scale-95 active:border-accent backdrop-blur-md border border-white/10 hover:border-accent/50 group min-w-[155px] sm:min-w-[190px] flex-shrink-0 transition-all duration-300 hover:shadow-xl active:shadow-2xl active:shadow-accent/30 hover:shadow-accent/20 hover:-translate-y-1 active:-translate-y-0.5"
              >
                <div className="w-18 h-18 sm:w-22 sm:h-22 rounded-3xl bg-white/10 flex items-center justify-center text-4xl sm:text-5xl group-hover:bg-accent group-active:bg-accent group-hover:scale-110 group-active:scale-110 transition-all duration-300 shadow-md">
                  {cat.emoji}
                </div>
                <span className="text-sm sm:text-base font-extrabold text-white tracking-wide group-hover:text-accent group-active:text-accent transition-colors">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About Section */}
      <section className="py-20 sm:py-28 bg-secondary/20 relative" id="about">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 sm:gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true, margin: "-50px" }} transition={{ duration: 0.6 }}>
              <span className="inline-flex items-center gap-1.5 text-accent font-extrabold text-xs tracking-widest uppercase bg-accent/15 px-3.5 py-1.5 rounded-full border border-accent/20 mb-3 sm:mb-4">
                <Coffee className="w-3.5 h-3.5" /> Our Heritage
              </span>
              <h2 className="text-3xl sm:text-5xl font-extrabold mt-2 mb-5 text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
                A Sanctuary for Everyone,<br />Crafted with Care.
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-5 sm:mb-6 whitespace-pre-line text-sm sm:text-base font-normal">
                {settings?.description || "Welcome to One Folk Cafe, a cozy destination where great coffee, delicious food, and memorable conversations come together.\nAs a 100% Pure Veg cafe, we take immense pride in offering a warm and inviting atmosphere designed for everyone."}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8 text-sm sm:text-base">
                We focus strictly on premium pure veg ingredients, handcrafted beverages, attentive hospitality, and an uplifting interior aesthetic that turns casual visits into lasting community memories. Come for the espresso — stay for the folk.
              </p>

              <div className="grid grid-cols-2 gap-6 pt-4 border-t border-border/60">
                <div>
                  <span className="text-3xl font-black text-primary dark:text-accent block">100%</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Pure Vegetarian</span>
                </div>
                <div>
                  <span className="text-3xl font-black text-primary dark:text-accent block">Nashik</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Loved Local Destination</span>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30, scale: 0.95 }}
              whileInView={{ opacity: 1, x: 0, scale: 1 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, ease: [0.25, 0.1, 0.25, 1] }}
              className="gpu-accelerated relative group mt-4 sm:mt-0 active:scale-[0.99] transition-transform duration-300"
            >
              <div className="absolute -inset-4 bg-gradient-to-tr from-accent/30 via-[#d99752]/20 to-primary/10 rounded-[40px] blur-2xl opacity-60 group-hover:opacity-100 group-active:opacity-100 transition-opacity duration-700 pointer-events-none" />

              <div className="relative aspect-[4/5] rounded-3xl overflow-hidden bg-secondary border-2 border-border/80 shadow-[0_20px_60px_rgba(0,0,0,0.12)]">
                <img
                  src={settings?.ourStoryImage || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&h=875&fit=crop&auto=format"}
                  alt="One Folk Cafe atmosphere"
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 group-active:scale-105 transition-transform duration-700 ease-out"
                />
              </div>

              {/* Floating Quality Badge */}
              <div className="absolute -bottom-5 sm:-bottom-6 left-4 sm:-left-6 bg-white dark:bg-[#241d18] p-4 sm:p-5 rounded-3xl border border-border shadow-2xl flex items-center gap-3.5 sm:gap-4 max-w-[280px] sm:max-w-xs z-20">
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-green-500/20 flex items-center justify-center text-green-500 flex-shrink-0 group-active:scale-110 transition-transform duration-300">
                  <Leaf className="w-6 h-6" />
                </div>
                <div>
                  <h5 className="font-extrabold text-sm leading-tight text-foreground">100% Pure Veg Promise</h5>
                  <p className="text-[11px] text-muted-foreground mt-0.5">Fresh hygiene & zero compromise.</p>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Interactive Games Section */}
      <GamesSection />

      {/* Contact & Map Location */}
      <section className="py-20 sm:py-28 bg-secondary/10 relative z-10" id="contact">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-1 text-accent font-extrabold text-xs tracking-widest uppercase bg-accent/15 px-4 py-1.5 rounded-full border border-accent/20 mb-3">
              <MapPin className="w-3.5 h-3.5" /> Find Our Refuge
            </span>
            <h2 className="text-3xl sm:text-5xl font-black text-foreground tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              Visit One Folk Cafe
            </h2>
            <p className="text-muted-foreground mt-2.5 max-w-md mx-auto text-sm sm:text-base font-normal px-2">
              We'd be delighted to host you. Step inside our vibrant Nashik destination.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 items-start">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="lg:col-span-5 bg-card dark:bg-[#241d18] rounded-3xl border border-border/70 dark:border-white/10 shadow-lg p-6 sm:p-10 space-y-7 sm:space-y-8"
            >
              <div className="flex items-center gap-4 pb-5 sm:pb-6 border-b border-border/60">
                <div className="w-13 h-13 sm:w-14 sm:h-14 rounded-2xl bg-gradient-to-br from-accent to-[#d99752] flex items-center justify-center shadow-md shadow-accent/20 flex-shrink-0">
                  <Coffee className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
                </div>
                <div>
                  <div className="font-extrabold text-lg sm:text-xl text-foreground" style={{ fontFamily: 'var(--font-display)' }}>
                    {settings?.cafeName || "One Folk Cafe"}
                  </div>
                  <div className="text-[11px] sm:text-xs font-semibold text-accent uppercase tracking-wider mt-0.5">
                    Where Every Cup Brings People Together
                  </div>
                </div>
              </div>

              <div className="space-y-5 sm:space-y-6">
                {[
                  { icon: <MapPin className="w-5 h-5" />, label: "Location Address", value: settings?.address || "One Folk Cafe, Nashik, Maharashtra" },
                  { icon: <Phone className="w-5 h-5" />, label: "Direct Phone", value: settings?.phone || "+91 00000 00000" },
                  { icon: <Mail className="w-5 h-5" />, label: "Email Correspondence", value: settings?.email || "hello@onefolkcafe.in" },
                  { icon: <Clock className="w-5 h-5" />, label: "Daily Opening Hours", value: settings?.openTime ? `Mon–Sun: ${formatTimeLabel(settings.openTime)} – ${formatTimeLabel(settings.closeTime)}` : "Mon–Sun: 10:00 AM – 11:00 PM (Daily)" },
                ].map(item => (
                  <div key={item.label} className="flex gap-4 items-start group">
                    <div className="w-11 h-11 rounded-2xl bg-accent/15 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-white transition-colors duration-300 flex-shrink-0 mt-0.5">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-[11px] text-muted-foreground font-bold uppercase tracking-wider mb-1">{item.label}</div>
                      <div className="text-sm font-bold text-foreground whitespace-pre-line leading-snug">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-border/50">
                <a
                  href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:flex-1 flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 rounded-2xl bg-gradient-to-r from-primary to-[#7a553b] text-white font-extrabold text-sm transition-all duration-300 shadow-lg active:scale-[0.98]"
                >
                  <MapPin className="w-4.5 h-4.5 text-accent flex-shrink-0" />
                  <span>Open in Google Maps</span>
                </a>

                {settings?.instagramLink && (
                  <a
                    href={settings.instagramLink}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-4 sm:py-3.5 rounded-2xl bg-secondary hover:bg-red-500 hover:text-white text-foreground font-bold text-sm transition-all duration-300 border border-border/60 shadow-sm active:scale-[0.98]"
                  >
                    <Heart className="w-4.5 h-4.5 text-red-500 hover:text-white transition-colors flex-shrink-0" />
                    <span>Instagram</span>
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="lg:col-span-7 rounded-3xl overflow-hidden border-2 border-border/80 dark:border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.1)] h-[440px] sm:h-[560px] relative group"
            >
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.8!2d73.83385!3d20.02296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb006e29c58f%3A0xdf5a50b4a51aef7a!2sOne%20Folk%20Cafe!5e0!3m2!1sen!2sin!4v1"
                width="100%"
                height="100%"
                style={{ border: 0 }}
                loading="lazy"
                allowFullScreen
                referrerPolicy="no-referrer-when-downgrade"
                title="One Folk Cafe Location"
                className="absolute inset-0 filter saturate-[1.1]"
              />
              <div className="absolute top-4 left-4 sm:top-6 sm:left-6 pointer-events-none">
                <span className="px-3.5 py-1.5 sm:px-4 sm:py-2 rounded-2xl bg-black/80 backdrop-blur-md text-white font-extrabold text-[11px] sm:text-xs tracking-wider uppercase border border-white/20 shadow-xl flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-green-400 animate-ping" /> Live Map Guidance
                </span>
              </div>
              <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6">
                <a
                  href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427"
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-4 rounded-2xl bg-white/95 dark:bg-[#1a1512]/95 backdrop-blur-xl text-primary dark:text-white font-extrabold text-xs sm:text-sm shadow-2xl border border-white/30 hover:bg-accent hover:text-white dark:hover:bg-accent dark:hover:text-white transition-all duration-300 active:scale-[0.98]"
                >
                  <MapPin className="w-4.5 h-4.5 sm:w-5 sm:h-5 text-accent group-hover:text-white transition-colors flex-shrink-0" />
                  <span className="truncate">Get Driving Directions to One Folk Cafe</span>
                  <ArrowUpRight className="w-4 h-4 flex-shrink-0" />
                </a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
