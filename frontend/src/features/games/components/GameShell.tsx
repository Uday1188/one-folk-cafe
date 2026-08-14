'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft } from 'lucide-react';
import { ReactNode } from 'react';

interface GameShellProps {
  title?: string;
  isPaused: boolean;
  onPause: () => void;
  onResume: () => void;
  onLeave: () => void;
  children: ReactNode;
  headerCenter?: ReactNode; 
  theme?: 'dark' | 'light';
}

export function GameShell({
  title,
  isPaused,
  onPause,
  onResume,
  onLeave,
  children,
  headerCenter,
  theme = 'light'
}: GameShellProps) {
  const isLight = theme === 'light';
  
  return (
    <div className={`flex-1 w-full h-full relative flex flex-col overflow-hidden ${isLight ? 'bg-[#fdfbf7] text-[#2c1d11]' : 'bg-[#1a1512] text-white'}`}>
      
      {/* Universal Game Header */}
      <div className="absolute top-0 left-0 right-0 p-4 sm:p-6 flex justify-between items-start sm:items-center z-[80] pointer-events-none">
         
         <button 
           onClick={onPause}
           className={`pointer-events-auto flex items-center gap-2 px-4 py-2 rounded-full border backdrop-blur-md font-bold text-sm shadow-sm transition-all active:scale-95 flex-shrink-0 ${
             isLight 
               ? 'bg-black/5 hover:bg-black/10 border-black/5 text-[#2c1d11]' 
               : 'bg-white/10 hover:bg-white/20 border-white/10 text-white shadow-md'
           }`}
         >
           <ChevronLeft className="w-4 h-4" /> Back
         </button>

         {/* Center Content (Score/Time/Title) */}
         <div className="flex-1 flex justify-center pointer-events-none px-4">
           {headerCenter && (
             <div className="flex flex-wrap justify-center gap-2 sm:gap-4 pointer-events-auto">
               {headerCenter}
             </div>
           )}
           
           {!headerCenter && title && (
             <div className={`px-4 py-1.5 rounded-full border backdrop-blur-md pointer-events-auto shadow-sm text-center ${
               isLight ? 'bg-white/50 border-black/5' : 'bg-white/10 border-white/10'
             }`}>
               <span className={`text-xs font-bold uppercase tracking-widest ${isLight ? 'text-[#2c1d11]' : 'text-white'}`}>{title}</span>
             </div>
           )}
         </div>
         
         {/* Invisible spacer to balance flex if needed on desktop */}
         <div className="w-[88px] hidden sm:block flex-shrink-0 pointer-events-none" />
      </div>

      {/* Game Content */}
      <div className="flex-1 relative flex flex-col overflow-hidden w-full h-full">
        {children}
      </div>

      {/* Universal Pause Overlay */}
      <AnimatePresence>
        {isPaused && (
          <div className="absolute inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md pointer-events-auto">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }} 
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`p-8 rounded-[40px] text-center w-full max-w-sm mx-4 border shadow-2xl ${
                isLight ? 'bg-white border-black/5' : 'bg-[#241d18] border-white/10'
              }`}
            >
              <h2 className={`text-2xl sm:text-3xl font-black mb-2 ${isLight ? 'text-[#2c1d11]' : 'text-white'}`} style={{ fontFamily: 'var(--font-display)' }}>Leave Game?</h2>
              <p className={`text-sm mb-8 ${isLight ? 'text-[#2c1d11]/60' : 'text-white/50'}`}>Your current progress will be lost.</p>
              
              <div className="flex gap-4">
                <button 
                  onClick={onLeave}
                  className={`flex-1 py-4 font-bold rounded-2xl active:scale-95 transition-all ${
                    isLight 
                      ? 'bg-black/5 text-[#2c1d11] hover:bg-black/10' 
                      : 'bg-white/10 text-white hover:bg-white/20'
                  }`}
                >
                  Leave
                </button>
                <button 
                  onClick={onResume}
                  className="flex-[2] py-4 bg-accent text-white font-bold rounded-2xl hover:bg-[#a66b2d] active:scale-95 transition-all shadow-lg shadow-accent/20"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
