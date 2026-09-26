import { useState, useEffect, useCallback } from 'react';
import { LoginPageView } from './components/LoginPageView';
import { SignupPageView } from './components/SignupPageView';
import { DashboardView } from './components/DashboardView';
import { SessionWarningModal } from './components/SessionWarningModal';
import { useSessionTimeout } from './hooks/useSessionTimeout';
import {
  getCurrentUserSession,
  subscribeToAuthChanges,
  type UserSessionData,
  signOutUser,
  setSessionExpiredFlag,
  getSessionExpiredFlag
} from './services/auth';

export function App() {
  type ActiveTabType =
    | 'dashboard'
    | 'home'
    | 'learn'
    | 'catalog'
    | 'knowledge_base'
    | 'feed'
    | 'rewards'
    | 'engage'
    | 'career'
    | 'my_koruna'
    | 'learning_path'
    | 'progress'
    | 'certificates'
    | 'skills'
    | 'team_reports'
    | 'admin_suite'
    | 'notifications'
    | 'settings';
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [activeTab, setActiveTabState] = useState<ActiveTabType>(() => {
    try {
      const saved = localStorage.getItem('koruna_active_tab');
      if (saved) return saved as ActiveTabType;
    } catch (e) {
      // Ignore storage errors
    }
    return 'dashboard';
  });

  const setActiveTab = (tab: ActiveTabType) => {
    setActiveTabState(tab);
    try {
      localStorage.setItem('koruna_active_tab', tab);
    } catch (e) {
      // Ignore storage errors
    }
  };

  const [userSession, setUserSession] = useState<UserSessionData | null>(null);
  const [sessionExpiredNotice, setSessionExpiredNotice] = useState<string | null>(null);

  // Check for persisted expiration notice on initial load
  useEffect(() => {
    const savedNotice = getSessionExpiredFlag();
    if (savedNotice) {
      setSessionExpiredNotice(savedNotice);
    }
  }, []);

  const handleSessionExpired = useCallback(async (reason: string) => {
    try {
      localStorage.removeItem('koruna_active_tab');
      localStorage.removeItem('koruna_active_inner_tab');
      localStorage.removeItem('koruna_studying_course_id');
    } catch (e) {}
    await signOutUser();
    setUserSession(null);
    setCurrentView('login');

    if (reason === 'inactivity') {
      const noticeMsg = 'Your session has expired due to inactivity. Please log in again to continue.';
      setSessionExpiredNotice(noticeMsg);
      setSessionExpiredFlag(true, noticeMsg);
    } else {
      setSessionExpiredNotice(null);
      setSessionExpiredFlag(false);
    }
  }, []);

  const {
    showWarningModal,
    remainingSeconds,
    extendSession,
    logoutNow
  } = useSessionTimeout({
    isActive: currentView === 'dashboard' && Boolean(userSession),
    onSessionExpired: handleSessionExpired
  });

  useEffect(() => {
    // Check if user has an active Supabase session on mount
    async function checkSession() {
      const activeUser = await getCurrentUserSession();
      if (activeUser) {
        setUserSession(activeUser);
        setCurrentView('dashboard');
        const savedTab = localStorage.getItem('koruna_active_tab') as ActiveTabType | null;
        if (!savedTab) {
          setActiveTab(activeUser.role === 'trainer' || activeUser.role === 'admin' ? 'admin_suite' : 'dashboard');
        }
      }
    }
    checkSession();

    // Subscribe to auth state changes (crucial for OAuth redirects & remote signouts)
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        setUserSession(user);
        setCurrentView('dashboard');
        const savedTab = localStorage.getItem('koruna_active_tab') as ActiveTabType | null;
        if (!savedTab) {
          setActiveTab(user.role === 'trainer' || user.role === 'admin' ? 'admin_suite' : 'dashboard');
        }
        setSessionExpiredNotice(null);
        setSessionExpiredFlag(false);
      } else {
        setUserSession(null);
        setCurrentView((prev) => (prev === 'dashboard' ? 'login' : prev));
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const handleAuthSuccess = (user: UserSessionData) => {
    setUserSession(user);
    setCurrentView('dashboard');
    const savedTab = localStorage.getItem('koruna_active_tab') as ActiveTabType | null;
    if (!savedTab) {
      setActiveTab(user.role === 'trainer' || user.role === 'admin' ? 'admin_suite' : 'dashboard');
    }
    setSessionExpiredNotice(null);
    setSessionExpiredFlag(false);
  };

  const handleSignOut = async () => {
    try {
      localStorage.removeItem('koruna_active_tab');
      localStorage.removeItem('koruna_active_inner_tab');
      localStorage.removeItem('koruna_studying_course_id');
    } catch (e) {}
    await signOutUser();
    setUserSession(null);
    setCurrentView('login');
    setSessionExpiredNotice(null);
    setSessionExpiredFlag(false);
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* Session Expiration Warning Modal */}
      <SessionWarningModal
        isOpen={showWarningModal}
        remainingSeconds={remainingSeconds}
        onExtendSession={extendSession}
        onLogout={logoutNow}
      />

      {/* View Router */}
      {currentView === 'login' && (
        <LoginPageView
          onNavigateSignup={() => setCurrentView('signup')}
          onLoginSuccess={handleAuthSuccess}
          sessionExpiredNotice={sessionExpiredNotice}
          onClearExpiredNotice={() => {
            setSessionExpiredNotice(null);
            setSessionExpiredFlag(false);
          }}
        />
      )}

      {currentView === 'signup' && (
        <SignupPageView
          onNavigateLogin={() => setCurrentView('login')}
          onSignupSuccess={handleAuthSuccess}
        />
      )}

      {currentView === 'dashboard' && userSession && (
        <DashboardView
          userSession={userSession}
          activeTab={activeTab}
          onTabChange={(tab) => setActiveTab(tab)}
          onSignOut={handleSignOut}
        />
      )}
    </div>
  );
}

export default App;

