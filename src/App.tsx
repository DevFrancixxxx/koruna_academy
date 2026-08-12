import { useState, useEffect } from 'react';
import { LoginPageView } from './components/LoginPageView';
import { SignupPageView } from './components/SignupPageView';
import { DashboardView } from './components/DashboardView';
import { getCurrentUserSession, subscribeToAuthChanges, type UserSessionData, signOutUser } from './services/auth';

export function App() {
  type ActiveTabType = 'dashboard' | 'catalog' | 'learning_path' | 'progress' | 'certificates' | 'skills' | 'career' | 'knowledge_base' | 'team_reports' | 'admin_suite';
  const [currentView, setCurrentView] = useState<'login' | 'signup' | 'dashboard'>('login');
  const [activeTab, setActiveTab] = useState<ActiveTabType>('dashboard');
  const [userSession, setUserSession] = useState<UserSessionData | null>(null);

  useEffect(() => {
    // Check if user has an active Supabase session on mount
    async function checkSession() {
      const activeUser = await getCurrentUserSession();
      if (activeUser) {
        setUserSession(activeUser);
        setCurrentView('dashboard');
        setActiveTab(activeUser.role === 'trainer' ? 'admin_suite' : 'dashboard');
      }
    }
    checkSession();

    // Subscribe to auth state changes (crucial for OAuth redirects)
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        setUserSession(user);
        setCurrentView('dashboard');
        setActiveTab(user.role === 'trainer' ? 'admin_suite' : 'dashboard');
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
    setActiveTab(user.role === 'trainer' ? 'admin_suite' : 'dashboard');
  };

  const handleSignOut = async () => {
    await signOutUser();
    setUserSession(null);
    setCurrentView('login');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      {/* View Router */}
      {currentView === 'login' && (
        <LoginPageView
          onNavigateSignup={() => setCurrentView('signup')}
          onLoginSuccess={handleAuthSuccess}
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
