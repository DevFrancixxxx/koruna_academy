import React, { useState, useEffect } from 'react';
import { 
  X, 
  Download, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  FileText, 
  FileSpreadsheet, 
  File, 
  CheckCircle, 
  Eye,
  ShieldCheck,
  ChevronLeft,
  ChevronRight
} from 'lucide-react';

export interface ResourceFile {
  name: string;
  url: string;
  size?: number;
}

interface ResourceViewerModalProps {
  file: ResourceFile | null;
  onClose: () => void;
  courseTitle?: string;
}

export const ResourceViewerModal: React.FC<ResourceViewerModalProps> = ({
  file,
  onClose,
  courseTitle = 'Course Module Material'
}) => {
  const [zoom, setZoom] = useState(100);
  const [currentPage, setCurrentPage] = useState(1);
  const [activeSheetTab, setActiveSheetTab] = useState('Summary');
  const [isDownloaded, setIsDownloaded] = useState(false);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!file) return null;

  const ext = file.name.split('.').pop()?.toLowerCase() || 'pdf';
  const isPdf = ext === 'pdf';
  const isExcel = ['xlsx', 'xls', 'csv'].includes(ext);
  const isImage = ['png', 'jpg', 'jpeg', 'svg', 'webp'].includes(ext);

  const formattedSize = file.size 
    ? `${(file.size / 1024).toFixed(1)} KB`
    : isPdf ? '345 KB' : isExcel ? '128 KB' : '210 KB';

  const handleDownload = () => {
    setIsDownloaded(true);
    // Create hidden anchor to download
    const link = document.createElement('a');
    link.href = file.url && file.url !== '#' ? file.url : `data:text/plain;charset=utf-8,${encodeURIComponent('Sample Resource Content for ' + file.name)}`;
    link.download = file.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => setIsDownloaded(false), 3000);
  };

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 15, 200));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 15, 60));
  const handleZoomReset = () => setZoom(100);

  return (
    <div 
      className="koruna-modal-overlay" 
      onClick={onClose}
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
          borderRadius: '20px',
          width: '100%',
          maxWidth: '1050px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.35)',
          overflow: 'hidden',
          border: '1px solid rgba(255, 255, 255, 0.2)'
        }}
      >
        {/* MODAL HEADER */}
        <div style={{
          padding: '1.1rem 1.5rem',
          background: '#0f172a',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          borderBottom: '1px solid #1e293b'
        }}>
          {/* File Name & Info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem', overflow: 'hidden' }}>
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: isPdf ? 'rgba(239, 68, 68, 0.15)' : isExcel ? 'rgba(34, 197, 94, 0.15)' : 'rgba(59, 130, 246, 0.15)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {isPdf ? (
                <FileText size={22} style={{ color: '#f87171' }} />
              ) : isExcel ? (
                <FileSpreadsheet size={22} style={{ color: '#4ade80' }} />
              ) : (
                <File size={22} style={{ color: '#60a5fa' }} />
              )}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.1rem', overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                <span style={{
                  fontSize: '1.05rem',
                  fontWeight: 700,
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                  maxWidth: '450px'
                }}>
                  {file.name}
                </span>
                <span style={{
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  padding: '0.15rem 0.5rem',
                  borderRadius: '6px',
                  background: 'rgba(255, 255, 255, 0.12)',
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  letterSpacing: '0.05em'
                }}>
                  {ext.toUpperCase()}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.78rem', color: '#94a3b8' }}>
                <span>{courseTitle}</span>
                <span>•</span>
                <span>{formattedSize}</span>
                <span>•</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#38bdf8' }}>
                  <Eye size={12} /> Live Preview (Not Downloaded)
                </span>
              </div>
            </div>
          </div>

          {/* Controls Right */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {/* Zoom Controls */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              background: '#1e293b',
              borderRadius: '10px',
              padding: '0.2rem 0.4rem',
              gap: '0.2rem',
              border: '1px solid #334155'
            }}>
              <button 
                onClick={handleZoomOut}
                title="Zoom Out"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ZoomOut size={16} />
              </button>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', width: '42px', textAlign: 'center' }}>
                {zoom}%
              </span>
              <button 
                onClick={handleZoomIn}
                title="Zoom In"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#cbd5e1',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center'
                }}
              >
                <ZoomIn size={16} />
              </button>
              <button 
                onClick={handleZoomReset}
                title="Reset Zoom"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: '#94a3b8',
                  cursor: 'pointer',
                  padding: '0.35rem',
                  borderRadius: '6px',
                  display: 'flex',
                  alignItems: 'center',
                  marginLeft: '0.2rem'
                }}
              >
                <RotateCcw size={14} />
              </button>
            </div>

            {/* Download Button */}
            <button
              onClick={handleDownload}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                background: isDownloaded ? '#16a34a' : 'var(--koruna-primary, #a82c5d)',
                color: '#ffffff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '10px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 2px 8px rgba(168,44,93,0.3)'
              }}
            >
              {isDownloaded ? <CheckCircle size={16} /> : <Download size={16} />}
              {isDownloaded ? 'Downloaded!' : 'Download'}
            </button>

            {/* Close Button */}
            <button
              onClick={onClose}
              title="Close Preview (Esc)"
              style={{
                background: '#1e293b',
                border: '1px solid #334155',
                color: '#94a3b8',
                cursor: 'pointer',
                padding: '0.55rem',
                borderRadius: '10px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = '#ffffff';
                e.currentTarget.style.background = '#334155';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = '#94a3b8';
                e.currentTarget.style.background = '#1e293b';
              }}
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* MODAL MAIN DOCUMENT CANVAS */}
        <div style={{
          flex: 1,
          background: '#525659',
          overflow: 'auto',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2rem 1.5rem',
          position: 'relative'
        }}>
          <div style={{
            transform: `scale(${zoom / 100})`,
            transformOrigin: 'top center',
            transition: 'transform 0.15s ease-out',
            width: isExcel ? '96%' : '850px',
            maxWidth: '100%',
            marginBottom: '3rem'
          }}>
            {file.url && file.url !== '#' && file.url.length > 5 ? (
              // Real File / Real URL (Uploaded or Blob/Data URL)
              isImage ? (
                <div style={{
                  background: '#ffffff',
                  padding: '1rem',
                  borderRadius: '12px',
                  boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                  textAlign: 'center'
                }}>
                  <img src={file.url} alt={file.name} style={{ maxWidth: '100%', maxHeight: '72vh', objectFit: 'contain', borderRadius: '8px' }} />
                </div>
              ) : isPdf ? (
                <object
                  data={file.url}
                  type="application/pdf"
                  style={{
                    width: '100%',
                    height: '76vh',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    background: '#ffffff'
                  }}
                >
                  <iframe 
                    src={file.url} 
                    title={file.name} 
                    style={{
                      width: '100%',
                      height: '76vh',
                      border: 'none',
                      borderRadius: '12px',
                      background: '#ffffff'
                    }} 
                  />
                </object>
              ) : (file.url.startsWith('data:text/') || file.url.startsWith('data:application/json') || ['txt', 'csv', 'md', 'json', 'xml', 'log'].includes(ext)) ? (
                <TextContentPreview url={file.url} fileName={file.name} />
              ) : (
                <iframe 
                  src={file.url.startsWith('http') && (file.name.endsWith('.docx') || file.name.endsWith('.xlsx')) 
                    ? `https://docs.google.com/gview?url=${encodeURIComponent(file.url)}&embedded=true` 
                    : file.url} 
                  title={file.name} 
                  style={{
                    width: '100%',
                    height: '76vh',
                    border: 'none',
                    borderRadius: '12px',
                    boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
                    background: '#ffffff'
                  }} 
                />
              )
            ) : isExcel ? (
              // SPREADSHEET PREVIEW RENDERER
              <SpreadsheetPreview file={file} activeTab={activeSheetTab} setActiveTab={setActiveSheetTab} />
            ) : (
              // PDF / DOCUMENT PREVIEW RENDERER
              <PdfDocumentPreview file={file} currentPage={currentPage} setCurrentPage={setCurrentPage} />
            )}
          </div>
        </div>

        {/* MODAL FOOTER */}
        <div style={{
          padding: '0.75rem 1.5rem',
          background: '#0f172a',
          borderTop: '1px solid #1e293b',
          color: '#94a3b8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <ShieldCheck size={16} style={{ color: '#22c55e' }} />
            <span>Verified Koruna Academy Reference Material</span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {isPdf && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button
                  disabled={currentPage <= 1}
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: currentPage <= 1 ? '#475569' : '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    cursor: currentPage <= 1 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronLeft size={14} />
                </button>
                <span>Page {currentPage} of 2</span>
                <button
                  disabled={currentPage >= 2}
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, 2))}
                  style={{
                    background: '#1e293b',
                    border: '1px solid #334155',
                    color: currentPage >= 2 ? '#475569' : '#ffffff',
                    padding: '0.2rem 0.5rem',
                    borderRadius: '6px',
                    cursor: currentPage >= 2 ? 'not-allowed' : 'pointer'
                  }}
                >
                  <ChevronRight size={14} />
                </button>
              </div>
            )}
            <span>Press <kbd style={{ background: '#1e293b', padding: '0.1rem 0.4rem', borderRadius: '4px', border: '1px solid #334155', color: '#f8fafc' }}>Esc</kbd> to exit</span>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sub-component: High-fidelity PDF Document Layout
const PdfDocumentPreview: React.FC<{ file: ResourceFile; currentPage: number; setCurrentPage: (p: number) => void }> = ({
  file,
  currentPage
}) => {
  const isDtiWorksheet = file.name.toLowerCase().includes('dti') || file.name.toLowerCase().includes('ratio');
  const isSampleCase = file.name.toLowerCase().includes('case') || file.name.toLowerCase().includes('sample');

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '850px',
      borderRadius: '4px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      padding: '3.5rem 4rem',
      position: 'relative',
      fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
      color: '#1e293b',
      boxSizing: 'border-box'
    }}>
      {/* Watermark */}
      <div style={{
        position: 'absolute',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%) rotate(-35deg)',
        fontSize: '4.5rem',
        fontWeight: 900,
        color: 'rgba(168, 44, 93, 0.04)',
        userSelect: 'none',
        pointerEvents: 'none',
        whiteSpace: 'nowrap',
        letterSpacing: '0.1em'
      }}>
        KORUNA ACADEMY
      </div>

      {/* Official Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        borderBottom: '2px solid #a82c5d',
        paddingBottom: '1.25rem',
        marginBottom: '2rem'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#a82c5d', letterSpacing: '-0.02em' }}>
              KORUNA FINANCIAL ACADEMY
            </span>
          </div>
          <span style={{ fontSize: '0.75rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Underwriting & Compliance Reference Standard
          </span>
        </div>

        <div style={{ textAlign: 'right', fontSize: '0.75rem', color: '#64748b' }}>
          <div>Doc Ref: <strong style={{ color: '#0f172a' }}>KFA-2026-REF-09</strong></div>
          <div>Effective Date: Aug 2026</div>
        </div>
      </div>

      {/* Document Content based on page */}
      {currentPage === 1 ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '1rem 1.25rem', borderRadius: '10px', borderLeft: '4px solid #a82c5d' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#0f172a', margin: 0 }}>
                {file.name.replace(/\.[^/.]+$/, '')}
              </h2>
              <span style={{ fontSize: '0.85rem', color: '#64748b' }}>
                Mortgage Division • Practical Underwriting Guidelines
              </span>
            </div>
            <span style={{
              background: '#dcfce7',
              color: '#15803d',
              fontSize: '0.75rem',
              fontWeight: 700,
              padding: '0.35rem 0.75rem',
              borderRadius: '9999px'
            }}>
              Active Template
            </span>
          </div>

          {isDtiWorksheet ? (
            <>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a82c5d', marginBottom: '0.5rem' }}>
                  1. Executive Summary & Purpose
                </h3>
                <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155', margin: 0 }}>
                  This Debt-to-Income (DTI) ratio reference sheet outlines standard formulas for Front-End (Housing) and Back-End (Total Debt) underwriting qualification. All loan officers and underwriters must verify gross monthly income calculations against Form 1040 and standard W-2 documentation.
                </p>
              </div>

              {/* DTI Calculation Table */}
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a82c5d', marginBottom: '0.75rem' }}>
                  2. Benchmark Thresholds & Qualification Ratios
                </h3>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                  <thead>
                    <tr style={{ background: '#f1f5f9', color: '#0f172a' }}>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', border: '1px solid #cbd5e1' }}>Loan Product</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', border: '1px solid #cbd5e1' }}>Front-End Limit</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'center', border: '1px solid #cbd5e1' }}>Back-End Limit</th>
                      <th style={{ padding: '0.65rem 0.85rem', textAlign: 'left', border: '1px solid #cbd5e1' }}>Compensating Factors</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', fontWeight: 600 }}>Conventional Primary</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#2563eb', fontWeight: 700 }}>28%</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>36%</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0' }}>FICO ≥ 740, 6+ mos reserves</td>
                    </tr>
                    <tr style={{ background: '#f8fafc' }}>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', fontWeight: 600 }}>FHA Standard</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#2563eb', fontWeight: 700 }}>31%</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>43%</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0' }}>Automated Underwriting Approval</td>
                    </tr>
                    <tr>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', fontWeight: 600 }}>VA Guaranteed</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#64748b' }}>N/A</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0', textAlign: 'center', color: '#16a34a', fontWeight: 700 }}>41%</td>
                      <td style={{ padding: '0.65rem 0.85rem', border: '1px solid #e2e8f0' }}>Residual Income analysis required</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Formula Callout Box */}
              <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '12px', padding: '1.25rem' }}>
                <h4 style={{ fontSize: '0.95rem', fontWeight: 700, color: '#1e40af', margin: '0 0 0.5rem 0' }}>
                  Standard Calculation Formula:
                </h4>
                <div style={{ fontSize: '0.85rem', color: '#1e3a8a', fontFamily: 'monospace', lineHeight: 1.6 }}>
                  <div>Front-End DTI = ( Principal + Interest + Taxes + Insurance + HOA ) / Gross Monthly Income</div>
                  <div>Back-End DTI = ( Total Housing PITI + Monthly Revolving & Installment Debts ) / Gross Monthly Income</div>
                </div>
              </div>
            </>
          ) : isSampleCase ? (
            <>
              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a82c5d', marginBottom: '0.5rem' }}>
                  1. Underwriting Case Profile - Borrower Assessment
                </h3>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', background: '#f8fafc', padding: '1rem', borderRadius: '10px', fontSize: '0.85rem' }}>
                  <div><strong>Applicant Name:</strong> John A. Doe</div>
                  <div><strong>Loan Application #:</strong> LA-99824-M</div>
                  <div><strong>Credit Score (FICO):</strong> <span style={{ color: '#16a34a', fontWeight: 700 }}>742 (Low Risk)</span></div>
                  <div><strong>Property Appraisal:</strong> $450,000</div>
                  <div><strong>Requested Loan:</strong> $360,000 (80% LTV)</div>
                  <div><strong>Gross Annual Income:</strong> $115,000</div>
                </div>
              </div>

              <div>
                <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a82c5d', marginBottom: '0.5rem' }}>
                  2. Verification Checklist Status
                </h3>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                    <CheckCircle size={16} /> 30-Day Paystubs Verified & Match W-2 YTD
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                    <CheckCircle size={16} /> IRS Form 4506-C Tax Transcripts Received
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#16a34a' }}>
                    <CheckCircle size={16} /> Asset Verification (6 Months Reserves Confirmed)
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#a82c5d', marginBottom: '0.5rem' }}>
                Course Reference Documentation
              </h3>
              <p style={{ fontSize: '0.9rem', lineHeight: 1.6, color: '#334155' }}>
                This standard study guide contains module reference materials, operational procedures, compliance checklists, and training objectives for Koruna Academy learners. Review all sections thoroughly before completing the end-of-module assessment.
              </p>
            </div>
          )}

          {/* Footer Signature */}
          <div style={{ marginTop: '2rem', paddingTop: '1.5rem', borderTop: '1px dashed #cbd5e1', display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#64748b' }}>
            <div>Approved by: <strong>Underwriting Quality Assurance Committee</strong></div>
            <div>Page 1 of 2</div>
          </div>
        </div>
      ) : (
        /* PAGE 2 */
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#a82c5d', margin: 0 }}>
            Page 2: Risk Mitigation & Underwriter Sign-off Notes
          </h3>

          <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '10px', padding: '1.25rem' }}>
            <h4 style={{ fontSize: '0.9rem', fontWeight: 700, color: '#b45309', margin: '0 0 0.5rem 0' }}>
              Required Underwriting Conditions (Prior to Docs):
            </h4>
            <ol style={{ fontSize: '0.85rem', color: '#92400e', margin: 0, paddingLeft: '1.25rem', lineHeight: 1.6 }}>
              <li>Provide updated bank statement showing liquid earnest money deposit clearance.</li>
              <li>Satisfactory HOA certification statement confirming no pending special assessments.</li>
              <li>Title commitment update clear of prior mortgage liens.</li>
            </ol>
          </div>

          <div style={{ marginTop: '3rem', display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: '2rem', borderTop: '2px solid #e2e8f0' }}>
            <div>
              <div style={{ borderBottom: '1px solid #0f172a', width: '220px', marginBottom: '0.3rem' }} />
              <div style={{ fontSize: '0.8rem', fontWeight: 700 }}>Senior Underwriter Signature</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Koruna Academy Certification Board</div>
            </div>

            <div style={{ textAlign: 'right', fontSize: '0.78rem', color: '#64748b' }}>
              <div>Document ID: REF-983120</div>
              <div>Page 2 of 2</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Sub-component: Spreadsheet Viewer Grid UI
const SpreadsheetPreview: React.FC<{ file: ResourceFile; activeTab: string; setActiveTab: (tab: string) => void }> = ({
  file,
  activeTab,
  setActiveTab
}) => {
  const tabs = ['Summary', 'Ratio Calc', 'Raw Data'];

  return (
    <div style={{
      background: '#ffffff',
      borderRadius: '8px',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      overflow: 'hidden',
      fontFamily: 'Segoe UI, system-ui, sans-serif',
      fontSize: '0.82rem',
      border: '1px solid #cbd5e1'
    }}>
      {/* Excel Ribbon Top */}
      <div style={{ background: '#107c41', color: '#ffffff', padding: '0.65rem 1rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', fontWeight: 700, fontSize: '0.9rem' }}>
          <FileSpreadsheet size={18} />
          <span>{file.name} - Microsoft Excel Viewer</span>
        </div>
        <span style={{ fontSize: '0.72rem', opacity: 0.85 }}>Read-Only Interactive View</span>
      </div>

      {/* Formula Bar */}
      <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '0.4rem 0.8rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
        <span style={{ fontWeight: 700, color: '#64748b', fontSize: '0.75rem' }}>fx</span>
        <div style={{ background: '#ffffff', border: '1px solid #cbd5e1', padding: '0.2rem 0.6rem', borderRadius: '4px', flex: 1, fontFamily: 'Consolas, monospace', fontSize: '0.8rem', color: '#0f172a' }}>
          =SUM(C4:C9) / Gross_Monthly_Income
        </div>
      </div>

      {/* Grid Table */}
      <div style={{ overflowX: 'auto', background: '#ffffff' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ background: '#f1f5f9', color: '#475569', textAlign: 'center', fontWeight: 700 }}>
              <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem 0.5rem', width: '40px', background: '#e2e8f0' }}>#</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem', width: '35%' }}>A (Description)</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem' }}>B (Monthly Amount)</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem' }}>C (DTI Weight)</th>
              <th style={{ border: '1px solid #cbd5e1', padding: '0.35rem 0.75rem' }}>D (Approval Status)</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', background: '#f8fafc', color: '#94a3b8', textAlign: 'center' }}>1</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', fontWeight: 700, color: '#0f172a' }}>Base Salaried Gross Income</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', color: '#16a34a', fontWeight: 700 }}>$9,583.33</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>100.00%</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', color: '#16a34a', fontWeight: 700 }}>VERIFIED</td>
            </tr>
            <tr style={{ background: '#fafafa' }}>
              <td style={{ border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', color: '#94a3b8' }}>2</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Proposed Mortgage Principal & Interest</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>$1,980.00</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>20.66%</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', color: '#2563eb' }}>Within Limit</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', color: '#94a3b8' }}>3</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Property Taxes & Insurance (Escrow)</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>$475.00</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>4.95%</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem', color: '#2563eb' }}>Standard</td>
            </tr>
            <tr style={{ background: '#f0fdf4', fontWeight: 700 }}>
              <td style={{ border: '1px solid #cbd5e1', background: '#e2e8f0', textAlign: 'center' }}>4</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', color: '#15803d' }}>FRONT-END DTI RATIO (PITI)</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', color: '#15803d' }}>$2,455.00</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', color: '#15803d' }}>25.61%</td>
              <td style={{ border: '1px solid #cbd5e1', padding: '0.5rem 0.75rem', color: '#15803d' }}>PASS (&lt; 28%)</td>
            </tr>
            <tr>
              <td style={{ border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', color: '#94a3b8' }}>5</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Auto Loan Monthly Payment</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>$350.00</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>3.65%</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Recurring</td>
            </tr>
            <tr style={{ background: '#fafafa' }}>
              <td style={{ border: '1px solid #e2e8f0', background: '#f8fafc', textAlign: 'center', color: '#94a3b8' }}>6</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Student Loan Installment</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>$210.00</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>2.19%</td>
              <td style={{ border: '1px solid #e2e8f0', padding: '0.5rem 0.75rem' }}>Recurring</td>
            </tr>
            <tr style={{ background: '#faf0f4', fontWeight: 800 }}>
              <td style={{ border: '1px solid #a82c5d', background: '#fce7f3', textAlign: 'center', color: '#a82c5d' }}>7</td>
              <td style={{ border: '1px solid #a82c5d', padding: '0.55rem 0.75rem', color: '#a82c5d' }}>TOTAL BACK-END DTI RATIO</td>
              <td style={{ border: '1px solid #a82c5d', padding: '0.55rem 0.75rem', color: '#a82c5d' }}>$3,015.00</td>
              <td style={{ border: '1px solid #a82c5d', padding: '0.55rem 0.75rem', color: '#a82c5d' }}>31.46%</td>
              <td style={{ border: '1px solid #a82c5d', padding: '0.55rem 0.75rem', color: '#16a34a' }}>PASSED UNDERWRITING</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Tabs Bottom */}
      <div style={{ background: '#f1f5f9', borderTop: '1px solid #cbd5e1', padding: '0.4rem 0.5rem', display: 'flex', gap: '0.25rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '0.35rem 0.85rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px 4px 0 0',
              background: activeTab === tab ? '#ffffff' : '#e2e8f0',
              color: activeTab === tab ? '#107c41' : '#475569',
              fontWeight: activeTab === tab ? 700 : 500,
              fontSize: '0.78rem',
              cursor: 'pointer'
            }}
          >
            {tab}
          </button>
        ))}
      </div>
    </div>
  );
};

// Sub-component: Raw Text/Code/Data Content Viewer
const TextContentPreview: React.FC<{ url: string; fileName: string }> = ({ url, fileName }) => {
  const [text, setText] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    setLoading(true);
    if (url.startsWith('data:')) {
      try {
        const base64Index = url.indexOf(';base64,');
        if (base64Index !== -1) {
          const raw = atob(url.substring(base64Index + 8));
          setText(raw);
        } else {
          const commaIndex = url.indexOf(',');
          setText(decodeURIComponent(url.substring(commaIndex + 1)));
        }
      } catch {
        setText('Unable to decode data URL text content.');
      }
      setLoading(false);
    } else if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('blob:')) {
      fetch(url)
        .then(res => res.text())
        .then(data => {
          setText(data);
          setLoading(false);
        })
        .catch(() => {
          setText('Content preview unavailable for this file URL.');
          setLoading(false);
        });
    } else {
      setText(url);
      setLoading(false);
    }
  }, [url]);

  return (
    <div style={{
      background: '#ffffff',
      minHeight: '550px',
      borderRadius: '12px',
      padding: '2.5rem',
      boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      fontFamily: 'Consolas, Monaco, "Courier New", monospace',
      fontSize: '0.88rem',
      lineHeight: 1.6,
      color: '#0f172a',
      overflowX: 'auto',
      border: '1px solid #cbd5e1'
    }}>
      <div style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '1rem', marginBottom: '1.5rem', fontFamily: 'Inter, sans-serif' }}>
        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 800, color: '#0f172a' }}>{fileName}</h3>
        <span style={{ fontSize: '0.75rem', color: '#64748b' }}>Decoded File Content</span>
      </div>

      {loading ? (
        <div style={{ color: '#64748b', fontStyle: 'italic' }}>Loading file contents...</div>
      ) : (
        <pre style={{ margin: 0, whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontFamily: 'inherit' }}>
          {text || 'File is empty.'}
        </pre>
      )}
    </div>
  );
};
