import React, { useState } from 'react';
import { Eye, EyeOff, KeyRound, AlertCircle, Info, ChevronDown, ChevronUp, Settings } from 'lucide-react';
import { signInUser, signInWithSSO } from '../services/auth';
import type { UserRole, UserSessionData } from '../services/auth';
import { isSupabaseConfigured } from '../lib/supabase';
import { LoadingModal } from './LoadingModal';

interface LoginFormProps {
  onLoginSuccess: (userData: UserSessionData) => void;
  onNavigateSignup?: () => void;
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

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess, onNavigateSignup }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showDevOptions, setShowDevOptions] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const presets: Array<{ label: string; email: string; pass: string; role: UserRole; name: string }> = [
    {
      label: 'Employee',
      email: 'alex.rivera@koruna.com',
      pass: 'KorunaLearner2026!',
      role: 'employee',
      name: 'Alex Rivera'
    },
    {
      label: 'Team Leader',
      email: 'sarah.chen@koruna.com',
      pass: 'KorunaManager2026!',
      role: 'team_leader',
      name: 'Sarah Chen'
    },
    {
      label: 'Trainer',
      email: 'dr.vance@koruna.com',
      pass: 'KorunaTrainer2026!',
      role: 'trainer',
      name: 'Dr. Marcus Vance'
    },
    {
      label: 'Admin',
      email: 'admin.learning@koruna.com',
      pass: 'KorunaAdmin2026!',
      role: 'admin',
      name: 'Global Admin'
    }
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setEmail(preset.email);
    setPassword(preset.pass);
    setErrorMsg(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email.trim() || !email.includes('@')) {
      setErrorMsg('Please enter a valid Koruna email address.');
      return;
    }
    if (!password || password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    setIsLoading(true);
    const startTime = Date.now();
    const result = await signInUser(email, password);
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
    }
    setIsLoading(false);

    if (!result.success || !result.data) {
      setErrorMsg(result.error || 'Authentication failed. Check your credentials.');
      return;
    }

    // Check if matched preset for richer demo role display
    const matchedPreset = presets.find((p) => p.email.toLowerCase() === email.toLowerCase());

    onLoginSuccess({
      name: matchedPreset ? matchedPreset.name : result.data.name,
      role: matchedPreset ? matchedPreset.role : result.data.role,
      email: result.data.email
    });
  };

  const handleSSO = async (provider: 'google' | 'azure') => {
    setIsLoading(true);
    setErrorMsg(null);
    const startTime = Date.now();
    const result = await signInWithSSO(provider, {
      email: email.trim() || undefined
    });
    const elapsed = Date.now() - startTime;
    if (elapsed < 1500) {
      await new Promise((resolve) => setTimeout(resolve, 1500 - elapsed));
    }
    setIsLoading(false);

    if (result.success && result.data) {
      onLoginSuccess(result.data);
    } else if (result.error) {
      setErrorMsg(result.error);
    }
  };

  return (
    <>
      {isLoading && <LoadingModal type="login" />}
      
      <div className="koruna-login-logo-container">
        <KorunaLogo />
      </div>

      <span className="koruna-login-badge">EMPLOYEE SIGN-IN</span>
      <h2 className="koruna-login-title">Welcome back</h2>
      <p className="koruna-login-subtitle">Log in to continue your learning journey.</p>

      {errorMsg && (
        <div style={{ padding: '0.65rem 0.85rem', background: '#fce8e6', border: '1px solid #ea4335', color: '#c5221f', fontSize: '0.85rem', marginBottom: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.25rem', borderRadius: '6px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <AlertCircle size={16} style={{ flexShrink: 0 }} />
            <span style={{ fontWeight: 600 }}>{errorMsg}</span>
          </div>
          {errorMsg.toLowerCase().includes('email not confirmed') && (
            <div style={{ fontSize: '0.75rem', color: '#5f6368', marginTop: '0.25rem', paddingLeft: '1.5rem', lineHeight: 1.4 }}>
              <strong>How to resolve:</strong>
              <ul style={{ margin: '0.25rem 0 0 0', paddingLeft: '1rem' }}>
                <li>Check your inbox (and spam folder) for the Supabase confirmation email.</li>
                <li><strong>Or:</strong> Open the Supabase Dashboard, navigate to <strong>Authentication &rarr; Users</strong>, click the <code>...</code> next to this email, and click <strong>Confirm User</strong>.</li>
                <li><strong>Or:</strong> In the Supabase Dashboard, go to <strong>Authentication &rarr; Providers &rarr; Email</strong>, and turn off <strong>Confirm Email</strong> (Double Opt-In) to disable verification.</li>
              </ul>
            </div>
          )}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit}>
        <div className="koruna-login-form-group">
          <label className="koruna-login-label" htmlFor="email-input">Email address</label>
          <input
            id="email-input"
            type="email"
            className="koruna-login-input"
            placeholder="name@korunaassist.com"
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

        <div className="koruna-login-row">
          <label className="koruna-login-checkbox-label">
            <input
              type="checkbox"
              className="koruna-login-checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
            />
            <span>Remember me</span>
          </label>
          
          <a
            href="#forgot"
            className="koruna-login-forgot-link"
            onClick={(e) => {
              e.preventDefault();
              alert("Forgot password instructions sent!");
            }}
          >
            Forgot password?
          </a>
        </div>

        <button type="submit" className="koruna-login-btn-primary" disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Login'}
        </button>
      </form>

      {/* Collapsible Demo Presets & SSO Options Drawer */}
      <div className="koruna-login-dev-panel">
        <button
          type="button"
          className="koruna-login-dev-toggle"
          onClick={() => setShowDevOptions(!showDevOptions)}
        >
          <Settings size={14} />
          <span>Demo Credentials & SSO Options</span>
          {showDevOptions ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showDevOptions && (
          <div className="koruna-login-dev-content">
            {!isSupabaseConfigured() && (
              <div style={{ padding: '0.6rem 0.8rem', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#1e40af', borderRadius: '6px', fontSize: '0.75rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Info size={14} style={{ flexShrink: 0 }} />
                <span>Supabase Demo Mode active. Select a preset chip below to test roles.</span>
              </div>
            )}

            {/* SSO Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', marginBottom: '1.25rem' }}>
              <button type="button" className="udemy-sso-btn" onClick={() => handleSSO('azure')} disabled={isLoading} style={{ borderRadius: '6px', margin: 0 }}>
                <KeyRound size={18} style={{ color: 'var(--emerald-600)' }} />
                <span>Continue with Koruna SSO</span>
              </button>

              <button type="button" className="udemy-sso-btn" onClick={() => handleSSO('google')} disabled={isLoading} style={{ borderRadius: '6px', margin: 0 }}>
                <svg width="18" height="18" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span>Continue with Google</span>
              </button>
            </div>

            {/* Presets Grid */}
            <div className="udemy-presets" style={{ border: 'none', padding: 0, margin: 0 }}>
              <div className="udemy-presets-label" style={{ fontSize: '0.7rem', marginBottom: '0.4rem' }}>Quick Role Demo Login</div>
              <div className="udemy-presets-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                {presets.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="udemy-preset-chip"
                    onClick={() => handleApplyPreset(preset)}
                    style={{ fontSize: '0.68rem', padding: '0.4rem 0.1rem', borderRadius: '4px' }}
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {onNavigateSignup && (
        <div style={{ textAlign: 'center', marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--udemy-border)', fontSize: '0.85rem' }}>
          Don't have an account?{' '}
          <button
            type="button"
            onClick={onNavigateSignup}
            style={{ background: 'none', border: 'none', color: 'var(--koruna-primary)', textDecoration: 'underline', fontWeight: 700, cursor: 'pointer' }}
          >
            Sign up
          </button>
        </div>
      )}
    </>
  );
};

