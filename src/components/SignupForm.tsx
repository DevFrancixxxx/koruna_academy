import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, AlertCircle, Info, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { signUpUser, signInWithSSO } from '../services/auth';
import type { UserRole, UserSessionData } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { LoadingModal } from './LoadingModal';

interface SignupFormProps {
  onSignupSuccess: (userData: UserSessionData) => void;
  onNavigateLogin: () => void;
}

const KorunaLogo: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <img 
        src="/korunalogo.png" 
        alt="Koruna Academy Logo" 
        style={{ height: '40px', width: 'auto', display: 'block' }} 
        onError={(e) => {
          const img = e.currentTarget;
          if (img.src.endsWith('/korunalogo.png')) {
            img.src = '/logo.svg';
          }
        }}
      />
    </div>
  );
};

export const SignupForm: React.FC<SignupFormProps> = ({ onSignupSuccess, onNavigateLogin }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const department = 'Software Engineering';
  const [role, setRole] = useState<UserRole>('employee');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [sendUpdates, setSendUpdates] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDevOptions, setShowDevOptions] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Please enter your full name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Koruna corporate email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    const result = await signUpUser(email, password, fullName, department, role);
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
    }
    setIsLoading(false);

    if (!result.success || !result.data) {
      setErrorMsg(result.error || 'Registration failed. Please try again.');
      return;
    }

    onSignupSuccess(result.data);
  };

  const handleSSO = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    setErrorMsg(null);
    const startTime = Date.now();
    const result = await signInWithSSO(provider, {
      role,
      department,
      fullName: fullName.trim() || undefined,
      email: email.trim() || undefined
    });
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
    }
    setIsLoading(false);

    if (result.success && result.data) {
      onSignupSuccess(result.data);
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <>
      {isLoading && <LoadingModal type="signup" />}
      
      <div className="koruna-login-logo-container">
        <KorunaLogo />
      </div>

      <span className="koruna-login-badge">EMPLOYEE REGISTRATION</span>
      <h2 className="koruna-login-title">Create your account</h2>
      <p className="koruna-login-subtitle">Start your internal learning journey at Koruna.</p>

      {errorMsg && (
        <div style={{ padding: '0.65rem 0.85rem', background: '#fce8e6', border: '1px solid #ea4335', color: '#c5221f', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem', borderRadius: '6px' }}>
          <AlertCircle size={16} style={{ flexShrink: 0 }} />
          <span style={{ fontWeight: 600 }}>{errorMsg}</span>
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="koruna-login-form-group">
          <label className="koruna-login-label" htmlFor="name-input">Full Name</label>
          <input
            id="name-input"
            type="text"
            className="koruna-login-input"
            placeholder="Jane Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="koruna-login-form-group">
          <label className="koruna-login-label" htmlFor="email-input">Email address</label>
          <input
            id="email-input"
            type="email"
            className="koruna-login-input"
            placeholder="jane.doe@koruna.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
        </div>

        <div className="koruna-login-form-group">
          <label className="koruna-login-label" htmlFor="password-input">Password</label>
          <div className="koruna-login-input-wrapper">
            <input
              id="password-input"
              type={showPassword ? 'text' : 'password'}
              className="koruna-login-input"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
            <button
              type="button"
              className="koruna-login-password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        {/* User Role Selector */}
        <div className="koruna-login-form-group">
          <label className="koruna-login-label" htmlFor="role-select">User Role</label>
          <select
            id="role-select"
            className="koruna-login-input"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            style={{ height: '52px', padding: '0 1.25rem', fontSize: '0.95rem', cursor: 'pointer' }}
            disabled={isLoading}
          >
            <option value="employee">Employee</option>
            <option value="team_leader">Team Leader</option>
            <option value="trainer">Trainer</option>
          </select>
        </div>

        <div style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'flex-start', gap: '0.6rem', fontSize: '0.8rem', color: 'var(--koruna-text-secondary)' }}>
          <input
            type="checkbox"
            id="send-updates"
            className="koruna-login-checkbox"
            checked={sendUpdates}
            onChange={(e) => setSendUpdates(e.target.checked)}
            style={{ marginTop: '2px' }}
          />
          <label htmlFor="send-updates" style={{ cursor: 'pointer', lineHeight: 1.4, fontWeight: 500 }}>
            Send me special internal course recommendations and platform announcements.
          </label>
        </div>

        <button type="submit" className="koruna-login-btn-primary" disabled={isLoading}>
          {isLoading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      {/* Collapsible Options Drawer */}
      <div className="koruna-login-dev-panel">
        <button
          type="button"
          className="koruna-login-dev-toggle"
          onClick={() => setShowDevOptions(!showDevOptions)}
        >
          <Settings size={14} />
          <span>Demo Options & SSO Sign up</span>
          {showDevOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDevOptions && (
          <div className="koruna-login-dev-content">
            {!isSupabaseConfigured() && (
              <div style={{ padding: '0.6rem 0.8rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} style={{ flexShrink: 0 }} />
                <span>Supabase Demo Mode active. Role & department can be customized in the main form above.</span>
              </div>
            )}

            {/* SSO Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <button type="button" className="udemy-sso-btn" onClick={() => handleSSO('azure')} disabled={isLoading} style={{ borderRadius: '6px', margin: 0 }}>
                <KeyRound size={18} style={{ color: 'var(--emerald-600)' }} />
                <span>Sign up with Koruna SSO</span>
              </button>

              <button type="button" className="udemy-sso-btn" onClick={() => handleSSO('google')} disabled={isLoading} style={{ borderRadius: '6px', margin: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>
          </div>
        )}
      </div>

      <div style={{ marginTop: '1rem', fontSize: '0.75rem', color: 'var(--koruna-text-secondary)', textAlign: 'center', lineHeight: 1.4 }}>
        By signing up, you agree to Koruna Academy's <a href="#terms" style={{ color: 'var(--koruna-primary)', textDecoration: 'underline' }}>Terms of Use</a> and <a href="#privacy" style={{ color: 'var(--koruna-primary)', textDecoration: 'underline' }}>Privacy Policy</a>.
      </div>

      <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--udemy-border)', fontSize: '0.85rem' }}>
        Already have an account?{' '}
        <button
          type="button"
          onClick={onNavigateLogin}
          style={{ background: 'none', border: 'none', color: 'var(--koruna-primary)', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer' }}
        >
          Log in
        </button>
      </div>
    </>
  );
};
