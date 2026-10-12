import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { RefreshCcw, Edit2, Copy, CheckCircle2, Home, ArrowLeft, Loader2, Check } from 'lucide-react';
import { useNokam } from '../context/useNokam';

export default function DraftScreen({ intent, keywords, onStartOver, onBackToKeywords }) {
  const {
    drafts,
    setDrafts,
    draftIndex,
    setDraftIndex,
    fetchDrafts,
    isLoadingDrafts,
    errorMessage
  } = useNokam();

  const [copied, setCopied] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editedText, setEditedText] = useState('');

  // Fetch drafts on mount if not already present
  useEffect(() => {
    if (!drafts || drafts.length === 0) {
      fetchDrafts(false);
    }
  }, [drafts, fetchDrafts]);

  const currentDraft = (drafts && drafts[draftIndex]) || '';

  const handleRegenerate = async () => {
    if (!drafts || drafts.length === 0) {
      await fetchDrafts(true);
      return;
    }
    // If we have drafts, cycle through them; if at end, request a new batch
    if (draftIndex < drafts.length - 1) {
      setDraftIndex(draftIndex + 1);
    } else {
      await fetchDrafts(true);
    }
    setCopied(false);
    setIsEditing(false);
  };

  const handleCopy = () => {
    if (!currentDraft) return;
    navigator.clipboard.writeText(currentDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleStartEdit = () => {
    setEditedText(currentDraft);
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (editedText.trim()) {
      const updatedDrafts = [...drafts];
      updatedDrafts[draftIndex] = editedText.trim();
      setDrafts(updatedDrafts);
    }
    setIsEditing(false);
  };

  const displayIntent = (intent || 'Intent').replace('-', ' ');

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center h-full w-full max-w-3xl mx-auto p-4 md:p-6"
    >
      {/* Top badges: Intent & preserved keywords */}
      <div className="w-full mb-6 md:mb-8 flex gap-2 flex-wrap justify-center items-center">
        <span className="px-3 py-1 text-[10px] md:text-xs font-medium bg-dark-surface border border-brand-primary/40 rounded-full text-brand-primary uppercase tracking-wider shadow-[0_0_10px_rgba(99,102,241,0.15)]">
          {displayIntent}
        </span>
        
        {keywords.map((kw) => (
          <span 
            key={`draft-kw-${kw}`} 
            className="px-3 py-1 text-xs font-medium glass-panel rounded-full text-dark-text border-white/10"
          >
            {kw}
          </span>
        ))}
      </div>

      {/* Main Draft Card */}
      <div className="w-full glass-panel p-6 md:p-10 relative overflow-hidden mb-8 md:mb-10 shadow-2xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-brand-accent to-brand-primary"></div>
        <div className="absolute -top-24 -right-24 w-48 h-48 bg-brand-primary/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute -bottom-24 -left-24 w-48 h-48 bg-brand-accent/10 rounded-full blur-3xl pointer-events-none"></div>
        
        <div className="flex justify-between items-center mb-6 md:mb-8">
          <h2 className="text-xs md:text-sm text-brand-primary font-semibold tracking-widest uppercase flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-primary animate-pulse"></span>
            AI Generated Draft {drafts.length > 0 && `(${draftIndex + 1}/${drafts.length})`}
          </h2>
          {isEditing && (
            <span className="text-xs text-brand-accent font-medium">Editing Draft</span>
          )}
        </div>
        
        {isLoadingDrafts ? (
          <div className="py-12 flex flex-col items-center justify-center gap-3">
            <Loader2 size={32} className="animate-spin text-brand-primary" />
            <p className="text-sm text-dark-muted font-light tracking-wide">
              Gemini 2.5 Flash is synthesizing strategic response...
            </p>
          </div>
        ) : isEditing ? (
          <div className="relative z-10 flex flex-col gap-3">
            <textarea
              value={editedText}
              onChange={(e) => setEditedText(e.target.value)}
              rows={4}
              className="w-full text-lg md:text-2xl font-light text-white leading-relaxed bg-dark-surface/80 border border-brand-primary/50 rounded-xl p-4 focus:outline-none focus:border-brand-primary"
            />
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setIsEditing(false)}
                className="px-4 py-1.5 text-xs rounded-full glass-button text-dark-muted hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveEdit}
                className="flex items-center gap-1.5 px-4 py-1.5 text-xs rounded-full glass-button-primary font-medium"
              >
                <Check size={14} /> Save Changes
              </button>
            </div>
          </div>
        ) : (
          <motion.div
            key={`draft-${draftIndex}`}
            initial={{ opacity: 0, filter: 'blur(8px)', y: 8 }}
            animate={{ opacity: 1, filter: 'blur(0px)', y: 0 }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
            className="relative z-10"
          >
            <p className="text-xl md:text-2xl font-light text-white leading-relaxed tracking-wide">
              "{currentDraft}"
            </p>
          </motion.div>
        )}

        {errorMessage && (
          <p className="mt-4 text-xs text-amber-400/90">{errorMessage}</p>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3 md:gap-4 justify-center w-full">
        <button 
          onClick={handleRegenerate}
          disabled={isLoadingDrafts}
          className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full glass-button group text-sm md:text-base cursor-pointer disabled:opacity-50"
        >
          <RefreshCcw size={16} className={`group-hover:-rotate-180 transition-transform duration-500 text-dark-muted group-hover:text-white ${isLoadingDrafts ? 'animate-spin' : ''}`} />
          <span>{draftIndex < drafts.length - 1 ? 'Next Variation' : 'Regenerate'}</span>
        </button>
        
        <button 
          onClick={handleStartEdit}
          disabled={isLoadingDrafts || isEditing}
          className="flex items-center gap-2 px-5 py-2.5 md:px-6 md:py-3 rounded-full glass-button group text-sm md:text-base cursor-pointer disabled:opacity-50"
        >
          <Edit2 size={16} className="text-dark-muted group-hover:text-brand-accent transition-colors" />
          <span>Edit</span>
        </button>
        
        <button 
          onClick={handleCopy}
          disabled={isLoadingDrafts || !currentDraft}
          className="flex items-center gap-2 px-8 py-2.5 md:px-8 md:py-3 rounded-full glass-button-primary group relative overflow-hidden text-sm md:text-base cursor-pointer disabled:opacity-50"
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

      {/* Navigation Footer */}
      <div className="mt-10 flex items-center gap-4">
        {onBackToKeywords && (
          <button 
            onClick={onBackToKeywords}
            className="flex items-center gap-1.5 text-xs md:text-sm text-dark-muted hover:text-white transition-colors py-2 px-3 rounded-full hover:bg-dark-surface border border-transparent hover:border-dark-border cursor-pointer"
          >
            <ArrowLeft size={14} /> Adjust Keywords
          </button>
        )}
        
        <button 
          onClick={onStartOver}
          className="flex items-center gap-1.5 text-xs md:text-sm text-dark-muted hover:text-white transition-colors py-2 px-3 rounded-full hover:bg-dark-surface border border-transparent hover:border-dark-border cursor-pointer"
        >
          <Home size={14} /> Start Over
        </button>
      </div>
    </motion.div>
  );
}
