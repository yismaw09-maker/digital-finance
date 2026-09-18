import React from 'react';
import { useBanking } from '../context/BankingContext';

export const Toast: React.FC = () => {
  const { toast } = useBanking();

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 pointer-events-none max-w-[90vw] animate-in fade-in slide-in-from-bottom-5 duration-200">
      <div className="bg-slate-900/95 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-semibold px-5 py-3 rounded-full shadow-2xl backdrop-blur-md flex items-center gap-2 border border-slate-700 dark:border-slate-300">
        <span>{toast}</span>
      </div>
    </div>
  );
};
