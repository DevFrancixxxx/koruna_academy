import React, { useEffect } from 'react';
import { Clock, ShieldAlert, RefreshCw, LogOut, Lock } from 'lucide-react';
import { WARNING_BEFORE_TIMEOUT_SECONDS } from '../services/auth';

interface SessionWarningModalProps {
  isOpen: boolean;
  remainingSeconds: number;
  onExtendSession: () => void;
  onLogout: () => void;
}

export const SessionWarningModal: React.FC<SessionWarningModalProps> = ({
  isOpen,
  remainingSeconds,
  onExtendSession,
  onLogout
}) => {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onExtendSession();
      } else if (e.key === 'Enter') {
        onExtendSession();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onExtendSession]);

  if (!isOpen) return null;

  // Format mm:ss
  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // Progress ratio for warning threshold
  const warningMax = WARNING_BEFORE_TIMEOUT_SECONDS;
  const progressPercent = Math.min(100, Math.max(0, (remainingSeconds / warningMax) * 100));
  const isUrgent = remainingSeconds <= 30;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1.25rem',
        animation: 'fadeIn 0.25s ease-out'
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="session-warning-title"
    >
      <div
        style={{
          width: '100%',
          maxWidth: '440px',
          backgroundColor: '#0f172a',
          borderRadius: '16px',
          border: isUrgent ? '1px solid rgba(239, 68, 68, 0.4)' : '1px solid rgba(245, 158, 11, 0.3)',
          boxShadow: isUrgent
            ? '0 25px 50px -12px rgba(239, 68, 68, 0.25), 0 0 30px rgba(239, 68, 68, 0.15)'
            : '0 25px 50px -12px rgba(245, 158, 11, 0.25), 0 0 30px rgba(245, 158, 11, 0.12)',
          color: '#f8fafc',
          padding: '2rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          transition: 'all 0.3s ease'
        }}
      >
        {/* Top Glow Accent Bar */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '4px',
            background: isUrgent
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : 'linear-gradient(90deg, #f59e0b, #eab308)',
            transition: 'background 0.3s ease'
          }}
        />

        {/* Animated Icon Circle */}
        <div
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: isUrgent ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
            border: isUrgent ? '1px solid rgba(239, 68, 68, 0.3)' : '1px solid rgba(245, 158, 11, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1.25rem',
            color: isUrgent ? '#ef4444' : '#f59e0b',
            boxShadow: isUrgent ? '0 0 20px rgba(239, 68, 68, 0.2)' : '0 0 20px rgba(245, 158, 11, 0.2)',
            animation: isUrgent ? 'pulse 1.2s infinite ease-in-out' : 'none'
          }}
        >
          {isUrgent ? <ShieldAlert size={32} /> : <Clock size={32} />}
        </div>

        {/* Header */}
        <h2
          id="session-warning-title"
          style={{
            fontSize: '1.35rem',
            fontWeight: 700,
            margin: '0 0 0.5rem',
            color: '#ffffff',
            letterSpacing: '-0.02em'
          }}
        >
          Session Expiring Soon
        </h2>

        <p
          style={{
            fontSize: '0.9rem',
            color: '#94a3b8',
            margin: '0 0 1.5rem',
            lineHeight: 1.5
          }}
        >
          Due to safety & compliance policies, your Koruna Academy session will automatically expire due to inactivity.
        </p>

        {/* Timer Box */}
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.8)',
            borderRadius: '12px',
            padding: '1.25rem 1rem',
            margin: '0 0 1.5rem',
            border: '1px solid rgba(51, 65, 85, 0.8)'
          }}
        >
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              color: isUrgent ? '#fca5a5' : '#fcd34d',
              marginBottom: '0.4rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.35rem'
            }}
          >
            <Lock size={13} /> Automatic Sign-out in
          </div>

          <div
            style={{
              fontSize: '2.5rem',
              fontWeight: 800,
              fontFamily: 'monospace, monospace',
              color: isUrgent ? '#f87171' : '#fbbf24',
              letterSpacing: '0.05em',
              textShadow: isUrgent ? '0 0 12px rgba(239, 68, 68, 0.4)' : '0 0 12px rgba(245, 158, 11, 0.3)'
            }}
          >
            {formattedTime}
          </div>

          {/* Animated Progress Bar */}
          <div
            style={{
              width: '100%',
              height: '6px',
              backgroundColor: 'rgba(15, 23, 42, 0.6)',
              borderRadius: '9999px',
              marginTop: '1rem',
              overflow: 'hidden',
              position: 'relative'
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${progressPercent}%`,
                backgroundColor: isUrgent ? '#ef4444' : '#f59e0b',
                borderRadius: '9999px',
                transition: 'width 1s linear, background-color 0.3s ease'
              }}
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <button
            onClick={onExtendSession}
            style={{
              width: '100%',
              padding: '0.85rem 1.25rem',
              borderRadius: '10px',
              border: 'none',
              background: 'linear-gradient(135deg, #a855f7 0%, #6366f1 100%)',
              color: '#ffffff',
              fontWeight: 700,
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              boxShadow: '0 4px 14px rgba(168, 85, 247, 0.35)',
              transition: 'transform 0.15s ease, box-shadow 0.15s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = 'translateY(-1px)';
              e.currentTarget.style.boxShadow = '0 6px 20px rgba(168, 85, 247, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.boxShadow = '0 4px 14px rgba(168, 85, 247, 0.35)';
            }}
          >
            <RefreshCw size={18} /> Keep Me Logged In
          </button>

          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.7rem 1.25rem',
              borderRadius: '10px',
              border: '1px solid rgba(148, 163, 184, 0.2)',
              backgroundColor: 'transparent',
              color: '#94a3b8',
              fontWeight: 600,
              fontSize: '0.875rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.4rem',
              transition: 'color 0.2s ease, border-color 0.2s ease'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.color = '#f8fafc';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.5)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.color = '#94a3b8';
              e.currentTarget.style.borderColor = 'rgba(148, 163, 184, 0.2)';
            }}
          >
            <LogOut size={16} /> Log Out Now
          </button>
        </div>
      </div>
    </div>
  );
};
