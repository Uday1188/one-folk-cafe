'use client';
import { motion } from 'framer-motion';
import { Coffee, ArrowRight } from 'lucide-react';
import Link from 'next/link';

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-6 max-w-md">
        
        <div className="w-20 h-20 rounded-3xl bg-accent/10 flex items-center justify-center mx-auto mb-2">
          <Coffee className="w-10 h-10 text-accent" />
        </div>
        
        <h1 className="text-4xl font-bold font-display text-foreground">Thank You!</h1>
        
        <p className="text-muted-foreground text-lg leading-relaxed">
          Thanks for visiting One Folk Cafe. We hope you enjoyed your time and look forward to serving you again soon!
        </p>

        <div className="pt-4">
          <Link href="/" className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all">
            Back to Home <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
