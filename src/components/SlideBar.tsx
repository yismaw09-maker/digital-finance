import React from 'react';
import {
  X,
  User,
  LayoutDashboard,
  Landmark,
  PlusCircle,
  ArrowLeftRight,
  Zap,
  CreditCard,
  QrCode,
  HandCoins,
  BookOpen,
  Lightbulb,
  PiggyBank,
  PieChart,
  Bot,
  Receipt,
  ShieldCheck,
  Bell,
  HelpCircle,
  LogOut,
  Send,
  KeyRound
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { formatETB } from '../utils/numberToWords';

interface SlideBarProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SlideBar: React.FC<SlideBarProps> = ({ isOpen, onClose }) => {
  const { user, accounts, primaryAccount, balanceVisible, openModal, logout, t } = useBanking();

  const totalBalance = accounts.reduce((acc, cur) => acc + cur.balance, 0);

  const handleNavigate = (modalName: string) => {
    onClose();
    openModal(modalName);
  };

  const handleLogout = () => {
    onClose();
    logout();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-xs transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Slide-out drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Drawer Header with user info */}
        <div className="bg-gradient-to-br from-emerald-700 to-emerald-900 p-5 text-white relative flex-shrink-0">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition"
          >
            <X size={16} />
          </button>

          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-white/20 border-2 border-white/30 flex items-center justify-center text-xl">
              <User size={24} />
            </div>
            <div>
              <h4 className="font-bold text-sm tracking-tight">{user.name}</h4>
              <p className="text-[11px] text-emerald-200 truncate max-w-[180px]">
                {primaryAccount ? `${primaryAccount.bank} · ${primaryAccount.accountNo.slice(-4)}` : user.email}
              </p>
            </div>
          </div>

          <div className="pt-2 border-t border-emerald-600/50">
            <div className="text-[11px] text-emerald-200 uppercase tracking-wider font-semibold">
              {t('totalBalance')}
            </div>
            <div className="text-xl font-black tracking-tight">
              {balanceVisible ? formatETB(totalBalance) : '••••••••'}
            </div>
          </div>
        </div>

        {/* Scrollable menu */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 text-xs font-medium">
          {/* Main Menu */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('mainMenu')}
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleNavigate('dashboard')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <LayoutDashboard size={15} />
                </div>
                <span>{t('dashboard')}</span>
              </button>

              <button
                onClick={() => handleNavigate('accounts')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Landmark size={15} />
                </div>
                <span>{t('myAccounts')}</span>
              </button>

              <button
                onClick={() => handleNavigate('addAccount')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <PlusCircle size={15} />
                </div>
                <span>{t('addAccountMenu')}</span>
              </button>

              <button
                onClick={() => handleNavigate('send')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <ArrowLeftRight size={15} />
                </div>
                <span>{t('transfers')}</span>
              </button>

              <button
                onClick={() => handleNavigate('rtgs')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-amber-900 dark:text-amber-200 hover:bg-amber-50 dark:hover:bg-amber-950/40 transition font-semibold"
              >
                <div className="w-7 h-7 rounded-lg bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 flex items-center justify-center">
                  <Zap size={15} />
                </div>
                <span>{t('rtgsBtn')} (High-Value)</span>
              </button>

              <button
                onClick={() => handleNavigate('pay')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <QrCode size={15} />
                </div>
                <span>{t('payments')}</span>
              </button>

              <button
                onClick={() => handleNavigate('loans')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <HandCoins size={15} />
                </div>
                <span>{t('loans')}</span>
              </button>
            </div>
          </div>

          {/* Financial Tools */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('financeTools')}
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleNavigate('bankDirectory')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-teal-100 dark:bg-teal-950/60 text-teal-700 dark:text-teal-400 flex items-center justify-center">
                  <BookOpen size={15} />
                </div>
                <span>{t('bankDirectory')} (31 Banks)</span>
              </button>

              <button
                onClick={() => handleNavigate('advice')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Lightbulb size={15} />
                </div>
                <span>{t('adviceBtn')}</span>
              </button>

              <button
                onClick={() => handleNavigate('savings')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <PiggyBank size={15} />
                </div>
                <span>{t('savings')}</span>
              </button>

              <button
                onClick={() => handleNavigate('budget')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-400 flex items-center justify-center">
                  <PieChart size={15} />
                </div>
                <span>{t('budget')}</span>
              </button>

              <button
                onClick={() => handleNavigate('aiChat')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-purple-100 dark:bg-purple-950/60 text-purple-700 dark:text-purple-400 flex items-center justify-center">
                  <Bot size={15} />
                </div>
                <span>{t('aiChat')}</span>
              </button>

              <button
                onClick={() => handleNavigate('receiptAdvisor')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-400 flex items-center justify-center">
                  <Receipt size={15} />
                </div>
                <span>{t('receiptAdvisor')}</span>
              </button>
            </div>
          </div>

          {/* Settings & Support */}
          <div>
            <div className="px-3 py-1 text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {t('settings')}
            </div>
            <div className="space-y-0.5 mt-1">
              <button
                onClick={() => handleNavigate('telegramHub')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-sky-50 dark:hover:bg-sky-950/40 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-sky-100 dark:bg-sky-950/60 text-[#229ED9] flex items-center justify-center">
                  <Send size={14} className="-rotate-12" />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t('telegramHub')}</div>
                  <div className="text-[10px] text-slate-400">@FinFlowEthiopiaBot</div>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('authCodesHub')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                  <KeyRound size={14} />
                </div>
                <div className="text-left">
                  <div className="font-semibold">{t('authCodesHub')}</div>
                  <div className="text-[10px] text-slate-400">2FA OTP Log</div>
                </div>
              </button>

              <button
                onClick={() => handleNavigate('profile')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <User size={15} />
                </div>
                <span>{t('profile')}</span>
              </button>

              <button
                onClick={() => handleNavigate('security')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <ShieldCheck size={15} />
                </div>
                <span>{t('security')}</span>
              </button>

              <button
                onClick={() => handleNavigate('notifications')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <Bell size={15} />
                </div>
                <span>{t('notifications')}</span>
              </button>

              <button
                onClick={() => handleNavigate('help')}
                className="w-full px-3 py-2 rounded-xl flex items-center gap-3 text-slate-700 dark:text-slate-200 hover:bg-emerald-50 dark:hover:bg-slate-800/80 transition"
              >
                <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 flex items-center justify-center">
                  <HelpCircle size={15} />
                </div>
                <span>{t('helpCenter')}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Logout */}
        <div className="p-3 border-t border-slate-200 dark:border-slate-800">
          <button
            onClick={handleLogout}
            className="w-full py-2.5 px-4 rounded-xl border border-rose-200 dark:border-rose-900/60 bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 font-bold text-xs flex items-center justify-center gap-2 hover:bg-rose-100 dark:hover:bg-rose-900/40 transition cursor-pointer"
          >
            <LogOut size={16} />
            <span>{t('logout')}</span>
          </button>
        </div>
      </aside>
    </>
  );
};
