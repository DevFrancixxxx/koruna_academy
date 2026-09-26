import React from 'react';
import { Construction } from 'lucide-react';

interface UnderDevelopmentProps {
  title: string;
  description?: string;
}

export const UnderDevelopment: React.FC<UnderDevelopmentProps> = ({
  title,
  description = 'This section is currently under active development. Check back soon for updates!'
}) => {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        padding: '3rem 1.5rem',
        textAlign: 'center',
        background: '#ffffff',
        borderRadius: '16px',
        border: '1px solid #e2e8f0',
        margin: '1.5rem 0',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05)'
      }}
    >
      <div
        style={{
          width: '64px',
          height: '64px',
          borderRadius: '50%',
          background: '#e0e7ff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: '1.25rem',
          color: '#4f46e5'
        }}
      >
        <Construction size={32} />
      </div>
      <h2
        style={{
          fontSize: '1.5rem',
          fontWeight: 800,
          color: '#0f172a',
          marginBottom: '0.5rem'
        }}
      >
        {title}
      </h2>
      <span
        style={{
          fontSize: '0.75rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          color: '#4f46e5',
          background: '#e0e7ff',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          marginBottom: '1rem'
        }}
      >
        Under Development
      </span>
      <p
        style={{
          fontSize: '0.925rem',
          color: '#64748b',
          maxWidth: '420px',
          lineHeight: '1.5'
        }}
      >
        {description}
      </p>
    </div>
  );
};
