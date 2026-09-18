import React, { useState } from 'react';
import { BankingProvider, useBanking } from './context/BankingContext';
import { Header } from './components/Header';
import { SlideBar } from './components/SlideBar';
import { WelcomeBanner } from './components/WelcomeBanner';
import { StatsRow } from './components/StatsRow';
import { ControlCenter } from './components/ControlCenter';
import { RecentTransactions } from './components/RecentTransactions';
import { QuickActions } from './components/QuickActions';
import { LoginScreen } from './components/LoginScreen';
import { SignupModal } from './components/SignupModal';
import { DetailModal } from './components/DetailModal';
import { OtpModal } from './components/OtpModal';
import { PinModal } from './components/PinModal';
import { BiometricModal } from './components/BiometricModal';
import { TransactionSearchBar } from './components/TransactionSearchBar';
import { AuthNotificationBanner } from './components/AuthNotificationBanner';
import { Toast } from './components/Toast';
import { Landmark, ShieldCheck } from 'lucide-react';

const DashboardContent: React.FC = () => {
  const {
    isLoggedIn,
    biometricOpen,
    closeBiometric,
    handleBiometricSuccess,
    rtgsDraft,
    t
  } = useBanking();
  const [menuOpen, setMenuOpen] = useState(false);
  const [signupOpen, setSignupOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/70 dark:bg-slate-950 text-slate-800 dark:text-slate-100 flex flex-col items-center justify-start p-3 sm:p-5 transition-colors duration-200">
      {/* Real-time Auth Notification Push Banner */}
      <AuthNotificationBanner />

      {/* Login Screen Overlay when not logged in */}
      {!isLoggedIn && (
        <LoginScreen onOpenSignup={() => setSignupOpen(true)} />
      )}

      {/* Main Container */}
      <main className="w-full max-w-lg bg-white dark:bg-slate-900/90 border border-slate-200/90 dark:border-slate-800 rounded-3xl shadow-xl p-4 sm:p-6 transition-all relative overflow-hidden backdrop-blur-xs">
        {/* Top Header */}
        <Header onOpenMenu={() => setMenuOpen(true)} />

        {/* 31 Banks Master Live Badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800/80 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3 shadow-xs">
          <Landmark size={13} className="text-emerald-600 dark:text-emerald-400" />
          <span>{t('licensedBanks')}</span>
          <span className="text-emerald-400">•</span>
          <span>{t('integrated')}</span>
        </div>

        {/* Search Input at top of Dashboard */}
        <TransactionSearchBar />

        {/* Welcome & Balance Banner */}
        <WelcomeBanner />

        {/* Income / Expense / Savings Goal Stats */}
        <StatsRow />

        {/* 14 Core Operations Control Center */}
        <ControlCenter />

        {/* Recent Transaction Activity */}
        <RecentTransactions />

        {/* Quick Shortcuts */}
        <QuickActions />

        {/* Footer */}
        <footer className="pt-4 mt-3 border-t border-slate-100 dark:border-slate-800 text-center text-[11px] text-slate-400 dark:text-slate-500 font-medium space-y-1">
          <div className="flex items-center justify-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
            <ShieldCheck size={13} />
            <span>FinFlow Ethiopia Automated Deployment · 2026</span>
          </div>
          <p>Complete Master System · 31 Licensed Commercial Banks · RTGS Irrevocable Settlement</p>
        </footer>
      </main>

      {/* Slide Navigation Drawer */}
      <SlideBar isOpen={menuOpen} onClose={() => setMenuOpen(false)} />

      {/* Sign Up Modal */}
      <SignupModal isOpen={signupOpen} onClose={() => setSignupOpen(false)} />

      {/* All Dialogs & Forms */}
      <DetailModal />

      {/* Simulated Biometric Authentication Overlay (FaceID/Fingerprint for RTGS) */}
      <BiometricModal
        isOpen={biometricOpen}
        onClose={closeBiometric}
        onSuccess={handleBiometricSuccess}
        amount={rtgsDraft?.amount || 0}
        receiverName={rtgsDraft?.receiverName || ''}
        receiverBank={rtgsDraft?.receiverBank || ''}
      />

      {/* 2FA OTP Modal */}
      <OtpModal />

      {/* 4-digit PIN Pad Modal */}
      <PinModal />

      {/* Toast Notification */}
      <Toast />
    </div>
  );
};

export default function App() {
  return (
    <BankingProvider>
      <DashboardContent />
    </BankingProvider>
  );
}
