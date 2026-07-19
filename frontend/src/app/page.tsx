'use client';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ScanLine, Utensils, Users, ShoppingBag, ChefHat, ChevronRight, Plus, Heart, Phone, MapPin, Coffee, Clock, Mail, Leaf, LogOut } from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { CATEGORIES } from '@/lib/constants';
import { useQuery } from '@tanstack/react-query';
import { fetchProducts, fetchSettings } from '@/lib/api';
import { Product } from '@/types';

const formatTimeLabel = (time?: string) => {
  if (!time) return "";
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

export default function Home() {
  const router = useRouter();

  const { data: fetchedProducts } = useQuery({
    queryKey: ['products'],
    queryFn: fetchProducts,
  });

  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  const handleExplore = () => {
    router.push("/menu");
  };

  const products: Product[] = fetchedProducts ? fetchedProducts.map((p: any) => ({
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
  })) : [];

  const featured = settings?.featuredProductIds?.length 
    ? settings.featuredProductIds
        .map(id => products.find(p => p.id === id))
        .filter((p): p is Product => p !== undefined)
        .slice(0, 4)
    : products.slice(0, 4);

  const fmtPrice = (p: number) => `₹${p.toLocaleString("en-IN")}`;

  return (
    <div className="min-h-screen">
      <Navbar />
      {/* Hero */}
      <section className="relative min-h-screen flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-stone-900">
          <img
            src="https://images.unsplash.com/photo-1611323128401-faa8f1b6de24?w=1600&h=900&fit=crop&auto=format"
            alt="One Folk Cafe interior"
            className="w-full h-full object-cover opacity-50"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-stone-900/90 via-stone-900/60 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
          <div className="max-w-2xl">
            <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
              <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-500/20 border border-green-500/30 text-green-400 text-sm font-bold mb-6">
                <Leaf className="w-3.5 h-3.5" /> 100% Pure Veg Cafe
              </span>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-white leading-[1.1] mb-6">
                Where Every<br />
                <span className="text-accent italic">Sip</span> Tells a<br />
                Story
              </h1>
              <p className="text-lg text-white/70 leading-relaxed mb-8 max-w-lg">
                Explore our curated 100% pure veg menu, and enjoy freshly crafted food and beverages — prepared with care, exactly the way you like it.
              </p>
              <div className="flex flex-wrap gap-3">
                <button onClick={handleExplore}
                  className="flex items-center gap-2 px-7 py-3.5 rounded-2xl bg-accent text-white font-semibold text-base hover:bg-accent/90 transition-all hover:shadow-xl hover:shadow-accent/20 hover:-translate-y-0.5">
                  <Utensils className="w-4.5 h-4.5" /> Explore Menu
                </button>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* QR Ordering Explained */}
      <section className="py-24 bg-secondary/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="text-accent font-semibold text-sm tracking-wider uppercase">How It Works</span>
            <h2 className="text-4xl font-bold mt-2 text-foreground">Order in 3 Simple Steps</h2>
            <p className="text-muted-foreground mt-3 max-w-lg mx-auto">No waiting for a waiter. Browse, select, and savour.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: "01", icon: <Users className="w-8 h-8 text-accent" />, title: "Enter Your Details", desc: "Add some basic info like your name and mobile number before you begin." },
              { step: "02", icon: <ShoppingBag className="w-8 h-8 text-accent" />, title: "Browse & Order", desc: "Explore our full pure veg menu with photos and descriptions. Add items to your cart effortlessly." },
              { step: "03", icon: <ChefHat className="w-8 h-8 text-accent" />, title: "Enjoy Your Food", desc: "Your order goes straight to the kitchen. Track it live and we bring it to you, hot and fresh." },
            ].map((step, i) => (
              <motion.div key={step.step}
                initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.15, duration: 0.6 }}
                className="relative bg-card rounded-3xl p-8 shadow-sm border border-border hover:shadow-lg transition-shadow">
                <div className="absolute top-6 right-6 text-5xl font-black text-muted/40">{step.step}</div>
                <div className="w-14 h-14 rounded-2xl bg-accent/10 flex items-center justify-center mb-6">{step.icon}</div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-muted-foreground leading-relaxed text-sm">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="text-accent font-semibold text-sm tracking-wider uppercase">Fan Favourites</span>
              <h2 className="text-4xl font-bold mt-2">Most Loved Items</h2>
            </div>
            <button onClick={() => router.push("/menu")}
              className="flex items-center gap-1.5 text-sm font-semibold text-accent hover:underline">
              View all <ChevronRight className="w-4 h-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featured.map((p, i) => (
              <motion.div key={p.id} initial={{ opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.1, duration: 0.5 }}
                className="group bg-card rounded-3xl overflow-hidden shadow-sm border border-border hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                onClick={() => router.push("/menu")}>
                <div className="relative aspect-square bg-secondary overflow-hidden">
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  {p.tags && p.tags.filter(t => t !== "New").length > 0 && (
                    <div className="absolute top-3 right-3">
                      <span className="px-2 py-0.5 rounded-lg bg-white/90 backdrop-blur text-xs font-bold text-primary">
                        {p.tags.filter(t => t !== "New")[0]}
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-5">
                  <div className="text-xs text-accent font-semibold uppercase tracking-wider mb-1">{p.category}</div>
                  <h4 className="font-bold text-base leading-tight mb-1">{p.name}</h4>
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-black text-primary">{fmtPrice(p.price)}</span>
                    <button className="w-8 h-8 rounded-xl bg-accent text-white flex items-center justify-center hover:bg-accent/80 transition-colors">
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 bg-primary overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-10">
          <h2 className="text-3xl font-bold text-primary-foreground text-center">Explore by Category</h2>
        </div>

        {/* Marquee Wrapper */}
        <div className="relative w-full overflow-hidden flex">
          <style dangerouslySetInnerHTML={{
            __html: `
            @keyframes marquee {
              0% { transform: translateX(0); }
              100% { transform: translateX(-50%); }
            }
            .marquee-track {
              display: flex;
              width: max-content;
              animation: marquee 35s linear infinite;
            }
            .marquee-track:hover {
              animation-play-state: paused;
            }
          `}} />

          <div className="marquee-track gap-8 py-2">
            {[...CATEGORIES, ...CATEGORIES].map((cat, i) => (
              <button key={cat.name + i} onClick={() => router.push("/menu")}
                className="flex flex-col items-center gap-3.5 p-5 rounded-3xl bg-white/5 hover:bg-white/15 transition-all border border-white/5 hover:border-white/10 group min-w-[170px] flex-shrink-0">
                <div className="w-20 h-20 rounded-3xl bg-white/10 flex items-center justify-center text-5xl group-hover:bg-accent/20 group-hover:scale-105 transition-all duration-300">
                  {cat.emoji}
                </div>
                <span className="text-sm font-semibold text-white/95 tracking-wide">{cat.name}</span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section className="py-24 bg-secondary/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div initial={{ opacity: 0, x: -30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}>
              <span className="text-accent font-semibold text-sm tracking-wider uppercase">Our Story</span>
              <h2 className="text-4xl font-bold mt-2 mb-6">A Place for Everyone,<br />Crafted with Care</h2>
              <p className="text-muted-foreground leading-relaxed mb-5 whitespace-pre-line">
                {settings?.description || "Welcome to One Folk Cafe, a cozy destination where great coffee, delicious food, and memorable conversations come together.\nAs a 100% Pure Veg cafe, we take immense pride in offering a warm and inviting atmosphere designed for everyone."}
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                We focus on quality vegetarian ingredients, handcrafted drinks, excellent service, and a comfortable dining experience
                that makes every visit special. Come for the coffee — stay for the vibe.
              </p>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.7 }}
              className="relative">
              <div className="aspect-[4/5] rounded-3xl overflow-hidden bg-secondary">
                <img src={settings?.ourStoryImage || "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=700&h=875&fit=crop&auto=format"}
                  alt="One Folk Cafe atmosphere" className="w-full h-full object-cover" />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-24 bg-secondary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-accent font-semibold text-sm tracking-wider uppercase">Find Us</span>
            <h2 className="text-4xl font-bold mt-2">Visit One Folk Cafe</h2>
            <p className="text-muted-foreground mt-3 max-w-md mx-auto text-sm">We'd love to have you. Come find us in Nashik.</p>
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
            <motion.div initial={{ opacity: 0, x: -20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="bg-card rounded-3xl border border-border shadow-sm p-8 space-y-6">
              <div className="flex items-center gap-3 pb-5 border-b border-border">
                <div className="w-12 h-12 rounded-2xl bg-accent/10 flex items-center justify-center">
                  <Coffee className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <div className="font-bold text-lg">{settings?.cafeName || "One Folk Cafe"}</div>
                  <div className="text-xs text-muted-foreground">Where Every Cup Brings People Together</div>
                </div>
              </div>
              <div className="space-y-5">
                {[
                  { icon: <MapPin className="w-5 h-5" />, label: "Address", value: settings?.address || "One Folk Cafe, Nashik, Maharashtra" },
                  { icon: <Phone className="w-5 h-5" />, label: "Phone", value: settings?.phone || "+91 00000 00000" },
                  { icon: <Mail className="w-5 h-5" />, label: "Email", value: settings?.email || "hello@onefolkcafe.in" },
                  { icon: <Clock className="w-5 h-5" />, label: "Hours", value: settings?.openTime ? `Mon–Sun: ${formatTimeLabel(settings.openTime)} – ${formatTimeLabel(settings.closeTime)}` : "Mon–Sun: 10:00 AM – 11:00 PM" },
                ].map(item => (
                  <div key={item.label} className="flex gap-4">
                    <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent flex-shrink-0">
                      {item.icon}
                    </div>
                    <div>
                      <div className="text-xs text-muted-foreground font-semibold uppercase tracking-wider mb-0.5">{item.label}</div>
                      <div className="text-sm font-medium whitespace-pre-line">{item.value}</div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3 pt-2">
                <a href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" target="_blank" rel="noreferrer"
                  className="flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-accent text-white font-semibold text-sm hover:bg-accent/90 transition-all shadow-sm hover:shadow-md hover:-translate-y-0.5">
                  <MapPin className="w-4 h-4" /> Open in Google Maps
                </a>

                {settings?.instagramLink && (
                  <a href={settings.instagramLink} target="_blank" rel="noreferrer"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-secondary text-foreground font-medium text-sm hover:bg-secondary/80 transition-all border border-border">
                    <Heart className="w-4 h-4" /> Instagram
                  </a>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 20 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ duration: 0.6 }}
              className="rounded-3xl overflow-hidden border border-border shadow-sm h-[480px] relative">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3748.8!2d73.83385!3d20.02296!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3bddeb006e29c58f%3A0xdf5a50b4a51aef7a!2sOne%20Folk%20Cafe!5e0!3m2!1sen!2sin!4v1"
                width="100%" height="100%" style={{ border: 0 }} loading="lazy" allowFullScreen
                referrerPolicy="no-referrer-when-downgrade" title="One Folk Cafe Location"
                className="absolute inset-0"
              />
              <div className="absolute bottom-4 left-4 right-4">
                <a href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" target="_blank" rel="noreferrer"
                  className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl bg-white/90 backdrop-blur text-primary font-semibold text-sm shadow-lg hover:bg-white transition-all">
                  <MapPin className="w-4 h-4 text-accent" /> Get Directions to One Folk Cafe
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
