import React, { useState } from 'react';
import {
  Send,
  ExternalLink,
  ShieldCheck,
  BellRing,
  KeyRound,
  Bot,
  MessageSquare,
  Users,
  Code,
  CheckCircle2,
  Zap,
  Copy,
  Check
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const TelegramHubModal: React.FC = () => {
  const {
    telegramSettings,
    updateTelegramSettings,
    generateAndSendAuthCode,
    lang,
    showToast,
    closeModal
  } = useBanking();

  const [username, setUsername] = useState(telegramSettings.username || '@FinFlow_User');
  const [alerts, setAlerts] = useState(telegramSettings.alertsEnabled);
  const [otp, setOtp] = useState(telegramSettings.otpEnabled);
  const [saved, setSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState<string | null>(null);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    await updateTelegramSettings(username, alerts, otp);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSendTestCode = () => {
    const code = generateAndSendAuthCode('Telegram Connection Verification', 'Telegram');
    showToast(lang === 'am' ? `✈️ የማረጋገጫ ኮድ ተልኳል: ${code}` : `✈️ Telegram Auth Code sent: ${code}`);
  };

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    showToast(lang === 'am' ? '📋 ሊንኩ ተገልብጧል' : '📋 Link copied');
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const telegramChannels = [
    {
      id: 'bot',
      name: 'FinFlow Banking Bot',
      handle: '@FinFlowEthiopiaBot',
      url: 'https://t.me/FinFlowEthiopiaBot',
      badge: 'Official Bot',
      icon: <Bot size={18} className="text-[#229ED9]" />,
      desc: lang === 'am'
        ? 'የቀሪ ሒሳብ ምርመራ፣ ፈጣን የግብይት ማሳወቂያዎች እና አውቶሜትድ አገልግሎት'
        : 'Balance check, instant push alerts, mini statements & automated banking'
    },
    {
      id: 'channel',
      name: 'Official FinFlow Channel',
      handle: '@FinFlowET_Official',
      url: 'https://t.me/FinFlowET_Official',
      badge: 'Announcements',
      icon: <Send size={18} className="text-[#229ED9] -rotate-12" />,
      desc: lang === 'am'
        ? 'የብሔራዊ ባንክ መመሪያዎች፣ የውጭ ምንዛሬ ተመኖች እና ይፋዊ መግለጫዎች'
        : 'NBE directives, live FX exchange rates, and official product announcements'
    },
    {
      id: 'support',
      name: '24/7 Customer Support',
      handle: '@FinFlowHelpET',
      url: 'https://t.me/FinFlowHelpET',
      badge: 'Helpdesk',
      icon: <MessageSquare size={18} className="text-emerald-500" />,
      desc: lang === 'am'
        ? 'የቀጥታ ድጋፍ ሰጪዎች ለአስቸኳይ የግብይት ወይም የቴክኒክ ጥያቄዎች'
        : 'Direct support agents for real-time transaction assistance & inquiries'
    },
    {
      id: 'community',
      name: 'Ethiopian Fintech Community',
      handle: '@FinFlowCommunity',
      url: 'https://t.me/FinFlowCommunity',
      badge: 'Community',
      icon: <Users size={18} className="text-purple-500" />,
      desc: lang === 'am'
        ? 'የዲጂታል ባንኪንግ ተጠቃሚዎችና ነጋዴዎች የውይይት መድረክ'
        : 'Discussion group for Ethiopian digital finance, business owners & merchants'
    },
    {
      id: 'devs',
      name: 'Developer & API Updates',
      handle: '@FinFlowDevs',
      url: 'https://t.me/FinFlowDevs',
      badge: 'API & Sandbox',
      icon: <Code size={18} className="text-amber-500" />,
      desc: lang === 'am'
        ? 'የክፍት ባንኪንግ ኤፒአይ (Open Banking) ሰነዶች እና ዌብሁክ ማንቂያዎች'
        : 'Open Banking APIs, webhook integrations, sandbox alerts & tech release notes'
    }
  ];

  return (
    <div className="space-y-4 text-xs">
      {/* Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-[#229ED9] to-[#1778A5] text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <Send size={16} className="-rotate-12" />
            </span>
            <span className="font-extrabold text-sm tracking-tight">
              {lang === 'am' ? 'የቴሌግራም ባንኪንግና ማሳወቂያዎች' : 'Telegram Banking & Alerts'}
            </span>
            <span className="px-2 py-0.5 rounded-full bg-white/25 text-[10px] font-bold">
              Live Integrated
            </span>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed max-w-sm">
            {lang === 'am'
              ? 'መለያዎን ከቴሌግራም ጋር በማገናኘት የግብይት ማንቂያዎችን፣ የ2FA የማረጋገጫ ኮዶችን እና የቀሪ ሒሳብ መረጃዎችን በቅጽበት ያግኙ።'
              : 'Link your Telegram account to receive instant transaction alerts, one-time 2FA security passcodes, and fast balance inquiries.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleSendTestCode}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white text-[#1778A5] font-bold text-[11px] flex items-center gap-1.5 shadow-sm hover:bg-white/90 transition cursor-pointer"
            >
              <Zap size={13} className="text-amber-500 fill-amber-500" />
              <span>{lang === 'am' ? 'የሙከራ ኮድ ላክ' : 'Send Test Auth Code'}</span>
            </button>
            <a
              href="https://t.me/FinFlowEthiopiaBot"
              target="_blank"
              rel="noopener noreferrer"
              className="px-3 py-1.5 rounded-xl bg-black/20 text-white font-semibold text-[11px] flex items-center gap-1 hover:bg-black/30 transition"
            >
              <span>Launch Bot</span>
              <ExternalLink size={12} />
            </a>
          </div>
        </div>

        {/* Decorative background logo */}
        <div className="absolute -right-6 -bottom-6 text-white/10 pointer-events-none">
          <Send size={120} className="-rotate-12" />
        </div>
      </div>

      {/* Telegram Configuration Form */}
      <form onSubmit={handleSaveSettings} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <ShieldCheck size={15} className="text-emerald-500" />
            <span>{lang === 'am' ? 'የቴሌግራም ግንኙነት ቅንብሮች' : 'Telegram Account & Dispatch Settings'}</span>
          </h4>
          {saved && (
            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
              <CheckCircle2 size={13} />
              <span>{lang === 'am' ? 'ተቀምጧል' : 'Saved'}</span>
            </span>
          )}
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
            {lang === 'am' ? 'የቴሌግራም የተጠቃሚ ስም (Telegram Username)' : 'Your Telegram Username / Handle'}
          </label>
          <div className="relative">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              placeholder="@username"
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white font-medium focus:ring-2 focus:ring-[#229ED9]/20 focus:border-[#229ED9] outline-none"
            />
          </div>
        </div>

        <div className="space-y-2 pt-1 border-t border-slate-200/60 dark:border-slate-700/60">
          <label className="flex items-center justify-between cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition">
            <div className="flex items-center gap-2">
              <BellRing size={14} className="text-[#229ED9]" />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {lang === 'am' ? 'የግብይት ማሳወቂያዎች በቴሌግራም' : 'Instant Transaction Push Alerts'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={alerts}
              onChange={e => setAlerts(e.target.checked)}
              className="w-4 h-4 rounded text-[#229ED9] focus:ring-[#229ED9] accent-[#229ED9] cursor-pointer"
            />
          </label>

          <label className="flex items-center justify-between cursor-pointer p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700/50 transition">
            <div className="flex items-center gap-2">
              <KeyRound size={14} className="text-amber-500" />
              <span className="text-xs text-slate-800 dark:text-slate-200 font-medium">
                {lang === 'am' ? 'የማረጋገጫ ኮዶች (2FA OTP) በቴሌግራም' : 'Deliver 2FA & Auth Codes via Telegram'}
              </span>
            </div>
            <input
              type="checkbox"
              checked={otp}
              onChange={e => setOtp(e.target.checked)}
              className="w-4 h-4 rounded text-[#229ED9] focus:ring-[#229ED9] accent-[#229ED9] cursor-pointer"
            />
          </label>
        </div>

        <button
          type="submit"
          className="w-full py-2.5 bg-[#229ED9] hover:bg-[#1778A5] text-white font-bold rounded-xl transition shadow-xs cursor-pointer text-xs flex items-center justify-center gap-1.5"
        >
          <Check size={14} />
          <span>{lang === 'am' ? 'ቅንብሮችን አስቀምጥ' : 'Save Telegram Preferences'}</span>
        </button>
      </form>

      {/* Official Telegram Channels & Links List */}
      <div>
        <h4 className="font-bold text-xs text-slate-900 dark:text-white mb-2 flex items-center justify-between">
          <span>{lang === 'am' ? 'ይፋዊ የቴሌግራም አድራሻዎች' : 'Official Telegram Links & Channels'}</span>
          <span className="text-[10px] text-slate-400 font-normal">5 Channels</span>
        </h4>

        <div className="space-y-2">
          {telegramChannels.map(item => (
            <div
              key={item.id}
              className="p-3 bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-2xs hover:border-[#229ED9]/50 transition"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0">
                  {item.icon}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-bold text-xs text-slate-900 dark:text-white truncate">
                      {item.name}
                    </span>
                    <span className="px-1.5 py-0.2 rounded-full bg-sky-50 dark:bg-sky-950/40 text-[#229ED9] text-[9px] font-bold border border-sky-200/60 dark:border-sky-800/60 flex-shrink-0">
                      {item.badge}
                    </span>
                  </div>
                  <div className="text-[11px] font-mono text-[#229ED9] font-medium truncate">
                    {item.handle}
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {item.desc}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <button
                  type="button"
                  onClick={() => handleCopyLink(item.url, item.id)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition"
                  title="Copy link"
                >
                  {copiedLink === item.id ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2.5 py-1.5 rounded-xl bg-sky-500/10 dark:bg-sky-500/20 text-[#229ED9] hover:bg-[#229ED9] hover:text-white font-bold text-[11px] flex items-center gap-1 transition"
                >
                  <span>Open</span>
                  <ExternalLink size={11} />
                </a>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Bot Commands Quick Guide */}
      <div className="p-3 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700 rounded-2xl">
        <h4 className="font-bold text-xs text-slate-800 dark:text-slate-200 mb-2 flex items-center gap-1.5">
          <Bot size={14} className="text-[#229ED9]" />
          <span>{lang === 'am' ? 'የቴሌግራም ቦት ትዕዛዞች' : 'Telegram Bot Quick Commands'}</span>
        </h4>
        <div className="grid grid-cols-2 gap-2 text-[11px]">
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
            <span className="font-mono font-bold text-[#229ED9]">/balance</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Check all 31 bank account balances</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
            <span className="font-mono font-bold text-[#229ED9]">/statement</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Get mini statement & receipts</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
            <span className="font-mono font-bold text-[#229ED9]">/otp</span>
            <p className="text-[10px] text-slate-500 mt-0.5">Request or retrieve security passcodes</p>
          </div>
          <div className="p-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-700/70">
            <span className="font-mono font-bold text-[#229ED9]">/rates</span>
            <p className="text-[10px] text-slate-500 mt-0.5">NBE live foreign exchange rates</p>
          </div>
        </div>
      </div>
    </div>
  );
};
