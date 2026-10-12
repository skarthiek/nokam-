import React, { useState, useEffect, useCallback, useRef } from 'react';
import { NokamContext } from './nokamContextDef';


const STORAGE_KEYS = {
  MESSAGE: 'nokam_message',
  INTENT: 'nokam_intent',
  SCREEN: 'nokam_screen',
  KEYWORDS: 'nokam_keywords',
  SELECTED_KEYWORDS: 'nokam_selected_keywords',
  DRAFTS: 'nokam_drafts',
  DRAFT_INDEX: 'nokam_draft_index'
};

const DEFAULT_MESSAGE = "Sorry, we don't think we can do this at this price.";

export function NokamProvider({ children }) {
  // Load state from localStorage or initialize with defaults
  const [message, setMessageState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.MESSAGE) || DEFAULT_MESSAGE;
  });

  const [screen, setScreenState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.SCREEN) || 'message';
  });

  const [intent, setIntentState] = useState(() => {
    return localStorage.getItem(STORAGE_KEYS.INTENT) || '';
  });

  const [keywords, setKeywordsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.KEYWORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [selectedKeywords, setSelectedKeywordsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.SELECTED_KEYWORDS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [drafts, setDraftsState] = useState(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEYS.DRAFTS);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [draftIndex, setDraftIndexState] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEYS.DRAFT_INDEX);
    return saved ? parseInt(saved, 10) : 0;
  });

  const [isLoadingKeywords, setIsLoadingKeywords] = useState(false);
  const [isLoadingDrafts, setIsLoadingDrafts] = useState(false);
  const [errorMessage, setErrorMessage] = useState(null);

  // Keep a ref to avoid stale closures
  const keywordsRef = useRef(keywords);
  useEffect(() => {
    keywordsRef.current = keywords;
  }, [keywords]);

  // Setters with localStorage synchronization
  const setMessage = useCallback((newMsg) => {
    setMessageState(newMsg);
    localStorage.setItem(STORAGE_KEYS.MESSAGE, newMsg);
  }, []);

  const setScreen = useCallback((newScreen) => {
    setScreenState(newScreen);
    localStorage.setItem(STORAGE_KEYS.SCREEN, newScreen);
  }, []);

  const setIntent = useCallback((newIntent) => {
    setIntentState(newIntent);
    localStorage.setItem(STORAGE_KEYS.INTENT, newIntent);
  }, []);

  const setKeywords = useCallback((newKeywords) => {
    setKeywordsState(newKeywords);
    localStorage.setItem(STORAGE_KEYS.KEYWORDS, JSON.stringify(newKeywords));
  }, []);

  const setSelectedKeywords = useCallback((newSelected) => {
    setSelectedKeywordsState(newSelected);
    localStorage.setItem(STORAGE_KEYS.SELECTED_KEYWORDS, JSON.stringify(newSelected));
  }, []);

  const setDrafts = useCallback((newDrafts) => {
    setDraftsState(newDrafts);
    localStorage.setItem(STORAGE_KEYS.DRAFTS, JSON.stringify(newDrafts));
  }, []);

  const setDraftIndex = useCallback((idx) => {
    setDraftIndexState(idx);
    localStorage.setItem(STORAGE_KEYS.DRAFT_INDEX, String(idx));
  }, []);

  // Toggle keyword in selected list
  const toggleKeyword = useCallback((kw) => {
    setSelectedKeywordsState(prev => {
      const next = prev.includes(kw) ? prev.filter(k => k !== kw) : [...prev, kw];
      localStorage.setItem(STORAGE_KEYS.SELECTED_KEYWORDS, JSON.stringify(next));
      return next;
    });
  }, []);

  // Remove single keyword from selected
  const removeKeyword = useCallback((kw) => {
    setSelectedKeywordsState(prev => {
      const next = prev.filter(k => k !== kw);
      localStorage.setItem(STORAGE_KEYS.SELECTED_KEYWORDS, JSON.stringify(next));
      return next;
    });
  }, []);

  // Fetch or regenerate keywords from Gemini backend
  const fetchKeywords = useCallback(async (customIntent = null, forceRefresh = false) => {
    const currentIntent = customIntent || intent;
    const currentMsg = message.trim();

    if (!currentMsg) return;

    // If keywords already exist and not forcing refresh, do not overwrite!
    if (!forceRefresh && keywordsRef.current && keywordsRef.current.length > 0) {
      return keywordsRef.current;
    }

    setIsLoadingKeywords(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/keywords', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMsg,
          intent: currentIntent
        })
      });

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.keywords) && data.keywords.length > 0) {
        setKeywords(data.keywords);
        return data.keywords;
      }
    } catch (err) {
      console.error('[Nokam] Failed to fetch keywords from Gemini:', err);
      setErrorMessage('Could not refresh keywords from AI. Retaining existing keywords.');
      // Keep existing keywords intact! Never wipe out.
      if (!keywordsRef.current || keywordsRef.current.length === 0) {
        const fallbacks = [
          'Understand', 'Flexible Terms', 'Scope Adjustment', 'Partnership',
          'Discuss', 'Budget Fit', 'Timeline', 'Future Value', 'Payment Structure', 'Product Quality'
        ];
        setKeywords(fallbacks);
        return fallbacks;
      }
    } finally {
      setIsLoadingKeywords(false);
    }
  }, [intent, message, setKeywords]);

  // Fetch drafts from Gemini backend
  const fetchDrafts = useCallback(async (forceRefresh = false) => {
    const currentMsg = message.trim();
    if (!currentMsg) return;

    if (!forceRefresh && drafts && drafts.length > 0) {
      return drafts;
    }

    setIsLoadingDrafts(true);
    setErrorMessage(null);

    try {
      const res = await fetch('/api/drafts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: currentMsg,
          intent: intent || 'soft-continue',
          keywords: selectedKeywords
        })
      });

      if (!res.ok) {
        const errJson = await res.json().catch(() => ({}));
        throw new Error(errJson.error || `Server returned HTTP ${res.status}`);
      }

      const data = await res.json();
      if (Array.isArray(data.drafts) && data.drafts.length > 0) {
        setDrafts(data.drafts);
        setDraftIndex(0);
        return data.drafts;
      }
    } catch (err) {
      console.error('[Nokam] Failed to fetch drafts:', err);
      setErrorMessage(`Failed to generate drafts: ${err.message}`);
      // Fallback draft based on actual context so user is never stuck
      const fallbackDrafts = [
        `We completely understand your perspective regarding the pricing. Since we are keen on building a strong partnership, we would love to discuss flexible terms and scope options that align with your budget.`,
        `Thank you for being upfront about your budget constraints. We value the relationship and would be glad to explore alternative structures or adjusted deliverables to make this work.`,
        `Understood. We are committed to finding common ground—could we schedule a brief 10-minute touchpoint this week to look at mutually agreeable options?`
      ];
      setDrafts(fallbackDrafts);
      setDraftIndex(0);
      return fallbackDrafts;
    } finally {
      setIsLoadingDrafts(false);
    }
  }, [message, intent, selectedKeywords, drafts, setDrafts, setDraftIndex]);

  // Reset navigation back to start while preserving keywords in state & storage
  const startOver = useCallback(() => {
    setScreen('message');
    // Note: Do NOT clear keywords or selectedKeywords, so user never loses them!
  }, [setScreen]);

  return (
    <NokamContext.Provider
      value={{
        message,
        setMessage,
        screen,
        setScreen,
        intent,
        setIntent,
        keywords,
        setKeywords,
        selectedKeywords,
        setSelectedKeywords,
        toggleKeyword,
        removeKeyword,
        fetchKeywords,
        drafts,
        setDrafts,
        draftIndex,
        setDraftIndex,
        fetchDrafts,
        isLoadingKeywords,
        isLoadingDrafts,
        errorMessage,
        setErrorMessage,
        startOver
      }}
    >
      {children}
    </NokamContext.Provider>
  );
}


