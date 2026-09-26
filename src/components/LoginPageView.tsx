import React from 'react';
import { LoginForm } from './LoginForm';

import type { UserSessionData } from '../services/auth';

interface LoginPageViewProps {
  onNavigateSignup: () => void;
  onLoginSuccess: (user: UserSessionData) => void;
  sessionExpiredNotice?: string | null;
  onClearExpiredNotice?: () => void;
}

export const LoginPageView: React.FC<LoginPageViewProps> = ({
  onNavigateSignup,
  onLoginSuccess,
  sessionExpiredNotice,
  onClearExpiredNotice
}) => {
  return (
    <main className="koruna-login-page">
      <div className="koruna-login-container">
        {/* Left Side: Glossy visual image sidebar */}
        <div className="koruna-login-sidebar-panel">
          <img
            src="/login_sidebar_bg.png"
            alt="Koruna Learning Visual"
            className="koruna-login-sidebar-img"
          />
        </div>

        {/* Right Side: Login Form */}
        <div className="koruna-login-form-panel">
          <LoginForm
            onLoginSuccess={onLoginSuccess}
            onNavigateSignup={onNavigateSignup}
            sessionExpiredNotice={sessionExpiredNotice}
            onClearExpiredNotice={onClearExpiredNotice}
          />
        </div>
      </div>
    </main>
  );
};


