'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, Sparkles } from 'lucide-react';
import dynamic from 'next/dynamic';
import { GameModal } from './GameModal';

// Lazy loaded game engines
const CoffeeCatch = dynamic(() => import('../games/CoffeeCatch').then(mod => mod.CoffeeCatch), {
  loading: () => <div className="flex-1 flex items-center justify-center text-[#2c1d11]/50 font-bold">Loading Experience...</div>,
  ssr: false
});

const PizzaBuilder = dynamic(() => import('../games/PizzaBuilder').then(mod => mod.PizzaBuilder), {
  loading: () => <div className="flex-1 flex items-center justify-center text-[#2c1d11]/50 font-bold">Preparing Ingredients...</div>,
  ssr: false
});

const GameHub = dynamic(() => import('../games/GameHub').then(mod => mod.GameHub), {
  loading: () => <div className="flex-1 flex items-center justify-center text-[#2c1d11]/50 font-bold">Loading Challenges...</div>,
  ssr: false
});

const GAMES = [
  {
    id: 'coffee-catch',
    title: 'Coffee Catch',
    category: '☕ Quick Game',
    image: 'https://images.unsplash.com/photo-1497935586351-b67a49e012bf?q=80&w=800&auto=format&fit=crop',
    description: 'Catch the right ingredients to brew the perfect cup. Watch out for the green ones!'
  },
  {
    id: 'pizza-builder',
    title: 'Pizza Builder',
    category: '🍕 Creative',
    image: 'https://images.unsplash.com/photo-1604382354936-07c5d9983bd3?q=80&w=800&auto=format&fit=crop',
    description: 'Customize your slice with premium ingredients in our interactive Pizza Lab.'
  },
  {
    id: 'game-hub',
    title: 'Your Choice',
    category: '🎮 Challenges',
    image: 'https://images.unsplash.com/photo-1559925393-8be0ec4767c8?q=80&w=800&auto=format&fit=crop',
    description: 'Test your reflexes and memory in our collection of quick cafe challenges.'
  }
];

export function GamesSection() {
  const [activeGame, setActiveGame] = useState<string | null>(null);

  const getActiveGameTitle = () => {
    return GAMES.find(g => g.id === activeGame)?.title || 'Experience';
  };

  return (
    <section className="py-24 sm:py-32 relative z-10 overflow-hidden bg-[#241d18]">
      
      {/* Premium Animated Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#3a2a20] via-[#241d18] to-[#1a1512]" />
        
        {/* Floating Ambient Orbs */}
        <motion.div 
          animate={{ y: [0, -20, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-20 -left-20 w-96 h-96 bg-accent/20 rounded-full blur-[100px]" 
        />
        <motion.div 
          animate={{ y: [0, 20, 0], opacity: [0.2, 0.4, 0.2] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-40 -right-20 w-80 h-80 bg-[#c68642]/20 rounded-full blur-[100px]" 
        />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header */}
        <div className="text-center mb-16 sm:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-2 text-accent font-extrabold text-xs tracking-[0.2em] uppercase bg-accent/10 px-5 py-2 rounded-full border border-accent/20 mb-6 backdrop-blur-md">
              <Sparkles className="w-4 h-4" /> Interactive
            </span>
            <h2 className="text-4xl sm:text-6xl font-black text-white tracking-tight mb-6" style={{ fontFamily: 'var(--font-display)' }}>
              TAKE A LITTLE BREAK
            </h2>
            <p className="text-white/60 max-w-lg mx-auto text-base sm:text-lg font-medium leading-relaxed">
              A little coffee. A little fun. <br className="hidden sm:block" />
              Play while you enjoy One Folk Cafe.
            </p>
          </motion.div>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 lg:gap-10">
          {GAMES.map((game, i) => (
            <motion.div
              key={game.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-40px" }}
              transition={{ duration: 0.6, delay: i * 0.15 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setActiveGame(game.id)}
              className="group cursor-pointer bg-white/5 backdrop-blur-xl rounded-[2.5rem] overflow-hidden border border-white/10 shadow-[0_8px_32px_rgba(0,0,0,0.3)] hover:shadow-[0_20px_50px_rgba(198,134,66,0.15)] transition-all duration-500 flex flex-col hover:-translate-y-2 hover:border-accent/40"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img 
                  src={game.image} 
                  alt={game.title} 
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 ease-out"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1a1512] via-[#1a1512]/40 to-transparent opacity-90 group-hover:opacity-80 transition-opacity duration-300" />
                
                <div className="absolute top-5 left-5">
                  <span className="px-4 py-2 rounded-full bg-black/40 backdrop-blur-md text-[10px] font-black text-white uppercase tracking-widest border border-white/10 shadow-lg">
                    {game.category}
                  </span>
                </div>
              </div>

              <div className="p-8 flex flex-col flex-1 relative z-10 bg-gradient-to-b from-[#1a1512] to-transparent">
                <h3 className="font-extrabold text-2xl mb-3 text-white group-hover:text-accent transition-colors duration-300" style={{ fontFamily: 'var(--font-display)' }}>
                  {game.title}
                </h3>
                <p className="text-white/50 text-sm leading-relaxed mb-8 flex-1">
                  {game.description}
                </p>

                <div className="flex items-center justify-between text-accent font-bold text-sm uppercase tracking-widest group-hover:translate-x-2 transition-transform duration-300">
                  <span>Play Now</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <GameModal 
        isOpen={!!activeGame} 
        onClose={() => setActiveGame(null)} 
        title={getActiveGameTitle()}
      >
        {activeGame === 'coffee-catch' && <CoffeeCatch onBack={() => setActiveGame(null)} />}
        {activeGame === 'pizza-builder' && <PizzaBuilder onBack={() => setActiveGame(null)} />}
        {activeGame === 'game-hub' && <GameHub onBack={() => setActiveGame(null)} />}
      </GameModal>
    </section>
  );
}
