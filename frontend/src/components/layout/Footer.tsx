'use client';
import { Coffee, MapPin, Phone, Mail, Clock, ArrowUpRight, ChevronRight, Sparkles, Heart } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { fetchSettings } from '@/lib/api';

const formatTimeLabel = (time?: string) => {
  if (!time) return "";
  const [h, m] = time.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const hour12 = hour % 12 || 12;
  return `${hour12}:${m} ${ampm}`;
};

export function Footer() {
  const router = useRouter();
  
  const { data: settings } = useQuery({
    queryKey: ['settings'],
    queryFn: fetchSettings,
  });

  return (
    <footer className="bg-gradient-to-b from-[#3d2719] via-[#2c1b11] to-[#160d07] text-white relative overflow-hidden py-14 sm:py-20 border-t border-accent/20">
      {/* Decorative Radial Glowing Light Orb */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-3/4 h-[1px] bg-gradient-to-r from-transparent via-accent/60 to-transparent" />
      <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[500px] h-[250px] bg-accent/15 blur-[120px] rounded-full pointer-events-none" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10 sm:gap-12 mb-12 sm:mb-16">
          <div className="md:col-span-5 space-y-5 sm:space-y-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-accent to-[#d99752] flex items-center justify-center shadow-lg shadow-accent/20 flex-shrink-0">
                <Coffee className="w-6 h-6 text-white" />
              </div>
              <div>
                <span className="text-2xl font-bold tracking-tight block" style={{ fontFamily: 'var(--font-display)' }}>{settings?.cafeName || "One Folk Cafe"}</span>
                <span className="text-[11px] uppercase font-bold tracking-widest text-accent flex items-center gap-1">
                  <Sparkles className="w-3 h-3 flex-shrink-0" /> <span>Nashik's Finest • 100% Pure Veg</span>
                </span>
              </div>
            </div>
            <p className="text-white/75 text-sm leading-relaxed max-w-sm whitespace-pre-line font-normal">
              {settings?.description || "Where Every Cup Brings People Together. Premium coffee, pure veg delights, and a warm atmosphere — handcrafted with love in Nashik."}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              {settings?.instagramLink && (
                <a href={settings.instagramLink} target="_blank" rel="noreferrer"
                  className="inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-accent hover:scale-105 active:scale-95 text-xs font-bold text-white transition-all duration-300 shadow-md border border-white/15 group">
                  <Heart className="w-3.5 h-3.5 text-red-400 group-hover:text-white transition-colors" /> Follow on Instagram
                  <ArrowUpRight className="w-3 h-3 text-white/70 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </a>
              )}
              <a href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" target="_blank" rel="noreferrer"
                className="inline-flex items-center gap-2 px-5 py-3 sm:py-2.5 rounded-2xl bg-white/10 hover:bg-white/20 active:scale-95 text-xs font-semibold text-white/90 hover:text-white transition-all duration-300 border border-white/15">
                <MapPin className="w-3.5 h-3.5 text-accent flex-shrink-0" /> Find Location
              </a>
            </div>
          </div>

          <div className="md:col-span-3">
            <h5 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-accent mb-5 sm:mb-6">Explore Cafe</h5>
            <ul className="space-y-4 sm:space-y-3.5 text-sm text-white/75 font-semibold">
              {[
                { label: 'Home Experience', action: () => router.push('/') },
                { label: 'Digital Menu & Showcase', action: () => router.push('/menu') },
                { label: 'About Our Atmosphere', action: () => router.push('/#about') },
                { label: 'Location & Hours', action: () => router.push('/#contact') },
              ].map((link, idx) => (
                <li key={idx}>
                  <button 
                    onClick={link.action} 
                    className="group flex items-center gap-2.5 hover:text-accent font-semibold transition-all duration-200 active:translate-x-2 text-left"
                  >
                    <ChevronRight className="w-4 h-4 text-accent group-hover:translate-x-0.5 transition-transform duration-200 flex-shrink-0" />
                    <span>{link.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h5 className="font-extrabold text-xs sm:text-sm tracking-wider uppercase text-accent mb-5 sm:mb-6">Cafe Information</h5>
            <div className="space-y-4 text-sm text-white/80">
              <a href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" target="_blank" rel="noreferrer" 
                className="group flex items-start gap-3.5 p-3 rounded-2xl hover:bg-white/5 active:bg-white/10 transition-all -mx-3">
                <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-accent/20 group-hover:bg-accent flex items-center justify-center text-accent group-hover:text-white transition-colors flex-shrink-0 mt-0.5">
                  <MapPin className="w-5 h-5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase font-extrabold tracking-wider">Location</div>
                  <div className="font-semibold mt-0.5 group-hover:text-accent transition-colors">{settings?.address || "One Folk Cafe, Nashik, Maharashtra"}</div>
                </div>
              </a>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl -mx-3">
                <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-accent flex-shrink-0">
                  <Phone className="w-5 h-5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase font-extrabold tracking-wider">Direct Contact</div>
                  <div className="font-semibold mt-0.5">{settings?.phone || "+91 00000 00000"}</div>
                </div>
              </div>

              <div className="flex items-start gap-3.5 p-3 rounded-2xl -mx-3">
                <div className="w-10 h-10 sm:w-9 sm:h-9 rounded-xl bg-white/10 flex items-center justify-center text-accent flex-shrink-0">
                  <Clock className="w-5 h-5 sm:w-4.5 sm:h-4.5" />
                </div>
                <div>
                  <div className="text-xs text-white/60 uppercase font-extrabold tracking-wider">Opening Hours</div>
                  <div className="font-bold mt-0.5 text-green-400">
                    {settings?.openTime ? `${formatTimeLabel(settings.openTime)} – ${formatTimeLabel(settings.closeTime)}` : "10:00 AM – 11:00 PM"} Daily
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-white/60 font-semibold text-center sm:text-left">
          <div>
            <span>© 2026 One Folk Cafe. Handcrafted for coffee lovers.</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="opacity-80 font-normal">Staff / Cafe Owner?</span>
            <button 
              className="px-4 py-2 sm:py-1.5 rounded-xl bg-accent/25 text-accent hover:bg-accent hover:text-white font-bold transition-all shadow-sm flex items-center gap-1.5 group active:scale-95" 
              onClick={() => router.push('/admin/login')}
            >
              <span>Admin Dashboard</span>
              <ArrowUpRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
