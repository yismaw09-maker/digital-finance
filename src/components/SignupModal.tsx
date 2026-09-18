import React, { useState } from 'react';
import { X, UserPlus, CheckCircle } from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { BANK_MASTER, getBankDisplayName } from '../data/banks';

interface SignupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SignupModal: React.FC<SignupModalProps> = ({ isOpen, onClose }) => {
  const { signup, lang, showToast } = useBanking();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedBank, setSelectedBank] = useState('Commercial Bank of Ethiopia');
  const [accountNo, setAccountNo] = useState('');
  const [initialBalance, setInitialBalance] = useState('0');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName || !email || !phone || !selectedBank || !accountNo || !password || !confirmPassword) {
      showToast(lang === 'am' ? '⚠️ እባክዎ ሁሉንም መስኮች ይሙሉ' : '⚠️ Please fill all required fields');
      return;
    }
    if (password.length < 6) {
      showToast(lang === 'am' ? '❌ የይለፍ ቃል ቢያንስ 6 ቁምፊዎች መሆን አለበት' : '❌ Password must be at least 6 characters');
      return;
    }
    if (password !== confirmPassword) {
      showToast(lang === 'am' ? '❌ የይለፍ ቃላት አይመሳሰሉም' : '❌ Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const ok = await signup({
        fullName,
        email,
        phone,
        bank: selectedBank,
        accountNo,
        password,
        initialBalance: parseFloat(initialBalance) || 0
      });
      if (ok) {
        onClose();
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="w-full max-w-lg bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-700 to-emerald-600 p-5 text-white flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <UserPlus size={20} />
            </div>
            <div>
              <h3 className="font-bold text-base">
                {lang === 'am' ? 'አዲስ መለያ ይፍጠሩ' : 'Create Bank Account'}
              </h3>
              <p className="text-xs text-emerald-100">
                {lang === 'am' ? 'ወደ FinFlow ኢትዮጵያ ይቀላቀሉ' : 'Join FinFlow Ethiopia 31 Banks Master'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition"
          >
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'am' ? 'ሙሉ ስም' : 'Full Name'} *
            </label>
            <input
              type="text"
              required
              value={fullName}
              onChange={e => setFullName(e.target.value)}
              placeholder="e.g. Almaz Bekele"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'ኢሜይል አድራሻ' : 'Email Address'} *
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="almaz@example.com"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የስልክ ቁጥር' : 'Phone Number'} *
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="0911 000 000"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                {lang === 'am' ? 'ባንክ ይምረጡ' : 'Select Bank'} *
              </label>
              <span className="text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                31 Banks Master
              </span>
            </div>
            <select
              value={selectedBank}
              onChange={e => setSelectedBank(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 font-medium"
            >
              {BANK_MASTER.map(b => (
                <option key={b.bankId} value={b.name}>
                  {getBankDisplayName(b, lang)} ({b.type})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የአካውንት ቁጥር' : 'Account Number'} *
              </label>
              <input
                type="text"
                required
                value={accountNo}
                onChange={e => setAccountNo(e.target.value.replace(/\D/g, ''))}
                placeholder="1000123456789"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የመጀመሪያ ቀሪ ሒሳብ' : 'Opening Balance (ETB)'}
              </label>
              <input
                type="number"
                step="0.01"
                value={initialBalance}
                onChange={e => setInitialBalance(e.target.value)}
                placeholder="0.00"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white font-mono focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የይለፍ ቃል' : 'Password'} *
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'am' ? 'የይለፍ ቃል አረጋግጥ' : 'Confirm Password'} *
              </label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                placeholder="Re-type password"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
          >
            {loading ? (
              <span className="inline-block w-5 h-5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <CheckCircle size={18} />
                <span>{lang === 'am' ? 'መለያ ፍጠር' : 'Complete Registration'}</span>
              </>
            )}
          </button>

          <p className="text-[11px] text-center text-slate-500 dark:text-slate-400">
            {lang === 'am'
              ? 'በመመዝገብ የFinFlow ኢትዮጵያ ደንቦችንና የብሔራዊ ባንክ መመሪያዎችን ተስማምተዋል።'
              : 'By registering you agree to FinFlow terms and National Bank of Ethiopia regulations.'}
          </p>
        </form>
      </div>
    </div>
  );
};
