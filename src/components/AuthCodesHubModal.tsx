import React, { useState } from 'react';
import {
  ShieldCheck,
  KeyRound,
  Send,
  Copy,
  Check,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';

export const AuthCodesHubModal: React.FC = () => {
  const {
    activeAuthCode,
    sentAuthCodes,
    generateAndSendAuthCode,
    verifyAuthCode,
    telegramSettings,
    autoFillAuthCode,
    lang,
    showToast
  } = useBanking();

  const [purpose, setPurpose] = useState('High-Value Transfer');
  const [channel, setChannel] = useState<'Telegram' | 'SMS'>('Telegram');
  const [verifyInput, setVerifyInput] = useState('');
  const [verifyResult, setVerifyResult] = useState<'success' | 'fail' | null>(null);
  const [copiedCode, setCopiedCode] = useState<string | null>(null);

  const handleRequestCode = () => {
    const code = generateAndSendAuthCode(purpose, channel);
    showToast(lang === 'am' ? `✅ አዲስ የማረጋገጫ ኮድ ተልኳል: ${code}` : `✅ New Auth Code generated & sent: ${code}`);
  };

  const handleTestVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyInput || verifyInput.length < 6) {
      showToast(lang === 'am' ? '⚠️ እባክዎ 6 አሃዝ ኮድ ያስገቡ' : '⚠️ Please enter 6-digit code');
      return;
    }
    const ok = verifyAuthCode(verifyInput);
    if (ok) {
      setVerifyResult('success');
      showToast(lang === 'am' ? '✅ ኮዱ በትክክል ተረጋግጧል!' : '✅ Auth code verified successfully!');
    } else {
      setVerifyResult('fail');
      showToast(lang === 'am' ? '❌ የተሳሳተ ወይም ያለፈበት ኮድ!' : '❌ Invalid or expired auth code!');
    }
  };

  const handleCopy = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    showToast(lang === 'am' ? '📋 ኮዱ ተገልብጧል' : '📋 Code copied');
    setTimeout(() => setCopiedCode(null), 2000);
  };

  return (
    <div className="space-y-4 text-xs">
      {/* Top Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-800 text-white shadow-lg relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="p-1.5 rounded-xl bg-white/20 backdrop-blur-xs">
              <ShieldCheck size={16} />
            </span>
            <span className="font-extrabold text-sm tracking-tight">
              {lang === 'am' ? 'የደህንነት ማረጋገጫ ኮዶች (2FA)' : 'Authentication Codes & 2FA Dispatch'}
            </span>
          </div>
          <p className="text-[11px] text-white/90 leading-relaxed max-w-sm">
            {lang === 'am'
              ? 'በቴሌግራም እና በኤስኤምኤስ የተላኩ የደህንነት ማረጋገጫ ኮዶችን እዚህ ማስተዳደር፣ መመልከት እና መፈተሽ ይችላሉ።'
              : 'Audit, manage, and verify one-time passcodes (OTP) dispatched via Telegram and SMS for secure Ethiopian banking operations.'}
          </p>

          <div className="mt-3 flex items-center gap-2">
            <button
              onClick={handleRequestCode}
              type="button"
              className="px-3 py-1.5 rounded-xl bg-white text-emerald-900 font-bold text-[11px] flex items-center gap-1.5 shadow-sm hover:bg-white/90 transition cursor-pointer"
            >
              <Zap size={13} className="text-amber-500 fill-amber-500" />
              <span>{lang === 'am' ? 'አዲስ ኮድ ጠይቅ' : 'Request New Auth Code'}</span>
            </button>
          </div>
        </div>

        <div className="absolute -right-6 -bottom-6 text-white/10 pointer-events-none">
          <KeyRound size={120} />
        </div>
      </div>

      {/* Active Code Card (if exists) */}
      {activeAuthCode && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] uppercase font-bold tracking-wider text-amber-700 dark:text-amber-300">
                {lang === 'am' ? 'አሁን የሚሰራ የማረጋገጫ ኮድ' : 'Currently Active Auth Code'}
              </span>
            </div>
            <div className="text-2xl font-black font-mono tracking-widest text-slate-900 dark:text-white mt-0.5">
              {activeAuthCode}
            </div>
            <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
              <Send size={11} className="text-[#229ED9]" />
              <span>Telegram: {telegramSettings.username}</span>
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={() => handleCopy(activeAuthCode)}
              className="px-2.5 py-1.5 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 font-medium text-xs flex items-center gap-1 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              {copiedCode === activeAuthCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
              <span>{copiedCode === activeAuthCode ? 'Copied' : 'Copy'}</span>
            </button>
            <button
              onClick={autoFillAuthCode}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition"
            >
              <Zap size={13} />
              <span>Auto-Fill</span>
            </button>
          </div>
        </div>
      )}

      {/* Code Request & Generation Tool */}
      <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
          <KeyRound size={15} className="text-amber-500" />
          <span>{lang === 'am' ? 'አዲስ የማረጋገጫ ኮድ ማመንጫ' : 'Generate & Dispatch Security Code'}</span>
        </h4>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'am' ? 'የግብይት ዓላማ' : 'Transaction Purpose'}
            </label>
            <select
              value={purpose}
              onChange={e => setPurpose(e.target.value)}
              className="w-full px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs text-slate-900 dark:text-white outline-none"
            >
              <option value="High-Value Transfer">High-Value Transfer</option>
              <option value="RTGS Settlement Authorization">RTGS Settlement Authorization</option>
              <option value="Card PIN Reset">Card PIN Reset</option>
              <option value="Foreign Remittance Claim">Foreign Remittance Claim</option>
              <option value="New Device Registration">New Device Registration</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'am' ? 'የመላኪያ መስመር' : 'Delivery Channel'}
            </label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setChannel('Telegram')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                  channel === 'Telegram'
                    ? 'bg-[#229ED9] text-white border-[#229ED9]'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Send size={12} className="-rotate-12" />
                <span>Telegram</span>
              </button>
              <button
                type="button"
                onClick={() => setChannel('SMS')}
                className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-1 border transition ${
                  channel === 'SMS'
                    ? 'bg-emerald-600 text-white border-emerald-600'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                }`}
              >
                <Smartphone size={12} />
                <span>SMS</span>
              </button>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={handleRequestCode}
          className="w-full py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold rounded-xl transition shadow-xs cursor-pointer text-xs flex items-center justify-center gap-1.5"
        >
          <Zap size={14} />
          <span>{lang === 'am' ? 'ኮዱን አሁን ላክ' : 'Dispatch Auth Code Now'}</span>
        </button>
      </div>

      {/* Code Verification Tester */}
      <form onSubmit={handleTestVerify} className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700/80 rounded-2xl p-4 space-y-3">
        <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
          <ShieldCheck size={15} className="text-sky-500" />
          <span>{lang === 'am' ? 'የኮድ ትክክለኛነት መሞከሪያ' : 'Verify Auth Code Tester'}</span>
        </h4>

        <div className="flex gap-2">
          <input
            type="text"
            maxLength={6}
            value={verifyInput}
            onChange={e => {
              setVerifyInput(e.target.value.replace(/\D/g, ''));
              setVerifyResult(null);
            }}
            placeholder="Enter 6-digit code"
            className="flex-1 px-3 py-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono tracking-widest text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-sky-500/20"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white font-bold rounded-xl text-xs flex items-center gap-1.5 cursor-pointer"
          >
            <Check size={14} />
            <span>Verify</span>
          </button>
        </div>

        {verifyResult === 'success' && (
          <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-500 flex-shrink-0" />
            <span>{lang === 'am' ? 'ኮዱ ትክክለኛና የሚሰራ ነው!' : 'Code is valid & authorized for execution.'}</span>
          </div>
        )}

        {verifyResult === 'fail' && (
          <div className="p-2.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-300 text-xs flex items-center gap-2">
            <XCircle size={16} className="text-rose-500 flex-shrink-0" />
            <span>{lang === 'am' ? 'የተሳሳተ ኮድ! እባክዎ እንደገና ይሞክሩ።' : 'Incorrect code or code has expired.'}</span>
          </div>
        )}
      </form>

      {/* Sent Auth Codes Audit Log */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h4 className="font-bold text-xs text-slate-900 dark:text-white flex items-center gap-1.5">
            <Clock size={14} className="text-slate-400" />
            <span>{lang === 'am' ? 'የተላኩ የማረጋገጫ ኮዶች ታሪክ' : 'Sent Authentication Codes Log'}</span>
          </h4>
          <span className="text-[10px] text-slate-400 font-mono">
            {sentAuthCodes.length} {sentAuthCodes.length === 1 ? 'record' : 'records'}
          </span>
        </div>

        {sentAuthCodes.length === 0 ? (
          <div className="p-6 text-center bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-2xl text-slate-400">
            <AlertCircle size={24} className="mx-auto mb-1.5 opacity-40" />
            <p className="text-xs">No authentication codes generated in this session yet.</p>
            <button
              onClick={handleRequestCode}
              className="mt-2.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[11px] font-bold inline-flex items-center gap-1 hover:bg-slate-200 dark:hover:bg-slate-700 transition cursor-pointer"
            >
              <Zap size={12} />
              <span>Generate First Code</span>
            </button>
          </div>
        ) : (
          <div className="space-y-2 max-h-60 overflow-y-auto pr-0.5">
            {sentAuthCodes.map(item => (
              <div
                key={item.id}
                className="p-3 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl flex items-center justify-between gap-3 shadow-2xs"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
                    item.channel === 'Telegram' ? 'bg-sky-100 dark:bg-sky-950/60 text-[#229ED9]' : 'bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600'
                  }`}>
                    {item.channel === 'Telegram' ? <Send size={14} className="-rotate-12" /> : <Smartphone size={14} />}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-xs text-slate-900 dark:text-white tracking-wider">
                        {item.code}
                      </span>
                      <span className={`px-1.5 py-0.2 rounded-full text-[9px] font-bold ${
                        item.used
                          ? 'bg-slate-100 dark:bg-slate-800 text-slate-500'
                          : 'bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400'
                      }`}>
                        {item.used ? 'Used' : 'Active'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {item.purpose} · {item.createdAt}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(item.code)}
                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition flex-shrink-0"
                  title="Copy code"
                >
                  {copiedCode === item.code ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* NBE Directive Note */}
      <div className="p-2.5 rounded-xl bg-slate-100/80 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-700/60 text-[10px] text-slate-500 dark:text-slate-400 leading-relaxed">
        <span className="font-bold text-slate-700 dark:text-slate-300">National Bank of Ethiopia Compliance: </span>
        All RTGS and high-value outbound interbank settlements are secured under 2FA Multi-Factor Authentication directives. Codes expire after 2 minutes.
      </div>
    </div>
  );
};
