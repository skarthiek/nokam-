import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Loader2 } from 'lucide-react';
import { useNokam } from '../context/useNokam';

const PRESET_MESSAGES = [
  { label: 'Price Objection', text: "Sorry, we don't think we can do this at this price." },
  { label: 'Scope Creep', text: "Can you also include mobile apps and priority support within the existing budget?" },
  { label: 'Rushed Deadline', text: "We need this delivered by Friday instead of next month, is that doable?" }
];

export default function MessageScreen({ onNext }) {
  const { message, setMessage, fetchKeywords, isLoadingKeywords } = useNokam();
  const [localMsg, setLocalMsg] = useState(message || "Sorry, we don't think we can do this at this price.");

  const handleTextChange = (e) => {
    setLocalMsg(e.target.value);
    setMessage(e.target.value);
  };

  const handleSelectPreset = (text) => {
    setLocalMsg(text);
    setMessage(text);
  };

  const handleAnalyze = async () => {
    const trimmed = localMsg.trim();
    if (!trimmed) return;
    setMessage(trimmed);
    // Trigger Gemini keyword generation in background
    fetchKeywords(null, false);
    onNext();
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-2xl mx-auto p-4 md:p-6"
    >
      <div className="w-full glass-panel p-6 md:p-12 relative overflow-hidden group">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-primary to-brand-accent transform origin-left scale-x-0 group-hover:scale-x-100 transition-transform duration-500"></div>
        
        <div className="flex justify-between items-center mb-4 md:mb-6">
          <h2 className="text-xs md:text-sm text-brand-accent font-semibold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-accent animate-pulse"></span>
            Incoming Message
          </h2>
          <span className="text-[11px] text-dark-muted hidden sm:inline">Click text to edit</span>
        </div>

        {/* Editable incoming message */}
        <div className="relative mb-6">
          <textarea
            value={localMsg}
            onChange={handleTextChange}
            rows={3}
            placeholder="Type or paste the client message here..."
            className="w-full text-2xl md:text-3xl font-light text-dark-text leading-tight bg-transparent border-b border-dark-border/60 focus:border-brand-primary focus:outline-none resize-none transition-all duration-200 placeholder:text-dark-muted/40 py-1"
          />
        </div>

        {/* Preset quick pills for easy testing */}
        <div className="flex flex-wrap gap-2 mb-8 items-center">
          <span className="text-[11px] text-dark-muted font-medium">Quick examples:</span>
          {PRESET_MESSAGES.map((preset) => (
            <button
              key={preset.label}
              type="button"
              onClick={() => handleSelectPreset(preset.text)}
              className="text-xs px-3 py-1 rounded-full bg-dark-surface/80 border border-dark-border hover:border-brand-primary/40 hover:text-brand-primary text-dark-muted transition-colors"
            >
              {preset.label}
            </button>
          ))}
        </div>
        
        <div className="flex justify-end items-center gap-3">
          <button 
            type="button"
            onClick={handleAnalyze}
            disabled={!localMsg.trim() || isLoadingKeywords}
            className="flex items-center gap-2 px-6 py-3 rounded-full glass-button-primary group disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingKeywords ? (
              <>
                <Loader2 size={18} className="animate-spin text-brand-accent" />
                <span className="font-medium tracking-wide">Analyzing with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles size={18} className="text-brand-accent group-hover:animate-pulse-glow" />
                <span className="font-medium tracking-wide">Analyze Intent</span>
              </>
            )}
          </button>
        </div>
      </div>
    </motion.div>
  );
}
