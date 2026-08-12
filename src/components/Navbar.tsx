import React from 'react';
import { KorunaLogo } from './KorunaLogo';
import { Search, Globe, ShieldCheck, BookOpen, Brain, BarChart3, Settings } from 'lucide-react';
import type { UserSessionData } from '../services/auth';

interface NavbarProps {
  onNavigateHome: () => void;
  onNavigateLogin: () => void;
  onNavigateSignup: () => void;
  userSession?: UserSessionData | null;
  activeTab?: string;
  onTabChange?: (tab: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNavigateHome,
  onNavigateLogin,
  onNavigateSignup,
  userSession,
  activeTab = 'learning',
  onTabChange
}) => {
  const roleDisplayNames = {
    employee: 'Employee',
    team_leader: 'Team Leader',
    trainer: 'Trainer',
    admin: 'Administrator'
  };

  return (
    <header className="udemy-nav">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
        <div onClick={onNavigateHome} className="udemy-nav-brand" role="button" tabIndex={0}>
          <KorunaLogo size="md" />
        </div>

        <button className="udemy-categories-btn" onClick={onNavigateHome}>
          Categories
        </button>
      </div>

      {/* Authenticated Portal Role Tabs or Search Bar */}
      {userSession ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '0 auto' }}>
          <button
            onClick={() => onTabChange?.('learning')}
            style={{
              padding: '0.5rem 0.85rem',
              border: 'none',
              background: activeTab === 'learning' ? 'var(--udemy-purple-light)' : 'transparent',
              color: activeTab === 'learning' ? 'var(--udemy-purple)' : 'var(--udemy-text)',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <BookOpen size={16} /> 📚 Learning
          </button>

          <button
            onClick={() => onTabChange?.('knowledge_base')}
            style={{
              padding: '0.5rem 0.85rem',
              border: 'none',
              background: activeTab === 'knowledge_base' ? 'var(--udemy-purple-light)' : 'transparent',
              color: activeTab === 'knowledge_base' ? 'var(--udemy-purple)' : 'var(--udemy-text)',
              fontWeight: 700,
              fontSize: '0.875rem',
              borderRadius: '4px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.4rem'
            }}
          >
            <Brain size={16} /> 🧠 Knowledge Base
          </button>

          {/* Team Leader, Trainer, Admin only */}
          {userSession.role !== 'employee' && (
            <button
              onClick={() => onTabChange?.('team_reports')}
              style={{
                padding: '0.5rem 0.85rem',
                border: 'none',
                background: activeTab === 'team_reports' ? 'var(--udemy-purple-light)' : 'transparent',
                color: activeTab === 'team_reports' ? 'var(--udemy-purple)' : 'var(--udemy-text)',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <BarChart3 size={16} /> 📊 Team Reports
            </button>
          )}

          {/* Trainer & Admin only */}
          {(userSession.role === 'admin' || userSession.role === 'trainer') && (
            <button
              onClick={() => onTabChange?.('admin_suite')}
              style={{
                padding: '0.5rem 0.85rem',
                border: 'none',
                background: activeTab === 'admin_suite' ? 'var(--udemy-purple-light)' : 'transparent',
                color: activeTab === 'admin_suite' ? 'var(--udemy-purple)' : 'var(--udemy-text)',
                fontWeight: 700,
                fontSize: '0.875rem',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}
            >
              <Settings size={16} /> ⚙️ {userSession.role === 'trainer' ? 'Trainer Suite' : 'Admin Suite'}
            </button>
          )}
        </div>
      ) : (
        <div className="udemy-search-bar">
          <Search size={18} className="udemy-search-icon" />
          <input 
            type="text" 
            className="udemy-search-input" 
            placeholder="Search for any internal skill, course, or compliance pathway..."
          />
        </div>
      )}

      {/* Right Actions */}
      <div className="udemy-nav-actions">
        {userSession ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.35rem 0.75rem', background: '#f1f5f9', borderRadius: '9999px', border: '1px solid var(--udemy-border)' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 800, textTransform: 'uppercase', background: 'var(--udemy-dark)', color: '#ffffff', padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {roleDisplayNames[userSession.role] || userSession.role}
            </span>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--udemy-dark)' }}>
              {userSession.name}
            </span>
          </div>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.8rem', fontWeight: 600, color: 'var(--emerald-600)', padding: '0.3rem 0.6rem', background: '#e6f4ea', borderRadius: '4px' }}>
              <ShieldCheck size={16} />
              <span>Koruna Enterprise</span>
            </div>

            <button className="btn-udemy-outline" onClick={onNavigateLogin}>
              Log in
            </button>

            <button className="btn-udemy-solid" onClick={onNavigateSignup}>
              Sign up
            </button>
          </>
        )}

        <button className="btn-udemy-outline" style={{ padding: '0 0.65rem' }} title="Change Language">
          <Globe size={18} />
        </button>
      </div>
    </header>
  );
};
