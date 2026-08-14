import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { Toaster } from "@/components/ui/sonner";
import { LocalBusinessSchema } from "@/components/seo/LocalBusinessSchema";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://onefolkcafe.in'),
  title: {
    template: "%s | One Folk Cafe",
    default: "One Folk Cafe | Cafe & Coffee Shop in Nashik",
  },
  description: "Visit One Folk Cafe in Nashik for freshly brewed coffee, pizzas, burgers, sandwiches, desserts and refreshing beverages. Explore our pure veg menu, cafe atmosphere and location.",
  keywords: ["One Folk Cafe", "Cafe in Nashik", "Coffee Shop Nashik", "Pure Veg Cafe", "Best Cafe Nashik"],
  openGraph: {
    title: "One Folk Cafe | Cafe & Coffee Shop in Nashik",
    description: "Visit One Folk Cafe in Nashik for freshly brewed coffee, pizzas, burgers, and refreshing beverages.",
    url: "/",
    siteName: "One Folk Cafe",
    images: [
      {
        url: "https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop",
        width: 1200,
        height: 630,
        alt: "Warm interior seating at One Folk Cafe",
      }
    ],
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "One Folk Cafe | Cafe in Nashik",
    description: "Visit One Folk Cafe in Nashik for freshly brewed coffee and premium pure veg food.",
    images: ["https://images.unsplash.com/photo-1554118811-1e0d58224f24?q=80&w=1200&auto=format&fit=crop"],
  },
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      data-scroll-behavior="smooth"
    >
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <LocalBusinessSchema />
        <Providers>{children}</Providers>
        <Toaster />
      </body>
    </html>
  );
}
