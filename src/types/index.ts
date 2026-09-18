export interface BankRtgsInfo {
  minimum: string;
  maximum: string;
  fee: string;
  operatingHours: string;
  settlement: string;
}

export interface BankMaster {
  bankId: string;
  name: string;
  nameAm: string;
  type: 'Public' | 'Private' | 'Interest-Free';
  swiftBic: string;
  licenseStatus: string;
  licenseDate: string;
  headOffice: string;
  website: string;
  phone: string;
  email: string;
  coreBankingSystem: string;
  digitalBanking: boolean;
  mobileBanking: boolean;
  atm: boolean;
  pos: boolean;
  agentBanking: boolean;
  internationalBanking: boolean;
  fxServices: boolean;
  importExport: boolean;
  correspondentBanking: boolean;
  ifbServices: boolean;
  ifbBrand?: string;
  status: string;
  rtgs: BankRtgsInfo;
}

export interface UserAccount {
  id?: string;
  accountNo: string;
  bank: string;
  name: string;
  balance: number;
}

export interface TransactionRecord {
  id: string;
  type: 'in' | 'out' | 'deposit';
  amount: number;
  fee?: number;
  vat?: number;
  totalDebit?: number;
  balanceAfter?: number;
  date: string;
  time?: string;
  timestamp: string;
  bank: string;
  title: string;
  icon?: string;
  accountNo: string;
  direction: 'in' | 'out';
  recipientName?: string;
  recipientBank?: string;
  recipientAccount?: string;
  senderName?: string;
  senderBank?: string;
  purpose?: string;
  purposeNote?: string;
  merchant?: string;
  category?: string;
  method?: string;
  billType?: string;
  billNumber?: string;
  phone?: string;
  network?: string;
}

export interface ReceiptRecord {
  receiptId: string;
  txId: string;
  issuedAt: string;
  type: string;
  title: string;
  bank: string;
  accountNo: string;
  amount: number;
  fee?: number;
  vat?: number;
  totalDebit?: number;
  balanceAfter?: number;
  date: string;
  time?: string;
  utr?: string;
  status?: string;
  senderName?: string;
  senderBank?: string;
  senderAccount?: string;
  receiverName?: string;
  receiverBank?: string;
  receiverAccount?: string;
  purpose?: string;
  purposeNote?: string;
}

export interface SavedCard {
  cardNumber: string;
  cardType: string;
  expiry: string;
  bank: string;
}

export interface SavedLoan {
  bank: string;
  loanAmount: number;
  loanTerm: string;
  date: string;
}

export interface SavingsGoal {
  goalName: string;
  targetAmount: number;
  saved: number;
  deadline: string;
}

export interface BudgetPlan {
  monthlyBudget: number;
  category1?: number;
  category2?: number;
  savedAt: string;
}

export interface UserProfile {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  telegramUsername?: string;
  telegramAlertsEnabled?: boolean;
  telegramOtpEnabled?: boolean;
}

export interface SentAuthCode {
  id: string;
  code: string;
  channel: 'Telegram' | 'SMS' | 'Email';
  purpose: string;
  createdAt: string;
  expiresAt: string;
  used: boolean;
}

export interface AppNotification {
  icon: string;
  title: string;
  desc: string;
  time: string;
  timestamp?: string;
}

export interface RtgsDraft {
  senderIdx: number;
  senderAccount: string;
  senderBank: string;
  senderName: string;
  receiverBank: string;
  receiverAccount: string;
  receiverName: string;
  amount: number;
  purpose: string;
  purposeNote?: string;
  serviceFee: number;
  vat: number;
  total: number;
}
