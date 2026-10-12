import React, { useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, RefreshCw, ArrowLeft, Send, Loader2 } from 'lucide-react';
import { useNokam } from '../context/useNokam';

export default function KeywordScreen({ selectedIntent, onBack, onSubmit }) {
  const {
    keywords,
    selectedKeywords,
    toggleKeyword,
    removeKeyword,
    fetchKeywords,
    isLoadingKeywords,
    fetchDrafts
  } = useNokam();

  // Ensure keywords are loaded on mount if empty
  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      fetchKeywords(selectedIntent, false);
    }
  }, [keywords, selectedIntent, fetchKeywords]);

  const handleRefresh = () => {
    // Explicit user action to regenerate fresh keywords from Gemini
    fetchKeywords(selectedIntent, true);
  };

  const handleEnter = useCallback(() => {
    if (selectedKeywords.length > 0) {
      // Trigger draft generation and advance to draft screen
      fetchDrafts(true);
      onSubmit(selectedKeywords);
    }
  }, [selectedKeywords, fetchDrafts, onSubmit]);

  // Keyboard shortcut: Enter submits when keywords are selected
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Enter' && selectedKeywords.length > 0) {
        handleEnter();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedKeywords, handleEnter]);

  const displayIntent = (selectedIntent || 'Intent').replace('-', ' ');

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className="flex flex-col h-full w-full relative pt-8 md:pt-12 pb-24 px-4 md:px-6 max-w-5xl mx-auto"
    >
      {/* Top Navigation & Status Bar */}
      <div className="flex justify-between items-center mb-4 md:mb-10 w-full z-20">
        <button 
          onClick={onBack} 
          className="flex items-center gap-2 text-dark-muted hover:text-white transition-colors px-4 py-2 rounded-full glass-button"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline">Back</span>
        </button>
        
        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-light">Add Context</h2>
          <p className="text-xs text-dark-muted">
            {isLoadingKeywords ? 'Gemini is generating strategic keywords...' : 'Select keywords for the AI'}
          </p>
        </div>

        <button 
          onClick={handleRefresh} 
          disabled={isLoadingKeywords}
          className="flex items-center gap-2 text-dark-muted hover:text-brand-accent transition-colors px-4 py-2 rounded-full glass-button group disabled:opacity-50"
          title="Regenerate keywords with Gemini"
        >
          <RefreshCw size={16} className={`transition-transform duration-500 ${isLoadingKeywords ? 'animate-spin text-brand-accent' : 'group-hover:rotate-180'}`} /> 
          <span className="hidden sm:inline">Refresh</span>
        </button>
      </div>

      {/* Orbital Cloud Area */}
      <div className="flex-1 relative flex items-center justify-center min-h-[350px] md:min-h-[450px]">
        {/* Central Intent Display */}
        <motion.div 
          className="absolute z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-surface border border-brand-primary/40 shadow-[0_0_40px_rgba(99,102,241,0.2)] flex flex-col items-center justify-center"
        >
          {isLoadingKeywords ? (
            <div className="flex flex-col items-center justify-center">
              <Loader2 size={24} className="animate-spin text-brand-primary mb-1" />
              <span className="text-[10px] text-brand-accent uppercase tracking-widest">AI Thinking</span>
            </div>
          ) : (
            <>
              <span className="text-[10px] md:text-xs text-brand-accent uppercase tracking-widest mb-1">Intent</span>
              <span className="text-sm md:text-lg font-medium text-white capitalize text-center leading-tight px-2">{displayIntent}</span>
            </>
          )}
        </motion.div>

        {/* Floating Keywords Cloud */}
        {keywords.map((kw, index) => {
          const isSelected = selectedKeywords.includes(kw);
          const total = keywords.length || 1;
          const angle = (index * (360 / total)) * (Math.PI / 180);
          const baseRadius = typeof window !== 'undefined' && window.innerWidth < 768 ? 125 : 210;
          
          // Deterministic organic offset based on index so it doesn't jump on re-renders
          const offset = ((index % 3) - 1) * 16;
          const r = baseRadius + offset;
          
          const x = Math.cos(angle) * r;
          const y = Math.sin(angle) * r;

          return (
            <motion.button
              key={`kw-${kw}-${index}`}
              onClick={() => toggleKeyword(kw)}
              initial={{ opacity: 0, scale: 0 }}
              animate={{ 
                opacity: isSelected ? 0.35 : 1, 
                scale: isSelected ? 0.95 : 1, 
                x, 
                y,
              }}
              transition={{ 
                delay: Math.min(index * 0.04, 0.4), 
                type: 'spring', 
                stiffness: 120, 
                damping: 18 
              }}
              className={`absolute px-4 py-2 rounded-full glass-panel whitespace-nowrap transition-all duration-300 text-sm md:text-base ${
                isSelected 
                  ? 'border-brand-primary/60 text-brand-primary bg-brand-primary/10 shadow-[0_0_15px_rgba(99,102,241,0.25)]' 
                  : 'hover:border-white/40 text-dark-text hover:bg-dark-surface'
              } animate-float-slow cursor-pointer select-none`}
              style={{
                animationDelay: `${(index % 5) * 0.6}s`
              }}
            >
              {kw}
            </motion.button>
          );
        })}
      </div>

      {/* Bottom Selected Drawer */}
      <div className="absolute bottom-4 md:bottom-8 left-0 w-full px-4 md:px-6 flex flex-col items-center z-20">
        <div className="w-full max-w-2xl glass-panel p-4 md:p-5 flex flex-col gap-4 shadow-2xl bg-dark-bg/90 backdrop-blur-xl">
          <div className="flex justify-between items-center">
            <span className="text-xs md:text-sm font-medium text-dark-muted">
              Selected ({selectedKeywords.length})
            </span>
            <button 
              onClick={handleEnter}
              disabled={selectedKeywords.length === 0}
              className={`flex items-center gap-2 px-6 py-2 md:py-2.5 rounded-full transition-all duration-300 ${
                selectedKeywords.length > 0 
                  ? 'glass-button-primary cursor-pointer' 
                  : 'bg-dark-surface/50 text-dark-muted cursor-not-allowed border border-dark-border'
              }`}
            >
              <span className="font-medium text-sm">Generate</span>
              <Send size={14} className={selectedKeywords.length > 0 ? 'text-brand-accent' : ''} />
            </button>
          </div>
          
          <div className="min-h-[40px] flex flex-wrap gap-2 max-h-28 overflow-y-auto">
            <AnimatePresence>
              {selectedKeywords.length === 0 && (
                <motion.span 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-dark-muted/50 text-sm italic py-1"
                >
                  Click floating keywords to add context...
                </motion.span>
              )}
              {selectedKeywords.map(kw => (
                <motion.div
                  key={`sel-${kw}`}
                  initial={{ opacity: 0, scale: 0.8, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  className="flex items-center gap-2 px-3 py-1.5 bg-brand-primary/15 border border-brand-primary/40 rounded-full text-brand-text text-sm shadow-sm"
                >
                  <span className="text-gray-200">{kw}</span>
                  <button 
                    type="button"
                    onClick={(e) => { 
                      e.stopPropagation(); 
                      removeKeyword(kw); 
                    }} 
                    className="text-brand-primary hover:text-white transition-colors p-0.5 bg-brand-primary/20 hover:bg-brand-primary/40 rounded-full cursor-pointer"
                  >
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
