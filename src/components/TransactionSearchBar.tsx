import React from 'react';
import { Search, X, SlidersHorizontal, ArrowUpDown } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const TransactionSearchBar: React.FC = () => {
  const { searchQuery, setSearchQuery, lang, transactions } = useBanking();

  const categories = [
    { id: '', label: lang === 'am' ? 'ሁሉም' : 'All' },
    { id: 'CBE', label: 'CBE' },
    { id: 'Telebirr', label: 'Telebirr' },
    { id: 'Awash', label: 'Awash' },
    { id: 'Dashen', label: 'Dashen' },
    { id: 'RTGS', label: 'RTGS' },
    { id: 'Deposit', label: lang === 'am' ? 'ተቀማጭ' : 'Deposit' }
  ];

  const trimmed = searchQuery.trim().toLowerCase();
  const matchCount = trimmed
    ? transactions.filter(
        tx =>
          tx.title.toLowerCase().includes(trimmed) ||
          tx.bank.toLowerCase().includes(trimmed) ||
          (tx.recipientName && tx.recipientName.toLowerCase().includes(trimmed)) ||
          (tx.type && tx.type.toLowerCase().includes(trimmed))
      ).length
    : transactions.length;

  return (
    <div className="mb-4">
      {/* Search Input Box */}
      <div className="relative flex items-center mb-2">
        <span className="absolute left-3.5 text-slate-400 dark:text-slate-500 pointer-events-none">
          <Search size={16} />
        </span>
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={
            lang === 'am'
              ? 'ግብይቶችን በነጋዴ ስም፣ በባንክ ወይም በአይነት ይፈልጉ...'
              : 'Search transactions by merchant, bank category...'
          }
          className="w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-800/80 hover:bg-white dark:hover:bg-slate-800 border border-slate-200/90 dark:border-slate-700/90 focus:border-emerald-500 rounded-2xl text-xs text-slate-900 dark:text-white placeholder:text-slate-400 transition focus:outline-none focus:ring-2 focus:ring-emerald-500/20 font-medium shadow-2xs"
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            className="absolute right-3 w-5 h-5 rounded-full bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center text-xs hover:bg-slate-300 dark:hover:bg-slate-600 transition"
            title="Clear search"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Category Pills & Match Indicator */}
      <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 no-scrollbar text-[11px]">
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {categories.map(cat => {
            const isSelected = cat.id === '' ? !searchQuery : searchQuery.toLowerCase() === cat.id.toLowerCase();
            return (
              <button
                key={cat.id || 'all'}
                onClick={() => setSearchQuery(cat.id === searchQuery ? '' : cat.id)}
                className={`px-2.5 py-1 rounded-full font-semibold transition cursor-pointer whitespace-nowrap ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {searchQuery.trim() && (
          <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 flex-shrink-0">
            {matchCount} {lang === 'am' ? 'ተገኝቷል' : 'found'}
          </span>
        )}
      </div>
    </div>
  );
};
