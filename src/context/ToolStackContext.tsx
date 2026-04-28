'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import Mobile from '@/lib/mobileAdapters';

type ToolStackContextType = {
  stack: string[];
  addToStack: (slug: string) => void;
  removeFromStack: (slug: string) => void;
  toggleStack: (slug: string) => void;
  isInStack: (slug: string) => boolean;
  isStackOpen: boolean;
  setStackOpen: (open: boolean) => void;
};

const ToolStackContext = createContext<ToolStackContextType | undefined>(undefined);

export function ToolStackProvider({ children }: { children: ReactNode }) {
  const [stack, setStack] = useState<string[]>([]);
  const [isStackOpen, setStackOpen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Load from local storage
  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const saved = await Mobile.storageGet('toolverse_tool_stack');
        if (!active) return;
        if (saved) setStack(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse tool stack from local storage', e);
      } finally {
        if (active) setIsInitialized(true);
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  // Save to local storage
  useEffect(() => {
    if (isInitialized) {
      void Mobile.storageSet('toolverse_tool_stack', JSON.stringify(stack));
    }
  }, [stack, isInitialized]);

  const addToStack = (slug: string) => {
    setStack(prev => {
      if (prev.includes(slug)) return prev;
      return [...prev, slug];
    });
  };

  const removeFromStack = (slug: string) => {
    setStack(prev => prev.filter(item => item !== slug));
  };

  const toggleStack = (slug: string) => {
    setStack(prev => {
      if (prev.includes(slug)) return prev.filter(item => item !== slug);
      return [...prev, slug];
    });
  };

  const isInStack = (slug: string) => stack.includes(slug);

  return (
    <ToolStackContext.Provider value={{ stack, addToStack, removeFromStack, toggleStack, isInStack, isStackOpen, setStackOpen }}>
      {children}
    </ToolStackContext.Provider>
  );
}

export function useToolStack() {
  const context = useContext(ToolStackContext);
  if (context === undefined) {
    throw new Error('useToolStack must be used within a ToolStackProvider');
  }
  return context;
}
