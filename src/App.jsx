import React from 'react';
import { AnimatePresence } from 'framer-motion';
import { NokamProvider } from './context/NokamContext';
import { useNokam } from './context/useNokam';
import MessageScreen from './components/MessageScreen';
import IntentScreen from './components/IntentScreen';
import KeywordScreen from './components/KeywordScreen';
import DraftScreen from './components/DraftScreen';

function AppContent() {
  const {
    screen,
    setScreen,
    intent,
    setIntent,
    selectedKeywords,
    setSelectedKeywords,
    startOver
  } = useNokam();

  return (
    <div className="w-full h-screen radial-bg text-dark-text overflow-hidden flex flex-col">
      {/* Header */}
      <header className="w-full px-6 py-4 flex justify-between items-center z-50 absolute top-0 left-0">
        <div 
          className="flex items-center gap-3 group cursor-pointer" 
          onClick={() => setScreen('message')}
          title="Return to message"
        >
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-primary to-brand-accent flex items-center justify-center shadow-[0_0_15px_rgba(99,102,241,0.5)] group-hover:shadow-[0_0_25px_rgba(99,102,241,0.8)] transition-shadow duration-300">
            <span className="font-bold text-white text-sm">N</span>
          </div>
          <span className="font-semibold text-lg tracking-widest uppercase text-white/90 group-hover:text-white transition-colors">NOKAM</span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-brand-primary/10 border border-brand-primary/30 text-brand-primary font-mono ml-1 hidden sm:inline-block">
            Gemini 2.5 Flash
          </span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 relative pt-16 w-full max-w-7xl mx-auto h-full overflow-y-auto overflow-x-hidden">
        <AnimatePresence mode="wait">
          {screen === 'message' && (
            <MessageScreen key="message" onNext={() => setScreen('intent')} />
          )}
          
          {screen === 'intent' && (
            <IntentScreen 
              key="intent" 
              onSelectIntent={(selected) => {
                setIntent(selected);
                setScreen('keywords');
              }} 
            />
          )}

          {screen === 'keywords' && (
            <KeywordScreen 
              key="keywords" 
              selectedIntent={intent}
              onBack={() => setScreen('intent')}
              onSubmit={(selectedKeys) => {
                setSelectedKeywords(selectedKeys);
                setScreen('draft');
              }}
            />
          )}

          {screen === 'draft' && (
            <DraftScreen 
              key="draft"
              intent={intent}
              keywords={selectedKeywords}
              onBackToKeywords={() => setScreen('keywords')}
              onStartOver={startOver}
            />
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}

export default function App() {
  return (
    <NokamProvider>
      <AppContent />
    </NokamProvider>
  );
}
