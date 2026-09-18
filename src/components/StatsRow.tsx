import React from 'react';
import { ArrowUpRight, ArrowDownLeft, PiggyBank } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { formatETB } from '../utils/numberToWords';

export const StatsRow: React.FC = () => {
  const { transactions, openModal, t } = useBanking();

  const totalIncome = transactions
    .filter(tx => tx.type === 'deposit' || tx.type === 'in' || tx.direction === 'in')
    .reduce((sum, tx) => sum + (tx.totalDebit || tx.amount), 0);

  const totalExpense = transactions
    .filter(tx => tx.type === 'out' || tx.direction === 'out')
    .reduce((sum, tx) => sum + (tx.totalDebit || tx.amount), 0);

  const savingsRate = totalIncome > 0 ? Math.max(0, Math.round(((totalIncome - totalExpense) / totalIncome) * 100)) : 0;

  return (
    <div className="grid grid-cols-3 gap-2.5 mb-4">
      <div
        onClick={() => openModal('history')}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs hover:border-emerald-500/40 transition cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto mb-1.5">
          <ArrowDownLeft size={16} />
        </div>
        <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {formatETB(totalIncome)}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {t('totalIncome')}
        </div>
      </div>

      <div
        onClick={() => openModal('history')}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs hover:border-emerald-500/40 transition cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-rose-50 dark:bg-rose-950/50 text-rose-600 dark:text-rose-400 flex items-center justify-center mx-auto mb-1.5">
          <ArrowUpRight size={16} />
        </div>
        <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
          {formatETB(totalExpense)}
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {t('totalExpense')}
        </div>
      </div>

      <div
        onClick={() => openModal('savings')}
        className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl p-3 text-center shadow-xs hover:border-emerald-500/40 transition cursor-pointer"
      >
        <div className="w-7 h-7 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mx-auto mb-1.5">
          <PiggyBank size={16} />
        </div>
        <div className="text-[11px] sm:text-xs font-bold text-slate-800 dark:text-slate-100">
          {savingsRate}%
        </div>
        <div className="text-[10px] text-slate-500 dark:text-slate-400 font-medium mt-0.5">
          {t('savingsGoal')}
        </div>
      </div>
    </div>
  );
};
