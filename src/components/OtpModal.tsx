import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, X, RefreshCw, Check, Send, Copy, Zap, ExternalLink } from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const OtpModal: React.FC = () => {
  const {
    otpOpen,
    closeOtp,
    confirmRtgsWithOtp,
    activeAuthCode,
    generateAndSendAuthCode,
    autoFillValue,
    consumeAutoFill,
    telegramSettings,
    lang,
    showToast,
    t
  } = useBanking();

  const [digits, setDigits] = useState(['', '', '', '', '', '']);
  const [timeLeft, setTimeLeft] = useState(120);
  const [copied, setCopied] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Reset or focus on open
  useEffect(() => {
    if (otpOpen) {
      setDigits(['', '', '', '', '', '']);
      setTimeLeft(120);
      setCopied(false);
      setTimeout(() => {
        inputRefs.current[0]?.focus();
      }, 100);
    }
  }, [otpOpen]);

  // Handle external auto-fill trigger (e.g. from banner click)
  useEffect(() => {
    if (otpOpen && autoFillValue && autoFillValue.length === 6) {
      const parts = autoFillValue.split('');
      setDigits(parts);
      consumeAutoFill();
      setTimeout(() => {
        inputRefs.current[5]?.focus();
      }, 50);
    }
  }, [otpOpen, autoFillValue]);

  // Countdown timer
  useEffect(() => {
    if (!otpOpen || timeLeft <= 0) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [otpOpen, timeLeft]);

  if (!otpOpen) return null;

  const handleChange = (index: number, val: string) => {
    const char = val.replace(/\D/g, '').slice(-1);
    const newDigits = [...digits];
    newDigits[index] = char;
    setDigits(newDigits);

    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
    if (e.key === 'Enter') {
      handleVerify();
    }
  };

  const handlePaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (!pasted) return;
    const newDigits = [...digits];
    for (let i = 0; i < 6; i++) {
      newDigits[i] = pasted[i] || '';
    }
    setDigits(newDigits);
    inputRefs.current[Math.min(pasted.length, 5)]?.focus();
  };

  const handleVerify = () => {
    const code = digits.join('');
    if (code.length < 6) {
      showToast(lang === 'am' ? '⚠️ እባክዎ 6 አሃዝ ኮድ ያስገቡ' : '⚠️ Please enter all 6 digits');
      return;
    }
    confirmRtgsWithOtp(code);
  };

  const handleResend = () => {
    setTimeLeft(120);
    setDigits(['', '', '', '', '', '']);
    generateAndSendAuthCode('RTGS Transfer Re-authorization', 'Telegram');
    showToast(t('rtgsOtpResent'));
    inputRefs.current[0]?.focus();
  };

  const handleAutoFillClick = () => {
    const targetCode = activeAuthCode || '123456';
    setDigits(targetCode.split(''));
    showToast(lang === 'am' ? '⚡ የማረጋገጫ ኮድ ተሞልቷል' : '⚡ Auth code filled');
  };

  const handleCopyCode = () => {
    const targetCode = activeAuthCode || '123456';
    navigator.clipboard.writeText(targetCode);
    setCopied(true);
    showToast(lang === 'am' ? '📋 ኮዱ ተገልብጧል' : '📋 Code copied');
    setTimeout(() => setCopied(false), 2000);
  };

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');
  const displayCode = activeAuthCode || '123456';

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative">
        <button
          onClick={closeOtp}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        <div className="text-center mb-4">
          <div className="w-13 h-13 rounded-2xl bg-amber-500 text-white flex items-center justify-center mx-auto mb-2.5 shadow-lg shadow-amber-500/25">
            <ShieldCheck size={26} />
          </div>
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white">
            {t('rtgsOtpTitle')}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {t('rtgsOtpInfo')}
          </p>

          {/* Telegram & SMS dispatch badge */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-sky-50 dark:bg-sky-950/40 border border-sky-200 dark:border-sky-800/80 text-sky-800 dark:text-sky-300 text-[11px] font-semibold">
            <Send size={12} className="text-[#229ED9]" />
            <span>Sent via Telegram ({telegramSettings.username}) & SMS</span>
          </div>
        </div>

        {/* Live Active Code Display Box */}
        <div className="mb-4 bg-slate-50 dark:bg-slate-800/70 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-3 flex items-center justify-between">
          <div>
            <div className="text-[10px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {lang === 'am' ? 'የተላከ የማረጋገጫ ኮድ' : 'Sent Auth Code'}
            </div>
            <div className="text-lg font-black font-mono tracking-widest text-emerald-600 dark:text-emerald-400">
              {displayCode}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={handleCopyCode}
              type="button"
              className="p-2 rounded-xl bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-emerald-600 dark:hover:text-emerald-400 transition"
              title="Copy code"
            >
              {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
            </button>
            <button
              onClick={handleAutoFillClick}
              type="button"
              className="px-2.5 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
              title="Auto-fill code into inputs"
            >
              <Zap size={13} />
              <span>{t('autoFill')}</span>
            </button>
          </div>
        </div>

        {/* 6 Digits input boxes */}
        <div className="flex items-center justify-center gap-2 mb-3" onPaste={handlePaste}>
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={el => (inputRefs.current[i] = el)}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={e => handleChange(i, e.target.value)}
              onKeyDown={e => handleKeyDown(i, e)}
              className={`w-11 h-12 text-center text-xl font-bold font-mono rounded-xl border-2 transition ${
                digit
                  ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-slate-900 dark:text-white'
                  : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20'
              }`}
            />
          ))}
        </div>

        {/* Timer */}
        <div className="text-center text-xs font-semibold text-slate-500 dark:text-slate-400 mb-4">
          <span>{lang === 'am' ? 'የሚሰራ ለ: ' : 'Valid for: '}</span>
          <span className="font-mono text-amber-600 dark:text-amber-400">{minutes}:{seconds}</span>
        </div>

        <button
          onClick={handleVerify}
          className="w-full py-3 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
        >
          <Check size={18} />
          <span>{t('rtgsOtpVerify')}</span>
        </button>

        {/* Resend and Telegram Bot Direct Link */}
        <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <div className="flex items-center gap-1.5">
            <span>{t('rtgsOtpResend')}</span>
            <button
              onClick={handleResend}
              className="text-amber-600 dark:text-amber-400 font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw size={12} />
              <span>{t('rtgsOtpResendBtn')}</span>
            </button>
          </div>

          <a
            href="https://t.me/FinFlowEthiopiaBot"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-sky-600 dark:text-sky-400 hover:underline flex items-center gap-1 font-semibold"
          >
            <Send size={11} className="text-[#229ED9]" />
            <span>Open Telegram Bot (@FinFlowEthiopiaBot)</span>
            <ExternalLink size={10} />
          </a>
        </div>
      </div>
    </div>
  );
};
