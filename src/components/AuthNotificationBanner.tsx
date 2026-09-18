import React, { useState, useEffect } from 'react';
import { Send, Copy, Check, X, ShieldAlert, Zap } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const AuthNotificationBanner: React.FC = () => {
  const { authNotificationBanner, dismissAuthBanner, autoFillAuthCode, lang, showToast } = useBanking();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (authNotificationBanner) {
      setCopied(false);
      // Auto-dismiss after 15 seconds if not interacted
      const timer = setTimeout(() => {
        dismissAuthBanner();
      }, 15000);
      return () => clearTimeout(timer);
    }
  }, [authNotificationBanner]);

  if (!authNotificationBanner) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(authNotificationBanner.code);
    setCopied(true);
    showToast(lang === 'am' ? '📋 ኮዱ ተገልብጧል' : '📋 Code copied to clipboard');
    setTimeout(() => setCopied(false), 2000);
  };

  const isTelegram = authNotificationBanner.channel === 'Telegram';

  return (
    <aside
      aria-label="Security Authentication Alert"
      className="fixed top-4 left-1/2 -translate-x-1/2 z-50 w-[94%] max-w-md animate-in slide-in-from-top-4 duration-300"
    >
      <div className="bg-slate-900/95 text-white dark:bg-slate-950/95 border border-sky-500/40 dark:border-sky-400/30 rounded-2xl p-3.5 shadow-2xl backdrop-blur-md flex flex-col gap-2.5">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
              isTelegram ? 'bg-[#229ED9] text-white' : 'bg-emerald-600 text-white'
            }`}>
              {isTelegram ? <Send size={16} className="-rotate-12" /> : <ShieldAlert size={16} />}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-400">
                  {isTelegram ? 'Telegram Instant Security Alert' : 'SMS Security Notification'}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  {authNotificationBanner.timestamp}
                </span>
              </div>
              <p className="text-[11px] text-slate-300">
                {authNotificationBanner.purpose}
              </p>
            </div>
          </div>

          <button
            onClick={dismissAuthBanner}
            className="text-slate-400 hover:text-white transition p-1 rounded-lg hover:bg-slate-800"
            title="Dismiss"
          >
            <X size={14} />
          </button>
        </div>

        {/* Code presentation */}
        <div className="flex items-center justify-between bg-slate-800/80 border border-slate-700/80 rounded-xl px-3 py-2">
          <div>
            <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-semibold">
              {lang === 'am' ? 'የተላከ የማረጋገጫ ኮድ' : 'Authentication Code'}
            </span>
            <span className="text-xl font-extrabold font-mono tracking-widest text-emerald-400">
              {authNotificationBanner.code}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopy}
              className="px-2.5 py-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-200 text-xs font-medium flex items-center gap-1 transition"
              title="Copy Code"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>

            <button
              onClick={autoFillAuthCode}
              className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold flex items-center gap-1 shadow-xs transition"
              title="Auto-Fill into input"
            >
              <Zap size={13} />
              <span>Auto-Fill</span>
            </button>
          </div>
        </div>

        <div className="flex items-center justify-between text-[10px] text-slate-400 px-0.5">
          <span>{authNotificationBanner.telegramUsername ? `Sent to ${authNotificationBanner.telegramUsername}` : 'Single-use code'}</span>
          <span className="text-amber-400/90 font-medium">⚠️ Valid for 2 mins · Do not share</span>
        </div>
      </div>
    </aside>
  );
};
