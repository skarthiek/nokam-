import React from 'react';
import { motion } from 'framer-motion';
import { ChevronRight, Target, Handshake, CornerUpRight, XCircle } from 'lucide-react';
import { useNokam } from '../context/useNokam';

const intents = [
  { id: 'continue', label: 'Continue', icon: ChevronRight, color: 'text-blue-400', border: 'border-blue-400/30', hover: 'hover:border-blue-400', bg: 'hover:bg-blue-400/10' },
  { id: 'soft-continue', label: 'Soft Continue', icon: Handshake, color: 'text-brand-accent', border: 'border-brand-accent/30', hover: 'hover:border-brand-accent', bg: 'hover:bg-brand-accent/10' },
  { id: 'counter', label: 'Counter', icon: CornerUpRight, color: 'text-orange-400', border: 'border-orange-400/30', hover: 'hover:border-orange-400', bg: 'hover:bg-orange-400/10' },
  { id: 'end-close', label: 'End / Close', icon: XCircle, color: 'text-red-400', border: 'border-red-400/30', hover: 'hover:border-red-400', bg: 'hover:bg-red-400/10' },
];

export default function IntentScreen({ onSelectIntent }) {
  const { setIntent, fetchKeywords } = useNokam();

  const handleSelect = (intentId) => {
    setIntent(intentId);
    // Prefetch contextual keywords tailored to this intent if not already loaded
    fetchKeywords(intentId, false);
    onSelectIntent(intentId);
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col items-center justify-center h-full w-full relative"
    >
      <div className="text-center mb-16 relative z-10">
        <motion.h2 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1 }}
          className="text-3xl md:text-4xl font-light mb-3"
        >
          Select an <span className="gradient-text font-semibold">Intent</span>
        </motion.h2>
        <motion.p 
          initial={{ y: -10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-dark-muted"
        >
          Guide the AI to craft the perfect response
        </motion.p>
      </div>

      <div className="relative w-[350px] h-[350px] md:w-[450px] md:h-[450px] flex items-center justify-center">
        {/* Connecting Lines */}
        <div className="absolute inset-0 rounded-full border border-dark-border/50 animate-[spin_60s_linear_infinite]"></div>
        <div className="absolute inset-10 rounded-full border border-dark-border/30 animate-[spin_40s_linear_infinite_reverse]"></div>

        {/* Central Hub */}
        <motion.div 
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', damping: 15 }}
          className="absolute z-10 w-20 h-20 md:w-28 md:h-28 rounded-full bg-dark-surface border border-brand-primary/40 shadow-[0_0_30px_rgba(99,102,241,0.2)] flex items-center justify-center"
        >
          <Target className="text-brand-primary" size={32} />
        </motion.div>

        {/* Orbiting Intents */}
        {intents.map((intentItem, index) => {
          // Calculate positions: Right, Bottom, Left, Top
          const angle = (index * 90) * (Math.PI / 180);
          const radius = typeof window !== 'undefined' && window.innerWidth < 768 ? 130 : 170;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;

          const Icon = intentItem.icon;

          return (
            <motion.button
              key={intentItem.id}
              onClick={() => handleSelect(intentItem.id)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, x, y, scale: 1 }}
              transition={{ delay: index * 0.1 + 0.3, type: 'spring', stiffness: 200, damping: 20 }}
              whileHover={{ scale: 1.1, zIndex: 20 }}
              whileTap={{ scale: 0.95 }}
              className={`absolute flex flex-col items-center justify-center w-28 h-28 md:w-32 md:h-32 rounded-full glass-panel cursor-pointer group ${intentItem.border} ${intentItem.hover} ${intentItem.bg} transition-colors duration-300`}
            >
              <Icon className={`${intentItem.color} mb-2 opacity-80 group-hover:opacity-100 transition-opacity drop-shadow-md`} size={28} />
              <span className="text-xs md:text-sm font-medium text-dark-text tracking-wide">{intentItem.label}</span>
            </motion.button>
          );
        })}
      </div>
    </motion.div>
  );
}
