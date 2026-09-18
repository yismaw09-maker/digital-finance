import React from 'react';
import {
  ArrowDownLeft,
  ArrowUpRight,
  PlusCircle,
  Inbox,
  ChevronRight,
  Zap,
  Smartphone,
  FileText,
  QrCode,
  Search
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { formatETB } from '../utils/numberToWords';
import { TransactionRecord } from '../types';

export const RecentTransactions: React.FC = () => {
  const { transactions, openModal, openTxDetail, searchQuery, setSearchQuery, lang, t } = useBanking();

  const getTxIcon = (tx: TransactionRecord) => {
    if (tx.icon?.includes('bolt')) return <Zap size={16} className="text-amber-600" />;
    if (tx.icon?.includes('qrcode')) return <QrCode size={16} className="text-purple-600" />;
    if (tx.icon?.includes('mobile')) return <Smartphone size={16} className="text-blue-600" />;
    if (tx.icon?.includes('invoice')) return <FileText size={16} className="text-pink-600" />;
    if (tx.type === 'deposit') return <PlusCircle size={16} className="text-teal-600" />;
    if (tx.direction === 'in' || tx.type === 'in') return <ArrowDownLeft size={16} className="text-emerald-600" />;
    return <ArrowUpRight size={16} className="text-rose-600" />;
  };

  const trimmed = searchQuery.trim().toLowerCase();
  const displayedTxs = trimmed
    ? transactions.filter(
        tx =>
          tx.title.toLowerCase().includes(trimmed) ||
          tx.bank.toLowerCase().includes(trimmed) ||
          (tx.recipientName && tx.recipientName.toLowerCase().includes(trimmed)) ||
          (tx.type && tx.type.toLowerCase().includes(trimmed))
      )
    : transactions.slice(0, 6);

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>
            {trimmed
              ? lang === 'am'
                ? `የፍለጋ ውጤቶች (${displayedTxs.length})`
                : `Filtered Results (${displayedTxs.length})`
              : t('recentTransactions')}
          </span>
        </h3>
        <button
          onClick={() => openModal('history')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{t('viewAll')}</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl overflow-hidden shadow-xs divide-y divide-slate-100 dark:divide-slate-800">
        {transactions.length === 0 ? (
          <div className="p-8 text-center text-slate-400 dark:text-slate-500">
            <Inbox size={32} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">{t('noTransactions')}</p>
          </div>
        ) : displayedTxs.length === 0 ? (
          <div className="p-6 text-center text-slate-400 dark:text-slate-500 space-y-2">
            <Search size={28} className="mx-auto text-slate-300 dark:text-slate-600" />
            <p className="text-xs font-medium">
              {lang === 'am' ? 'ምንም የሚመሳሰል ግብይት አልተገኘም' : 'No transactions matching this filter'}
            </p>
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="text-xs text-emerald-600 dark:text-emerald-400 font-bold hover:underline"
            >
              {lang === 'am' ? 'ፍለጋውን ያጽዱ' : 'Clear search query'}
            </button>
          </div>
        ) : (
          displayedTxs.map(tx => {
            const isPositive = tx.direction === 'in' || tx.type === 'deposit';
            return (
              <div
                key={tx.id}
                onClick={() => openTxDetail(tx)}
                className="p-3 sm:px-4 flex items-center justify-between hover:bg-slate-50 dark:hover:bg-slate-800/60 transition cursor-pointer"
              >
                <div className="flex items-center gap-3 min-w-0 pr-3">
                  <div className="w-9 h-9 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200/70 dark:border-slate-700/70 flex items-center justify-center flex-shrink-0">
                    {getTxIcon(tx)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                      {tx.title}
                    </div>
                    <div className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                      {tx.date} · {tx.bank}
                    </div>
                  </div>
                </div>

                <div className="text-right flex-shrink-0">
                  <div
                    className={`text-xs font-extrabold font-mono ${
                      isPositive ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-900 dark:text-slate-100'
                    }`}
                  >
                    {isPositive ? '+' : '−'} {formatETB(tx.totalDebit || tx.amount)}
                  </div>
                  <div className="text-[10px] text-slate-400 dark:text-slate-500">
                    {tx.time || 'Completed'}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
