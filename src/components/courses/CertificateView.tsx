import React, { useEffect } from 'react';
import { Download, Share2, CheckCircle2, X } from 'lucide-react';
import type { Course } from '../../services/db';
import type { UserSessionData } from '../../services/auth';

interface CertificateViewProps {
  course: Course;
  userSession: UserSessionData;
  issueDate?: string;
  certificateId?: string;
  trainerName?: string;
  onBack: () => void;
  onDone?: () => void;
  showToast?: (msg: string) => void;
  isModal?: boolean;
}

export const CertificateView: React.FC<CertificateViewProps> = ({
  course,
  userSession,
  issueDate,
  certificateId,
  trainerName = 'Dr. Marcus Vance',
  onBack,
  onDone,
  showToast,
  isModal = true
}) => {
  const recipientName = userSession?.name || 'Jessica Timon';
  const displayCertificateId = certificateId || `KA-${course?.code || 'MB'}-2026-${Math.floor(100000 + Math.random() * 900000)}`;
  const displayIssueDate = issueDate || 'June 14, 2026';
  const displayCourseTitle = course?.title || 'Senior Mortgage: VA Loan Specialist';

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onBack]);

  const handleShare = () => {
    const shareUrl = `${window.location.origin}/verify/certs/${displayCertificateId}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      if (showToast) {
        showToast('Certificate verification link copied to clipboard!');
      } else {
        alert('Certificate verification link copied to clipboard!');
      }
    }
  };

  const handleDone = () => {
    const msg = `🎉 Congratulations ${recipientName}! You have successfully completed "${displayCourseTitle}"!`;
    if (showToast) {
      showToast(msg);
    } else {
      alert(msg);
    }
    if (onDone) {
      onDone();
    } else {
      onBack();
    }
  };

  const certContent = (
    <>
      {/* ── Modal Header Bar ── */}
      <div
        className="no-print"
        style={{
          width: '100%',
          maxWidth: '960px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '1px solid #f1f5f9'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <span style={{
            background: '#fce7f3',
            color: '#be185d',
            fontSize: '0.75rem',
            fontWeight: 700,
            padding: '0.25rem 0.6rem',
            borderRadius: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.05em'
          }}>
            Official Certificate
          </span>
          <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 700, color: '#0f172a' }}>
            {displayCourseTitle}
          </h3>
        </div>

        <button
          onClick={onBack}
          className="no-print"
          title="Close modal (Esc)"
          style={{
            background: '#f1f5f9',
            border: 'none',
            color: '#64748b',
            cursor: 'pointer',
            padding: '0.5rem',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
        >
          <X size={20} />
        </button>
      </div>

      {/* ── Certificate Card Container ── */}
      <div
        id="printable-certificate"
        style={{
          width: '100%',
          maxWidth: '960px',
          borderRadius: '24px',
          boxShadow: '0 12px 36px rgba(0, 0, 0, 0.08), 0 2px 6px rgba(0, 0, 0, 0.04)',
          position: 'relative',
          overflow: 'hidden',
          background: '#ffffff'
        }}
      >
        {/* Base Image Template */}
        <img
          src="/Certificate.png"
          alt="Certificate Template"
          style={{
            width: '100%',
            height: 'auto',
            display: 'block',
            userSelect: 'none'
          }}
        />

        {/* ── Dynamic Text Overlays ── */}

        {/* 1. Recipient Name Overlay */}
        <div style={{
          position: 'absolute',
          top: '31%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '68%',
          textAlign: 'center',
          background: '#ffffff',
          padding: '0.15rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(1.5rem, 3.8vw, 2.75rem)',
            fontWeight: 800,
            color: '#b8185c',
            lineHeight: 1.15,
            letterSpacing: '-0.01em',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {recipientName}
          </span>
        </div>

        {/* 2. Course Title Overlay */}
        <div style={{
          position: 'absolute',
          top: '67.2%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '65%',
          textAlign: 'center',
          background: '#ffffff',
          padding: '0.1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(0.9rem, 1.9vw, 1.35rem)',
            fontWeight: 800,
            color: '#111827',
            lineHeight: 1.25,
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {displayCourseTitle}
          </span>
        </div>

        {/* 3. Trainer Overlay */}
        <div style={{
          position: 'absolute',
          top: '82.5%',
          left: '26%',
          transform: 'translateX(-50%)',
          width: '24%',
          textAlign: 'center',
          background: '#ffffff',
          padding: '0.1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(0.75rem, 1.3vw, 0.95rem)',
            fontWeight: 700,
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {trainerName}
          </span>
        </div>

        {/* 4. Certificate Number Overlay */}
        <div style={{
          position: 'absolute',
          top: '82.5%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '28%',
          textAlign: 'center',
          background: '#ffffff',
          padding: '0.1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(0.75rem, 1.3vw, 0.95rem)',
            fontWeight: 700,
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {displayCertificateId}
          </span>
        </div>

        {/* 5. Completion Date Overlay */}
        <div style={{
          position: 'absolute',
          top: '82.5%',
          left: '74%',
          transform: 'translateX(-50%)',
          width: '24%',
          textAlign: 'center',
          background: '#ffffff',
          padding: '0.1rem 0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <span style={{
            fontSize: 'clamp(0.75rem, 1.3vw, 0.95rem)',
            fontWeight: 700,
            color: '#111827',
            fontFamily: 'Inter, system-ui, sans-serif'
          }}>
            {displayIssueDate}
          </span>
        </div>
      </div>

      {/* ── Bottom Action Buttons ── */}
      <div
        className="no-print"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '1rem',
          marginTop: '1.5rem'
        }}
      >
        {/* Done Button */}
        <button
          id="cert-done-btn"
          onClick={handleDone}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#16a34a',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 2.25rem',
            borderRadius: '12px',
            fontWeight: 700,
            fontSize: '0.95rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(22, 163, 74, 0.3)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#16a34a'; e.currentTarget.style.transform = 'none'; }}
        >
          <CheckCircle2 size={20} strokeWidth={2.5} />
          <span>Done</span>
        </button>

        {/* Download PDF Button */}
        <button
          onClick={() => window.print()}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#9f1239',
            color: '#ffffff',
            border: 'none',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.925rem',
            cursor: 'pointer',
            boxShadow: '0 4px 14px rgba(159, 18, 57, 0.25)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#881337'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#9f1239'; e.currentTarget.style.transform = 'none'; }}
        >
          <Download size={18} strokeWidth={2.2} />
          <span>Download PDF</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.6rem',
            background: '#ffffff',
            color: '#374151',
            border: '1px solid #d1d5db',
            padding: '0.75rem 2rem',
            borderRadius: '12px',
            fontWeight: 600,
            fontSize: '0.925rem',
            cursor: 'pointer',
            boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
            transition: 'all 0.15s ease'
          }}
          onMouseEnter={e => { e.currentTarget.style.background = '#f9fafb'; e.currentTarget.style.borderColor = '#9ca3af'; }}
          onMouseLeave={e => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.borderColor = '#d1d5db'; }}
        >
          <Share2 size={18} strokeWidth={2} />
          <span>Share</span>
        </button>
      </div>

      <style>{`
        @media print {
          .no-print {
            display: none !important;
          }
          .koruna-modal-overlay {
            position: static !important;
            background: transparent !important;
            backdrop-filter: none !important;
            padding: 0 !important;
          }
          .koruna-modal-content {
            box-shadow: none !important;
            border-radius: 0 !important;
            max-width: 100% !important;
            width: 100% !important;
            max-height: none !important;
            overflow: visible !important;
            padding: 0 !important;
            background: #ffffff !important;
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
    </>
  );

  if (isModal) {
    return (
      <div
        className="koruna-modal-overlay no-print"
        onClick={onBack}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(15, 23, 42, 0.75)',
          backdropFilter: 'blur(8px)',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1.5rem',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        <div
          className="koruna-modal-content"
          onClick={(e) => e.stopPropagation()}
          style={{
            background: '#ffffff',
            borderRadius: '24px',
            maxWidth: '1020px',
            width: '100%',
            maxHeight: '92vh',
            overflowY: 'auto',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
            padding: '1.75rem',
            position: 'relative',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            border: '1px solid rgba(255, 255, 255, 0.2)'
          }}
        >
          {certContent}
        </div>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      minHeight: '100vh',
      background: '#f4f4f5',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1rem'
    }}>
      {certContent}
    </div>
  );
};



