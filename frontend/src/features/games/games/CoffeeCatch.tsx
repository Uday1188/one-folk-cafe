'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '../components/GameShell';

// --- Premium CSS Assets ---
const Cup = () => (
  <div className="relative w-20 h-24 sm:w-24 sm:h-28 mx-auto filter drop-shadow-[0_10px_20px_rgba(0,0,0,0.3)] pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[#f0ebe1] to-[#d6c7b0] rounded-b-3xl rounded-t-sm border-b-4 border-[#c5b59f]" />
    <div className="absolute -top-3 left-0 right-0 h-6 bg-gradient-to-r from-[#3a2517] to-[#1a100a] rounded-[50%] border-4 border-[#f0ebe1] shadow-inner flex items-center justify-center overflow-hidden">
      <div className="w-12 h-3 rounded-[50%] bg-[#c68642]/40 blur-sm mix-blend-screen animate-pulse" />
    </div>
    <div className="absolute top-6 -right-5 sm:top-8 sm:-right-6 w-6 h-10 sm:w-8 sm:h-12 border-[4px] sm:border-[5px] border-[#f0ebe1] border-l-0 rounded-r-2xl shadow-md" />
  </div>
);

const Bean = () => (
  <div className="w-8 h-12 bg-gradient-to-br from-[#5a3e2b] to-[#2c1d13] rounded-full shadow-lg relative transform rotate-12 flex items-center justify-center border border-black/30">
    <div className="w-1 h-10 bg-gradient-to-r from-black/60 to-transparent rounded-full transform -rotate-6 opacity-70" />
  </div>
);

const Cookie = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-[#c68642] to-[#a66b2d] rounded-full shadow-lg relative border border-[#8a551e]">
    <div className="absolute top-2 left-2 w-1.5 h-1.5 bg-[#5a3e2b] rounded-full" />
    <div className="absolute top-6 left-3 w-1.5 h-1.5 bg-[#5a3e2b] rounded-full" />
    <div className="absolute top-4 left-6 w-2 h-2 bg-[#5a3e2b] rounded-full" />
    <div className="absolute top-7 left-7 w-1.5 h-1.5 bg-[#5a3e2b] rounded-full" />
  </div>
);

const Donut = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-[#f0ebe1] to-[#e8d8c4] rounded-full shadow-lg relative border-2 border-[#e8d8c4]/50 flex items-center justify-center">
    <div className="absolute inset-0 m-1 bg-[#d32f2f]/90 rounded-full shadow-[inset_0_2px_5px_rgba(255,255,255,0.5)]" />
    <div className="w-3 h-3 bg-[#1a1512] rounded-full shadow-[inset_0_2px_4px_rgba(0,0,0,0.8)] z-10" />
  </div>
);

const RottenItem = () => (
  <div className="w-12 h-12 bg-gradient-to-br from-green-800 to-green-950 rounded-full shadow-lg relative border border-green-900 flex items-center justify-center">
    <div className="w-4 h-4 bg-green-500 rounded-full mix-blend-overlay opacity-50 blur-[2px]" />
  </div>
);

// --- Engine Types ---
type ItemType = 'bean' | 'cookie' | 'donut' | 'rotten';
interface GameObject {
  id: string;
  type: ItemType;
  x: number;
  y: number;
  speed: number;
  width: number;
  height: number;
}

// --- Dimensions ---
const CUP_WIDTH = 96;
const CUP_HEIGHT = 112;

export function CoffeeCatch({ onBack }: { onBack?: () => void }) {
  const [gameState, setGameState] = useState<'start' | 'playing' | 'paused' | 'ended'>('start');
  const [renderTick, setRenderTick] = useState(0); 
  
  const containerRef = useRef<HTMLDivElement>(null);
  
  const state = useRef({
    items: [] as GameObject[],
    cupX: 0,
    score: 0,
    timeLeft: 30,
    catches: 0,
    lastSpawnTime: 0,
    lastTick: 0,
    gameWidth: 0,
    gameHeight: 0
  });

  const requestRef = useRef<number | null>(null);

  // --- Input Handlers ---
  const handlePointerMove = (e: React.PointerEvent) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let newX = e.clientX - rect.left - (CUP_WIDTH / 2);
    newX = Math.max(0, Math.min(newX, state.current.gameWidth - CUP_WIDTH));
    state.current.cupX = newX;
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;
      const speed = 40;
      if (e.key === 'ArrowLeft') {
        state.current.cupX = Math.max(0, state.current.cupX - speed);
      } else if (e.key === 'ArrowRight') {
        state.current.cupX = Math.min(state.current.gameWidth - CUP_WIDTH, state.current.cupX + speed);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // --- Physics Loop ---
  const gameLoop = useCallback((time: number) => {
    if (gameState !== 'playing') return;

    if (!state.current.lastTick) state.current.lastTick = time;
    const delta = time - state.current.lastTick;
    state.current.lastTick = time;

    if (containerRef.current) {
      state.current.gameWidth = containerRef.current.offsetWidth;
      state.current.gameHeight = containerRef.current.offsetHeight;
    }

    const { gameWidth, gameHeight, cupX } = state.current;
    
    if (!state.current.lastSpawnTime) state.current.lastSpawnTime = time;

    const cupTop = gameHeight - 40 - CUP_HEIGHT; 
    const cupBottom = gameHeight - 40;
    const cupLeft = cupX;
    const cupRight = cupX + CUP_WIDTH;

    let itemsAlive: GameObject[] = [];
    
    for (let i = 0; i < state.current.items.length; i++) {
      let item = state.current.items[i];
      
      item.y += (item.speed * (delta / 1000));
      
      const itemTop = item.y;
      const itemBottom = item.y + item.height;
      const itemLeft = item.x;
      const itemRight = item.x + item.width;

      const isColliding = 
        itemBottom >= cupTop + 20 && 
        itemTop <= cupBottom &&
        itemRight >= cupLeft + 10 && 
        itemLeft <= cupRight - 10;

      if (isColliding) {
        if (item.type === 'rotten') {
          state.current.score = Math.max(0, state.current.score - 10);
        } else {
          state.current.catches += 1;
          if (item.type === 'bean') state.current.score += 10;
          if (item.type === 'cookie') state.current.score += 20;
          if (item.type === 'donut') state.current.score += 15;
        }
      } else if (itemTop > gameHeight) {
        continue; 
      } else {
        itemsAlive.push(item);
      }
    }

    state.current.items = itemsAlive;

    const timeRatio = Math.max(0, state.current.timeLeft) / 30; 
    const spawnInterval = 600 + (timeRatio * 600); 
    
    if (time - state.current.lastSpawnTime > spawnInterval && state.current.items.length < 7) {
       const rand = Math.random();
       let type: ItemType = 'bean';
       if (rand > 0.85) type = 'rotten';
       else if (rand > 0.65) type = 'cookie';
       else if (rand > 0.5) type = 'donut';

       const objWidth = 48; 
       const spawnX = Math.random() * (gameWidth - objWidth);
       const fallSpeed = 400 - (timeRatio * 200);

       state.current.items.push({
         id: Math.random().toString(),
         type,
         x: spawnX,
         y: -100, 
         speed: fallSpeed,
         width: objWidth,
         height: objWidth
       });
       
       state.current.lastSpawnTime = time;
    }

    setRenderTick(t => t + 1); 
    requestRef.current = requestAnimationFrame(gameLoop);
  }, [gameState]);

  // Start / Stop Loop
  useEffect(() => {
    if (gameState === 'playing') {
      state.current.lastTick = performance.now();
      requestRef.current = requestAnimationFrame(gameLoop);
    }
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [gameState, gameLoop]);

  // Timer
  useEffect(() => {
    if (gameState !== 'playing') return;
    const timerId = setInterval(() => {
      state.current.timeLeft -= 1;
      if (state.current.timeLeft <= 0) {
        state.current.timeLeft = 0;
        setGameState('ended');
      }
    }, 1000);
    return () => clearInterval(timerId);
  }, [gameState]);

  const startGame = () => {
    state.current = {
      ...state.current,
      items: [],
      score: 0,
      timeLeft: 30,
      catches: 0,
      lastSpawnTime: 0,
      cupX: (containerRef.current?.offsetWidth || 400) / 2 - (CUP_WIDTH / 2)
    };
    setGameState('playing');
  };

  const leaveGame = () => {
    setGameState('start');
    if (onBack) onBack();
  };

  const scoreHeader = gameState === 'playing' ? (
    <>
      <div className="bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5 text-center pointer-events-auto shadow-sm">
        <span className="text-[10px] text-[#2c1d11]/60 font-bold uppercase tracking-widest mr-2">Score</span>
        <span className="text-lg font-black text-[#2c1d11]">{state.current.score}</span>
      </div>
      <div className="bg-white/50 backdrop-blur-md px-4 py-1.5 rounded-full border border-black/5 text-center pointer-events-auto shadow-sm">
        <span className="text-[10px] text-[#2c1d11]/60 font-bold uppercase tracking-widest mr-2">Time</span>
        <span className={`text-lg font-black ${state.current.timeLeft <= 10 ? 'text-red-500 animate-pulse' : 'text-[#2c1d11]'}`}>{state.current.timeLeft}s</span>
      </div>
    </>
  ) : undefined;

  return (
    <GameShell
      theme="light"
      isPaused={gameState === 'paused'}
      onPause={() => setGameState('paused')}
      onResume={() => {
        state.current.lastTick = performance.now();
        setGameState('playing');
      }}
      onLeave={leaveGame}
      headerCenter={scoreHeader}
      title={gameState === 'start' ? undefined : "Perfect Brew"}
    >
      <div 
        className="absolute inset-0 overflow-hidden touch-none" 
        ref={containerRef}
        onPointerDown={handlePointerMove}
        onPointerMove={(e) => {
           if (e.buttons > 0) handlePointerMove(e);
        }}
        style={{ touchAction: 'none' }}
      >
        
        {/* Background Ambience */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-10 left-10 w-64 h-64 bg-accent rounded-full blur-[100px]" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-primary rounded-full blur-[100px]" />
        </div>

        {gameState === 'start' && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#fdfbf7]/80 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              className="bg-white p-8 rounded-3xl text-center max-w-sm mx-4 border border-black/5 shadow-2xl"
            >
              <h2 className="text-3xl font-black text-[#2c1d11] mb-2" style={{ fontFamily: 'var(--font-display)' }}>Perfect Brew</h2>
              <p className="text-[#2c1d11]/70 mb-6 text-sm">Drag the cup to catch coffee beans and pastries. Avoid the green ones!</p>
              <button 
                onClick={startGame}
                className="w-full py-4 bg-accent text-white font-bold rounded-2xl hover:bg-[#a66b2d] active:scale-95 transition-all shadow-lg shadow-accent/20 mb-3"
              >
                Start Brewing
              </button>
            </motion.div>
          </div>
        )}

        {gameState === 'ended' && (
          <div className="absolute inset-0 z-[60] flex items-center justify-center bg-[#fdfbf7]/80 backdrop-blur-md">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }}
              className="bg-white p-8 rounded-[40px] text-center max-w-sm mx-4 border border-black/5 shadow-[0_20px_60px_rgba(0,0,0,0.1)]"
            >
              <span className="inline-block px-4 py-1.5 rounded-full bg-accent/10 text-accent text-xs font-bold uppercase tracking-wider mb-4">
                Time's Up
              </span>
              <h2 className="text-4xl font-black text-[#2c1d11] mb-2" style={{ fontFamily: 'var(--font-display)' }}>{state.current.score}</h2>
              <p className="text-[#2c1d11]/50 text-sm mb-6">Final Score</p>
              
              <div className="bg-black/5 rounded-2xl p-4 mb-8">
                <p className="text-[#2c1d11]/90 font-bold mb-1">Coffee Master</p>
                <p className="text-[#2c1d11]/60 text-sm">You caught {state.current.catches} perfect moments.</p>
              </div>

              <div className="flex gap-4">
                <button 
                  onClick={leaveGame}
                  className="flex-1 py-4 bg-black/5 text-[#2c1d11] font-bold rounded-2xl hover:bg-black/10 active:scale-95 transition-all"
                >
                  Menu
                </button>
                <button 
                  onClick={startGame}
                  className="flex-[2] py-4 bg-accent text-white font-bold rounded-2xl hover:bg-[#a66b2d] active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                  Play Again
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {/* Render Game Objects */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-20">
          {state.current.items.map(item => (
            <div 
              key={item.id}
              className="absolute top-0 left-0 will-change-transform"
              style={{ transform: `translate3d(${item.x}px, ${item.y}px, 0)` }}
            >
              {item.type === 'bean' && <Bean />}
              {item.type === 'cookie' && <Cookie />}
              {item.type === 'donut' && <Donut />}
              {item.type === 'rotten' && <RottenItem />}
            </div>
          ))}
        </div>

        {/* Render Cup */}
        <div className="absolute bottom-10 left-0 right-0 z-40 pointer-events-none">
           <div 
             className="absolute bottom-0 will-change-transform"
             style={{ transform: `translate3d(${state.current.cupX}px, 0, 0)` }}
           >
             <Cup />
           </div>
        </div>

      </div>
    </GameShell>
  );
}
