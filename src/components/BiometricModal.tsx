import React, { useState, useEffect } from 'react';
import { ShieldCheck, Fingerprint, ScanFace, CheckCircle2, AlertCircle, X } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { formatETB } from '../utils/numberToWords';

interface BiometricModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  amount: number;
  receiverName: string;
  receiverBank: string;
}

export const BiometricModal: React.FC<BiometricModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  amount,
  receiverName,
  receiverBank
}) => {
  const { lang, t } = useBanking();
  const [authMode, setAuthMode] = useState<'face' | 'fingerprint'>('face');
  const [scanState, setScanState] = useState<'scanning' | 'success' | 'idle'>('idle');

  useEffect(() => {
    if (isOpen) {
      setScanState('scanning');
      const timer = setTimeout(() => {
        setScanState('success');
        const doneTimer = setTimeout(() => {
          onSuccess();
        }, 1100);
        return () => clearTimeout(doneTimer);
      }, 1900);
      return () => clearTimeout(timer);
    } else {
      setScanState('idle');
    }
  }, [isOpen, authMode]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="w-full max-w-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden p-6 relative animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-500 hover:text-slate-800 dark:hover:text-white flex items-center justify-center transition"
        >
          <X size={16} />
        </button>

        {/* Security Badge */}
        <div className="flex justify-center mb-4">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
            <ShieldCheck size={13} className="text-emerald-600" />
            <span>High-Value RTGS Biometric Verification</span>
          </div>
        </div>

        {/* Transaction Summary Card */}
        <div className="p-3.5 mb-5 rounded-2xl bg-slate-50 dark:bg-slate-800/70 border border-slate-200/80 dark:border-slate-700/80 text-center">
          <div className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
            {lang === 'am' ? 'የዝውውር መጠን' : 'Authorizing Transfer Amount'}
          </div>
          <div className="text-xl font-black font-mono text-slate-900 dark:text-white my-1">
            {formatETB(amount)}
          </div>
          <div className="text-xs text-slate-600 dark:text-slate-300 font-semibold truncate">
            → {receiverName || 'Beneficiary'} ({receiverBank || 'NBE RTGS'})
          </div>
        </div>

        {/* Biometric Scanner Visual Area */}
        <div className="flex flex-col items-center justify-center py-4">
          <div className="relative w-28 h-28 flex items-center justify-center mb-4">
            {/* Pulsing ring */}
            <div
              className={`absolute inset-0 rounded-full border-2 transition-all duration-700 ${
                scanState === 'success'
                  ? 'border-emerald-500 scale-110 bg-emerald-500/10'
                  : 'border-emerald-500/60 animate-ping scale-95'
              }`}
            />
            <div
              className={`w-24 h-24 rounded-2xl flex items-center justify-center transition-all duration-500 ${
                scanState === 'success'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'bg-gradient-to-tr from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-600/25'
              }`}
            >
              {scanState === 'success' ? (
                <CheckCircle2 size={52} className="animate-in zoom-in-75 duration-300" />
              ) : authMode === 'face' ? (
                <ScanFace size={48} className="animate-pulse" />
              ) : (
                <Fingerprint size={48} className="animate-pulse" />
              )}
            </div>

            {/* Laser scanning bar effect */}
            {scanState === 'scanning' && (
              <div className="absolute top-2 left-2 right-2 h-0.5 bg-emerald-300 shadow-[0_0_8px_#34d399] animate-bounce" />
            )}
          </div>

          <div className="text-center">
            <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">
              {scanState === 'success'
                ? lang === 'am'
                  ? 'ባዮሜትሪክ ተረጋግጧል!'
                  : 'Biometric Authenticated'
                : authMode === 'face'
                ? lang === 'am'
                  ? 'የፊት መለያ በማረጋገጥ ላይ...'
                  : 'Scanning Face ID...'
                : lang === 'am'
                ? 'የጣት አሻራ በማረጋገጥ ላይ...'
                : 'Scanning Fingerprint...'}
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              {scanState === 'success'
                ? lang === 'am'
                  ? 'ወደ 2FA OTP በማስተላለፍ ላይ...'
                  : 'Proceeding to 2FA verification...'
                : lang === 'am'
                ? 'እባክዎ ካሜራውን ይመልከቱ ወይም አሻራዎን ይጫኑ'
                : 'Please hold your position for authentication'}
            </p>
          </div>
        </div>

        {/* Mode Switchers */}
        <div className="flex items-center justify-center gap-2 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs">
          <button
            type="button"
            onClick={() => setAuthMode('face')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              authMode === 'face'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <ScanFace size={14} />
            <span>Face ID</span>
          </button>
          <button
            type="button"
            onClick={() => setAuthMode('fingerprint')}
            className={`px-3 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
              authMode === 'fingerprint'
                ? 'bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300'
                : 'text-slate-500 hover:text-slate-800 dark:hover:text-white'
            }`}
          >
            <Fingerprint size={14} />
            <span>Touch ID</span>
          </button>
        </div>
      </div>
    </div>
  );
};
