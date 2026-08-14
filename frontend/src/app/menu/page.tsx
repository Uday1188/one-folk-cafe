import { Metadata } from 'next';
import MenuClient from './MenuClient';

export const metadata: Metadata = {
  title: 'Menu | Coffee, Pizza, Burgers & More',
  description: 'Explore the complete One Folk Cafe menu. Browse our handcrafted 100% pure vegetarian pizzas, artisanal coffees, refreshing beverages, and gourmet desserts in Nashik.',
  alternates: {
    canonical: '/menu',
  },
  openGraph: {
    title: 'One Folk Cafe Menu | Coffee, Pizza, Burgers & More',
    description: 'Explore the complete One Folk Cafe pure veg menu in Nashik.',
    url: '/menu',
    images: [
      {
        url: 'https://images.unsplash.com/photo-1590947132387-155cc02f3212?q=80&w=1200&auto=format&fit=crop',
        width: 1200,
        height: 630,
        alt: 'Gourmet pure veg pizza at One Folk Cafe',
      }
    ],
  },
};

export default function MenuPage() {
  return <MenuClient />;
}
