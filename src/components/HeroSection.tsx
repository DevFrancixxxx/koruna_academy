import React from 'react';
import { Check } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <div className="udemy-hero-card">
      <span className="udemy-hero-badge">KORUNA ENTERPRISE LMS</span>
      
      <h1 className="udemy-hero-title">
        Skills for your present and future at Koruna
      </h1>

      <p className="udemy-hero-text">
        Join over 12,000+ Koruna engineers, managers, and operational specialists advancing their careers through real-world courses and verified internal certifications.
      </p>

      <div className="udemy-bullet-list">
        <div className="udemy-bullet-item">
          <div className="udemy-bullet-check">
            <Check size={14} />
          </div>
          <span>Access 250+ internal technical & leadership pathways</span>
        </div>

        <div className="udemy-bullet-item">
          <div className="udemy-bullet-check">
            <Check size={14} />
          </div>
          <span>Hands-on labs & automated AI code assessments</span>
        </div>

        <div className="udemy-bullet-item">
          <div className="udemy-bullet-check">
            <Check size={14} />
          </div>
          <span>Earn official Koruna skill badges and level upgrades</span>
        </div>

        <div className="udemy-bullet-item">
          <div className="udemy-bullet-check">
            <Check size={14} />
          </div>
          <span>Single Sign-On (SSO) with Okta & Azure AD</span>
        </div>
      </div>
    </div>
  );
};
