import React from 'react';
import { Eye, EyeOff, Send, ArrowDown, BookOpen, Sparkles } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { formatETB } from '../utils/numberToWords';

export const WelcomeBanner: React.FC = () => {
  const { user, accounts, balanceVisible, toggleBalanceVisibility, openModal, t } = useBanking();

  const totalBalance = accounts.reduce((sum, a) => sum + a.balance, 0);

  return (
    <div className="relative rounded-3xl bg-gradient-to-tr from-emerald-800 via-emerald-700 to-teal-800 p-5 sm:p-6 text-white shadow-xl shadow-emerald-900/15 overflow-hidden mb-4 border border-emerald-600/30">
      {/* Subtle background circular glow */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/10 rounded-full blur-xl pointer-events-none" />
      <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-teal-400/10 rounded-full blur-xl pointer-events-none" />

      <div className="relative z-10 flex flex-col justify-between">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="text-xs font-semibold text-emerald-200 tracking-wide flex items-center gap-1.5">
              <span>{t('welcomeBack')}</span>
              <Sparkles size={13} className="text-amber-300" />
            </div>
            <h2 className="text-xl font-extrabold tracking-tight mt-0.5">{user.name}</h2>
          </div>

          <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-xs border border-white/20">
            <span>🇪🇹</span>
            <span>31 Banks</span>
          </span>
        </div>

        <div className="mb-4">
          <div className="text-xs font-medium text-emerald-200 uppercase tracking-wider mb-1">
            {t('totalBalance')}
          </div>
          <div className="flex items-center gap-3">
            <span className="text-2xl sm:text-3xl font-black tracking-tight">
              {balanceVisible ? formatETB(totalBalance) : 'ETB ••••••••'}
            </span>
            <button
              onClick={toggleBalanceVisibility}
              className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer text-white"
              title={balanceVisible ? 'Hide Balance' : 'Show Balance'}
            >
              {balanceVisible ? <Eye size={15} /> : <EyeOff size={15} />}
            </button>
          </div>
        </div>

        {/* Quick buttons */}
        <div className="flex flex-wrap gap-2 pt-2 border-t border-white/15">
          <button
            onClick={() => openModal('send')}
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
          >
            <Send size={13} />
            <span>{t('send')}</span>
          </button>
          <button
            onClick={() => openModal('receive')}
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
          >
            <ArrowDown size={13} />
            <span>{t('receive')}</span>
          </button>
          <button
            onClick={() => openModal('bankDirectory')}
            className="px-3.5 py-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white text-xs font-semibold flex items-center gap-1.5 transition active:scale-95 border border-white/20 cursor-pointer"
          >
            <BookOpen size={13} />
            <span>{t('banks')} (31)</span>
          </button>
        </div>
      </div>
    </div>
  );
};
