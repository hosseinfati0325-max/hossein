import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { AppProvider, useApp } from './context/AppContext';
import { AppHeader } from './components/Header/AppHeader';
import { BottomNavigation } from './components/Navigation/BottomNavigation';
import { LearningPathView } from './components/LearningPath/LearningPathView';
import { GrammarModuleView } from './components/Grammar/GrammarModuleView';
import { AiTutorView } from './components/AiTutor/AiTutorView';
import { SRSView } from './components/SRSFlashcards/SRSView';
import { ExamsAndLeagueView } from './components/ExamsAndLeague/ExamsAndLeagueView';
import { SettingsView } from './components/Settings/SettingsView';
import { PlacementTestModal } from './components/Assessment/PlacementTestModal';
import { ProfileModal } from './components/Auth/ProfileModal';
import { RealCapacityModal } from './components/Capacity/RealCapacityModal';
import { SyncStatusBanner } from './components/Sync/SyncStatusBanner';
import { SyncManagerModal } from './components/Sync/SyncManagerModal';
import { PWAInstallPrompt } from './components/PWA/PWAInstallPrompt';
import { notificationService } from './services/notificationService';
import { nativeBridge } from './services/nativeBridge';

const AppContent: React.FC = () => {
  const {
    user,
    activeTab,
    setActiveTab,
    isProfileModalOpen,
    setIsProfileModalOpen,
    isCapacityModalOpen,
    setIsCapacityModalOpen,
    isSyncModalOpen,
    setIsSyncModalOpen,
    triggerManualSync,
  } = useApp();
  const [showPlacementTest, setShowPlacementTest] = useState(false);
  const [remedialTopic, setRemedialTopic] = useState<string | null>(null);

  // Setup Notification loop & listen to SW events
  useEffect(() => {
    // Initialize native features (Capacitor status bar, splash screen, hardware back button)
    nativeBridge.initNativeFeatures().catch(() => {});

    notificationService.setupDailyReminderCheck(
      user.firstName || user.name,
      user.settings?.dailyReminderHour ?? 20,
      user.streak || 0,
      user.settings?.notificationsEnabled ?? false
    );

    // Listen to ServiceWorker messages (from notification clicks or sync events)
    const handleSWMessage = (event: MessageEvent) => {
      if (event.data?.type === 'NAVIGATE_TAB') {
        const tab = event.data.tab;
        if (['learn', 'ai_tutor', 'flashcards', 'exams', 'settings'].includes(tab)) {
          setActiveTab(tab as any);
        }
      } else if (event.data?.type === 'EXECUTE_BACKGROUND_SYNC') {
        triggerManualSync();
      }
    };

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('message', handleSWMessage);
    }

    return () => {
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.removeEventListener('message', handleSWMessage);
      }
    };
  }, [user.firstName, user.name, user.settings?.dailyReminderHour, user.settings?.notificationsEnabled, user.streak]);

  const handleOpenAiRemedial = (topic: string) => {
    setRemedialTopic(topic);
    setActiveTab('ai_tutor');
  };

  return (
    <div className="min-h-screen min-h-[100dvh] w-full bg-[#F3F4F6] dark:bg-slate-950 text-[#1F2937] dark:text-slate-100 flex flex-col font-sans selection:bg-indigo-600 selection:text-white transition-colors duration-200 overflow-x-hidden">
      {/* Top Background Sync Status Toast Banner */}
      <SyncStatusBanner />

      {/* Top Application Header */}
      <AppHeader />

      {/* Main Screen Content View with bottom safe-area offset so bottom nav never overlaps content */}
      <main className="flex-1 w-full max-w-4xl mx-auto px-2.5 sm:px-4 pb-28 sm:pb-32 pt-2">
        <AnimatePresence mode="wait">
          {activeTab === 'learn' && (
            <motion.div
              key="learn"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <LearningPathView
                onOpenPlacementTest={() => setShowPlacementTest(true)}
                onOpenAiTutor={() => {
                  setRemedialTopic(null);
                  setActiveTab('ai_tutor');
                }}
                onOpenSRS={() => setActiveTab('srs')}
              />
            </motion.div>
          )}

          {activeTab === 'grammar' && (
            <motion.div
              key="grammar"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <GrammarModuleView />
            </motion.div>
          )}

          {activeTab === 'ai_tutor' && (
            <motion.div
              key="ai_tutor"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <AiTutorView
                initialRemedialTopic={remedialTopic}
                initialMode={remedialTopic ? 'remedial' : undefined}
              />
            </motion.div>
          )}

          {activeTab === 'srs' && (
            <motion.div
              key="srs"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SRSView onOpenAiRemedial={handleOpenAiRemedial} />
            </motion.div>
          )}

          {activeTab === 'exams' && (
            <motion.div
              key="exams"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <ExamsAndLeagueView onOpenPlacementTest={() => setShowPlacementTest(true)} />
            </motion.div>
          )}

          {activeTab === 'settings' && (
            <motion.div
              key="settings"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
            >
              <SettingsView />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* Material 3 Bottom Navigation Bar */}
      <BottomNavigation />

      {/* Global Placement Test Modal */}
      {showPlacementTest && (
        <PlacementTestModal onClose={() => setShowPlacementTest(false)} />
      )}

      {/* Profile Management / Switch Modal */}
      {isProfileModalOpen && (
        <ProfileModal onClose={() => setIsProfileModalOpen(false)} />
      )}

      {/* Real Capacity & Direct Registration Modal */}
      {isCapacityModalOpen && (
        <RealCapacityModal onClose={() => setIsCapacityModalOpen(false)} />
      )}

      {/* Background Sync & Cloud Database Manager Modal */}
      {isSyncModalOpen && (
        <SyncManagerModal isOpen={isSyncModalOpen} onClose={() => setIsSyncModalOpen(false)} />
      )}

      {/* PWA Direct Installation Prompt */}
      <PWAInstallPrompt />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
