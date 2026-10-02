import React from 'react';

interface CertificateTemplateViewProps {
  certHeader: string;
  setCertHeader: (val: string) => void;
  trainerSig: string;
  setTrainerSig: (val: string) => void;
  adminSig: string;
  setAdminSig: (val: string) => void;
  sampleRecipient: string;
  setSampleRecipient: (val: string) => void;
  sampleCourseTitle: string;
  setSampleCourseTitle: (val: string) => void;
}

export const CertificateTemplateView: React.FC<CertificateTemplateViewProps> = ({
  certHeader,
  setCertHeader,
  trainerSig,
  setTrainerSig,
  adminSig,
  setAdminSig,
  sampleRecipient,
  setSampleRecipient,
  sampleCourseTitle,
  setSampleCourseTitle,
}) => {
  return (
    <div className="as-split">
      <div className="as-card as-card-body">
        <h3 className="as-card-title">Certificate details</h3>
        <p className="as-card-desc" style={{ marginBottom: '1.25rem' }}>
          Uses the Certificate.png master design. Changes appear in the preview.
        </p>
        <div className="as-stack" style={{ gap: '1rem' }}>
          <div className="as-field">
            <label className="as-label" htmlFor="cert-header">Organization name</label>
            <input id="cert-header" className="as-input" value={certHeader} onChange={(e) => setCertHeader(e.target.value)} placeholder="Koruna Financial Academy" />
          </div>
          <div className="as-field">
            <label className="as-label" htmlFor="cert-trainer">Trainer signature</label>
            <input id="cert-trainer" className="as-input" value={trainerSig} onChange={(e) => setTrainerSig(e.target.value)} placeholder="Jefrey Tatoy" />
          </div>
          <div className="as-field">
            <label className="as-label" htmlFor="cert-admin">Verified by</label>
            <input id="cert-admin" className="as-input" value={adminSig} onChange={(e) => setAdminSig(e.target.value)} placeholder="Global Admin" />
          </div>
          <div className="as-field">
            <label className="as-label" htmlFor="cert-name">Preview: recipient name</label>
            <input id="cert-name" className="as-input" value={sampleRecipient} onChange={(e) => setSampleRecipient(e.target.value)} placeholder="Jessica Taylor" />
          </div>
          <div className="as-field">
            <label className="as-label" htmlFor="cert-course">Preview: course title</label>
            <input id="cert-course" className="as-input" value={sampleCourseTitle} onChange={(e) => setSampleCourseTitle(e.target.value)} placeholder="Mortgage Level 2: Underwriting Processes" />
          </div>
        </div>
      </div>

      <div className="as-card as-card-body">
        <h3 className="as-card-title">Preview</h3>
        <p className="as-card-desc" style={{ marginBottom: '1rem' }}>How a certificate will look when issued.</p>
        <div className="as-cert-frame">
          <img src="/Certificate.png" alt="Certificate template" style={{ width: '100%', height: 'auto', display: 'block', userSelect: 'none' }} />
          <div className="as-cert-overlay" style={{ top: '31%', left: '50%', width: '68%' }}>
            <span style={{ fontSize: 'clamp(1rem, 2.5vw, 1.7rem)', fontWeight: 700, color: '#be185d', lineHeight: 1.15 }}>
              {sampleRecipient || 'Jessica Taylor'}
            </span>
          </div>
          <div className="as-cert-overlay" style={{ top: '67.2%', left: '50%', width: '65%' }}>
            <span style={{ fontSize: 'clamp(0.6rem, 1.3vw, 0.9rem)', fontWeight: 700, color: '#111827', lineHeight: 1.2 }}>
              {sampleCourseTitle || 'Mortgage Level 2: Underwriting Processes'}
            </span>
          </div>
          <div className="as-cert-overlay" style={{ top: '82.5%', left: '26%', width: '24%' }}>
            <span style={{ fontSize: 'clamp(0.5rem, 1vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>{trainerSig || 'Jefrey Tatoy'}</span>
          </div>
          <div className="as-cert-overlay" style={{ top: '82.5%', left: '50%', width: '28%' }}>
            <span style={{ fontSize: 'clamp(0.5rem, 1vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>KA-ML2-2026-849201</span>
          </div>
          <div className="as-cert-overlay" style={{ top: '82.5%', left: '74%', width: '24%' }}>
            <span style={{ fontSize: 'clamp(0.5rem, 1vw, 0.7rem)', fontWeight: 600, color: '#111827' }}>September 8, 2026</span>
          </div>
        </div>
      </div>
    </div>
  );
};
