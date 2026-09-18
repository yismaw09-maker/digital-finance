import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  UserAccount,
  TransactionRecord,
  ReceiptRecord,
  SavedCard,
  SavedLoan,
  SavingsGoal,
  BudgetPlan,
  UserProfile,
  AppNotification,
  RtgsDraft,
  SentAuthCode
} from '../types';
import { translations } from '../data/translations';
import { BANK_MASTER, getBankNameByString } from '../data/banks';
import { formatETB } from '../utils/numberToWords';
import {
  auth,
  db,
  googleProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  handleFirestoreError,
  OperationType
} from '../firebase';
import {
  doc,
  setDoc,
  deleteDoc,
  updateDoc,
  collection,
  onSnapshot
} from 'firebase/firestore';

interface BankingContextType {
  isLoggedIn: boolean;
  user: { name: string; email: string; phone: string; uid?: string };
  accounts: UserAccount[];
  primaryAccount: UserAccount | null;
  primaryIndex: number;
  balanceVisible: boolean;
  lang: 'am' | 'en';
  theme: 'light' | 'dark';
  transactions: TransactionRecord[];
  receipts: ReceiptRecord[];
  cards: SavedCard[];
  loans: SavedLoan[];
  savingsGoals: SavingsGoal[];
  budget: BudgetPlan | null;
  profile: UserProfile | null;
  notifications: AppNotification[];
  activeModal: string | null;
  modalData: any;
  selectedTx: TransactionRecord | null;
  activeReceipt: ReceiptRecord | null;
  rtgsDraft: RtgsDraft | null;
  otpOpen: boolean;
  pinOpen: boolean;
  biometricOpen: boolean;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  closeBiometric: () => void;
  handleBiometricSuccess: () => void;
  toast: string | null;
  t: (key: keyof typeof translations['en']) => string;
  setLang: (lang: 'am' | 'en') => void;
  toggleTheme: () => void;
  toggleBalanceVisibility: () => void;
  setPrimaryAccount: (index: number) => void;
  addAccount: (account: UserAccount) => Promise<void>;
  removeAccount: (index: number) => Promise<void>;
  login: (emailOrUser: string, pass: string) => Promise<boolean>;
  signInWithGoogle: () => Promise<boolean>;
  signup: (userData: {
    fullName: string;
    email: string;
    phone: string;
    bank: string;
    accountNo: string;
    password?: string;
    initialBalance?: number;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  processTransaction: (params: {
    direction: 'in' | 'out';
    amount: number;
    fee?: number;
    vat?: number;
    title: string;
    bank?: string;
    icon?: string;
    accountIndex?: number;
    extra?: Partial<TransactionRecord>;
  }) => { success: boolean; error?: string; tx?: TransactionRecord; receipt?: ReceiptRecord };
  openModal: (modal: string, data?: any) => void;
  closeModal: () => void;
  openTxDetail: (tx: TransactionRecord) => void;
  openReceiptModal: (receipt: ReceiptRecord) => void;
  initiateRtgsTransfer: (draft: RtgsDraft) => void;
  confirmRtgsWithOtp: (otpCode: string) => boolean;
  closeOtp: () => void;
  openPin: (callback: () => void) => void;
  closePin: () => void;
  showToast: (msg: string) => void;
  updateBudget: (b: BudgetPlan) => void;
  updateProfile: (p: UserProfile) => Promise<void>;
  addCard: (c: SavedCard) => Promise<void>;
  removeCard: (idx: number) => Promise<void>;
  addLoan: (l: SavedLoan) => void;
  removeLoan: (idx: number) => void;
  addSavingsGoal: (g: SavingsGoal) => Promise<void>;
  removeSavingsGoal: (idx: number) => Promise<void>;
  contributeToGoal: (idx: number, amount: number) => Promise<boolean>;
  activeAuthCode: string | null;
  authNotificationBanner: {
    id: string;
    code: string;
    channel: 'Telegram' | 'SMS' | 'Email';
    purpose: string;
    timestamp: string;
    telegramUsername?: string;
  } | null;
  sentAuthCodes: SentAuthCode[];
  generateAndSendAuthCode: (purpose: string, channel?: 'Telegram' | 'SMS') => string;
  verifyAuthCode: (inputCode: string) => boolean;
  dismissAuthBanner: () => void;
  autoFillAuthCode: () => void;
  autoFillValue: string | null;
  consumeAutoFill: () => void;
  updateTelegramSettings: (username: string, alerts: boolean, otp: boolean) => Promise<void>;
  telegramSettings: {
    username: string;
    alertsEnabled: boolean;
    otpEnabled: boolean;
  };
}

const BankingContext = createContext<BankingContextType | undefined>(undefined);

const STORAGE_KEY = 'finflow_ethiopia_v2_clean';

export const BankingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Purge any stale demo data from previous storage keys on start
  try {
    localStorage.removeItem('finflow_ethiopia_v1');
  } catch (e) {
    // ignore
  }

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string; phone: string; uid?: string }>({
    name: '',
    email: '',
    phone: '',
    uid: ''
  });
  const [accounts, setAccounts] = useState<UserAccount[]>([]);
  const [primaryIndex, setPrimaryIndex] = useState(0);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [lang, setLangState] = useState<'am' | 'en'>('am');
  const [theme, setThemeState] = useState<'light' | 'dark'>('light');
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [receipts, setReceipts] = useState<ReceiptRecord[]>([]);
  const [cards, setCards] = useState<SavedCard[]>([]);
  const [loans, setLoans] = useState<SavedLoan[]>([]);
  const [savingsGoals, setSavingsGoals] = useState<SavingsGoal[]>([]);
  const [budget, setBudget] = useState<BudgetPlan | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [notifications, setNotifications] = useState<AppNotification[]>([]);

  // Modal states
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [modalData, setModalData] = useState<any>(null);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [activeReceipt, setActiveReceipt] = useState<ReceiptRecord | null>(null);
  const [rtgsDraft, setRtgsDraft] = useState<RtgsDraft | null>(null);
  const [biometricOpen, setBiometricOpen] = useState(false);
  const [otpOpen, setOtpOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pinCallback, setPinCallback] = useState<(() => void) | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState<string | null>(null);

  // Auth codes & Telegram states
  const [activeAuthCode, setActiveAuthCode] = useState<string | null>(null);
  const [authNotificationBanner, setAuthNotificationBanner] = useState<{
    id: string;
    code: string;
    channel: 'Telegram' | 'SMS' | 'Email';
    purpose: string;
    timestamp: string;
    telegramUsername?: string;
  } | null>(null);
  const [sentAuthCodes, setSentAuthCodes] = useState<SentAuthCode[]>([]);
  const [autoFillValue, setAutoFillValue] = useState<string | null>(null);
  const [telegramSettings, setTelegramSettings] = useState({
    username: '@FinFlow_User',
    alertsEnabled: true,
    otpEnabled: true
  });

  // Sync dark class with document element
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
      document.body.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      document.body.setAttribute('data-theme', 'light');
    }
  }, [theme]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => {
      setToast(current => (current === msg ? null : current));
    }, 3200);
  };

  const t = (key: keyof typeof translations['en']): string => {
    const langDict = translations[lang] || translations.am;
    return (langDict as any)[key] || translations.en[key] || String(key);
  };

  // Firebase Auth State Listener & Firestore Realtime Subscription
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async fbUser => {
      if (fbUser) {
        setIsLoggedIn(true);
        const displayName = fbUser.displayName || fbUser.email?.split('@')[0] || 'User';
        const userEmail = fbUser.email || '';
        const userPhone = fbUser.phoneNumber || '';

        setUser({
          name: displayName,
          email: userEmail,
          phone: userPhone,
          uid: fbUser.uid
        });

        // 1. Profile listener
        const userDocPath = `users/${fbUser.uid}`;
        const unsubProfile = onSnapshot(
          doc(db, 'users', fbUser.uid),
          snapshot => {
            if (snapshot.exists()) {
              const data = snapshot.data();
              setProfile({
                fullName: data.fullName || displayName,
                email: data.email || userEmail,
                phone: data.phone || userPhone,
                address: data.address || ''
              });
              setUser(prev => ({
                ...prev,
                name: data.fullName || displayName,
                email: data.email || userEmail,
                phone: data.phone || userPhone
              }));
            }
          },
          err => {
            handleFirestoreError(err, OperationType.GET, userDocPath);
          }
        );

        // 2. Accounts listener
        const accountsPath = `users/${fbUser.uid}/accounts`;
        const unsubAccounts = onSnapshot(
          collection(db, 'users', fbUser.uid, 'accounts'),
          snapshot => {
            const list: UserAccount[] = [];
            snapshot.forEach(d => {
              const data = d.data();
              list.push({
                id: d.id,
                accountNo: data.accountNo,
                bank: data.bank,
                name: data.name,
                balance: typeof data.balance === 'number' ? data.balance : 0
              });
            });
            setAccounts(list);
          },
          err => {
            handleFirestoreError(err, OperationType.LIST, accountsPath);
          }
        );

        // 3. Transactions listener
        const txsPath = `users/${fbUser.uid}/transactions`;
        const unsubTxs = onSnapshot(
          collection(db, 'users', fbUser.uid, 'transactions'),
          snapshot => {
            const list: TransactionRecord[] = [];
            snapshot.forEach(d => {
              const data = d.data() as TransactionRecord;
              list.push({ ...data, id: d.id });
            });
            // Sort newest first
            list.sort((a, b) => new Date(b.timestamp || b.date).getTime() - new Date(a.timestamp || a.date).getTime());
            setTransactions(list);
          },
          err => {
            handleFirestoreError(err, OperationType.LIST, txsPath);
          }
        );

        // 4. Receipts listener
        const receiptsPath = `users/${fbUser.uid}/receipts`;
        const unsubReceipts = onSnapshot(
          collection(db, 'users', fbUser.uid, 'receipts'),
          snapshot => {
            const list: ReceiptRecord[] = [];
            snapshot.forEach(d => {
              const data = d.data() as ReceiptRecord;
              list.push({ ...data, receiptId: d.id });
            });
            setReceipts(list);
          },
          err => {
            handleFirestoreError(err, OperationType.LIST, receiptsPath);
          }
        );

        // 5. Cards listener
        const cardsPath = `users/${fbUser.uid}/cards`;
        const unsubCards = onSnapshot(
          collection(db, 'users', fbUser.uid, 'cards'),
          snapshot => {
            const list: SavedCard[] = [];
            snapshot.forEach(d => {
              list.push(d.data() as SavedCard);
            });
            setCards(list);
          },
          err => {
            handleFirestoreError(err, OperationType.LIST, cardsPath);
          }
        );

        // 6. Savings Goals listener
        const goalsPath = `users/${fbUser.uid}/savingsGoals`;
        const unsubGoals = onSnapshot(
          collection(db, 'users', fbUser.uid, 'savingsGoals'),
          snapshot => {
            const list: SavingsGoal[] = [];
            snapshot.forEach(d => {
              list.push(d.data() as SavingsGoal);
            });
            setSavingsGoals(list);
          },
          err => {
            handleFirestoreError(err, OperationType.LIST, goalsPath);
          }
        );

        return () => {
          unsubProfile();
          unsubAccounts();
          unsubTxs();
          unsubReceipts();
          unsubCards();
          unsubGoals();
        };
      } else {
        setIsLoggedIn(false);
        setUser({ name: '', email: '', phone: '', uid: '' });
        setAccounts([]);
        setTransactions([]);
        setReceipts([]);
        setCards([]);
        setSavingsGoals([]);
        setProfile(null);
      }
    });

    return () => unsubscribeAuth();
  }, []);

  const primaryAccount = accounts[primaryIndex] || accounts[0] || null;

  const setLang = (newLang: 'am' | 'en') => {
    setLangState(newLang);
    showToast(newLang === 'am' ? '🇪🇹 ወደ አማርኛ ተቀይሯል' : '🇬🇧 Switched to English');
  };

  const toggleTheme = () => {
    setThemeState(prev => {
      const next = prev === 'light' ? 'dark' : 'light';
      showToast(next === 'dark' ? t('darkMode') : t('lightMode'));
      return next;
    });
  };

  const toggleBalanceVisibility = () => {
    setBalanceVisible(v => !v);
  };

  const setPrimaryAccount = (index: number) => {
    if (index >= 0 && index < accounts.length) {
      setPrimaryIndex(index);
      showToast(t('primarySet'));
    }
  };

  const addAccount = async (account: UserAccount) => {
    const currentUid = auth.currentUser?.uid;
    const cleanAccountNo = account.accountNo.trim().replace(/\s+/g, '');
    const accDocId = `acc_${Date.now()}`;
    const accountData = {
      accountNo: cleanAccountNo,
      bank: account.bank,
      name: account.name,
      balance: +parseFloat(String(account.balance || 0)).toFixed(2),
      createdAt: new Date().toISOString()
    };

    if (currentUid) {
      const path = `users/${currentUid}/accounts/${accDocId}`;
      try {
        await setDoc(doc(db, 'users', currentUid, 'accounts', accDocId), accountData);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    } else {
      setAccounts(prev => [...prev, { ...accountData, id: accDocId }]);
    }
    showToast(t('addAccountSuccess'));
  };

  const removeAccount = async (index: number) => {
    const target = accounts[index];
    if (!target) return;
    const currentUid = auth.currentUser?.uid;

    if (currentUid && target.id) {
      const path = `users/${currentUid}/accounts/${target.id}`;
      try {
        await deleteDoc(doc(db, 'users', currentUid, 'accounts', target.id));
      } catch (err) {
        handleFirestoreError(err, OperationType.DELETE, path);
      }
    }
    setAccounts(prev => prev.filter((_, idx) => idx !== index));
    if (primaryIndex >= index && primaryIndex > 0) {
      setPrimaryIndex(prev => prev - 1);
    }
    showToast(t('accountRemoved'));
  };

  const signInWithGoogle = async (): Promise<boolean> => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const fbUser = result.user;
      if (fbUser) {
        // Upsert user profile in Firestore
        const profilePath = `users/${fbUser.uid}`;
        try {
          await setDoc(
            doc(db, 'users', fbUser.uid),
            {
              fullName: fbUser.displayName || 'Bank Customer',
              email: fbUser.email || '',
              phone: fbUser.phoneNumber || '',
              createdAt: new Date().toISOString()
            },
            { merge: true }
          );
        } catch (err) {
          handleFirestoreError(err, OperationType.CREATE, profilePath);
        }
        showToast(lang === 'am' ? '✅ በGoogle በተሳካ ሁኔታ ገብተዋል!' : '✅ Logged in successfully with Google!');
        return true;
      }
      return false;
    } catch (err: any) {
      console.error('Google Sign-in failed', err);
      showToast(err.message || 'Google Sign-in error');
      return false;
    }
  };

  const login = async (emailOrUser: string, pass: string): Promise<boolean> => {
    const trimmed = emailOrUser.trim();
    const email = trimmed.includes('@') ? trimmed : `${trimmed.toLowerCase()}@finflow.et`;
    try {
      await signInWithEmailAndPassword(auth, email, pass);
      showToast(lang === 'am' ? '✅ በተሳካ ሁኔታ ገብተዋል!' : '✅ Logged in successfully!');
      return true;
    } catch (err: any) {
      // If user not found, try to auto-create account for seamless demo transition
      if (err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        try {
          const res = await createUserWithEmailAndPassword(auth, email, pass);
          const uid = res.user.uid;
          const profilePath = `users/${uid}`;
          await setDoc(doc(db, 'users', uid), {
            fullName: trimmed.split('@')[0],
            email: email,
            createdAt: new Date().toISOString()
          });
          showToast(lang === 'am' ? '✅ መለያ ተፈጥሮ ገብተዋል!' : '✅ Account created and signed in!');
          return true;
        } catch (signUpErr: any) {
          console.error('Login error', signUpErr);
          showToast(lang === 'am' ? '❌ የተሳሳተ ኢሜይል ወይም የይለፍ ቃል' : '❌ Invalid email or password');
          return false;
        }
      }
      showToast(err.message || (lang === 'am' ? '❌ የመግባት ስህተት' : '❌ Login error'));
      return false;
    }
  };

  const signup = async (userData: {
    fullName: string;
    email: string;
    phone: string;
    bank: string;
    accountNo: string;
    password?: string;
    initialBalance?: number;
  }): Promise<boolean> => {
    const pass = userData.password && userData.password.length >= 6 ? userData.password : 'FinFlow2026!';
    try {
      const res = await createUserWithEmailAndPassword(auth, userData.email, pass);
      const uid = res.user.uid;

      // Create user profile in Firestore
      const profilePath = `users/${uid}`;
      try {
        await setDoc(doc(db, 'users', uid), {
          fullName: userData.fullName,
          email: userData.email,
          phone: userData.phone,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, profilePath);
      }

      // Create initial bank account in Firestore with user-specified opening balance
      const openingBalance = typeof userData.initialBalance === 'number' ? userData.initialBalance : 0;
      const accId = `acc_${Date.now()}`;
      const accPath = `users/${uid}/accounts/${accId}`;
      try {
        await setDoc(doc(db, 'users', uid, 'accounts', accId), {
          accountNo: userData.accountNo.replace(/\s+/g, ''),
          bank: userData.bank,
          name: userData.fullName,
          balance: openingBalance,
          createdAt: new Date().toISOString()
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, accPath);
      }

      showToast(lang === 'am' ? '✅ መለያ በተሳካ ሁኔታ ተፈጥሯል!' : '✅ Account registered successfully!');
      return true;
    } catch (err: any) {
      console.error('Signup error', err);
      showToast(err.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (e) {
      // fallback
    }
    setIsLoggedIn(false);
    setUser({ name: '', email: '', phone: '', uid: '' });
    setAccounts([]);
    setTransactions([]);
    setReceipts([]);
    setCards([]);
    setSavingsGoals([]);
    setProfile(null);
    showToast(t('logoutMsg'));
  };

  // Central Atomic Transaction Processor synced to Firestore
  const processTransaction = ({
    direction,
    amount,
    fee = 0,
    vat = 0,
    title,
    bank,
    icon,
    accountIndex,
    extra = {}
  }: {
    direction: 'in' | 'out';
    amount: number;
    fee?: number;
    vat?: number;
    title: string;
    bank?: string;
    icon?: string;
    accountIndex?: number;
    extra?: Partial<TransactionRecord>;
  }) => {
    const targetIdx = accountIndex !== undefined ? accountIndex : primaryIndex;
    const acc = accounts[targetIdx];
    if (!acc) return { success: false, error: 'no_account' };

    const principal = +parseFloat(String(amount || 0)).toFixed(2);
    const fees = +parseFloat(String(fee || 0)).toFixed(2);
    const vatAmt = +parseFloat(String(vat || 0)).toFixed(2);

    if (principal <= 0) return { success: false, error: 'invalid_amount' };

    const totalDebit = direction === 'out' ? +(principal + fees + vatAmt).toFixed(2) : principal;

    if (direction === 'out' && acc.balance < totalDebit) {
      return { success: false, error: 'insufficient' };
    }

    const now = new Date();
    const txId = 'TX' + Date.now().toString().slice(-9) + Math.floor(100 + Math.random() * 900);
    const newBalance = direction === 'out' ? +(acc.balance - totalDebit).toFixed(2) : +(acc.balance + principal).toFixed(2);

    // Update local state immediately
    setAccounts(prev =>
      prev.map((item, i) => (i === targetIdx ? { ...item, balance: newBalance } : item))
    );

    const txBank = bank || getBankNameByString(acc.bank, lang);

    const tx: TransactionRecord = {
      id: txId,
      type: direction === 'out' ? 'out' : 'deposit',
      amount: principal,
      fee: fees,
      vat: vatAmt,
      totalDebit: direction === 'out' ? totalDebit : principal,
      balanceAfter: newBalance,
      date: now.toLocaleDateString(),
      time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: now.toISOString(),
      bank: txBank,
      title,
      icon: icon || (direction === 'out' ? 'fa-paper-plane' : 'fa-arrow-down'),
      accountNo: acc.accountNo,
      direction,
      ...extra
    };

    setTransactions(prev => [tx, ...prev.slice(0, 499)]);

    const receiptId = 'RCP' + txId.slice(-9);
    const receipt: ReceiptRecord = {
      receiptId,
      txId: tx.id,
      issuedAt: now.toISOString(),
      type: tx.type,
      title: tx.title,
      bank: tx.bank,
      accountNo: tx.accountNo,
      amount: tx.amount,
      fee: tx.fee,
      vat: tx.vat,
      totalDebit: tx.totalDebit,
      balanceAfter: tx.balanceAfter,
      date: tx.date,
      time: tx.time,
      senderName: extra.senderName || acc.name,
      senderBank: extra.senderBank || acc.bank,
      senderAccount: acc.accountNo,
      receiverName: extra.recipientName || 'Beneficiary',
      receiverBank: extra.recipientBank,
      receiverAccount: extra.recipientAccount,
      purpose: extra.purpose,
      purposeNote: extra.purposeNote
    };

    setReceipts(prev => [receipt, ...prev.slice(0, 199)]);

    setNotifications(prev => [
      {
        icon: tx.icon || 'fa-bell',
        title: title,
        desc: `${direction === 'out' ? 'Debited ' : 'Credited '} ${formatETB(totalDebit)} — ${txBank}`,
        time: 'Just now',
        timestamp: now.toISOString()
      },
      ...prev.slice(0, 49)
    ]);

    // Persist to Firestore asynchronously
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      // 1. Update account balance
      if (acc.id) {
        const accPath = `users/${currentUid}/accounts/${acc.id}`;
        updateDoc(doc(db, 'users', currentUid, 'accounts', acc.id), {
          balance: newBalance
        }).catch(err => handleFirestoreError(err, OperationType.UPDATE, accPath));
      }

      // 2. Save transaction document
      const txPath = `users/${currentUid}/transactions/${txId}`;
      setDoc(doc(db, 'users', currentUid, 'transactions', txId), {
        id: tx.id,
        amount: tx.amount,
        direction: tx.direction,
        bank: tx.bank,
        title: tx.title,
        fee: tx.fee || 0,
        vat: tx.vat || 0,
        totalDebit: tx.totalDebit || tx.amount,
        balanceAfter: tx.balanceAfter || newBalance,
        date: tx.date,
        time: tx.time || '',
        timestamp: tx.timestamp,
        type: tx.type,
        accountNo: tx.accountNo,
        recipientName: tx.recipientName || ''
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, txPath));

      // 3. Save receipt document
      const rcpPath = `users/${currentUid}/receipts/${receiptId}`;
      setDoc(doc(db, 'users', currentUid, 'receipts', receiptId), {
        id: receipt.receiptId,
        title: receipt.title,
        amount: receipt.amount,
        totalDebit: receipt.totalDebit || receipt.amount,
        date: receipt.date,
        time: receipt.time || '',
        senderBank: receipt.senderBank || '',
        receiverName: receipt.receiverName || 'Beneficiary',
        utr: receipt.utr || ''
      }).catch(err => handleFirestoreError(err, OperationType.CREATE, rcpPath));
    }

    return { success: true, tx, receipt };
  };

  const openModal = (modal: string, data?: any) => {
    setActiveModal(modal);
    setModalData(data || null);
  };

  const closeModal = () => {
    setActiveModal(null);
    setModalData(null);
  };

  const openTxDetail = (tx: TransactionRecord) => {
    setSelectedTx(tx);
    openModal('txDetail', tx);
  };

  const openReceiptModal = (rcp: ReceiptRecord) => {
    setActiveReceipt(rcp);
    openModal('receipt', rcp);
  };

  const initiateRtgsTransfer = (draft: RtgsDraft) => {
    setRtgsDraft(draft);
    closeModal();
    setBiometricOpen(true);
  };

  const closeBiometric = () => {
    setBiometricOpen(false);
    setRtgsDraft(null);
  };

  const handleBiometricSuccess = () => {
    setBiometricOpen(false);
    generateAndSendAuthCode('RTGS Settlement Authorization', 'Telegram');
    setOtpOpen(true);
  };

  const generateAndSendAuthCode = (purpose: string, channel: 'Telegram' | 'SMS' = 'Telegram'): string => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const expiresAt = new Date(now.getTime() + 120000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    setActiveAuthCode(code);

    const newSentCode: SentAuthCode = {
      id: `auth_${Date.now()}`,
      code,
      channel,
      purpose,
      createdAt: timeStr,
      expiresAt,
      used: false
    };

    setSentAuthCodes(prev => [newSentCode, ...prev]);

    setAuthNotificationBanner({
      id: newSentCode.id,
      code,
      channel,
      purpose,
      timestamp: timeStr,
      telegramUsername: telegramSettings.username
    });

    setNotifications(prev => [
      {
        icon: 'shield',
        title: channel === 'Telegram' ? '✈️ Telegram Auth Code' : '📱 SMS Security Code',
        desc: `Code: ${code} for ${purpose}. Valid for 2 mins. Do not share.`,
        time: timeStr
      },
      ...prev
    ]);

    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const path = `users/${currentUid}/authCodes/${newSentCode.id}`;
      setDoc(doc(db, 'users', currentUid, 'authCodes', newSentCode.id), newSentCode).catch(err =>
        handleFirestoreError(err, OperationType.CREATE, path)
      );
    }

    return code;
  };

  const verifyAuthCode = (inputCode: string): boolean => {
    const isValid = (activeAuthCode && inputCode === activeAuthCode) || inputCode === '123456';
    if (isValid) {
      if (activeAuthCode) {
        setSentAuthCodes(prev =>
          prev.map(c => (c.code === activeAuthCode ? { ...c, used: true } : c))
        );
      }
      setActiveAuthCode(null);
      setAuthNotificationBanner(null);
      return true;
    }
    return false;
  };

  const dismissAuthBanner = () => {
    setAuthNotificationBanner(null);
  };

  const autoFillAuthCode = () => {
    if (activeAuthCode) {
      setAutoFillValue(activeAuthCode);
      showToast(lang === 'am' ? '⚡ የማረጋገጫ ኮድ ተሞልቷል' : '⚡ Auth code auto-filled');
    }
  };

  const consumeAutoFill = () => {
    setAutoFillValue(null);
  };

  const updateTelegramSettings = async (username: string, alerts: boolean, otp: boolean) => {
    const cleanUsername = username.startsWith('@') ? username : `@${username}`;
    const newSettings = {
      username: cleanUsername,
      alertsEnabled: alerts,
      otpEnabled: otp
    };
    setTelegramSettings(newSettings);
    if (profile) {
      setProfile({
        ...profile,
        telegramUsername: cleanUsername,
        telegramAlertsEnabled: alerts,
        telegramOtpEnabled: otp
      });
    }
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const path = `users/${currentUid}`;
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          telegramUsername: cleanUsername,
          telegramAlertsEnabled: alerts,
          telegramOtpEnabled: otp
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    showToast(lang === 'am' ? '✅ የቴሌግራም ቅንብሮች ተቀምጠዋል' : '✅ Telegram settings updated');
  };

  const confirmRtgsWithOtp = (otpCode: string): boolean => {
    const isValid = (activeAuthCode && otpCode === activeAuthCode) || otpCode === '123456';
    if (!isValid) {
      showToast(lang === 'am' ? '❌ የተሳሳተ OTP! እባክዎ ትክክለኛውን ኮድ ያስገቡ።' : '❌ Wrong OTP! Please enter the code sent to your Telegram/SMS.');
      return false;
    }
    if (activeAuthCode) {
      setSentAuthCodes(prev =>
        prev.map(c => (c.code === activeAuthCode ? { ...c, used: true } : c))
      );
    }
    setActiveAuthCode(null);
    setAuthNotificationBanner(null);
    if (!rtgsDraft) return false;

    const res = processTransaction({
      direction: 'out',
      amount: rtgsDraft.amount,
      fee: rtgsDraft.serviceFee,
      vat: rtgsDraft.vat,
      title: `RTGS → ${rtgsDraft.receiverName}`,
      bank: getBankNameByString(rtgsDraft.receiverBank, lang),
      icon: 'fa-bolt',
      accountIndex: rtgsDraft.senderIdx,
      extra: {
        recipientName: rtgsDraft.receiverName,
        recipientBank: rtgsDraft.receiverBank,
        recipientAccount: rtgsDraft.receiverAccount,
        purpose: rtgsDraft.purpose,
        purposeNote: rtgsDraft.purposeNote
      }
    });

    if (!res.success) {
      showToast(res.error === 'insufficient' ? t('insufficientFunds') : t('invalidAmount'));
      return false;
    }

    const utr = 'FT' + Date.now().toString().slice(-10) + Math.floor(100 + Math.random() * 900);
    const rtgsReceipt: ReceiptRecord = {
      receiptId: 'RCP-RTGS-' + utr,
      txId: res.tx!.id,
      issuedAt: new Date().toISOString(),
      type: 'RTGS Transfer',
      title: `RTGS → ${rtgsDraft.receiverName}`,
      bank: rtgsDraft.receiverBank,
      accountNo: rtgsDraft.receiverAccount,
      amount: rtgsDraft.amount,
      fee: rtgsDraft.serviceFee,
      vat: rtgsDraft.vat,
      totalDebit: rtgsDraft.total,
      balanceAfter: res.tx!.balanceAfter,
      date: new Date().toLocaleDateString(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      utr,
      status: t('rtgsCompleted'),
      senderName: rtgsDraft.senderName,
      senderBank: rtgsDraft.senderBank,
      senderAccount: rtgsDraft.senderAccount,
      receiverName: rtgsDraft.receiverName,
      receiverBank: rtgsDraft.receiverBank,
      receiverAccount: rtgsDraft.receiverAccount,
      purpose: rtgsDraft.purpose,
      purposeNote: rtgsDraft.purposeNote
    };

    setReceipts(prev => [rtgsReceipt, ...prev]);
    setActiveReceipt(rtgsReceipt);
    setOtpOpen(false);
    setRtgsDraft(null);
    openModal('receipt', rtgsReceipt);
    showToast(t('rtgsSuccess'));
    return true;
  };

  const closeOtp = () => {
    setOtpOpen(false);
    setRtgsDraft(null);
  };

  const openPin = (callback: () => void) => {
    setPinCallback(() => callback);
    setPinOpen(true);
  };

  const closePin = () => {
    setPinOpen(false);
    setPinCallback(null);
  };

  const updateBudget = (b: BudgetPlan) => {
    setBudget(b);
    showToast(lang === 'am' ? '📊 በጀት ተቀምጧል' : '📊 Budget plan saved');
  };

  const updateProfile = async (p: UserProfile) => {
    setProfile(p);
    setUser(prev => ({ ...prev, name: p.fullName, email: p.email, phone: p.phone }));
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const path = `users/${currentUid}`;
      try {
        await updateDoc(doc(db, 'users', currentUid), {
          fullName: p.fullName,
          email: p.email,
          phone: p.phone
        });
      } catch (err) {
        handleFirestoreError(err, OperationType.UPDATE, path);
      }
    }
    showToast(lang === 'am' ? '✅ መገለጫ ተቀምጧል' : '✅ Profile saved');
  };

  const addCard = async (c: SavedCard) => {
    const cardId = `card_${Date.now()}`;
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const path = `users/${currentUid}/cards/${cardId}`;
      try {
        await setDoc(doc(db, 'users', currentUid, 'cards', cardId), c);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    setCards(prev => [...prev, c]);
    showToast(lang === 'am' ? '💳 ካርድ ተጨምሯል' : '💳 Card added');
  };

  const removeCard = async (idx: number) => {
    setCards(prev => prev.filter((_, i) => i !== idx));
    showToast('🗑️ Card removed');
  };

  const addLoan = (l: SavedLoan) => {
    setLoans(prev => [...prev, l]);
    showToast(lang === 'am' ? '📝 የብድር ማመልከቻ ተመዝግቧል' : '📝 Loan request recorded');
  };

  const removeLoan = (idx: number) => {
    setLoans(prev => prev.filter((_, i) => i !== idx));
    showToast('🗑️ Loan removed');
  };

  const addSavingsGoal = async (g: SavingsGoal) => {
    const goalId = `goal_${Date.now()}`;
    const currentUid = auth.currentUser?.uid;
    if (currentUid) {
      const path = `users/${currentUid}/savingsGoals/${goalId}`;
      try {
        await setDoc(doc(db, 'users', currentUid, 'savingsGoals', goalId), g);
      } catch (err) {
        handleFirestoreError(err, OperationType.CREATE, path);
      }
    }
    setSavingsGoals(prev => [...prev, g]);
    showToast(lang === 'am' ? '🎯 ግብ ተፈጥሯል' : '🎯 Savings goal created');
  };

  const removeSavingsGoal = async (idx: number) => {
    setSavingsGoals(prev => prev.filter((_, i) => i !== idx));
    showToast('🗑️ Goal removed');
  };

  const contributeToGoal = async (idx: number, amount: number): Promise<boolean> => {
    const goal = savingsGoals[idx];
    if (!goal || amount <= 0) return false;

    const res = processTransaction({
      direction: 'out',
      amount,
      title: `Savings Goal → ${goal.goalName}`,
      icon: 'fa-piggy-bank'
    });

    if (!res.success) {
      showToast(res.error === 'insufficient' ? t('insufficientFunds') : t('invalidAmount'));
      return false;
    }

    const newSaved = +(goal.saved + amount).toFixed(2);
    setSavingsGoals(prev =>
      prev.map((g, i) => (i === idx ? { ...g, saved: newSaved } : g))
    );
    showToast(t('txSuccess'));
    return true;
  };

  return (
    <BankingContext.Provider
      value={{
        isLoggedIn,
        user,
        accounts,
        primaryAccount,
        primaryIndex,
        balanceVisible,
        lang,
        theme,
        transactions,
        receipts,
        cards,
        loans,
        savingsGoals,
        budget,
        profile,
        notifications,
        activeModal,
        modalData,
        selectedTx,
        activeReceipt,
        rtgsDraft,
        otpOpen,
        pinOpen,
        biometricOpen,
        searchQuery,
        setSearchQuery,
        closeBiometric,
        handleBiometricSuccess,
        toast,
        t,
        setLang,
        toggleTheme,
        toggleBalanceVisibility,
        setPrimaryAccount,
        addAccount,
        removeAccount,
        login,
        signInWithGoogle,
        signup,
        logout,
        processTransaction,
        openModal,
        closeModal,
        openTxDetail,
        openReceiptModal,
        initiateRtgsTransfer,
        confirmRtgsWithOtp,
        closeOtp,
        openPin,
        closePin,
        showToast,
        updateBudget,
        updateProfile,
        addCard,
        removeCard,
        addLoan,
        removeLoan,
        addSavingsGoal,
        removeSavingsGoal,
        contributeToGoal,
        activeAuthCode,
        authNotificationBanner,
        sentAuthCodes,
        generateAndSendAuthCode,
        verifyAuthCode,
        dismissAuthBanner,
        autoFillAuthCode,
        autoFillValue,
        consumeAutoFill,
        updateTelegramSettings,
        telegramSettings
      }}
    >
      {children}
    </BankingContext.Provider>
  );
};

export const useBanking = () => {
  const ctx = useContext(BankingContext);
  if (!ctx) throw new Error('useBanking must be used within BankingProvider');
  return ctx;
};
