import { useEffect, useState } from 'react';

export type FontSize = 'normal' | 'grande' | 'extra';

const STORAGE_KEY = 'cryomanager-font-size';

const SCALE: Record<FontSize, string> = {
  normal: '100%',
  grande: '112.5%',
  extra: '125%',
};

function readStored(): FontSize {
  try {
    const value = localStorage.getItem(STORAGE_KEY);
    if (value === 'grande' || value === 'extra') return value;
  } catch {
    // localStorage indisponível: usa padrão
  }
  return 'normal';
}

export function useFontSize() {
  const [fontSize, setFontSize] = useState<FontSize>(readStored);

  useEffect(() => {
    document.documentElement.style.fontSize = SCALE[fontSize];
    try {
      localStorage.setItem(STORAGE_KEY, fontSize);
    } catch {
      // sem persistência disponível; mantém apenas na sessão
    }
    return () => {
      document.documentElement.style.fontSize = '';
    };
  }, [fontSize]);

  return { fontSize, setFontSize };
}
