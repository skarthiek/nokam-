import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Edit2, Copy, CheckCircle2, Home } from 'lucide-react';

const DRAFTS = [
  "We understand your position and really value the product. Since we're interested in building a long-term partnership, we'd like to discuss this further and see if we can agree on a better price.",
  "Thanks for letting us know. While the current price is a bit outside our budget, we highly value the quality of your product and are keen on a long-term partnership. Could we explore a more flexible pricing arrangement for future orders?",
  "I completely understand where you're coming from. Given our interest in a sustained partnership, we'd love to see if there's any room to discuss a better rate that works for both of us."
];

export default function DraftScreen({ intent, keywords, onStartOver }) {
  const [draftIndex, setDraftIndex] = useState(0);
  const [copied, setCopied] = useState(false);

  const handleRegenerate = () => {
    setDraftIndex((prev) => (prev + 1) % DRAFTS.length);
    setCopied(false);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(DRAFTS[draftIndex]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto p-4 md:p-6"
    >
      <div className="w-full mb-6 md:mb-10 flex gap-2 flex-wrap justify-center items-center">
        <span className="px-3 py-1 text-[10px] md:text-xs font-medium bg-dark-surface border border-brand-primary/30 rounded-full text-brand-primary uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.1)]">
          {intent.replace('-', ' ')}
        </span>
        {keywords.slice(0, 3).map(kw => (
          <span key={kw} className="px-3 py-1 text-xs font-medium glass-panel rounded-full text-dark-text border-white/10">
            {kw}
          </span>
        ))}
        {keywords.length > 3 && (
          <span className="px-3 py-1 text-xs font-medium glass-panel rounded-full text-dark-muted border-white/5">
            +{keywords.length - 3} more
          </span>
        )}
      </div>

      <div className="w-full glass-panel p-6 md:p-10 relative overflow-hidden mb-8 md:mb-12 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-brand-primary"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <h2 className="text-xs md:text-sm text-brand-primary mb-6 md:mb-8 font-semibold tracking-widest uppercase flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-primary"></span>
          AI Generated Draft
        </h2>
        
        <motion.div
          key={draftIndex}
          initial={{ opacity: 0, filter: 'blur(10px)', y: 10 }}
          animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="relative z-10"
        >
          <p className="text-xl md:text-3xl font-light text-white leading-relaxed tracking-wide">
            "{DRAFTS[draftIndex]}"
          </p>
        </motion.div>
      </div>

      <div className="flex flex-wrap gap-3 md:gap-4 justify-center w-full">
        <button 
          onClick={handleRegenerate}
          className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full glass-button group text-sm md:text-base"
        >
          <RefreshCcw size={16} className="group-hover:-rotate-180 transition-transform duration-500 text-dark-muted group-hover:text-white" />
          <span>Regenerate</span>
        </button>
        
        <button className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full glass-button group text-sm md:text-base">
          <Edit2 size={16} className="text-dark-muted group-hover:text-brand-accent transition-colors" />
          <span>Edit</span>
        </button>
        
        <button 
          onClick={handleCopy}
          className="flex items-center gap-2 px-8 py-2.5 md:px-8 md:py-3 rounded-full glass-button-primary group relative overflow-hidden text-sm md:text-base"
        >
          {copied ? (
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="flex items-center gap-2"
            >
              <CheckCircle2 size={18} />
              <span className="font-medium">Copied!</span>
            </motion.div>
          ) : (
            <div className="flex items-center gap-2">
              <Copy size={16} className="text-brand-accent group-hover:text-white transition-colors" />
              <span className="font-medium">Copy Draft</span>
            </div>
          )}
        </button>
      </div>

      <button 
        onClick={onStartOver}
        className="mt-12 flex items-center gap-2 text-xs md:text-sm text-dark-muted hover:text-white transition-colors py-2 px-4 rounded-full hover:bg-dark-surface border border-transparent hover:border-dark-border"
      >
        <Home size={14} /> Start Over
      </button>
    </motion.div>
  );
}
