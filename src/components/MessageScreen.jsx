import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';

export default function MessageScreen({ onNext }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-6"
    >
      <div className="w-full glass-panel p-8 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        <h2 className="text-xs md:text-sm text-brand-accent mb-6 font-semibold tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
          Incoming Message
        </h2>
        <p className="text-2xl md:text-4xl font-light text-dark-text leading-tight mb-10">
          "Sorry, we don't think we can do this at this price."
        </p>
        
        <div className="flex justify-end">
          <button 
            onClick={onNext}
            className="flex items-center gap-2 px-6 py-3 rounded-full glass-button-primary group"
          >
            <Sparkles size={18} className="text-brand-accent group-hover:animate-pulse-glow" />
            <span className="font-medium tracking-wide">Analyze Intent</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
}
