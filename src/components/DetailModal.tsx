import React, { useState, useEffect } from 'react';
import {
  X,
  Zap,
  Send,
  ArrowDown,
  PlusCircle,
  HandCoins,
  QrCode,
  FileText,
  Smartphone,
  CalendarClock,
  Landmark,
  BookOpen,
  Lightbulb,
  CreditCard,
  PiggyBank,
  PieChart,
  Bot,
  Receipt,
  User,
  ShieldCheck,
  Bell,
  HelpCircle,
  Copy,
  Printer,
  Search,
  Download,
  CheckCircle2,
  ExternalLink,
  Phone,
  Mail,
  Building2,
  Globe,
  KeyRound
} from 'lucide-react';
import { useBanking } from '../context/BankingContext';
import { BANK_MASTER, getBankDisplayName, getBankNameByString } from '../data/banks';
import { formatETB, formatNum, numberToAmharicWords, numberToEnglishWords } from '../utils/numberToWords';
import { BankLogo } from './BankLogo';
import { BankMaster, TransactionRecord, ReceiptRecord } from '../types';
import { TelegramHubModal } from './TelegramHubModal';
import { AuthCodesHubModal } from './AuthCodesHubModal';

export const DetailModal: React.FC = () => {
  const {
    activeModal,
    openModal,
    closeModal,
    selectedTx,
    activeReceipt,
    user,
    accounts,
    primaryAccount,
    primaryIndex,
    setPrimaryAccount,
    addAccount,
    removeAccount,
    processTransaction,
    initiateRtgsTransfer,
    openTxDetail,
    openReceiptModal,
    transactions,
    budget,
    updateBudget,
    profile,
    updateProfile,
    cards,
    addCard,
    removeCard,
    loans,
    addLoan,
    removeLoan,
    savingsGoals,
    addSavingsGoal,
    removeSavingsGoal,
    contributeToGoal,
    notifications,
    lang,
    showToast,
    t
  } = useBanking();

  // Common form states
  const [senderIdx, setSenderIdx] = useState(0);
  const [amount, setAmount] = useState('');
  const [purpose, setPurpose] = useState('');
  const [purposeNote, setPurposeNote] = useState('');
  const [receiverName, setReceiverName] = useState('');
  const [receiverBank, setReceiverBank] = useState('Commercial Bank of Ethiopia');
  const [receiverAccount, setReceiverAccount] = useState('');
  const [merchant, setMerchant] = useState('');
  const [category, setCategory] = useState('General');
  const [billType, setBillType] = useState('Electricity');
  const [billNumber, setBillNumber] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [network, setNetwork] = useState('Ethio Telecom');
  const [scheduleDate, setScheduleDate] = useState('');

  // Bank Directory states
  const [bankSearch, setBankSearch] = useState('');
  const [bankTypeFilter, setBankTypeFilter] = useState<'All' | 'Public' | 'Private' | 'Interest-Free'>('All');
  const [selectedBankDetails, setSelectedBankDetails] = useState<BankMaster | null>(null);

  // History search states
  const [historyQuery, setHistoryQuery] = useState('');
  const [historyType, setHistoryType] = useState<'all' | 'in' | 'out'>('all');

  // AI Chat states
  const [chatMessages, setChatMessages] = useState<{ sender: 'user' | 'bot'; text: string }[]>([
    { sender: 'bot', text: t('aiWelcome') }
  ]);
  const [chatInput, setChatInput] = useState('');

  // Receipt Advisor states
  const [receiptRawText, setReceiptRawText] = useState('');
  const [parsedAdvice, setParsedAdvice] = useState<any>(null);

  // Sync index when primaryIndex changes
  useEffect(() => {
    setSenderIdx(primaryIndex);
  }, [primaryIndex, activeModal]);

  if (!activeModal) return null;

  // Auto receiver name lookup simulation for RTGS
  const handleAccountChange = (acct: string) => {
    setReceiverAccount(acct);
    if (acct.length >= 8) {
      const demoNames = [
        'Abebe Kebede',
        'Sara Tesfaye',
        'Dawit Haile',
        'Hanna Girma',
        'Yonas Bekele',
        'Marta Assefa',
        'Kalkidan Tadesse'
      ];
      const name = demoNames[Math.abs(acct.split('').reduce((a, b) => a + b.charCodeAt(0), 0)) % demoNames.length];
      setReceiverName(name);
    }
  };

  // RTGS fee calculations
  const parsedRtgsAmount = parseFloat(amount) || 0;
  const rtgsFee = 100.0;
  const rtgsVat = +(rtgsFee * 0.15).toFixed(2);
  const rtgsTotal = +(parsedRtgsAmount + rtgsFee + rtgsVat).toFixed(2);

  // Export CSV
  const handleExportCSV = () => {
    if (transactions.length === 0) {
      showToast(lang === 'am' ? '⚠️ ምንም ግብይት የለም' : '⚠️ No transactions to export');
      return;
    }
    const header = ['Transaction ID', 'Date', 'Time', 'Type', 'Title', 'Bank', 'Account', 'Amount (ETB)', 'Total Debit (ETB)', 'Balance After'];
    const rows = transactions.map(tx => [
      tx.id,
      tx.date,
      tx.time || '',
      tx.type,
      `"${tx.title.replace(/"/g, '""')}"`,
      `"${tx.bank.replace(/"/g, '""')}"`,
      tx.accountNo,
      tx.amount,
      tx.totalDebit || tx.amount,
      tx.balanceAfter || 0
    ]);
    const csvContent = '\ufeff' + [header.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `finflow-transactions-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(lang === 'am' ? '📥 ግብይቶች በ CSV ተወርደዋል' : '📥 Transactions exported as CSV');
  };

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard?.writeText(text);
    showToast(t('copied'));
  };

  // Send AI message
  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg }]);
    setChatInput('');

    setTimeout(() => {
      const lower = userMsg.toLowerCase();
      let reply = '';
      const balance = primaryAccount?.balance || 0;

      if (lower.includes('balance') || lower.includes('ቀሪ')) {
        reply = lang === 'am' ? `የአሁኑ ጠቅላላ ቀሪ ሒሳብዎ ${formatETB(balance)} ነው።` : `Your current primary balance is ${formatETB(balance)}.`;
      } else if (lower.includes('rtgs')) {
        reply = lang === 'am'
          ? 'የኢትዮጵያ ብሔራዊ ባንክ የ RTGS ዝቅተኛ መጠን ETB 200,000 ነው። የአገልግሎት ክፍያ ETB 100 + 15% VAT ነው።'
          : 'National Bank of Ethiopia RTGS has a minimum threshold of ETB 200,000.00 with real-time irrevocable settlement.';
      } else if (lower.includes('bank') || lower.includes('ባንክ')) {
        reply = lang === 'am'
          ? 'በኢትዮጵያ 31 ፈቃድ ያላቸው ባንኮች አሉ። በባንክ ማውጫ (Bank Directory) ውስጥ ሙሉ ዝርዝራቸውን ማየት ይችላሉ።'
          : 'There are 31 licensed commercial banks in Ethiopia integrated in FinFlow. Check the Bank Directory for SWIFT & details.';
      } else if (lower.includes('save') || lower.includes('ቁጠባ')) {
        reply = lang === 'am'
          ? 'በወር 10-20% ገቢዎን በቋሚነት መቆጠብ ለአደጋ ጊዜና ለኢንቨስትመንት ቁልፍ ነው።'
          : 'A disciplined 10% to 20% monthly savings habit creates a dependable emergency fund and enables high-yield goals.';
      } else {
        reply = lang === 'am'
          ? 'ጥያቄዎን ተረድቻለሁ! ስለ ቀሪ ሒሳብ፣ RTGS ዝውውር፣ 31 ባንኮች ወይም ወጪዎች ማንኛውንም ጥያቄ ይጠይቁኝ።'
          : 'I can assist you with RTGS rules, all 31 Ethiopian banks, your balance inquiries, and savings diagnostics.';
      }

      setChatMessages(prev => [...prev, { sender: 'bot', text: reply }]);
    }, 400);
  };

  // Parse receipt text
  const handleParseReceipt = () => {
    if (!receiptRawText.trim()) {
      showToast(lang === 'am' ? '⚠️ እባክዎ ደረሰኝ ጽሑፍ ያስገቡ' : '⚠️ Please paste receipt text');
      return;
    }
    const match = receiptRawText.match(/[\d,]+\.\d{2}/);
    const parsedAmt = match ? parseFloat(match[0].replace(/,/g, '')) : 12500.00;
    setParsedAdvice({
      amount: parsedAmt,
      date: new Date().toLocaleDateString(),
      wordsEn: numberToEnglishWords(parsedAmt),
      wordsAm: numberToAmharicWords(parsedAmt),
      advice: parsedAmt > 50000
        ? (lang === 'am' ? 'ትልቅ የክፍያ ግብይት ነው። ደረሰኙን ለታክስና ሪፖርት ያስቀምጡ።' : 'High-value transaction. Maintain proof for fiscal documentation.')
        : (lang === 'am' ? 'መደበኛ ግብይት። በተሳካ ሁኔታ ተመዝግቧል።' : 'Standard transaction logged successfully.')
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-auto max-h-[94vh] flex flex-col animate-in fade-in zoom-in-95 duration-200">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-emerald-800 via-emerald-700 to-teal-800 text-white p-4 sm:p-5 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-xs flex items-center justify-center">
              {activeModal === 'rtgs' && <Zap size={20} className="text-amber-300" />}
              {activeModal === 'send' && <Send size={20} />}
              {activeModal === 'receive' && <ArrowDown size={20} />}
              {activeModal === 'deposit' && <PlusCircle size={20} />}
              {activeModal === 'withdraw' && <HandCoins size={20} />}
              {activeModal === 'pay' && <QrCode size={20} />}
              {activeModal === 'billPay' && <FileText size={20} />}
              {activeModal === 'airtime' && <Smartphone size={20} />}
              {activeModal === 'scanQR' && <QrCode size={20} />}
              {activeModal === 'requestMoney' && <HandCoins size={20} />}
              {activeModal === 'schedule' && <CalendarClock size={20} />}
              {activeModal === 'accounts' && <Landmark size={20} />}
              {activeModal === 'addAccount' && <PlusCircle size={20} />}
              {activeModal === 'bankDirectory' && <BookOpen size={20} />}
              {activeModal === 'advice' && <Lightbulb size={20} />}
              {activeModal === 'cards' && <CreditCard size={20} />}
              {activeModal === 'loans' && <HandCoins size={20} />}
              {activeModal === 'savings' && <PiggyBank size={20} />}
              {activeModal === 'budget' && <PieChart size={20} />}
              {activeModal === 'aiChat' && <Bot size={20} />}
              {activeModal === 'receiptAdvisor' && <Receipt size={20} />}
              {activeModal === 'profile' && <User size={20} />}
              {activeModal === 'security' && <ShieldCheck size={20} />}
              {activeModal === 'notifications' && <Bell size={20} />}
              {activeModal === 'help' && <HelpCircle size={20} />}
              {activeModal === 'txDetail' && <Receipt size={20} />}
              {activeModal === 'receipt' && <Receipt size={20} />}
              {activeModal === 'telegramHub' && <Send size={20} className="-rotate-12 text-sky-200" />}
              {activeModal === 'authCodesHub' && <KeyRound size={20} className="text-amber-300" />}
            </div>
            <div>
              <h3 className="font-bold text-base tracking-tight capitalize">
                {activeModal === 'rtgs' && t('rtgsTransfer')}
                {activeModal === 'send' && t('sendMoney')}
                {activeModal === 'receive' && t('receiveMoney')}
                {activeModal === 'deposit' && t('depositMoney')}
                {activeModal === 'withdraw' && t('withdrawMoney')}
                {activeModal === 'pay' && t('makePayment')}
                {activeModal === 'billPay' && t('billPayTitle')}
                {activeModal === 'airtime' && t('airtimeTitle')}
                {activeModal === 'scanQR' && t('scanQRTitle')}
                {activeModal === 'requestMoney' && t('requestMoneyTitle')}
                {activeModal === 'schedule' && t('scheduleTitle')}
                {activeModal === 'accounts' && t('myAccountsTitle')}
                {activeModal === 'addAccount' && t('addAccountTitle')}
                {activeModal === 'bankDirectory' && t('bankDirectoryTitle')}
                {activeModal === 'advice' && t('adviceTitle')}
                {activeModal === 'cards' && t('myCards')}
                {activeModal === 'loans' && t('loansTitle')}
                {activeModal === 'savings' && t('savingsTitle')}
                {activeModal === 'budget' && t('budgetTitle')}
                {activeModal === 'aiChat' && t('aiChatTitle')}
                {activeModal === 'receiptAdvisor' && t('receiptAdvisorTitle')}
                {activeModal === 'profile' && t('profileTitle')}
                {activeModal === 'security' && t('securityTitle')}
                {activeModal === 'notifications' && t('notificationsTitle')}
                {activeModal === 'help' && t('helpTitle')}
                {activeModal === 'txDetail' && t('txDetail')}
                {activeModal === 'receipt' && (lang === 'am' ? 'ደረሰኝ' : 'Transaction Receipt')}
                {activeModal === 'telegramHub' && (lang === 'am' ? 'የቴሌግራም ባንኪንግና ማሳወቂያዎች' : 'Telegram Banking & Alerts')}
                {activeModal === 'authCodesHub' && (lang === 'am' ? 'የደህንነት ማረጋገጫ ኮዶች (2FA)' : 'Security Codes & 2FA Dispatch')}
              </h3>
              <p className="text-[11px] text-emerald-200">
                {activeModal === 'rtgs' && t('rtgsTransferDesc')}
                {activeModal === 'send' && t('sendDesc')}
                {activeModal === 'receive' && t('receiveDesc')}
                {activeModal === 'bankDirectory' && '31 Licensed Commercial Banks in Ethiopia'}
                {activeModal === 'advice' && t('adviceDesc')}
                {activeModal === 'accounts' && t('accountsDesc')}
                {activeModal === 'txDetail' && 'Official Transaction Record'}
                {activeModal === 'receipt' && 'Verified Settlement Voucher'}
                {activeModal === 'telegramHub' && (lang === 'am' ? 'ይፋዊ ቦት፣ ቻናሎች እና የቀጥታ ማንቂያዎች' : 'Official Bot, Channels & Live Notifications')}
                {activeModal === 'authCodesHub' && (lang === 'am' ? 'በቴሌግራም እና በኤስኤምኤስ የተላኩ ኮዶች' : 'Audit Log of One-Time Authentication Codes')}
              </p>
            </div>
          </div>

          <button
            onClick={closeModal}
            className="w-8 h-8 rounded-full bg-white/15 hover:bg-white/25 flex items-center justify-center transition cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-4 text-slate-800 dark:text-slate-100">
          {/* ======================= RTGS FORM ======================= */}
          {activeModal === 'rtgs' && (
            <div className="space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-2xl flex items-center gap-3 text-xs text-amber-900 dark:text-amber-200">
                <Zap size={22} className="text-amber-600 flex-shrink-0" />
                <div>
                  <span className="font-bold">{t('rtgsTitle')}: </span>
                  <span>{t('rtgsInfo')}</span>
                </div>
              </div>

              {/* Sender Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold uppercase text-emerald-700 dark:text-emerald-400 tracking-wider">
                  {t('rtgsSenderSection')}
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('rtgsSenderAccount')} *</label>
                  <select
                    value={senderIdx}
                    onChange={e => setSenderIdx(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {accounts.map((acc, i) => (
                      <option key={i} value={i}>
                        {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="flex justify-between items-center text-xs px-1">
                  <span className="text-slate-500 dark:text-slate-400">{t('rtgsAvailableBalance')}:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400">
                    {formatETB(accounts[senderIdx]?.balance || 0)}
                  </span>
                </div>
              </div>

              {/* Receiver Section */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 space-y-3">
                <div className="text-xs font-bold uppercase text-sky-700 dark:text-sky-400 tracking-wider">
                  {t('rtgsReceiverSection')}
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t('rtgsReceiverBank')} *</label>
                  <select
                    value={receiverBank}
                    onChange={e => setReceiverBank(e.target.value)}
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {BANK_MASTER.map(b => (
                      <option key={b.bankId} value={b.name}>
                        {getBankDisplayName(b, lang)}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">{t('rtgsReceiverAccount')} *</label>
                  <input
                    type="text"
                    required
                    value={receiverAccount}
                    onChange={e => handleAccountChange(e.target.value.replace(/\D/g, ''))}
                    placeholder="1000987654321"
                    className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold mb-1">
                    {t('rtgsReceiverName')}
                    <span className="ml-2 text-[10px] bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full font-bold">
                      {t('rtgsAutoVerified')}
                    </span>
                  </label>
                  <input
                    type="text"
                    readOnly
                    value={receiverName}
                    placeholder="Auto-verifying beneficiary name..."
                    className="w-full px-3 py-2 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-300"
                  />
                </div>
              </div>

              {/* Amount & Purpose */}
              <div>
                <label className="block text-xs font-semibold mb-1">{t('rtgsAmount')} *</label>
                <input
                  type="number"
                  min="200000"
                  step="1000"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="200000.00"
                  className="w-full px-3 py-2.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-sm font-mono font-bold text-slate-900 dark:text-white"
                />
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  {t('rtgsAmountHelp')}
                </p>
                {parsedRtgsAmount > 0 && parsedRtgsAmount < 200000 && (
                  <p className="text-xs text-rose-600 font-bold mt-1">
                    ⚠️ {t('rtgsMinError')}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('rtgsPurpose')} *</label>
                <select
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="Commercial Payment">Commercial Payment</option>
                  <option value="Property Purchase">Property / Real Estate Purchase</option>
                  <option value="Corporate Dividend">Corporate Dividend Distribution</option>
                  <option value="Loan Settlement">Interbank Loan Settlement</option>
                  <option value="Government Treasury">Government Treasury Payment</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('rtgsPurposeNote')}</label>
                <input
                  type="text"
                  value={purposeNote}
                  onChange={e => setPurposeNote(e.target.value)}
                  placeholder="e.g. Invoice #2026-0819"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              {/* Fee Breakdown */}
              <div className="p-3.5 bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 rounded-2xl text-xs space-y-1.5">
                <div className="font-bold text-amber-900 dark:text-amber-200 mb-2">
                  {t('rtgsFeeBreakdown')}
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('rtgsServiceFee')}:</span>
                  <span className="font-semibold">{formatETB(rtgsFee)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600 dark:text-slate-400">{t('rtgsVat')}:</span>
                  <span className="font-semibold">{formatETB(rtgsVat)}</span>
                </div>
                <div className="flex justify-between pt-1.5 border-t border-amber-200 dark:border-amber-800/80 font-bold text-slate-900 dark:text-white">
                  <span>{t('rtgsTotal')}:</span>
                  <span className="text-amber-600 dark:text-amber-400 font-mono text-sm">{formatETB(rtgsTotal)}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  if (parsedRtgsAmount < 200000) {
                    showToast(t('rtgsMinError'));
                    return;
                  }
                  if (!receiverAccount || !receiverName) {
                    showToast(t('rtgsFillFields'));
                    return;
                  }
                  const acc = accounts[senderIdx];
                  if (acc.balance < rtgsTotal) {
                    showToast(t('rtgsInsufficientBalance'));
                    return;
                  }
                  initiateRtgsTransfer({
                    senderIdx,
                    senderAccount: acc.accountNo,
                    senderBank: acc.bank,
                    senderName: acc.name,
                    receiverBank,
                    receiverAccount,
                    receiverName,
                    amount: parsedRtgsAmount,
                    purpose: purpose || 'Commercial Payment',
                    purposeNote,
                    serviceFee: rtgsFee,
                    vat: rtgsVat,
                    total: rtgsTotal
                  });
                }}
                className="w-full py-3.5 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-bold text-sm rounded-xl shadow-lg shadow-amber-600/20 transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Zap size={18} />
                <span>{t('rtgsInitiate')}</span>
              </button>
            </div>
          )}

          {/* ======================= SEND MONEY FORM ======================= */}
          {activeModal === 'send' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('senderAccount')} *</label>
                <select
                  value={senderIdx}
                  onChange={e => setSenderIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((acc, i) => (
                    <option key={i} value={i}>
                      {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('recipientName')} *</label>
                <input
                  type="text"
                  required
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  placeholder="e.g. Solomon Desta"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('bankName')} *</label>
                  <select
                    value={receiverBank}
                    onChange={e => setReceiverBank(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  >
                    {BANK_MASTER.map(b => (
                      <option key={b.bankId} value={b.name}>
                        {getBankDisplayName(b, lang)}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('recipientAccount')} *</label>
                  <input
                    type="text"
                    required
                    value={receiverAccount}
                    onChange={e => setReceiverAccount(e.target.value.replace(/\D/g, ''))}
                    placeholder="1000123456"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('purpose')}</label>
                <input
                  type="text"
                  value={purpose}
                  onChange={e => setPurpose(e.target.value)}
                  placeholder="e.g. Monthly rent, supplies"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const numAmt = parseFloat(amount);
                  if (!receiverName || !numAmt || numAmt <= 0) {
                    showToast(t('rtgsFillFields'));
                    return;
                  }
                  const res = processTransaction({
                    direction: 'out',
                    amount: numAmt,
                    title: `Sent → ${receiverName}`,
                    bank: getBankNameByString(receiverBank, lang),
                    icon: 'fa-paper-plane',
                    accountIndex: senderIdx,
                    extra: {
                      recipientName: receiverName,
                      recipientBank: receiverBank,
                      recipientAccount: receiverAccount,
                      purpose
                    }
                  });
                  if (res.success && res.receipt) {
                    showToast(t('txSuccess'));
                    closeModal();
                    openReceiptModal(res.receipt);
                  } else {
                    showToast(res.error === 'insufficient' ? t('insufficientFunds') : t('invalidAmount'));
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send size={16} />
                <span>{t('sendMoney')}</span>
              </button>
            </div>
          )}

          {/* ======================= RECEIVE MONEY ======================= */}
          {activeModal === 'receive' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('senderName')} *</label>
                <input
                  type="text"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  placeholder="e.g. Ethiopian Airlines Group"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('senderBank')}</label>
                <select
                  value={receiverBank}
                  onChange={e => setReceiverBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {BANK_MASTER.map(b => (
                    <option key={b.bankId} value={b.name}>
                      {getBankDisplayName(b, lang)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('recipientAccount')} (Destination) *</label>
                <select
                  value={senderIdx}
                  onChange={e => setSenderIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((acc, i) => (
                    <option key={i} value={i}>
                      {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const numAmt = parseFloat(amount);
                  if (!receiverName || !numAmt || numAmt <= 0) {
                    showToast(t('rtgsFillFields'));
                    return;
                  }
                  const res = processTransaction({
                    direction: 'in',
                    amount: numAmt,
                    title: `Received ← ${receiverName}`,
                    bank: getBankNameByString(receiverBank, lang),
                    icon: 'fa-arrow-down',
                    accountIndex: senderIdx,
                    extra: {
                      senderName: receiverName,
                      senderBank: receiverBank,
                      purpose
                    }
                  });
                  if (res.success && res.receipt) {
                    showToast(t('txSuccess'));
                    closeModal();
                    openReceiptModal(res.receipt);
                  } else {
                    showToast(t('invalidAmount'));
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-sky-600 to-sky-700 hover:from-sky-700 hover:to-sky-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <ArrowDown size={16} />
                <span>{t('receiveMoney')}</span>
              </button>
            </div>
          )}

          {/* ======================= DEPOSIT ======================= */}
          {activeModal === 'deposit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('accountNumber')} *</label>
                <select
                  value={senderIdx}
                  onChange={e => setSenderIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((acc, i) => (
                    <option key={i} value={i}>
                      {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('source')}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="Cash Deposit">Cash Deposit (Branch)</option>
                  <option value="Direct Transfer">Direct Bank Transfer</option>
                  <option value="Telebirr Bridge">Telebirr / Mobile Wallet Bridge</option>
                  <option value="Agent Banking">Licensed Agent Banking</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const numAmt = parseFloat(amount);
                  if (!numAmt || numAmt <= 0) {
                    showToast(t('invalidAmount'));
                    return;
                  }
                  const res = processTransaction({
                    direction: 'in',
                    amount: numAmt,
                    title: `Deposit (${category})`,
                    bank: accounts[senderIdx].bank,
                    icon: 'fa-plus-circle',
                    accountIndex: senderIdx
                  });
                  if (res.success && res.receipt) {
                    showToast(t('depositSuccess'));
                    closeModal();
                    openReceiptModal(res.receipt);
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-teal-600 to-teal-700 hover:from-teal-700 hover:to-teal-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>{t('depositMoney')}</span>
              </button>
            </div>
          )}

          {/* ======================= WITHDRAW ======================= */}
          {activeModal === 'withdraw' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('accountNumber')} *</label>
                <select
                  value={senderIdx}
                  onChange={e => setSenderIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((acc, i) => (
                    <option key={i} value={i}>
                      {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('withdrawMethod')}</label>
                <select
                  value={category}
                  onChange={e => setCategory(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  <option value="ATM Cash">ATM Cash Code (Cardless)</option>
                  <option value="Branch Teller">Branch Teller Cashier</option>
                  <option value="Authorized Agent">Authorized Bank Agent</option>
                </select>
              </div>

              <button
                type="button"
                onClick={() => {
                  const numAmt = parseFloat(amount);
                  if (!numAmt || numAmt <= 0) {
                    showToast(t('invalidAmount'));
                    return;
                  }
                  const res = processTransaction({
                    direction: 'out',
                    amount: numAmt,
                    title: `Withdrawal (${category})`,
                    bank: accounts[senderIdx].bank,
                    icon: 'fa-hand-holding-usd',
                    accountIndex: senderIdx
                  });
                  if (res.success && res.receipt) {
                    showToast(t('txSuccess'));
                    closeModal();
                    openReceiptModal(res.receipt);
                  } else {
                    showToast(res.error === 'insufficient' ? t('insufficientFunds') : t('invalidAmount'));
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <HandCoins size={16} />
                <span>{t('withdrawMoney')}</span>
              </button>
            </div>
          )}

          {/* ======================= PAY & BILLS ======================= */}
          {(activeModal === 'pay' || activeModal === 'billPay' || activeModal === 'airtime' || activeModal === 'scanQR') && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('accountNumber')} *</label>
                <select
                  value={senderIdx}
                  onChange={e => setSenderIdx(Number(e.target.value))}
                  className="w-full px-3 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {accounts.map((acc, i) => (
                    <option key={i} value={i}>
                      {acc.bank} · {acc.accountNo} ({formatETB(acc.balance)})
                    </option>
                  ))}
                </select>
              </div>

              {activeModal === 'pay' && (
                <div>
                  <label className="block text-xs font-semibold mb-1">{t('merchantName')} *</label>
                  <input
                    type="text"
                    value={merchant}
                    onChange={e => setMerchant(e.target.value)}
                    placeholder="e.g. Safeway Supermarket Bole"
                    className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
              )}

              {activeModal === 'billPay' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{t('billType')} *</label>
                    <select
                      value={billType}
                      onChange={e => setBillType(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                    >
                      <option value="Electricity">Ethiopian Electric Utility (EEU)</option>
                      <option value="Water">Addis Ababa Water & Sewerage Authority</option>
                      <option value="Telecom">Ethio Telecom Postpaid Bill</option>
                      <option value="Internet">Broadband Internet Fibernet</option>
                      <option value="Traffic Penalty">Addis Ababa Traffic Management</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">{t('billNumber')} *</label>
                    <input
                      type="text"
                      value={billNumber}
                      onChange={e => setBillNumber(e.target.value)}
                      placeholder="e.g. ACC-2026-99120"
                      className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                    />
                  </div>
                </>
              )}

              {activeModal === 'airtime' && (
                <>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold mb-1">{t('network')} *</label>
                      <select
                        value={network}
                        onChange={e => setNetwork(e.target.value)}
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                      >
                        <option value="Ethio Telecom">Ethio Telecom 🇪🇹</option>
                        <option value="Safaricom Ethiopia">Safaricom Ethiopia</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold mb-1">{t('phoneNumber')} *</label>
                      <input
                        type="tel"
                        value={phoneNumber}
                        onChange={e => setPhoneNumber(e.target.value)}
                        placeholder="0911 234 567"
                        className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {activeModal === 'scanQR' && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800/60 text-center">
                  <QrCode size={40} className="mx-auto text-purple-600 mb-2" />
                  <div className="text-xs font-bold text-purple-950 dark:text-purple-200">
                    {lang === 'am' ? 'የQR ክፍያ ተቃኝቷል (Scan & Pay)' : 'Scanned Merchant: Ethiopian Duty Free Bole'}
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold mb-1">{t('amount')} *</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-sm font-bold font-mono"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  const numAmt = parseFloat(amount);
                  if (!numAmt || numAmt <= 0) {
                    showToast(t('invalidAmount'));
                    return;
                  }
                  let txTitle = 'Payment';
                  let txBank = accounts[senderIdx].bank;

                  if (activeModal === 'pay') txTitle = `Payment → ${merchant || 'Merchant'}`;
                  if (activeModal === 'billPay') txTitle = `${billType} Bill (#${billNumber || 'Auto'})`;
                  if (activeModal === 'airtime') txTitle = `Airtime (${network}) → ${phoneNumber || 'Phone'}`;
                  if (activeModal === 'scanQR') txTitle = `QR Merchant Payment`;

                  const res = processTransaction({
                    direction: 'out',
                    amount: numAmt,
                    title: txTitle,
                    bank: txBank,
                    accountIndex: senderIdx
                  });

                  if (res.success && res.receipt) {
                    showToast(t('txSuccess'));
                    closeModal();
                    openReceiptModal(res.receipt);
                  } else {
                    showToast(res.error === 'insufficient' ? t('insufficientFunds') : t('invalidAmount'));
                  }
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 size={16} />
                <span>{t('submit')}</span>
              </button>
            </div>
          )}

          {/* ======================= MY ACCOUNTS ======================= */}
          {activeModal === 'accounts' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-emerald-600 text-white flex items-center justify-between shadow-md">
                <div>
                  <div className="text-[10px] text-emerald-200 uppercase tracking-wider font-bold">
                    {t('totalBalanceLabel')}
                  </div>
                  <div className="text-xl font-black">
                    {formatETB(accounts.reduce((s, a) => s + a.balance, 0))}
                  </div>
                </div>
                <div className="px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
                  {accounts.length} {t('linkedAccounts')}
                </div>
              </div>

              <div className="space-y-3">
                {accounts.length === 0 ? (
                  <div className="p-8 text-center text-slate-400 dark:text-slate-500 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                    <Landmark size={36} className="mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                      {lang === 'am' ? 'እስካሁን የተገናኘ የባንክ ሂሳብ የለም' : 'No bank accounts linked yet'}
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1">
                      {lang === 'am' ? 'የኢትዮጵያ ባንክ ሂሳብዎን ለማገናኘት ከታች ያለውን ይጫኑ' : 'Link your Ethiopian bank account below to get started'}
                    </p>
                  </div>
                ) : (
                  accounts.map((acc, i) => {
                  const bankData = BANK_MASTER.find(b => b.name.toLowerCase() === acc.bank.toLowerCase());
                  const isPrimary = i === primaryIndex;
                  return (
                    <div
                      key={i}
                      className={`p-4 rounded-2xl border transition-all ${
                        isPrimary
                          ? 'border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 shadow-sm'
                          : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          {bankData && <BankLogo bank={bankData} size="md" />}
                          <div>
                            <div className="font-extrabold text-xs text-slate-900 dark:text-white">
                              {bankData ? getBankDisplayName(bankData, lang) : acc.bank}
                            </div>
                            <div className="text-[11px] text-slate-500 dark:text-slate-400">
                              {acc.name}
                            </div>
                          </div>
                        </div>

                        {isPrimary ? (
                          <span className="text-[10px] font-extrabold tracking-wider bg-emerald-600 text-white px-2.5 py-0.5 rounded-full">
                            {t('primaryAccount')}
                          </span>
                        ) : (
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => setPrimaryAccount(i)}
                              className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 hover:underline px-2 py-1"
                            >
                              {t('setAsPrimary')}
                            </button>
                            <button
                              onClick={() => removeAccount(i)}
                              className="text-xs text-rose-500 hover:text-rose-700 p-1"
                              title="Delete Account"
                            >
                              ×
                            </button>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 mb-2 font-mono text-xs">
                        <span className="font-bold tracking-wider">{acc.accountNo}</span>
                        <button
                          onClick={() => handleCopy(acc.accountNo)}
                          className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1"
                          title={t('copyNumber')}
                        >
                          <Copy size={14} />
                        </button>
                      </div>

                      <div className="flex justify-between items-center text-xs">
                        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                          {t('accountLive')}
                        </span>
                        <span className="text-sm font-black font-mono text-slate-900 dark:text-white">
                          {formatETB(acc.balance)}
                        </span>
                      </div>
                    </div>
                  );
                }))}
              </div>

              <button
                type="button"
                onClick={() => {
                  closeModal();
                  setTimeout(() => {
                    openModal('addAccount');
                  }, 100);
                }}
                className="w-full py-3 rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-emerald-500 text-slate-600 dark:text-slate-300 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>{t('addAnotherAccount')}</span>
              </button>
            </div>
          )}

          {/* ======================= ADD ACCOUNT ======================= */}
          {activeModal === 'addAccount' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('fullName')} *</label>
                <input
                  type="text"
                  required
                  value={receiverName || profile?.fullName || user.name || ''}
                  onChange={e => setReceiverName(e.target.value)}
                  placeholder="e.g. Abebe Kebede"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('bankName')} *</label>
                <select
                  value={receiverBank}
                  onChange={e => setReceiverBank(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                >
                  {BANK_MASTER.map(b => (
                    <option key={b.bankId} value={b.name}>
                      {getBankDisplayName(b, lang)} ({b.type})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">{t('accountNumber')} *</label>
                <input
                  type="text"
                  required
                  value={receiverAccount}
                  onChange={e => setReceiverAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="e.g. 1000998877665"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold mb-1">
                  {lang === 'am' ? 'የመጀመሪያ ቀሪ ሒሳብ' : 'Initial Balance (ETB)'}
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono font-semibold"
                />
              </div>

              <button
                type="button"
                onClick={() => {
                  if (!receiverAccount) {
                    showToast(t('rtgsFillFields'));
                    return;
                  }
                  addAccount({
                    accountNo: receiverAccount,
                    bank: receiverBank,
                    name: receiverName || profile?.fullName || user.name || 'Account Holder',
                    balance: parseFloat(amount) || 0
                  });
                  closeModal();
                }}
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-700 hover:to-emerald-800 text-white font-bold text-sm rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
              >
                <PlusCircle size={16} />
                <span>{t('addAccountTitle')}</span>
              </button>
            </div>
          )}

          {/* ======================= BANK DIRECTORY (31 BANKS) ======================= */}
          {activeModal === 'bankDirectory' && (
            <div className="space-y-4">
              {/* Search & Filter */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={bankSearch}
                    onChange={e => setBankSearch(e.target.value)}
                    placeholder={lang === 'am' ? 'ባንክ በስም ወይም በ SWIFT ፈልግ...' : 'Search banks by name or SWIFT...'}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>

                <div className="flex gap-1 overflow-x-auto pb-1">
                  {(['All', 'Public', 'Private', 'Interest-Free'] as const).map(tab => (
                    <button
                      key={tab}
                      onClick={() => setBankTypeFilter(tab)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                        bankTypeFilter === tab
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200'
                      }`}
                    >
                      {tab}
                    </button>
                  ))}
                </div>
              </div>

              {/* Selected Bank Details View */}
              {selectedBankDetails && (
                <div className="p-4 rounded-2xl bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/40 dark:to-slate-800/80 border border-emerald-300 dark:border-emerald-700 space-y-3 animate-in fade-in duration-200">
                  <div className="flex items-center justify-between pb-3 border-b border-emerald-200 dark:border-emerald-800">
                    <div className="flex items-center gap-3">
                      <BankLogo bank={selectedBankDetails} size="lg" />
                      <div>
                        <h4 className="font-black text-sm text-slate-900 dark:text-white">
                          {getBankDisplayName(selectedBankDetails, lang)}
                        </h4>
                        <div className="text-[11px] text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-2">
                          <span>{selectedBankDetails.bankId}</span>
                          <span>•</span>
                          <span>SWIFT: {selectedBankDetails.swiftBic}</span>
                          <span>•</span>
                          <span className="bg-emerald-600 text-white px-2 py-0.2 rounded-full text-[10px]">
                            {selectedBankDetails.type}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() => setSelectedBankDetails(null)}
                      className="text-xs text-slate-500 hover:text-slate-800 p-1"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('licenseStatus')}</span>
                      <div className="font-semibold text-emerald-600">{selectedBankDetails.licenseStatus}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('licenseDate')}</span>
                      <div className="font-semibold">{selectedBankDetails.licenseDate}</div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('headOffice')}</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Building2 size={13} className="text-slate-400" />
                        <span>{selectedBankDetails.headOffice}</span>
                      </div>
                    </div>
                    <div className="col-span-2">
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('coreBankingSystem')}</span>
                      <div className="font-semibold">{selectedBankDetails.coreBankingSystem}</div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('bankPhone')}</span>
                      <div className="font-semibold flex items-center gap-1">
                        <Phone size={12} className="text-slate-400" />
                        <span>{selectedBankDetails.phone}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-slate-400 text-[10px] uppercase font-bold">{t('website')}</span>
                      <a
                        href={selectedBankDetails.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-semibold text-emerald-600 hover:underline flex items-center gap-1"
                      >
                        <Globe size={12} />
                        <span className="truncate max-w-[130px]">{selectedBankDetails.website}</span>
                      </a>
                    </div>
                  </div>

                  {/* RTGS specs */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/80 rounded-xl text-xs space-y-1">
                    <div className="font-bold text-amber-900 dark:text-amber-300 flex items-center gap-1.5">
                      <Zap size={14} />
                      <span>{t('rtgsTitle')}</span>
                    </div>
                    <div className="text-[11px] text-slate-600 dark:text-slate-400">
                      <strong>Min:</strong> {selectedBankDetails.rtgs.minimum} · <strong>Fee:</strong> {selectedBankDetails.rtgs.fee} · <strong>Hours:</strong> {selectedBankDetails.rtgs.operatingHours}
                    </div>
                  </div>
                </div>
              )}

              {/* 31 Banks Master List */}
              <div className="space-y-2 max-h-[360px] overflow-y-auto pr-1">
                {BANK_MASTER
                  .filter(b => {
                    const matchQ =
                      b.name.toLowerCase().includes(bankSearch.toLowerCase()) ||
                      b.nameAm.includes(bankSearch) ||
                      b.swiftBic.toLowerCase().includes(bankSearch.toLowerCase()) ||
                      b.bankId.toLowerCase().includes(bankSearch.toLowerCase());
                    const matchT = bankTypeFilter === 'All' || b.type === bankTypeFilter;
                    return matchQ && matchT;
                  })
                  .map(bank => (
                    <div
                      key={bank.bankId}
                      onClick={() => setSelectedBankDetails(bank)}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500 hover:bg-emerald-50/30 dark:hover:bg-slate-800/80 transition flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3">
                        <BankLogo bank={bank} size="sm" />
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {getBankDisplayName(bank, lang)}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {bank.swiftBic} · {bank.type} · {bank.coreBankingSystem}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <span>{t('seeDetails')}</span>
                        <ExternalLink size={12} />
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          {/* ======================= FINANCIAL ADVICE ======================= */}
          {activeModal === 'advice' && (
            <div className="space-y-4">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center gap-3 shadow-md">
                <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center flex-shrink-0">
                  <Lightbulb size={24} className="text-amber-300" />
                </div>
                <div>
                  <h4 className="font-bold text-sm">{t('adviceGreeting')}</h4>
                  <p className="text-xs text-emerald-100">{t('adviceQuestion1')}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t('adviceTotalTx')}</div>
                  <div className="text-base font-black text-emerald-600 dark:text-emerald-400">{transactions.length}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                  <div className="text-[10px] text-slate-400 font-bold uppercase">{t('totalBalance')}</div>
                  <div className="text-base font-black text-slate-900 dark:text-white">
                    {formatETB(accounts.reduce((s, a) => s + a.balance, 0))}
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2.5">
                <h5 className="font-bold text-xs uppercase tracking-wider text-emerald-700 dark:text-emerald-400">
                  Recommended Ethiopian Banking Guidelines:
                </h5>
                <ul className="text-xs space-y-2 text-slate-700 dark:text-slate-300">
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{t('adviceTip1')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{t('adviceTip2')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{t('adviceTip3')}</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                    <span>{t('adviceTip4')}</span>
                  </li>
                </ul>
              </div>

              <button
                onClick={handleExportCSV}
                className="w-full py-3 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Download size={15} />
                <span>{t('exportCSV')}</span>
              </button>
            </div>
          )}

          {/* ======================= TRANSACTION HISTORY ======================= */}
          {activeModal === 'history' && (
            <div className="space-y-3">
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                  <input
                    type="text"
                    value={historyQuery}
                    onChange={e => setHistoryQuery(e.target.value)}
                    placeholder={t('searchTransactions')}
                    className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
                >
                  <Download size={14} />
                  <span>CSV</span>
                </button>
              </div>

              <div className="space-y-1.5 max-h-[380px] overflow-y-auto pr-1">
                {transactions
                  .filter(tx => {
                    const q = historyQuery.toLowerCase();
                    const matchQ =
                      !q ||
                      tx.id.toLowerCase().includes(q) ||
                      tx.title.toLowerCase().includes(q) ||
                      tx.bank.toLowerCase().includes(q) ||
                      tx.accountNo.includes(q);
                    const matchT =
                      historyType === 'all' ||
                      (historyType === 'in' && (tx.type === 'in' || tx.type === 'deposit')) ||
                      (historyType === 'out' && tx.type === 'out');
                    return matchQ && matchT;
                  })
                  .map(tx => {
                    const isPositive = tx.direction === 'in' || tx.type === 'deposit';
                    return (
                      <div
                        key={tx.id}
                        onClick={() => openTxDetail(tx)}
                        className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition flex items-center justify-between cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-xs text-slate-900 dark:text-white">
                            {tx.title}
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400">
                            {tx.date} · {tx.bank} · <span className="font-mono">{tx.id}</span>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className={`font-mono font-bold text-xs ${isPositive ? 'text-emerald-600' : 'text-slate-900 dark:text-white'}`}>
                            {isPositive ? '+' : '−'} {formatETB(tx.totalDebit || tx.amount)}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            Bal: {formatETB(tx.balanceAfter || 0)}
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </div>
          )}

          {/* ======================= TRANSACTION DETAIL ======================= */}
          {activeModal === 'txDetail' && (
            <div className="space-y-4 text-xs">
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-center">
                <div className="text-[10px] text-slate-400 uppercase font-bold">{t('totalAmount')}</div>
                <div className="text-2xl font-black font-mono mt-1 text-slate-900 dark:text-white">
                  {formatETB(selectedTx?.totalDebit || selectedTx?.amount || 0)}
                </div>
                <div className="text-xs text-emerald-600 font-bold mt-1">
                  {selectedTx?.title}
                </div>
              </div>

              <div className="space-y-2 divide-y divide-slate-100 dark:divide-slate-800">
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('transactionId')}</span>
                  <span className="font-mono font-bold">{selectedTx?.id}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('transactionDate')}</span>
                  <span className="font-semibold">{selectedTx?.date} {selectedTx?.time}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('bankName')}</span>
                  <span className="font-semibold">{selectedTx?.bank}</span>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('accountNumber')}</span>
                  <span className="font-mono font-semibold">{selectedTx?.accountNo}</span>
                </div>
                {selectedTx?.recipientName && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{t('recipientName')}</span>
                    <span className="font-semibold">{selectedTx?.recipientName}</span>
                  </div>
                )}
                {selectedTx?.fee !== undefined && selectedTx?.fee! > 0 && (
                  <div className="flex justify-between py-1.5">
                    <span className="text-slate-500">{t('fee')}</span>
                    <span className="font-semibold">{formatETB(selectedTx?.fee || 0)}</span>
                  </div>
                )}
                <div className="flex justify-between py-1.5">
                  <span className="text-slate-500">{t('balanceAfter')}</span>
                  <span className="font-bold text-emerald-600">{formatETB(selectedTx?.balanceAfter || 0)}</span>
                </div>
                <div className="py-2">
                  <span className="text-slate-500 block mb-0.5">{t('amountInWords')}</span>
                  <div className="font-semibold text-slate-700 dark:text-slate-300">
                    {lang === 'am'
                      ? numberToAmharicWords(selectedTx?.amount || 0)
                      : numberToEnglishWords(selectedTx?.amount || 0)}
                  </div>
                </div>
              </div>

              <button
                onClick={() => window.print()}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Printer size={15} />
                <span>{lang === 'am' ? 'ደረሰኝ አትም' : 'Print Voucher'}</span>
              </button>
            </div>
          )}

          {/* ======================= VERIFIED RECEIPT ======================= */}
          {activeModal === 'receipt' && (
            <div className="space-y-4">
              <div className="p-6 border-2 border-dashed border-emerald-600/40 rounded-3xl bg-slate-50 dark:bg-slate-800/80 font-mono text-xs space-y-3">
                <div className="text-center pb-3 border-b border-dashed border-emerald-600/30">
                  <div className="w-12 h-12 rounded-full bg-emerald-600 text-white flex items-center justify-center mx-auto mb-2 text-xl font-bold">
                    ✓
                  </div>
                  <h3 className="font-extrabold text-sm text-emerald-700 dark:text-emerald-400">
                    {activeReceipt?.utr ? t('rtgsReceipt') : 'FinFlow Payment Voucher'}
                  </h3>
                  <p className="text-[10px] text-slate-500">
                    National Bank of Ethiopia Real-Time Settlement
                  </p>
                </div>

                {activeReceipt?.utr && (
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 rounded-xl text-center text-emerald-900 dark:text-emerald-200">
                    <span className="text-[10px] block uppercase font-bold text-slate-500">
                      {t('rtgsReceiptUTR')}
                    </span>
                    <span className="font-bold tracking-wider">{activeReceipt?.utr}</span>
                  </div>
                )}

                <div className="space-y-1.5 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('transactionDate')}:</span>
                    <span className="font-bold">{activeReceipt?.date} {activeReceipt?.time}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('senderBank')}:</span>
                    <span className="font-bold">{activeReceipt?.senderBank || 'FinFlow Account'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('beneficiaryName')}:</span>
                    <span className="font-bold">{activeReceipt?.receiverName || activeReceipt?.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">{t('transferAmount')}:</span>
                    <span className="font-bold">{formatETB(activeReceipt?.amount || 0)}</span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-dashed border-slate-300 dark:border-slate-700 font-extrabold text-xs text-slate-900 dark:text-white">
                    <span>{t('totalAmount')}:</span>
                    <span>{formatETB(activeReceipt?.totalDebit || activeReceipt?.amount || 0)}</span>
                  </div>
                  <div className="pt-2 text-[10px] text-slate-600 dark:text-slate-300">
                    <strong>Words: </strong>
                    {lang === 'am'
                      ? numberToAmharicWords(activeReceipt?.amount || 0)
                      : numberToEnglishWords(activeReceipt?.amount || 0)}
                  </div>
                </div>

                <div className="text-center pt-3 border-t border-dashed border-emerald-600/30">
                  <span className="inline-block px-3 py-1 rounded-full border border-emerald-600 text-emerald-600 text-[10px] font-black tracking-widest uppercase">
                    COMPLETED & SETTLED
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={closeModal}
                  className="flex-1 py-3 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-800 dark:text-slate-200 font-bold text-xs rounded-xl transition cursor-pointer"
                >
                  {t('close')}
                </button>
                <button
                  onClick={() => window.print()}
                  className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  <Printer size={15} />
                  <span>{lang === 'am' ? 'ደረሰኝ አትም' : 'Print Receipt'}</span>
                </button>
              </div>
            </div>
          )}

          {/* ======================= AI CHAT ASSISTANT ======================= */}
          {activeModal === 'aiChat' && (
            <div className="flex flex-col h-[400px]">
              <div className="flex-1 overflow-y-auto space-y-2.5 p-2 bg-slate-50 dark:bg-slate-800/50 rounded-2xl mb-3 border border-slate-200 dark:border-slate-700">
                {chatMessages.map((msg, i) => (
                  <div
                    key={i}
                    className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                      msg.sender === 'user'
                        ? 'ml-auto bg-emerald-600 text-white rounded-br-none'
                        : 'mr-auto bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none shadow-xs'
                    }`}
                  >
                    {msg.text}
                  </div>
                ))}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={e => setChatInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSendChat()}
                  placeholder={t('aiPlaceholder')}
                  className="flex-1 px-4 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
                <button
                  onClick={handleSendChat}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition flex items-center justify-center cursor-pointer"
                >
                  <Send size={15} />
                </button>
              </div>
            </div>
          )}

          {/* ======================= RECEIPT ADVISOR ======================= */}
          {activeModal === 'receiptAdvisor' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold mb-1">{t('pasteReceipt')}</label>
                <textarea
                  rows={4}
                  value={receiptRawText}
                  onChange={e => setReceiptRawText(e.target.value)}
                  placeholder="Paste bank SMS or transaction receipt text here... e.g.: You have sent ETB 45,000.00 to CBE account 1000..."
                  className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
              </div>

              <button
                onClick={handleParseReceipt}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition cursor-pointer"
              >
                <Receipt size={16} />
                <span>{t('generateAdvice')}</span>
              </button>

              {parsedAdvice && (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs space-y-2">
                  <div className="font-bold text-emerald-800 dark:text-emerald-300">
                    {t('receiptAdvice')}
                  </div>
                  <div className="flex justify-between font-mono">
                    <span>Parsed Amount:</span>
                    <span className="font-bold">{formatETB(parsedAdvice.amount)}</span>
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong>Amharic: </strong> {parsedAdvice.wordsAm}
                  </div>
                  <div className="text-[11px] text-slate-600 dark:text-slate-400">
                    <strong>English: </strong> {parsedAdvice.wordsEn}
                  </div>
                  <div className="p-2.5 rounded-xl bg-white dark:bg-slate-800 font-semibold text-emerald-700 dark:text-emerald-300 mt-2">
                    💡 {parsedAdvice.advice}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ======================= SAVINGS & BUDGET ======================= */}
          {activeModal === 'savings' && (
            <div className="space-y-4">
              <div className="space-y-2.5">
                {savingsGoals.map((g, i) => {
                  const pct = Math.min(100, Math.round((g.saved / g.targetAmount) * 100));
                  return (
                    <div key={i} className="p-3.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/60 space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold">{g.goalName}</span>
                        <button onClick={() => removeSavingsGoal(i)} className="text-rose-500 hover:text-rose-700">✕</button>
                      </div>
                      <div className="w-full bg-slate-200 dark:bg-slate-700 h-2 rounded-full overflow-hidden">
                        <div className="bg-emerald-600 h-full rounded-full transition-all" style={{ width: `${pct}%` }} />
                      </div>
                      <div className="flex justify-between items-center text-[11px] text-slate-500">
                        <span>{formatETB(g.saved)} of {formatETB(g.targetAmount)} ({pct}%)</span>
                        <button
                          onClick={() => {
                            const amt = parseFloat(prompt('Contribution amount in ETB:') || '0');
                            if (amt > 0) contributeToGoal(i, amt);
                          }}
                          className="font-bold text-emerald-600 hover:underline"
                        >
                          + Contribute
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <h5 className="font-bold text-xs">{lang === 'am' ? 'አዲስ ግብ ፍጠር' : 'Create New Goal'}</h5>
                <input
                  type="text"
                  placeholder="Goal Title (e.g. Electric Car)"
                  value={receiverName}
                  onChange={e => setReceiverName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder="Target Amount (ETB)"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-xs font-mono"
                />
                <button
                  onClick={() => {
                    const num = parseFloat(amount);
                    if (!receiverName || !num) return;
                    addSavingsGoal({
                      goalName: receiverName,
                      targetAmount: num,
                      saved: 0,
                      deadline: '2027-12-31'
                    });
                    setReceiverName('');
                    setAmount('');
                  }}
                  className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl"
                >
                  Save Goal
                </button>
              </div>
            </div>
          )}

          {/* ======================= NOTIFICATIONS ======================= */}
          {activeModal === 'notifications' && (
            <div className="space-y-2 max-h-[380px] overflow-y-auto">
              {notifications.map((n, i) => (
                <div key={i} className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-start gap-3">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-400 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Bell size={15} />
                  </div>
                  <div className="flex-1 min-w-0 text-xs">
                    <div className="font-bold text-slate-900 dark:text-white">{n.title}</div>
                    <div className="text-slate-600 dark:text-slate-300 mt-0.5">{n.desc}</div>
                    <div className="text-[10px] text-slate-400 mt-1">{n.time}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ======================= PROFILE ======================= */}
          {activeModal === 'profile' && (
            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold mb-1">{t('fullName')}</label>
                <input
                  type="text"
                  value={profile?.fullName || ''}
                  onChange={e => updateProfile({ ...profile!, fullName: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('email')}</label>
                <input
                  type="email"
                  value={profile?.email || ''}
                  onChange={e => updateProfile({ ...profile!, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('phone')}</label>
                <input
                  type="text"
                  value={profile?.phone || ''}
                  onChange={e => updateProfile({ ...profile!, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <div>
                <label className="block font-semibold mb-1">{t('address')}</label>
                <input
                  type="text"
                  value={profile?.address || ''}
                  onChange={e => updateProfile({ ...profile!, address: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl"
                />
              </div>
              <button
                onClick={closeModal}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl mt-2 cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          )}

          {/* ======================= CARDS / LOANS / BUDGET / SECURITY / HELP ======================= */}
          {activeModal === 'cards' && (
            <div className="space-y-3 text-xs">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-violet-700 to-purple-800 text-white font-mono space-y-4 shadow-md">
                <div className="flex justify-between items-center text-[10px] tracking-widest uppercase">
                  <span>FinFlow Platinum Debit</span>
                  <span>Mastercard</span>
                </div>
                <div className="text-base font-bold tracking-widest">
                  5254 •••• •••• 9821
                </div>
                <div className="flex justify-between items-end text-[10px]">
                  <div>
                    <div className="opacity-75">CARDHOLDER</div>
                    <div className="font-bold">{profile?.fullName || user.name || 'Cardholder'}</div>
                  </div>
                  <div>
                    <div className="opacity-75">EXPIRES</div>
                    <div className="font-bold">12/28</div>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl text-center text-slate-500">
                Contactless NFC and ATM Cash access enabled.
              </div>
            </div>
          )}

          {activeModal === 'help' && (
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-xl text-emerald-800 dark:text-emerald-300">
                FinFlow Ethiopia 24/7 Digital Operations Desk
              </div>
              <div>
                <label className="block font-semibold mb-1">Subject</label>
                <select className="w-full px-3 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl">
                  <option>RTGS Settlement Inquiry</option>
                  <option>Account Linkage Verification</option>
                  <option>Transaction Reversal Request</option>
                  <option>Security & 2FA Reset</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold mb-1">Message</label>
                <textarea rows={3} placeholder="Describe your inquiry..." className="w-full p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl" />
              </div>
              <button
                onClick={() => {
                  showToast('Support ticket #ET-8912 created');
                  closeModal();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl cursor-pointer"
              >
                Send Message
              </button>
            </div>
          )}

          {activeModal === 'telegramHub' && <TelegramHubModal />}

          {activeModal === 'authCodesHub' && <AuthCodesHubModal />}
        </div>
      </div>
    </div>
  );
};
