import React from 'react';
import { Download, Share2, Award, CheckCircle2 } from 'lucide-react';
import type { Course } from '../../services/db';
import type { UserSessionData } from '../../services/auth';

interface CertificateViewProps {
  course: Course;
  userSession: UserSessionData;
  issueDate?: string;
  certificateId?: string;
  onBack: () => void;
  showToast?: (msg: string) => void;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  course,
  userSession,
  issueDate = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }),
  certificateId = `KA-${course.id.toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
  onBack,
  showToast
}) => {
  const getUserInitials = (name?: string, email?: string) => {
    if (name) {
      const parts = name.trim().split(' ');
      if (parts.length >= 2) {
        return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
      }
      return name.substring(0, 2).toUpperCase();
    }
    if (email) {
      return email.substring(0, 2).toUpperCase();
    }
    return 'KA';
  };

  const userInitials = getUserInitials(userSession?.name, userSession?.email);
  const recipientName = userSession?.name || 'Valued Learner';

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/certs/${certificateId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (showToast) {
        showToast('Certificate verification link copied to clipboard!');
      } else {
        alert('Certificate verification link copied to clipboard!');
      }
    }
  };

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#f8fafc',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* ── Top Header Navigation ── */}
      <div 
        className="no-print"
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: '1.1rem 2.5rem',
          background: '#ffffff',
          borderBottom: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.03)'
        }}
      >
        {/* Back Button matching exact design in screenshot */}
        <button
          onClick={onBack}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#475569',
            fontSize: '0.95rem',
            fontWeight: 600,
            padding: '0.4rem 0.25rem',
            borderRadius: '6px',
            transition: 'color 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.color = '#475569'; }}
        >
          <svg 
            width="20" 
            height="20" 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2.2" 
            strokeLinecap="round" 
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="11 17 6 12 11 7" />
            <line x1="18" x2="6" y1="12" y2="12" />
          </svg>
          <span>Back to My Certificates</span>
        </button>

        {/* User Initials Avatar Badge */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#a82c5d',
          color: '#ffffff',
          width: '38px',
          height: '38px',
          borderRadius: '50%',
          fontWeight: 700,
          fontSize: '0.9rem',
          boxShadow: '0 2px 6px rgba(168,44,93,0.3)'
        }}>
          {userInitials}
        </div>
      </div>

      {/* ── Main Content Container ── */}
      <div style={{
        maxWidth: '1020px',
        width: '100%',
        margin: '0 auto',
        padding: '2.5rem 1.5rem 4rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
      }}>
        {/* Header Titles */}
        <div style={{ textAlign: 'center', marginBottom: '2.25rem' }}>
          <h1 style={{
            fontSize: '2.1rem',
            fontWeight: 800,
            color: '#0f172a',
            margin: '0 0 0.5rem 0',
            letterSpacing: '-0.02em'
          }}>
            Certificate of Completion
          </h1>
          <p style={{
            fontSize: '0.95rem',
            color: '#64748b',
            margin: 0,
            fontWeight: 500
          }}>
            Awarded for successfully completing {course.title}
          </p>
        </div>

        {/* ── The Certificate Card Display Container ── */}
        <div 
          id="printable-certificate"
          style={{
            width: '100%',
            maxWidth: '880px',
            background: '#ffffff',
            borderRadius: '20px',
            border: '1px solid #e2e8f0',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07), 0 0 0 1px rgba(0, 0, 0, 0.02)',
            padding: '3.5rem 3rem',
            boxSizing: 'border-box',
            position: 'relative',
            overflow: 'hidden'
          }}
        >
          {/* Outer Decorative Gold/Rose Inset Border Frame */}
          <div style={{
            border: '2px solid #f1f5f9',
            outline: '1px dashed #cbd5e1',
            outlineOffset: '-10px',
            padding: '3rem 2.5rem',
            borderRadius: '14px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            background: 'linear-gradient(180deg, #ffffff 0%, #fafafa 100%)'
          }}>

            {/* Academy Branding Header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '1.75rem' }}>
              <div style={{
                background: 'linear-gradient(135deg, #a82c5d 0%, #b8235a 100%)',
                color: '#ffffff',
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(168,44,93,0.25)'
              }}>
                <Award size={18} />
              </div>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 800,
                letterSpacing: '0.18em',
                color: '#a82c5d',
                textTransform: 'uppercase'
              }}>
                Koruna Learning Portal Academy
              </span>
            </div>

            {/* Certifies Statement */}
            <p style={{
              fontStyle: 'italic',
              fontSize: '1rem',
              color: '#64748b',
              margin: '0 0 1.25rem 0',
              fontFamily: 'Georgia, serif'
            }}>
              This credential certificate certifies that
            </p>

            {/* Recipient Full Name */}
            <div style={{
              fontSize: '2.2rem',
              fontWeight: 800,
              color: '#0f172a',
              paddingBottom: '0.6rem',
              marginBottom: '1.5rem',
              borderBottom: '2.5 solid #a82c5d',
              minWidth: '280px',
              letterSpacing: '-0.01em'
            }}>
              {recipientName}
            </div>

            {/* Course Accomplishment Description */}
            <p style={{
              fontSize: '0.925rem',
              color: '#475569',
              maxWidth: '560px',
              lineHeight: 1.6,
              margin: '0 0 1rem 0'
            }}>
              has successfully fulfilled all compliance curriculum items, verified active learning comprehension, and passed evaluations for
            </p>

            {/* Course Title */}
            <h2 style={{
              fontSize: '1.6rem',
              fontWeight: 800,
              color: '#0f172a',
              margin: '0 0 2.5rem 0',
              lineHeight: 1.3
            }}>
              {course.title}
            </h2>

            {/* Signatures & Seal Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              width: '100%',
              maxWidth: '680px',
              margin: '1rem 0 2rem 0',
              paddingTop: '1.5rem',
              borderTop: '1px solid #f1f5f9'
            }}>
              {/* Trainer Signature */}
              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{
                  fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif',
                  fontSize: '1.5rem',
                  color: '#1e293b',
                  lineHeight: 1,
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #cbd5e1',
                  marginBottom: '0.35rem'
                }}>
                  Jefrey Tatoy
                </div>
                <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }}>
                  Lead Underwriting Trainer
                </div>
              </div>

              {/* Center Official Gold/Rose Badge Seal */}
              <div style={{
                width: '76px',
                height: '76px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #a82c5d 0%, #831b43 100%)',
                color: '#ffffff',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 6px 18px rgba(168,44,93,0.35), inset 0 0 0 3px rgba(255,255,255,0.3)',
                padding: '4px'
              }}>
                <CheckCircle2 size={20} style={{ marginBottom: '2px' }} />
                <span style={{ fontSize: '0.55rem', fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  VERIFIED
                </span>
              </div>

              {/* Director Signature */}
              <div style={{ textAlign: 'center', width: '180px' }}>
                <div style={{
                  fontFamily: '"Brush Script MT", "Caveat", cursive, sans-serif',
                  fontSize: '1.5rem',
                  color: '#1e293b',
                  lineHeight: 1,
                  paddingBottom: '0.35rem',
                  borderBottom: '1px solid #cbd5e1',
                  marginBottom: '0.35rem'
                }}>
                  Global Admin
                </div>
                <div style={{ fontSize: '0.725rem', fontWeight: 600, color: '#64748b' }}>
                  Compliance Director
                </div>
              </div>
            </div>

            {/* Certificate ID & Verification Metadata Footer */}
            <div style={{
              fontSize: '0.725rem',
              color: '#94a3b8',
              marginTop: '0.5rem',
              letterSpacing: '0.02em'
            }}>
              Certificate ID: <strong style={{ color: '#64748b' }}>{certificateId}</strong> • Issued: {issueDate} • Verification Link: verify.koruna.com/certs/{certificateId}
            </div>

          </div>
        </div>

        {/* ── Bottom Action Buttons ── */}
        <div 
          className="no-print"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '1rem',
            marginTop: '2.5rem'
          }}
        >
          {/* Download PDF Button */}
          <button
            onClick={() => window.print()}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: '#b8235a',
              color: '#ffffff',
              border: 'none',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 700,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(184,35,90,0.3)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#a82c5d'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#b8235a'; e.currentTarget.style.transform = 'none'; }}
          >
            <Download size={17} style={{ strokeWidth: 2.2 }} />
            <span>Download PDF</span>
          </button>

          {/* Share Button */}
          <button
            onClick={handleShare}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.55rem',
              background: '#ffffff',
              color: '#334155',
              border: '1px solid #cbd5e1',
              padding: '0.75rem 1.75rem',
              borderRadius: '10px',
              fontWeight: 600,
              fontSize: '0.9rem',
              cursor: 'pointer',
              boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#f8fafc'; e.currentTarget.style.borderColor = '#94a3b8'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
          >
            <Share2 size={17} style={{ strokeWidth: 2 }} />
            <span>Share</span>
          </button>
        </div>
      </div>

      {/* Print Stylesheet */}
      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          #printable-certificate {
            box-shadow: none !important;
            border: none !important;
            max-width: 100% !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
};
