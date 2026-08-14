import { Metadata } from 'next';
import HomeClient from './HomeClient';

export const metadata: Metadata = {
  title: 'One Folk Cafe | Cafe & Coffee Shop in Nashik',
  description: 'Welcome to One Folk Cafe, a premier cafe in Nashik offering 100% pure vegetarian gourmet food, artisanal coffee, and a cozy atmosphere. Order online or visit us.',
  alternates: {
    canonical: '/',
  },
};

export default function HomePage() {
  return <HomeClient />;
}
