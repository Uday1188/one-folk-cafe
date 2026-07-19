'use client';
import { Coffee, MapPin, Phone, Mail, Clock } from 'lucide-react';
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
    <footer className="bg-primary text-primary-foreground py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-9 h-9 rounded-xl bg-accent flex items-center justify-center">
                <Coffee className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">{settings?.cafeName || "One Folk Cafe"}</span>
            </div>
            <p className="text-primary-foreground/60 text-sm leading-relaxed max-w-xs mb-5 whitespace-pre-line">
              {settings?.description || "Where Every Cup Brings People Together. Premium coffee, great food, and a warm atmosphere — all in Nashik."}
            </p>
            <div className="flex gap-2">
              {settings?.instagramLink && (
                <a href={settings.instagramLink} target="_blank" rel="noreferrer"
                  className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-accent/30 text-xs font-medium transition-colors">
                  Instagram
                </a>
              )}
            </div>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Quick Links</h5>
            <ul className="space-y-2.5 text-sm text-primary-foreground/60">
              <li><button onClick={() => router.push('/')} className="hover:text-accent transition-colors">Home</button></li>
              <li><button onClick={() => router.push('/menu')} className="hover:text-accent transition-colors">Menu</button></li>
              <li><button onClick={() => router.push('/menu')} className="hover:text-accent transition-colors">Order Now</button></li>
              <li><button onClick={() => router.push('/#about')} className="hover:text-accent transition-colors">About Us</button></li>
            </ul>
          </div>
          <div>
            <h5 className="font-semibold mb-4">Contact</h5>
            <ul className="space-y-2.5 text-sm text-primary-foreground/60">
              <li><a href="https://maps.app.goo.gl/Lmo6tdHUpUYa79427" target="_blank" rel="noreferrer" className="hover:text-accent transition-colors flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5 flex-shrink-0" /><span className="truncate">{settings?.address || "Nashik, Maharashtra"}</span></a></li>
              <li><span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 flex-shrink-0" />{settings?.phone || "+91 00000 00000"}</span></li>
              <li><span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 flex-shrink-0" />{settings?.email || "hello@onefolkcafe.in"}</span></li>
              <li><span className="flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 flex-shrink-0" />{settings?.openTime ? `${formatTimeLabel(settings.openTime)} – ${formatTimeLabel(settings.closeTime)}` : "10 AM – 11 PM"} Daily</span></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-white/10 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-primary-foreground/40">
          <span>© 2026 One Folk Cafe. All Rights Reserved.</span>
          <div className="flex items-center gap-1.5 text-primary-foreground">
            <span className="opacity-70">Admin?</span>
            <button className="text-accent dark:text-primary-foreground hover:underline font-bold" onClick={() => router.push('/admin/login')}>
              Login here
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
