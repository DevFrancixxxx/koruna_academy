import React from 'react';
import { Globe } from 'lucide-react';
import { KorunaLogo } from './KorunaLogo';

export const Footer: React.FC = () => {
  return (
    <footer className="udemy-footer">
      <div className="udemy-footer-inner">
        <div className="udemy-footer-links">
          <div className="udemy-footer-col">
            <a href="#link" className="udemy-footer-link">Koruna Business</a>
            <a href="#link" className="udemy-footer-link">Teach on Koruna Academy</a>
            <a href="#link" className="udemy-footer-link">Get the Koruna Mobile App</a>
            <a href="#link" className="udemy-footer-link">About us</a>
          </div>

          <div className="udemy-footer-col">
            <a href="#link" className="udemy-footer-link">Careers</a>
            <a href="#link" className="udemy-footer-link">Internal Blog</a>
            <a href="#link" className="udemy-footer-link">Help & Support</a>
            <a href="#link" className="udemy-footer-link">Affiliates</a>
          </div>

          <div className="udemy-footer-col">
            <a href="#link" className="udemy-footer-link">Terms & Security</a>
            <a href="#link" className="udemy-footer-link">Privacy Policy</a>  
            <a href="#link" className="udemy-footer-link">Sitemap</a>
            <a href="#link" className="udemy-footer-link">Accessibility Statement</a>
          </div>
        </div>

        <div>
          <button className="btn-udemy-outline" style={{ borderColor: '#ffffff', color: '#ffffff', background: 'transparent' }}>
            <Globe size={16} /> English
          </button>
        </div>
      </div>

      <div className="udemy-footer-bottom">
        <div style={{ filter: 'brightness(0) invert(1)' }}>
          <KorunaLogo size="sm" />
        </div>
        <span>© 2026 Koruna Academy, Inc. All rights reserved.</span>
      </div>
    </footer>
  );
};
