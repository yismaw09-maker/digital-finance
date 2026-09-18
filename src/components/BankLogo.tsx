import React, { useState } from 'react';
import { Landmark } from 'lucide-react';
import { BankMaster } from '../types';
import { getBankLogoChain } from '../utils/logoResolver';

interface BankLogoProps {
  bank: BankMaster;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BankLogo: React.FC<BankLogoProps> = ({ bank, className = '', size = 'md' }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [hasFailedAll, setHasFailedAll] = useState(false);
  const chain = getBankLogoChain(bank);

  const handleError = () => {
    if (currentIdx + 1 < chain.length) {
      setCurrentIdx(prev => prev + 1);
    } else {
      setHasFailedAll(true);
    }
  };

  const sizeClasses = {
    sm: 'w-8 h-8 rounded-lg text-sm',
    md: 'w-11 h-11 rounded-xl text-base',
    lg: 'w-14 h-14 rounded-2xl text-xl'
  };

  const iconSizes = {
    sm: 16,
    md: 20,
    lg: 26
  };

  if (hasFailedAll || chain.length === 0) {
    return (
      <div className={`bg-emerald-50 dark:bg-emerald-950/50 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 ${sizeClasses[size]} ${className}`}>
        <Landmark size={iconSizes[size]} />
      </div>
    );
  }

  return (
    <div className={`bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 p-1 flex items-center justify-center overflow-hidden flex-shrink-0 shadow-sm ${sizeClasses[size]} ${className}`}>
      <img
        src={chain[currentIdx]}
        alt={bank.name}
        onError={handleError}
        loading="lazy"
        referrerPolicy="no-referrer"
        className="w-full h-full object-contain"
      />
    </div>
  );
};
