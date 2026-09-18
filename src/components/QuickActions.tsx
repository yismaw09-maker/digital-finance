import React from 'react';
import { QrCode, HandCoins, CalendarClock, Bot } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const QuickActions: React.FC = () => {
  const { openModal, t } = useBanking();

  const actions = [
    {
      id: 'scanQR',
      title: t('scanQR'),
      icon: QrCode,
      color: 'text-purple-600 dark:text-purple-400',
      bg: 'bg-purple-50 dark:bg-purple-950/40'
    },
    {
      id: 'requestMoney',
      title: t('request'),
      icon: HandCoins,
      color: 'text-teal-600 dark:text-teal-400',
      bg: 'bg-teal-50 dark:bg-teal-950/40'
    },
    {
      id: 'schedule',
      title: t('schedule'),
      icon: CalendarClock,
      color: 'text-amber-600 dark:text-amber-400',
      bg: 'bg-amber-50 dark:bg-amber-950/40'
    },
    {
      id: 'aiChat',
      title: t('aiChat'),
      icon: Bot,
      color: 'text-emerald-600 dark:text-emerald-400',
      bg: 'bg-emerald-50 dark:bg-emerald-950/40'
    }
  ];

  return (
    <div className="mb-6">
      <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 mb-3 px-1">
        <span className="w-2 h-2 rounded-full bg-emerald-500" />
        <span>{t('quickActions')}</span>
      </h3>

      <div className="grid grid-cols-4 gap-2.5">
        {actions.map(act => {
          const Icon = act.icon;
          return (
            <button
              key={act.id}
              onClick={() => openModal(act.id)}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex flex-col items-center justify-center gap-1.5 hover:border-emerald-500/40 hover:-translate-y-0.5 active:scale-95 transition shadow-xs cursor-pointer group"
            >
              <div className={`w-9 h-9 rounded-xl ${act.bg} ${act.color} flex items-center justify-center transition group-hover:scale-110`}>
                <Icon size={18} />
              </div>
              <span className="text-[11px] font-bold text-slate-700 dark:text-slate-200 line-clamp-1">
                {act.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
