import React, { useState } from 'react';
import { Lock, X } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const PinModal: React.FC = () => {
  const { pinOpen, closePin, showToast, t } = useBanking();
  const [pin, setPin] = useState('');

  if (!pinOpen) return null;

  const handleKey = (digit: string) => {
    if (pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);

    if (next.length === 4) {
      setTimeout(() => {
        if (next === '1234') {
          showToast(t('pinSuccess'));
          closePin();
          setPin('');
        } else {
          showToast(t('pinFailed'));
          setPin('');
        }
      }, 250);
    }
  };

  const handleBackspace = () => {
    setPin(prev => prev.slice(0, -1));
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl p-6 relative">
        <button
          onClick={closePin}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-6">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2.5 shadow-md">
            <Lock size={22} />
          </div>
          <h3 className="font-bold text-base text-slate-900 dark:text-white">
            {t('enterPin')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('pinSubtitle')} (Demo: <span className="font-mono font-bold">1234</span>)
          </p>
        </div>

        {/* 4 Pin Dots */}
        <div className="flex justify-center gap-3.5 mb-6">
          {[0, 1, 2, 3].map(idx => (
            <div
              key={idx}
              className={`w-4 h-4 rounded-full transition-all duration-150 ${
                idx < pin.length
                  ? 'bg-emerald-600 dark:bg-emerald-400 scale-125'
                  : 'bg-slate-200 dark:bg-slate-700'
              }`}
            />
          ))}
        </div>

        {/* Keypad */}
        <div className="grid grid-cols-3 gap-2.5 max-w-[220px] mx-auto">
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', '*', '0', '⌫'].map(k => (
            <button
              key={k}
              type="button"
              onClick={() => {
                if (k === '⌫') handleBackspace();
                else if (k !== '*') handleKey(k);
              }}
              className="h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 hover:bg-emerald-100 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 font-bold text-lg active:scale-95 transition flex items-center justify-center cursor-pointer select-none"
            >
              {k}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
