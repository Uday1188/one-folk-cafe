'use client';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle, RotateCcw } from 'lucide-react';
import { GameShell } from '../components/GameShell';

const INGREDIENTS = [
  { id: 'tomato', label: 'Tomato' },
  { id: 'mozzarella', label: 'Mozzarella' },
  { id: 'basil', label: 'Basil' },
  { id: 'mushroom', label: 'Mushroom' },
  { id: 'olive', label: 'Olive' },
  { id: 'capsicum', label: 'Capsicum' },
  { id: 'onion', label: 'Onion' },
  { id: 'jalapeno', label: 'Jalapeño' },
];

interface PlacedIngredient {
  id: string;
  type: string;
  targetX: number;
  targetY: number;
  startX: number;
  startY: number;
  rotation: number;
  scale: number;
}

// Hyper-Realistic SVG Components
const Tomato = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-md overflow-visible">
    <circle cx="50" cy="50" r="45" fill="#d32f2f" />
    <circle cx="50" cy="50" r="38" fill="#b71c1c" />
    <path d="M50 12 A38 38 0 0 1 88 50 A 38 38 0 0 1 50 88 A 38 38 0 0 1 12 50 A 38 38 0 0 1 50 12" fill="none" stroke="#d32f2f" strokeWidth="4" />
    <line x1="50" y1="12" x2="50" y2="88" stroke="#d32f2f" strokeWidth="4" />
    <line x1="12" y1="50" x2="88" y2="50" stroke="#d32f2f" strokeWidth="4" />
    <ellipse cx="30" cy="30" rx="3" ry="5" fill="#fbc02d" transform="rotate(45 30 30)" />
    <ellipse cx="70" cy="30" rx="3" ry="5" fill="#fbc02d" transform="rotate(-45 70 30)" />
    <ellipse cx="30" cy="70" rx="3" ry="5" fill="#fbc02d" transform="rotate(-45 30 70)" />
    <ellipse cx="70" cy="70" rx="3" ry="5" fill="#fbc02d" transform="rotate(45 70 70)" />
  </svg>
);

const Mozzarella = () => (
  <svg viewBox="0 0 100 100" className="w-12 h-12 drop-shadow-md overflow-visible">
    <path d="M30 20 C 50 5, 80 15, 85 45 C 90 75, 70 95, 45 85 C 15 75, 5 45, 30 20 Z" fill="#fff9ec" />
    <path d="M30 20 C 50 5, 80 15, 85 45 C 90 75, 70 95, 45 85 C 15 75, 5 45, 30 20 Z" fill="none" stroke="#f0ebe1" strokeWidth="3" />
  </svg>
);

const Basil = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md overflow-visible">
    <path d="M50 10 C 80 30, 90 70, 50 95 C 10 70, 20 30, 50 10 Z" fill="#2e7d32" />
    <path d="M50 10 Q 45 50, 50 95" fill="none" stroke="#4caf50" strokeWidth="2" />
    <path d="M50 30 Q 60 25, 65 20 M50 50 Q 65 40, 70 35 M50 70 Q 60 65, 65 60" fill="none" stroke="#4caf50" strokeWidth="1.5" />
    <path d="M50 30 Q 40 25, 35 20 M50 50 Q 35 40, 30 35 M50 70 Q 40 65, 35 60" fill="none" stroke="#4caf50" strokeWidth="1.5" />
  </svg>
);

const Mushroom = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-md overflow-visible">
    <path d="M42 50 L42 85 Q50 95 58 85 L58 50 Z" fill="#d7ccc8" />
    <path d="M15 50 C 15 10, 85 10, 85 50 Z" fill="#bcaaa4" />
    <path d="M15 50 Q 50 65 85 50 Z" fill="#8d6e63" />
    <path d="M25 50 Q 50 60 75 50" fill="none" stroke="#5d4037" strokeWidth="1.5" opacity="0.5" />
    <path d="M35 50 Q 50 55 65 50" fill="none" stroke="#5d4037" strokeWidth="1.5" opacity="0.5" />
  </svg>
);

const Olive = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm overflow-visible">
    <path d="M50 10 A 40 40 0 1 0 90 50 A 40 40 0 0 0 50 10 Z M50 35 A 15 15 0 1 1 35 50 A 15 15 0 0 1 50 35 Z" fill="#3e2723" fillRule="evenodd" />
  </svg>
);

const Capsicum = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-sm overflow-visible">
    <path d="M20 50 C 15 15, 85 15, 80 50 C 85 85, 15 85, 20 50" fill="none" stroke="#4caf50" strokeWidth="12" />
    <path d="M20 50 Q 30 30, 50 35 T 80 50 Q 70 70, 50 65 T 20 50" fill="none" stroke="#388e3c" strokeWidth="8" />
  </svg>
);

const Onion = () => (
  <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-sm overflow-visible">
    <circle cx="50" cy="50" r="40" fill="none" stroke="#ab47bc" strokeWidth="4" opacity="0.9" />
    <circle cx="50" cy="50" r="32" fill="none" stroke="#ce93d8" strokeWidth="3" opacity="0.7" />
    <circle cx="50" cy="50" r="24" fill="none" stroke="#ab47bc" strokeWidth="2" opacity="0.5" />
  </svg>
);

const Jalapeno = () => (
  <svg viewBox="0 0 100 100" className="w-8 h-8 drop-shadow-sm overflow-visible">
    <path d="M50 10 A 40 40 0 1 0 90 50 A 40 40 0 0 0 50 10 Z M50 30 A 20 20 0 1 1 30 50 A 20 20 0 0 1 50 30 Z" fill="#66bb6a" fillRule="evenodd" />
    <circle cx="43" cy="38" r="3.5" fill="#fdd835" />
    <circle cx="57" cy="42" r="3.5" fill="#fdd835" />
    <circle cx="42" cy="55" r="3.5" fill="#fdd835" />
    <circle cx="58" cy="58" r="3.5" fill="#fdd835" />
    <circle cx="50" cy="65" r="3.5" fill="#fdd835" />
  </svg>
);

export function PizzaBuilder({ onBack }: { onBack?: () => void }) {
  const [placed, setPlaced] = useState<PlacedIngredient[]>([]);
  const [isBaking, setIsBaking] = useState(false);
  const [isDone, setIsDone] = useState(false);
  const [score, setScore] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  
  const pizzaRef = useRef<HTMLDivElement>(null);

  const addIngredient = (type: string, e: React.MouseEvent<HTMLButtonElement>) => {
    if (!pizzaRef.current) return;
    
    const pizzaRect = pizzaRef.current.getBoundingClientRect();
    const buttonRect = e.currentTarget.getBoundingClientRect();
    
    // Calculate start position relative to the CENTER of the pizza container
    const pizzaRadiusX = pizzaRect.width / 2;
    const pizzaRadiusY = pizzaRect.height / 2;
    
    const startX = buttonRect.left - pizzaRect.left + (buttonRect.width / 2) - pizzaRadiusX;
    const startY = buttonRect.top - pizzaRect.top + (buttonRect.height / 2) - pizzaRadiusY;

    // Dynamically calculate valid radius to scatter toppings across the entire pizza surface
    const crustMargin = 30; // pixels to keep away from absolute edge
    const maxTargetRadius = Math.max(0, pizzaRadiusX - crustMargin);
    
    const angle = Math.random() * Math.PI * 2;
    const r = Math.sqrt(Math.random()) * maxTargetRadius; // Math.sqrt ensures uniform area distribution
    const targetX = r * Math.cos(angle);
    const targetY = r * Math.sin(angle);
    
    setPlaced(prev => [...prev, {
      id: Math.random().toString(),
      type,
      startX,
      startY,
      targetX,
      targetY,
      rotation: Math.random() * 360,
      scale: 0.9 + Math.random() * 0.3
    }]);
  };

  const undo = () => {
    setPlaced(prev => prev.slice(0, -1));
  };

  const startBaking = () => {
    setIsBaking(true);
    setTimeout(() => {
      setIsBaking(false);
      setIsDone(true);
      const types = new Set(placed.map(p => p.type)).size;
      const amount = placed.length;
      let finalScore = (types / 8) * 5 + Math.min(5, amount / 4);
      setScore(Number(finalScore.toFixed(1)));
    }, 4000); 
  };

  const leaveGame = () => {
    setIsPaused(false);
    if (onBack) onBack();
  };

  const IngredientShape = ({ type }: { type: string }) => {
    if (type === 'tomato') return <Tomato />;
    if (type === 'mozzarella') return <Mozzarella />;
    if (type === 'basil') return <Basil />;
    if (type === 'mushroom') return <Mushroom />;
    if (type === 'olive') return <Olive />;
    if (type === 'capsicum') return <Capsicum />;
    if (type === 'onion') return <Onion />;
    if (type === 'jalapeno') return <Jalapeno />;
    return null;
  };

  return (
    <GameShell
      theme="light"
      isPaused={isPaused}
      onPause={() => setIsPaused(true)}
      onResume={() => setIsPaused(false)}
      onLeave={leaveGame}
    >
      {/* Oven Glow Effect during baking */}
      <motion.div 
        animate={{ opacity: isBaking ? 0.8 : 0 }}
        className="absolute inset-0 bg-gradient-to-t from-[#ff9800]/40 to-transparent pointer-events-none z-10 mix-blend-overlay"
      />
      
      <div className="flex flex-col md:flex-row h-full relative z-20">
        
        {/* Header / Badges (Only visible during build phase) */}
        {!isDone && (
          <div className="absolute top-16 md:top-6 left-0 right-0 flex flex-col items-center pointer-events-none z-20">
            <div className="bg-white/80 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5 shadow-sm flex items-center gap-2 mb-2">
              <span className="text-xl">🍕</span>
              <span className="text-xs font-bold uppercase tracking-widest text-[#2c1d11]">Pizza Lab</span>
            </div>
            <p className="text-[#2c1d11]/60 text-sm font-medium">Select ingredients to build your perfect pizza</p>
          </div>
        )}

        {/* PIZZA AREA */}
        <div className="flex-1 md:flex-[1.5] lg:flex-[2] relative flex items-center justify-center p-4 pt-32 md:pt-16 min-h-[400px]">
          <motion.div 
            ref={pizzaRef}
            animate={isBaking ? { 
              rotate: 360, 
              scale: 0.95,
              filter: "brightness(0.9) contrast(1.1)"
            } : { rotate: 0, scale: 1 }}
            transition={isBaking ? { duration: 4, ease: "linear" } : { type: "spring" }}
            className="relative w-full max-w-[280px] sm:max-w-[380px] lg:max-w-[500px] aspect-square rounded-full shadow-[0_30px_60px_rgba(0,0,0,0.2)] bg-[#e6c280] border-[16px] sm:border-[20px] lg:border-[24px] border-[#cda052] flex items-center justify-center"
          >
            {/* Sauce Layer */}
            <div className="absolute inset-1 sm:inset-2 rounded-full bg-[#b71c1c] opacity-95 blur-[1px]" />
            
            {/* Base Cheese Layer */}
            <div className="absolute inset-2 sm:inset-4 rounded-full bg-gradient-to-br from-[#ffecb3] to-[#ffe082] opacity-90 blur-[2px]" />
            
            {/* Placed Ingredients */}
            <AnimatePresence>
              {placed.map((item) => (
                <motion.div
                  key={item.id}
                  initial={{ x: item.startX, y: item.startY, scale: 0.3, rotate: 0, opacity: 0.5 }}
                  animate={{ 
                    x: item.targetX, 
                    y: item.targetY, 
                    scale: item.scale, 
                    rotate: item.rotation,
                    opacity: 1
                  }}
                  exit={{ 
                    x: item.startX, 
                    y: item.startY, 
                    scale: 0, 
                    opacity: 0,
                    rotate: -180
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 250, 
                    damping: 20,
                    mass: 0.8
                  }}
                  className="absolute shadow-lg z-30"
                  style={{ filter: isBaking ? 'brightness(0.8) blur(0.5px)' : 'none' }}
                >
                  <IngredientShape type={item.type} />
                </motion.div>
              ))}
            </AnimatePresence>
            
            {/* Steam / Heat Effect */}
            {isBaking && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.8 }} 
                animate={{ opacity: 0.6, scale: 1.1 }} 
                transition={{ duration: 1, repeat: Infinity, repeatType: 'reverse' }}
                className="absolute inset-0 bg-white/40 rounded-full blur-2xl z-40 pointer-events-none" 
              />
            )}
          </motion.div>
        </div>

        {/* CONTROLS AREA */}
        <div className="md:w-[350px] lg:w-[400px] bg-white border-t md:border-t-0 md:border-l border-black/5 p-4 sm:p-6 md:p-8 flex flex-col justify-end md:justify-center shadow-[0_-10px_40px_rgba(0,0,0,0.05)] md:shadow-[-10px_0_40px_rgba(0,0,0,0.05)] z-30 relative pb-10 md:pb-8">
          <AnimatePresence mode="wait">
            
            {!isDone && !isBaking && (
              <motion.div key="build" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-full md:justify-center">
                <div className="flex justify-between items-end mb-4 px-2 md:px-0">
                  <div>
                    <h3 className="text-lg md:text-2xl font-bold text-[#2c1d11]">Ingredients</h3>
                    <p className="text-[#2c1d11]/60 text-xs md:text-sm mt-1">{placed.length} total added</p>
                  </div>
                  <div className="flex gap-2">
                    {placed.length > 0 && (
                      <button 
                        onClick={undo}
                        className="px-3 py-2 bg-black/5 text-[#2c1d11] rounded-xl text-sm font-bold flex items-center gap-1 active:scale-95 transition-transform hover:bg-black/10"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="overflow-x-auto md:overflow-y-auto md:overflow-x-hidden scrollbar-hide flex md:grid md:grid-cols-3 gap-3 pb-4 pt-2 -mx-4 px-6 sm:-mx-6 sm:px-8 md:mx-0 md:px-2 snap-x md:snap-none md:max-h-[50vh]">
                  {INGREDIENTS.map(ing => {
                    const count = placed.filter(p => p.type === ing.id).length;
                    const isActive = count > 0;
                    
                    return (
                      <button
                        key={ing.id}
                        onClick={(e) => addIngredient(ing.id, e)}
                        className={`relative flex-shrink-0 flex flex-col items-center justify-center gap-2 p-3 w-20 h-28 sm:w-24 sm:h-32 md:w-full md:h-28 rounded-2xl border-2 transition-all snap-start md:snap-align-none ${
                          isActive 
                            ? 'border-[#c68642] bg-[#fdfbf7] shadow-[0_10px_20px_rgba(198,134,66,0.15)] scale-105 z-10' 
                            : 'border-black/5 bg-black/[0.02] hover:bg-black/5 active:scale-95'
                        }`}
                      >
                        {isActive && (
                          <CheckCircle className="absolute -top-2 -right-2 w-5 h-5 text-[#c68642] fill-white drop-shadow-sm" />
                        )}
                        
                        <div className="flex-1 flex items-center justify-center transform transition-transform group-hover:scale-110">
                          <IngredientShape type={ing.id} />
                        </div>
                        
                        <div className="flex flex-col items-center">
                          <span className="text-[10px] sm:text-xs font-bold text-[#2c1d11]">{ing.label}</span>
                          {isActive ? (
                             <span className="text-[9px] text-[#c68642] font-black mt-0.5">ADDED ({count})</span>
                          ) : (
                             <span className="text-[9px] text-[#2c1d11]/40 font-bold mt-0.5 uppercase tracking-wider">+ Add</span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {placed.length > 0 && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-4 md:mt-8 flex justify-center">
                    <button 
                      onClick={startBaking}
                      className="w-full bg-accent py-4 rounded-2xl text-base font-bold text-white shadow-lg shadow-accent/20 active:scale-95 transition-all hover:bg-[#a66b2d]"
                    >
                      Bake Pizza
                    </button>
                  </motion.div>
                )}
              </motion.div>
            )}

            {isBaking && (
              <motion.div key="baking" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-10 md:py-20 flex flex-col items-center justify-center h-full">
                <h3 className="text-2xl md:text-3xl font-black text-accent animate-pulse" style={{ fontFamily: 'var(--font-display)' }}>Baking in the Oven...</h3>
              </motion.div>
            )}

            {isDone && (
              <motion.div key="done" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center py-6 flex flex-col items-center justify-center h-full">
                <h3 className="text-4xl font-black text-[#2c1d11] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Perfect Pizza</h3>
                <p className="text-[#2c1d11]/60 text-sm mb-6">Your culinary creation is ready.</p>
                
                <div className="flex justify-center gap-4 mb-8 w-full">
                  <div className="bg-black/5 px-4 py-4 rounded-2xl flex-1">
                    <p className="text-[#2c1d11]/60 text-[10px] font-bold uppercase tracking-wider mb-1">Ingredients</p>
                    <p className="text-2xl font-black text-[#2c1d11]">{placed.length}</p>
                  </div>
                  <div className="bg-[#c68642]/10 px-4 py-4 rounded-2xl border border-[#c68642]/20 flex-1">
                    <p className="text-[#c68642] text-[10px] font-bold uppercase tracking-wider mb-1">Creativity</p>
                    <p className="text-2xl font-black text-[#c68642]">{Math.min(100, Math.round((score / 10) * 100))}%</p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 w-full max-w-sm mx-auto">
                  <button 
                    onClick={() => { setPlaced([]); setIsDone(false); setScore(0); }}
                    className="w-full py-4 bg-accent text-white font-bold rounded-xl hover:bg-[#a66b2d] active:scale-95 transition-all shadow-lg shadow-accent/20"
                  >
                    Play Again
                  </button>
                  <button 
                    onClick={leaveGame}
                    className="w-full py-4 bg-black/5 border border-black/10 text-[#2c1d11] font-bold rounded-xl hover:bg-black/10 active:scale-95 transition-all"
                  >
                    Menu
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

      </div>
    </GameShell>
  );
}
