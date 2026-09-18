import React, { useState, useRef, useEffect } from 'react';
import { Menu, Moon, Sun, Bell, User, ChevronDown, Send } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

interface HeaderProps {
  onOpenMenu: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenMenu }) => {
  const { theme, toggleTheme, lang, setLang, openModal, notifications } = useBanking();
  const [langDropdown, setLangDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setLangDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="flex items-center justify-between pb-3 mb-3 border-b border-slate-200/80 dark:border-slate-800/80">
      <div className="flex items-center gap-2.5">
        <button
          onClick={onOpenMenu}
          className="w-10 h-10 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-emerald-700 dark:text-emerald-400 flex items-center justify-center shadow-xs hover:bg-emerald-50 dark:hover:bg-slate-700 transition cursor-pointer"
          title="Open Menu"
        >
          <Menu size={20} />
        </button>

        <div className="flex items-center gap-1.5">
          <span className="text-xl" role="img" aria-label="Ethiopia">🇪🇹</span>
          <div className="font-extrabold text-base tracking-tight text-slate-900 dark:text-white flex items-center">
            FinFlow <span className="text-emerald-600 dark:text-emerald-400 ml-1">Ethiopia</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        {/* Theme toggle */}
        <button
          onClick={toggleTheme}
          className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
          title={theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}
        >
          {theme === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
        </button>

        {/* Language selector */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setLangDropdown(!langDropdown)}
            className="h-9 px-2.5 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center gap-1.5 text-xs font-bold hover:border-emerald-300 transition cursor-pointer"
          >
            <span>{lang === 'am' ? '🇪🇹' : '🇬🇧'}</span>
            <span>{lang === 'am' ? 'AM' : 'EN'}</span>
            <ChevronDown size={13} className={`transition-transform duration-200 ${langDropdown ? 'rotate-180' : ''}`} />
          </button>

          {langDropdown && (
            <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl shadow-xl py-1.5 z-40 animate-in fade-in zoom-in-95">
              <button
                onClick={() => {
                  setLang('am');
                  setLangDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2 transition ${
                  lang === 'am'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇪🇹</span>
                <span>አማርኛ</span>
              </button>
              <button
                onClick={() => {
                  setLang('en');
                  setLangDropdown(false);
                }}
                className={`w-full px-3 py-2 text-left text-xs font-semibold flex items-center gap-2 transition ${
                  lang === 'en'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 font-bold'
                    : 'text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                <span>🇬🇧</span>
                <span>English</span>
              </button>
            </div>
          )}
        </div>

        {/* Telegram Hub quick button */}
        <button
          onClick={() => openModal('telegramHub')}
          className="w-9 h-9 rounded-full bg-sky-50 dark:bg-sky-950/60 border border-sky-200 dark:border-sky-800/80 text-[#229ED9] flex items-center justify-center hover:bg-[#229ED9] hover:text-white transition cursor-pointer"
          title="Telegram Banking & Alerts (@FinFlowEthiopiaBot)"
        >
          <Send size={15} className="-rotate-12" />
        </button>

        {/* Notifications */}
        <button
          onClick={() => openModal('notifications')}
          className="relative w-9 h-9 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
          title="Notifications"
        >
          <Bell size={17} />
          {notifications.length > 0 && (
            <span className="absolute top-1 right-1 w-2 h-2 bg-emerald-500 rounded-full ring-2 ring-white dark:ring-slate-900" />
          )}
        </button>

        {/* User Profile */}
        <button
          onClick={() => openModal('profile')}
          className="w-9 h-9 rounded-full bg-emerald-50 dark:bg-slate-800 border border-emerald-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center hover:text-emerald-600 dark:hover:text-emerald-400 transition cursor-pointer"
          title="My Profile"
        >
          <User size={17} />
        </button>
      </div>
    </header>
  );
};
