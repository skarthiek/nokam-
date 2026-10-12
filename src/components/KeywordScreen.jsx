import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowLeft, Send } from 'lucide-react';

const ALL_KEYWORDS = [
  'Understand', 'Better Price', 'Partnership', 'Future Orders',
  'Discuss', 'Flexible', 'Budget', 'Product', 'Volume', 'Timeline', 'Quality', 'Terms'
];

export default function KeywordScreen({ selectedIntent, onBack, onSubmit }) {
  const [keywords, setKeywords] = useState(ALL_KEYWORDS.slice(0, 10));
  const [selected, setSelected] = useState([]);

  const toggleKeyword = (kw) => {
    if (selected.includes(kw)) {
      setSelected(selected.filter(k => k !== kw));
    } else {
      setSelected([...selected, kw]);
    }
  };

  const removeKeyword = (kw) => {
    setSelected(selected.filter(k => k !== kw));
  };

  const handleRefresh = () => {
    // Visual shuffle for demo
    setKeywords([...keywords].sort(() => Math.random() - 0.5));
  };

  const handleEnter = () => {
    if (selected.length > 0) {
      onSubmit(selected);
    }
  };

  // Allow enter key to submit
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selected.length > 0) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selected]);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col h-full w-full relative pt-8 md:pt-12 pb-24 px-4 md:px-6 max-w-5xl mx-auto"
    >
      <div className="flex justify-between items-center mb-4 md:mb-10 w-full z-20">
        <button onClick={onBack} className="flex items-center gap-2 text-dark-muted hover:text-white transition-colors px-4 py-2 rounded-full glass-button">
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
        </button>
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-light">Add Context</h2>
          <p className="text-xs text-dark-muted">Select keywords for the AI</p>
        </div>
        <button onClick={handleRefresh} className="flex items-center gap-2 text-dark-muted hover:text-brand-accent transition-colors px-4 py-2 rounded-full glass-button group">
          <RefreshCw size={16} className="group-hover:rotate-180 transition-transform duration-500" /> <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      <div className="flex-1 relative flex items-center justify-center min-h-[350px] md:min-h-[450px]">
        {/* Central intent display */}
        <motion.div 
          className="absolute z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-surface border border-brand-primary/40 shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center"
        >
          <span className="text-[10px] md:text-xs text-brand-accent uppercase tracking-widest mb-1">Intent</span>
          <span className="text-sm md:text-lg font-medium text-white capitalize text-center leading-tight px-2">{selectedIntent.replace('-', ' ')}</span>
        </motion.div>

        {/* Floating keywords */}
        {keywords.map((kw, index) => {
          const isSelected = selected.includes(kw);
          const angle = (index * (360 / keywords.length)) * (Math.PI / 180);
          const radius = window.innerWidth < 768 ? 120 : 200; 
          
          // Add some slight randomness to the radius for a more organic feel
          const r = radius + (Math.random() * 30 - 15);
          
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          return (
            <motion.button
              key={kw}
              onClick={() => toggleKeyword(kw)}
              initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
              animate={{ 
                opacity: isSelected ? 0.3 : 1, 
                scale: isSelected ? 0.9 : 1, 
                x, 
                y,
              }}
              transition={{ 
                delay: index * 0.05, 
                type: 'spring', 
                stiffness: 100, 
                damping: 15 
              }}
              className={`absolute px-4 py-2 rounded-full glass-panel whitespace-nowrap transition-all duration-300 text-sm md:text-base ${isSelected ? 'border-brand-primary/50 text-brand-primary' : 'hover:border-white/30 text-dark-text'} animate-float-slow`}
              style={{
                animationDelay: `${index * 0.5}s`
              }}
            >
              {kw}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Selected Area */}
      <div className="absolute bottom-4 md:bottom-8 left-0 w-full px-4 md:px-6 flex flex-col items-center z-20">
        <div className="w-full max-w-2xl glass-panel p-4 md:p-5 flex flex-col gap-4 shadow-2xl bg-dark-bg/80">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm font-medium text-dark-muted">Selected ({selected.length})</span>
            <button 
              onClick={handleEnter}
              disabled={selected.length === 0}
              className={`flex items-center gap-2 px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 ${selected.length > 0 ? 'glass-button-primary' : 'bg-dark-surface/50 text-dark-muted cursor-not-allowed border border-dark-border'}`}
            >
              <span className="font-medium text-sm">Generate</span>
              <Send size={14} className={selected.length > 0 ? 'text-brand-accent' : ''} />
            </button>
          </div>
          
          <div className="min-h-[40px] flex flex-wrap gap-2">
            <AnimatePresence>
              {selected.length === 0 && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-dark-muted/50 text-sm italic py-1"
                >
                  Click floating keywords to add them...
                </motion.span>
              )}
              {selected.map(kw => (
                <motion.div
                  key={`sel-${kw}`}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/10 border border-brand-primary/30 rounded-full text-brand-text text-sm shadow-sm"
                >
                  <span className="text-gray-200">{kw}</span>
                  <button onClick={(e) => { e.stopPropagation(); removeKeyword(kw); }} className="text-brand-primary hover:text-white transition-colors p-0.5 bg-brand-primary/20 rounded-full">
                    <X size={12} />
                  </button>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
