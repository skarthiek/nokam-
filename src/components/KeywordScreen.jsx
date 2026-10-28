import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  RefreshCw,
  ArrowLeft,
  Send,
  Loader2,
  Check,
  ChevronRight,
  Handshake,
  CornerUpRight,
  XCircle,
  Target
} from 'lucide-react';
import { useNokam } from '../context/useNokam';

const INTENT_CONFIG = {
  'continue': {
    label: 'Continue',
    icon: ChevronRight,
    color: 'text-blue-400',
    glow: 'rgba(96,165,250,0.3)',
    border: 'border-blue-400/40',
    bg: 'bg-blue-400/10'
  },
  'soft-continue': {
    label: 'Soft Continue',
    icon: Handshake,
    color: 'text-brand-accent',
    glow: 'rgba(139,92,246,0.35)',
    border: 'border-brand-accent/40',
    bg: 'bg-brand-accent/10'
  },
  'counter': {
    label: 'Counter',
    icon: CornerUpRight,
    color: 'text-orange-400',
    glow: 'rgba(251,146,60,0.3)',
    border: 'border-orange-400/40',
    bg: 'bg-orange-400/10'
  },
  'end-close': {
    label: 'End / Close',
    icon: XCircle,
    color: 'text-red-400',
    glow: 'rgba(248,113,113,0.3)',
    border: 'border-red-400/40',
    bg: 'bg-red-400/10'
  }
};

export default function KeywordScreen({ selectedIntent, onBack, onSubmit }) {
  const {
    keywords,
    selectedKeywords,
    toggleKeyword,
    removeKeyword,
    setSelectedKeywords,
    fetchKeywords,
    isLoadingKeywords,
    fetchDrafts
  } = useNokam();

  const containerRef = useRef(null);
  const [dimensions, setDimensions] = useState({ width: 900, height: 420 });

  // Measure orbital container dimensions dynamically for responsive spacing
  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        const rect = containerRef.current.getBoundingClientRect();
        setDimensions({
          width: Math.max(rect.width, 320),
          height: Math.max(rect.height, 320)
        });
      } else {
        setDimensions({
          width: typeof window !== 'undefined' ? window.innerWidth : 900,
          height: 420
        });
      }
    };

    updateSize();

    let resizeObserver;
    if (typeof ResizeObserver !== 'undefined' && containerRef.current) {
      resizeObserver = new ResizeObserver(() => updateSize());
      resizeObserver.observe(containerRef.current);
    }

    window.addEventListener('resize', updateSize);
    return () => {
      window.removeEventListener('resize', updateSize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, []);

  // Ensure keywords are loaded on mount if empty
  useEffect(() => {
    if (!keywords || keywords.length === 0) {
      fetchKeywords(selectedIntent, false);
    }
  }, [keywords, selectedIntent, fetchKeywords]);

  const handleRefresh = () => {
    fetchKeywords(selectedIntent, true);
  };

  const handleClearAll = () => {
    setSelectedKeywords([]);
  };

  const handleEnter = useCallback(() => {
    if (selectedKeywords.length > 0) {
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

  // Intent visual config
  const intentKey = (selectedIntent || '').toLowerCase();
  const currentIntentConfig = INTENT_CONFIG[intentKey] || {
    label: (selectedIntent || 'Intent').replace('-', ' '),
    icon: Target,
    color: 'text-brand-accent',
    glow: 'rgba(99,102,241,0.3)',
    border: 'border-brand-primary/40',
    bg: 'bg-brand-primary/10'
  };
  const IntentIcon = currentIntentConfig.icon;
  const displayIntent = currentIntentConfig.label;

  // Responsive orbital geometry calculations
  const { width, height } = dimensions;
  const isMobile = width < 640;
  const isTablet = width < 1024 && !isMobile;

  // Safe inner & outer elliptical radii fitted to screen aspect ratio
  const rxInner = isMobile
    ? Math.min(125, width * 0.32)
    : isTablet
      ? Math.min(220, width * 0.27)
      : Math.min(280, width * 0.27);

  const ryInner = isMobile
    ? Math.min(85, height * 0.22)
    : isTablet
      ? Math.min(115, height * 0.24)
      : Math.min(130, height * 0.25);

  const rxOuter = isMobile
    ? Math.min(168, width * 0.44)
    : isTablet
      ? Math.min(360, width * 0.44)
      : Math.min(460, width * 0.44);

  const ryOuter = isMobile
    ? Math.min(145, height * 0.38)
    : isTablet
      ? Math.min(175, height * 0.38)
      : Math.min(200, height * 0.39);

  const total = keywords.length || 1;
  const innerCount = Math.floor(total / 2);
  const outerCount = total - innerCount;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="flex flex-col h-full w-full relative px-4 md:px-8 max-w-6xl mx-auto justify-between select-none pb-4"
    >
      {/* Top Navigation & Status Bar */}
      <div className="flex justify-between items-center w-full z-20 pt-2 pb-2 flex-shrink-0">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-dark-muted hover:text-white transition-colors px-3.5 py-1.5 md:px-4 md:py-2 rounded-full glass-button cursor-pointer"
        >
          <ArrowLeft size={16} /> <span className="hidden sm:inline text-sm">Back</span>
        </button>

        <div className="text-center">
          <h2 className="text-xl md:text-2xl font-light text-white tracking-wide">Add Context</h2>
          <p className="text-xs text-dark-muted mt-0.5">
            {isLoadingKeywords
              ? 'Gemini is generating strategic keywords...'
              : 'Select floating keywords to shape the AI response'}
          </p>
        </div>

        <button
          onClick={handleRefresh}
          disabled={isLoadingKeywords}
          className="flex items-center gap-2 text-dark-muted hover:text-brand-accent transition-colors px-3.5 py-1.5 md:px-4 md:py-2 rounded-full glass-button group disabled:opacity-50 cursor-pointer"
          title="Regenerate keywords with Gemini"
        >
          <RefreshCw
            size={16}
            className={`transition-transform duration-500 ${
              isLoadingKeywords ? 'animate-spin text-brand-accent' : 'group-hover:rotate-180'
            }`}
          />
          <span className="hidden sm:inline text-sm">Refresh</span>
        </button>
      </div>

      {/* Orbital Cloud Area */}
      <div
        ref={containerRef}
        className="flex-1 relative w-full flex items-center justify-center my-2 min-h-[340px] md:min-h-[420px] overflow-visible"
      >
        {/* Subtle Ambient Orbital Tracks */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Inner orbit guide */}
          <div
            className="rounded-full border border-brand-primary/10 transition-all duration-700 ease-out"
            style={{ width: `${rxInner * 2}px`, height: `${ryInner * 2}px` }}
          />
          {/* Outer orbit guide */}
          <div
            className="rounded-full border border-brand-primary/5 border-dashed transition-all duration-700 ease-out"
            style={{ width: `${rxOuter * 2}px`, height: `${ryOuter * 2}px` }}
          />
          {/* Ambient center aura */}
          <div className="absolute w-48 h-48 bg-brand-primary/5 rounded-full blur-3xl pointer-events-none" />
        </div>

        {/* Central Intent Hub */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20, stiffness: 200 }}
          className={`relative z-10 w-24 h-24 md:w-32 md:h-32 rounded-full bg-dark-surface/95 backdrop-blur-xl border ${currentIntentConfig.border} flex flex-col items-center justify-center text-center p-3 select-none`}
          style={{
            boxShadow: `0 0 35px ${currentIntentConfig.glow}`
          }}
        >
          {isLoadingKeywords ? (
            <div className="flex flex-col items-center justify-center gap-1.5">
              <Loader2 size={24} className="animate-spin text-brand-primary" />
              <span className="text-[10px] text-brand-accent font-semibold tracking-wider uppercase">
                Synthesizing
              </span>
            </div>
          ) : (
            <>
              <IntentIcon size={isMobile ? 18 : 22} className={`${currentIntentConfig.color} mb-1`} />
              <span className="text-[9px] md:text-[10px] text-dark-muted uppercase tracking-widest font-mono">
                Intent
              </span>
              <span className="text-xs md:text-sm font-semibold text-white leading-tight capitalize max-w-[105px] truncate px-1">
                {displayIntent}
              </span>
            </>
          )}
        </motion.div>

        {/* Floating Keywords */}
        {keywords.map((kw, index) => {
          const isSelected = selectedKeywords.includes(kw);

          // Assign to inner or outer orbit alternatively
          const isOuter = index % 2 === 1;
          const ringIndex = Math.floor(index / 2);
          const ringTotal = isOuter ? outerCount : innerCount;

          // Start at top-angled offset so nodes don't bunch directly on the vertical line
          const startAngle = -Math.PI / 2 + Math.PI / 12;
          const step = (2 * Math.PI) / (ringTotal || 1);
          // Stagger outer orbit by half a step so items neatly slot into the gaps
          const stagger = isOuter ? step / 2 : 0;
          const angle = startAngle + ringIndex * step + stagger;

          const rx = isOuter ? rxOuter : rxInner;
          const ry = isOuter ? ryOuter : ryInner;

          // Deterministic organic jitter per index
          const jitterX = Math.sin(index * 2.7) * (isMobile ? 3 : 8);
          const jitterY = Math.cos(index * 3.1) * (isMobile ? 3 : 6);

          const posX = Math.round(Math.cos(angle) * rx + jitterX);
          const posY = Math.round(Math.sin(angle) * ry + jitterY);

          // Unique organic floating oscillation parameters
          const floatDuration = 4.2 + (index % 5) * 0.6; // 4.2s - 6.6s
          const floatDelay = (index % 6) * 0.35;
          const deltaY = isMobile ? 5 : 7 + (index % 3) * 2;
          const deltaX = isMobile ? 3 : 4 + ((index + 1) % 3) * 2;

          return (
            <div
              key={`kw-slot-${kw}-${index}`}
              className="absolute transition-all duration-700 ease-out z-10 pointer-events-auto"
              style={{
                left: `calc(50% + ${posX}px)`,
                top: `calc(50% + ${posY}px)`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <motion.button
                onClick={() => toggleKeyword(kw)}
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{
                  opacity: isSelected ? 1 : 0.92,
                  scale: isSelected ? 1.05 : 1,
                  y: [0, -deltaY, deltaY * 0.3, -deltaY * 0.7, 0],
                  x: [0, deltaX, -deltaX * 0.5, deltaX * 0.4, 0],
                }}
                whileHover={{
                  scale: 1.12,
                  y: -3,
                  zIndex: 35,
                  transition: { duration: 0.18 }
                }}
                whileTap={{ scale: 0.94 }}
                transition={{
                  y: {
                    duration: floatDuration,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: floatDelay,
                  },
                  x: {
                    duration: floatDuration * 1.3,
                    repeat: Infinity,
                    ease: 'easeInOut',
                    delay: floatDelay + 0.4,
                  },
                  scale: { type: 'spring', stiffness: 350, damping: 25 },
                  opacity: { duration: 0.25 }
                }}
                className={`group flex items-center gap-1.5 md:gap-2 px-3 py-1.5 md:px-4 md:py-2 rounded-full whitespace-nowrap cursor-pointer select-none transition-all duration-300 text-xs md:text-sm font-medium ${
                  isSelected
                    ? 'bg-gradient-to-r from-brand-primary/25 via-brand-accent/30 to-brand-primary/25 border border-brand-accent text-white shadow-[0_0_20px_rgba(139,92,246,0.45)]'
                    : 'glass-panel border-white/10 hover:border-brand-primary/50 text-dark-text/90 hover:text-white hover:bg-dark-surface/90 hover:shadow-[0_0_18px_rgba(99,102,241,0.25)]'
                }`}
              >
                {isSelected ? (
                  <span className="w-3.5 h-3.5 md:w-4 md:h-4 rounded-full bg-brand-accent flex items-center justify-center text-white shadow-sm flex-shrink-0">
                    <Check size={10} strokeWidth={3} />
                  </span>
                ) : (
                  <span className="w-1.5 h-1.5 rounded-full bg-brand-primary/40 group-hover:bg-brand-primary transition-colors flex-shrink-0" />
                )}
                <span>{kw}</span>
              </motion.button>
            </div>
          );
        })}
      </div>

      {/* Bottom Selected Keywords Dock */}
      <div className="w-full flex-shrink-0 z-20 flex flex-col items-center">
        <div className="w-full max-w-2xl glass-panel p-3.5 md:p-4 flex flex-col gap-3 shadow-2xl bg-dark-bg/95 backdrop-blur-xl border border-dark-border/80">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <span className="text-xs md:text-sm font-medium text-dark-text">
                Selected Context ({selectedKeywords.length})
              </span>
              {selectedKeywords.length > 0 && (
                <button
                  onClick={handleClearAll}
                  className="text-[11px] text-dark-muted hover:text-red-400 transition-colors ml-1 underline cursor-pointer"
                >
                  Clear all
                </button>
              )}
            </div>

            <button
              onClick={handleEnter}
              disabled={selectedKeywords.length === 0}
              className={`flex items-center gap-2 px-5 py-2 md:px-6 md:py-2.5 rounded-full transition-all duration-300 text-xs md:text-sm font-medium ${
                selectedKeywords.length > 0
                  ? 'glass-button-primary cursor-pointer'
                  : 'bg-dark-surface/50 text-dark-muted cursor-not-allowed border border-dark-border opacity-60'
              }`}
            >
              <span>Generate Drafts</span>
              <Send
                size={14}
                className={selectedKeywords.length > 0 ? 'text-brand-accent' : ''}
              />
            </button>
          </div>

          <div className="min-h-[38px] flex flex-wrap gap-2 max-h-24 overflow-y-auto items-center">
            <AnimatePresence>
              {selectedKeywords.length === 0 && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-dark-muted/60 text-xs md:text-sm italic py-1"
                >
                  Click floating keywords above to attach strategic context to your message...
                </motion.span>
              )}
              {selectedKeywords.map((kw) => (
                <motion.div
                  key={`dock-${kw}`}
                  initial={{ opacity: 0, scale: 0.8, y: 8 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.15 } }}
                  className="flex items-center gap-1.5 px-3 py-1 bg-brand-primary/15 border border-brand-primary/40 rounded-full text-brand-text text-xs shadow-sm hover:border-brand-primary/70 transition-colors"
                >
                  <span className="text-gray-200">{kw}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeKeyword(kw);
                    }}
                    className="text-brand-primary hover:text-white transition-colors p-0.5 bg-brand-primary/20 hover:bg-brand-primary/50 rounded-full cursor-pointer"
                    title={`Remove ${kw}`}
                  >
                    <X size={11} />
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
