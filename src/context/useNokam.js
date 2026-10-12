import { useContext } from 'react';
import { NokamContext } from './nokamContextDef';

export function useNokam() {
  const ctx = useContext(NokamContext);
  if (!ctx) {
    throw new Error('useNokam must be used within a NokamProvider');
  }
  return ctx;
}
