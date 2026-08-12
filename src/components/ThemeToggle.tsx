import React from 'react';
import { Sun, Moon } from 'lucide-react';

interface ThemeToggleProps {
  theme: 'dark' | 'light';
  onToggle: () => void;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ theme, onToggle }) => {
  return (
    <button
      className="btn-theme"
      onClick={onToggle}
      title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`}
      aria-label="Toggle Theme"
    >
      {theme === 'dark' ? (
        <Sun size={18} style={{ color: '#fbbf24' }} />
      ) : (
        <Moon size={18} style={{ color: '#6366f1' }} />
      )}
    </button>
  );
};
