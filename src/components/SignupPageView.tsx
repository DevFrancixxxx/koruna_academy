import React from 'react';
import { SignupForm } from './SignupForm';

import type { UserSessionData } from '../services/auth';

interface SignupPageViewProps {
  onNavigateLogin: () => void;
  onSignupSuccess: (user: UserSessionData) => void;
}

export const SignupPageView: React.FC<SignupPageViewProps> = ({
  onNavigateLogin,
  onSignupSuccess
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

        {/* Right Side: Signup Form */}
        <div className="koruna-login-form-panel">
          <SignupForm
            onSignupSuccess={onSignupSuccess}
            onNavigateLogin={onNavigateLogin}
          />
        </div>
      </div>
    </main>
  );
};
