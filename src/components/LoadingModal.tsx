import React from 'react';
import { createPortal } from 'react-dom';
import { KorunaLogoSvg } from './KorunaLogo';

interface LoadingModalProps {
  type?: 'login' | 'signup' | 'logout' | 'academy' | 'switching';
  message?: string;
  variant?: 'fullscreen' | 'modal';
}

export const LoadingModal: React.FC<LoadingModalProps> = ({ type = 'academy', message, variant = 'fullscreen' }) => {
  const getDisplayText = () => {
    if (message) return message;
    switch (type) {
      case 'logout':
        return 'Logging out...';
      case 'login':
        return 'Logging in...';
      case 'signup':
        return 'Creating account...';
      case 'switching':
        return 'Switching view...';
      case 'academy':
      default:
        return 'Loading Koruna Academy...';
    }
  };

  const displayText = getDisplayText();

  return createPortal(
    <div className={`loading-modal-overlay ${variant === 'modal' ? 'loading-modal-overlay--dialog' : ''}`}>
      <div className={`loading-modal-container ${variant === 'modal' ? 'loading-modal-container--dialog' : ''}`}>
        <div className="loading-logo-icon">
          <KorunaLogoSvg
            width={variant === 'modal' ? 72 : 140}
            height={variant === 'modal' ? 54 : 104}
            useGradient={true}
          />
        </div>
        <div className="loading-text-label">
          <span>{displayText}</span>
        </div>
      </div>
    </div>,
    document.body
  );
};
