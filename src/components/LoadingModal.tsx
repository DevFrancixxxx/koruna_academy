import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { GraduationCap } from 'lucide-react';

interface LoadingModalProps {
  type: 'login' | 'signup' | 'logout';
}

const loginMessages = [
  'Securing corporate gateway connection...',
  'Verifying identity with Koruna Directory...',
  'Authorizing account permissions...',
  'Syncing personalized learning paths...',
  'Loading your Academy dashboard...'
];

const signupMessages = [
  'Provisioning new Koruna account...',
  'Registering corporate credentials...',
  'Mapping department curricula...',
  'Configuring user workspace...',
  'Finalizing profile setup...'
];

const logoutMessages = [
  'Clearing secure portal session...',
  'Disconnecting database client link...',
  'Safeguarding local learning progress...',
  'Redirecting to corporate gatekeeper...'
];

export const LoadingModal: React.FC<LoadingModalProps> = ({ type }) => {
  const messages = type === 'login' ? loginMessages : type === 'signup' ? signupMessages : logoutMessages;
  const [messageIndex, setMessageIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      // Trigger a quick fade transition between messages
      setFade(false);
      setTimeout(() => {
        setMessageIndex((prev) => (prev + 1) % messages.length);
        setFade(true);
      }, 150); // duration of the fade-out
    }, 1800); // cycle messages every 1.8s

    return () => clearInterval(interval);
  }, [messages.length]);

  return createPortal(
    <div className="loading-modal-overlay">
      <div className="loading-modal-card">
        <div className="loading-spinner-container">
          <div className="loading-spinner-ring"></div>
          <div className="loading-spinner-segment"></div>
          <div className="loading-spinner-inner">
            <GraduationCap size={32} />
          </div>
        </div>

        <h3 className="loading-modal-title">
          {type === 'login' ? 'Logging in' : type === 'signup' ? 'Creating Account' : 'Signing out'}
        </h3>
        
        <div 
          className="loading-modal-message"
          style={{
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.15s ease-in-out'
          }}
        >
          {messages[messageIndex]}
        </div>

        <div className="loading-progress-track">
          <div className="loading-progress-bar"></div>
        </div>
      </div>
    </div>,
    document.body
  );
};
