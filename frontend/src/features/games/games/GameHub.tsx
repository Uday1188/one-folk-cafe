'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Zap, HelpCircle } from 'lucide-react';
import { GameShell } from '../components/GameShell';

// --- Mini Games ---

const QuickReaction = ({ onBack }: { onBack: () => void }) => {
  const [state, setState] = useState<'waiting' | 'ready' | 'done'>('waiting');
  const [startTime, setStartTime] = useState<number>(0);
  const [reactionTime, setReactionTime] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (state !== 'waiting' || isPaused) return;
    const delay = 2000 + Math.random() * 3000;
    const timeout = setTimeout(() => {
      setState('ready');
      setStartTime(Date.now());
    }, delay);
    return () => clearTimeout(timeout);
  }, [state, isPaused]);

  const handleTap = () => {
    if (isPaused) return;
    if (state === 'waiting') {
      setState('waiting');
    } else if (state === 'ready') {
      setReactionTime(Date.now() - startTime);
      setState('done');
    }
  };

  const leaveGame = () => {
    setIsPaused(false);
    onBack();
  };

  return (
    <GameShell
      theme="light"
      title="Quick Reaction"
      isPaused={isPaused}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      onLeave={leaveGame}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center w-full h-full relative touch-none"
           style={{ touchAction: 'none' }}
           onPointerDown={handleTap}>
        
        {state === 'waiting' && <p className="text-2xl text-[#2c1d11]/50 font-bold tracking-widest animate-pulse">Wait for it...</p>}
        
        {state === 'ready' && (
          <div className="w-full max-w-[280px] sm:max-w-[340px] aspect-square rounded-full bg-accent flex items-center justify-center shadow-[0_0_100px_rgba(198,134,66,0.3)] active:scale-95 transition-transform pointer-events-none">
            <span className="text-4xl sm:text-5xl font-black text-white tracking-widest uppercase">Tap Now</span>
          </div>
        )}

        {state === 'done' && (
          <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="flex flex-col items-center pointer-events-auto z-20">
            <p className="text-6xl sm:text-8xl font-black text-[#2c1d11] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{reactionTime} <span className="text-xl sm:text-3xl">ms</span></p>
            <p className="text-accent text-sm sm:text-base font-bold uppercase tracking-widest mb-12">
              {reactionTime! < 200 ? 'Lightning Fast' : reactionTime! < 350 ? 'Excellent Reaction' : 'Good Try'}
            </p>
            <button 
              onClick={(e) => { e.stopPropagation(); setState('waiting'); setReactionTime(null); }} 
              className="px-8 py-4 sm:px-10 sm:py-5 bg-black/5 rounded-full text-[#2c1d11] font-bold active:scale-95 transition-transform hover:bg-black/10 text-lg"
            >
              Try Again
            </button>
          </motion.div>
        )}
      </div>
    </GameShell>
  );
};

const LuckyCup = ({ onBack }: { onBack: () => void }) => {
  const [cups, setCups] = useState([0, 1, 2]);
  const [hasBean, setHasBean] = useState(1);
  const [state, setState] = useState<'idle' | 'shuffling' | 'revealed'>('idle');
  const [selected, setSelected] = useState<number | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  const startShuffle = () => {
    setState('shuffling');
    setHasBean(Math.floor(Math.random() * 3));
    let shuffles = 0;
    const interval = setInterval(() => {
      setCups(prev => [...prev].sort(() => Math.random() - 0.5));
      shuffles++;
      if (shuffles > 15) {
        clearInterval(interval);
        setState('idle');
      }
    }, 150);
  };

  const handleSelect = (idx: number) => {
    if (state !== 'idle' || isPaused) return;
    setSelected(idx);
    setState('revealed');
  };

  const leaveGame = () => {
    setIsPaused(false);
    onBack();
  };

  return (
    <GameShell
      theme="light"
      title="Lucky Cup"
      isPaused={isPaused}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      onLeave={leaveGame}
    >
      <div className="flex-1 flex flex-col items-center justify-center p-6 w-full h-full relative">
        <h3 className="text-2xl sm:text-4xl font-black text-[#2c1d11] mb-16 sm:mb-24" style={{ fontFamily: 'var(--font-display)' }}>
          {state === 'revealed' ? (selected === hasBean ? 'You found it!' : 'Not this one.') : 'Where is the bean?'}
        </h3>

        <div className="flex gap-4 sm:gap-12 relative h-40 sm:h-56 items-end justify-center w-full max-w-2xl mx-auto">
          <AnimatePresence>
            {cups.map((cupId, index) => (
              <motion.div 
                key={cupId}
                layout
                transition={{ type: "spring", stiffness: 300, damping: 20 }}
                onClick={() => handleSelect(index)}
                className="relative w-24 h-32 sm:w-32 sm:h-44 flex flex-col items-center justify-end cursor-pointer"
              >
                {/* The Bean underneath */}
                {(state === 'revealed' && index === hasBean) && (
                  <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} className="absolute bottom-4 w-12 h-16 sm:w-16 sm:h-24 bg-gradient-to-br from-[#5a3e2b] to-[#2c1d13] rounded-full z-0" />
                )}
                
                {/* The Cup */}
                <motion.div 
                  animate={{ y: (state === 'revealed' && (index === selected || index === hasBean)) ? (window.innerWidth > 640 ? -120 : -90) : 0 }}
                  className="w-full h-full bg-gradient-to-b from-[#f0ebe1] to-[#d6c7b0] rounded-b-3xl rounded-t-sm border-b-4 border-[#c5b59f] z-10 shadow-[0_10px_20px_rgba(0,0,0,0.3)]"
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {(state === 'revealed' || state === 'idle' && selected === null) && (
          <button onClick={startShuffle} className="mt-20 sm:mt-24 px-8 py-4 sm:px-10 sm:py-5 bg-accent rounded-full text-white font-bold text-lg active:scale-95 transition-transform shadow-lg shadow-accent/20">
            {state === 'revealed' ? 'Play Again' : 'Shuffle Cups'}
          </button>
        )}
      </div>
    </GameShell>
  );
};

// --- Hub ---

const HUB_GAMES = [
  { id: 'reaction', title: 'Quick Reaction', icon: <Zap className="w-6 h-6 sm:w-8 sm:h-8" />, desc: 'Test your reflexes.' },
  { id: 'lucky', title: 'Lucky Cup', icon: <HelpCircle className="w-6 h-6 sm:w-8 sm:h-8" />, desc: 'Find the hidden bean.' },
];

export function GameHub({ onBack }: { onBack?: () => void }) {
  const [activeMini, setActiveMini] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(false);

  if (activeMini === 'reaction') return <QuickReaction onBack={() => setActiveMini(null)} />;
  if (activeMini === 'lucky') return <LuckyCup onBack={() => setActiveMini(null)} />;

  const leaveHub = () => {
    setIsPaused(false);
    if (onBack) onBack();
  };

  return (
    <GameShell
      theme="light"
      title="Your Choice"
      isPaused={isPaused}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      onLeave={leaveHub}
    >
      <div className="flex-1 p-6 sm:p-10 flex flex-col items-center justify-center relative w-full h-full">
        <h2 className="text-3xl sm:text-5xl font-black text-[#2c1d11] mb-8 sm:mb-12 text-center" style={{ fontFamily: 'var(--font-display)' }}>Choose Your Moment</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6 w-full max-w-3xl">
          {HUB_GAMES.map(game => (
            <motion.button
              key={game.id}
              whileTap={{ scale: 0.95 }}
              onClick={() => setActiveMini(game.id)}
              className="flex items-center gap-4 sm:gap-6 p-6 sm:p-8 bg-white border border-black/5 rounded-3xl hover:bg-black/5 active:bg-black/10 transition-colors text-left shadow-sm hover:shadow-md"
            >
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-accent/20 text-accent flex items-center justify-center flex-shrink-0">
                {game.icon}
              </div>
              <div>
                <h4 className="font-bold text-[#2c1d11] text-lg sm:text-xl">{game.title}</h4>
                <p className="text-[#2c1d11]/60 text-sm sm:text-base mt-1 sm:mt-2">{game.desc}</p>
              </div>
            </motion.button>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
