import React from 'react';
import {
  Zap,
  Send,
  ArrowDown,
  Lightbulb,
  QrCode,
  PlusCircle,
  HandCoins,
  History,
  Landmark,
  BookOpen,
  CreditCard,
  FileText,
  Smartphone,
  ChevronRight
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const ControlCenter: React.FC = () => {
  const { openModal, t } = useBanking();

  const operations = [
    {
      id: 'rtgs',
      title: 'RTGS',
      badge: '>= 200k',
      icon: Zap,
      gradient: 'from-amber-500 to-amber-700',
      shadow: 'shadow-amber-500/25',
      hasPulse: true
    },
    {
      id: 'send',
      title: t('send'),
      icon: Send,
      gradient: 'from-emerald-500 to-emerald-700',
      shadow: 'shadow-emerald-500/25'
    },
    {
      id: 'receive',
      title: t('receive'),
      icon: ArrowDown,
      gradient: 'from-sky-500 to-sky-700',
      shadow: 'shadow-sky-500/25'
    },
    {
      id: 'advice',
      title: t('adviceBtn'),
      icon: Lightbulb,
      gradient: 'from-lime-600 to-green-700',
      shadow: 'shadow-green-500/25'
    },
    {
      id: 'pay',
      title: t('pay'),
      icon: QrCode,
      gradient: 'from-purple-500 to-purple-700',
      shadow: 'shadow-purple-500/25'
    },
    {
      id: 'deposit',
      title: t('deposit'),
      icon: PlusCircle,
      gradient: 'from-teal-500 to-teal-700',
      shadow: 'shadow-teal-500/25'
    },
    {
      id: 'withdraw',
      title: t('withdraw'),
      icon: HandCoins,
      gradient: 'from-rose-500 to-rose-700',
      shadow: 'shadow-rose-500/25'
    },
    {
      id: 'history',
      title: t('history'),
      icon: History,
      gradient: 'from-slate-600 to-slate-800',
      shadow: 'shadow-slate-500/25'
    },
    {
      id: 'accounts',
      title: t('accounts'),
      icon: Landmark,
      gradient: 'from-indigo-500 to-indigo-700',
      shadow: 'shadow-indigo-500/25'
    },
    {
      id: 'bankDirectory',
      title: t('banks'),
      icon: BookOpen,
      gradient: 'from-cyan-600 to-cyan-800',
      shadow: 'shadow-cyan-500/25'
    },
    {
      id: 'cards',
      title: t('cards'),
      icon: CreditCard,
      gradient: 'from-violet-500 to-violet-700',
      shadow: 'shadow-violet-500/25'
    },
    {
      id: 'loans',
      title: t('loans'),
      icon: HandCoins,
      gradient: 'from-orange-500 to-orange-700',
      shadow: 'shadow-orange-500/25'
    },
    {
      id: 'billPay',
      title: t('billPay'),
      icon: FileText,
      gradient: 'from-pink-500 to-pink-700',
      shadow: 'shadow-pink-500/25'
    },
    {
      id: 'airtime',
      title: t('airtime'),
      icon: Smartphone,
      gradient: 'from-blue-500 to-blue-700',
      shadow: 'shadow-blue-500/25'
    }
  ];

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span>{t('controlCenter')}</span>
        </h3>
        <button
          onClick={() => openModal('dashboard')}
          className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5 cursor-pointer"
        >
          <span>{t('viewAll')}</span>
          <ChevronRight size={13} />
        </button>
      </div>

      <div className="grid grid-cols-4 sm:grid-cols-7 gap-2.5">
        {operations.map(op => {
          const Icon = op.icon;
          return (
            <button
              key={op.id}
              onClick={() => openModal(op.id)}
              className={`relative flex flex-col items-center justify-center p-2.5 sm:py-3.5 rounded-2xl bg-gradient-to-b ${op.gradient} text-white shadow-md ${op.shadow} hover:-translate-y-1 hover:shadow-lg active:scale-95 transition duration-200 cursor-pointer overflow-hidden text-center group`}
            >
              {/* Highlight glass reflection */}
              <div className="absolute inset-x-0 top-0 h-1/2 bg-gradient-to-b from-white/20 to-transparent rounded-t-2xl pointer-events-none" />

              {/* Pulse tag for RTGS */}
              {op.hasPulse && (
                <span className="absolute top-1.5 right-1.5 flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-200" />
                </span>
              )}

              <div className="w-8 h-8 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center mb-1.5 shadow-inner transition group-hover:scale-110">
                <Icon size={16} className="text-white drop-shadow-xs" />
              </div>

              <span className="text-[10px] sm:text-xs font-bold leading-tight line-clamp-1 tracking-tight">
                {op.title}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
