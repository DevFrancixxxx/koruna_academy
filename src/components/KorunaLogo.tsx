import React from 'react';

interface KorunaLogoProps {
  size?: 'sm' | 'md' | 'lg';
}

export const KorunaLogo: React.FC<KorunaLogoProps> = ({ size = 'md' }) => {
  const fontSizes = {
    sm: '1.2rem',
    md: '1.5rem',
    lg: '1.85rem',
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontFamily: 'var(--font-heading)' }}>
      <div 
        style={{ 
          width: size === 'sm' ? 24 : 30, 
          height: size === 'sm' ? 24 : 30,
          background: 'var(--udemy-dark)',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#ffffff',
          fontWeight: 800,
          fontSize: size === 'sm' ? '0.8rem' : '1rem'
        }}
      >
        K
      </div>

      <span style={{ fontSize: fontSizes[size], fontWeight: 800, color: 'var(--udemy-dark)', letterSpacing: '-0.03em' }}>
        koruna<span style={{ color: 'var(--emerald-600)' }}>academy</span>
      </span>
    </div>
  );
};
