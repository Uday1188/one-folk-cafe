'use client';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { ReactNode, useEffect } from 'react';

interface GameModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export function GameModal({ isOpen, onClose, title, children }: GameModalProps) {
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex flex-col bg-[#fdfbf7]/95 backdrop-blur-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 sm:p-6 border-b border-black/5 bg-white/50">
            <h2 className="text-xl sm:text-2xl font-bold text-[#2c1d11]" style={{ fontFamily: 'var(--font-display)' }}>
              {title}
            </h2>
            <button
              onClick={onClose}
              className="p-2 bg-black/5 hover:bg-black/10 active:scale-95 rounded-full transition-all border border-black/5 text-[#2c1d11]"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Game Content Area */}
          <div className="flex-1 relative overflow-hidden flex flex-col">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
