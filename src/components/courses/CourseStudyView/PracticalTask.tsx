import React from 'react';
import { Award, Send, Hourglass, CheckCircle2, XCircle } from 'lucide-react';
import type { Course, UserProgress } from '../../../services/db';

interface PracticalTaskProps {
  studyingCourse: Course;
  practicalText: string;
  setPracticalText: React.Dispatch<React.SetStateAction<string>>;
  handlePracticalSubmit: (e: React.FormEvent) => void;
  userProgress: UserProgress[];
}

export const PracticalTask: React.FC<PracticalTaskProps> = ({
  studyingCourse,
  practicalText,
  setPracticalText,
  handlePracticalSubmit,
  userProgress
}) => {
  const currentProgress = userProgress.find(p => p.courseId === studyingCourse.id);
  const status = currentProgress?.practicalStatus || 'none';

  return (
    <div style={{
      background: '#ffffff',
      border: '1px solid var(--koruna-border-color)',
      borderRadius: '16px',
      padding: '2.5rem',
      boxShadow: 'var(--koruna-card-shadow)',
      display: 'flex',
      flexDirection: 'column',
      gap: '1.5rem',
      marginTop: '2rem',
      borderTop: '2px dashed var(--koruna-border-color)',
      paddingTop: '2rem'
    }}>
      {/* Title */}
      <div>
        <h4 style={{
          fontSize: '1.2rem',
          fontWeight: 800,
          color: 'var(--koruna-text-dark)',
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem',
          fontFamily: 'var(--font-heading)'
        }}>
          <Award style={{ color: '#b4690e' }} />
          Practical Case Study Assessment
        </h4>
        <p style={{
          fontSize: '0.85rem',
          color: 'var(--koruna-text-muted)',
          marginTop: '0.25rem',
          lineHeight: 1.5
        }}>
          Submit a mock underwriting case review summary analyzing sole proprietor DTI metrics for your Team Leader's sign-off.
        </p>
      </div>

      {status === 'none' ? (
        /* SUBMISSION FORM */
        <form onSubmit={handlePracticalSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            className="koruna-textarea"
            placeholder="Review sole proprietor tax schedules and write your case summary notes..."
            required
            value={practicalText}
            onChange={(e) => setPracticalText(e.target.value)}
            style={{
              minHeight: '120px',
              borderRadius: '10px',
              border: '1px solid var(--koruna-border-color)',
              padding: '1rem',
              fontSize: '0.9rem',
              outline: 'none',
              transition: 'all 0.15s ease'
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = 'var(--koruna-primary)';
              e.currentTarget.style.boxShadow = '0 0 0 2px var(--koruna-primary-light, rgba(164, 53, 240, 0.1))';
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = 'var(--koruna-border-color)';
              e.currentTarget.style.boxShadow = 'none';
            }}
          />
          <button
            type="submit"
            className="btn-koruna-solid"
            style={{
              width: 'fit-content',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              height: '40px',
              padding: '0 1.5rem',
              borderRadius: '8px',
              fontWeight: 700
            }}
          >
            <Send size={14} />
            <span>Submit Case Study</span>
          </button>
        </form>
      ) : (
        /* STATUS CARD CONTAINER */
        <div style={{
          borderRadius: '12px',
          padding: '1.5rem',
          border: '1px solid',
          background:
            status === 'approved' ? 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)' :
            status === 'pending' ? 'linear-gradient(135deg, #fffbeb 0%, #fef3c7 100%)' :
            'linear-gradient(135deg, #fff1f2 0%, #ffe4e6 100%)',
          borderColor:
            status === 'approved' ? '#bbf7d0' :
            status === 'pending' ? '#fde68a' :
            '#fecdd3',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '1rem',
          boxShadow: 'var(--shadow-sm)'
        }}>
          {/* Status Icon */}
          <div style={{
            color:
              status === 'approved' ? '#16a34a' :
              status === 'pending' ? '#d97706' :
              '#ef4444',
            marginTop: '0.15rem'
          }}>
            {status === 'approved' && <CheckCircle2 size={24} />}
            {status === 'pending' && <Hourglass size={24} style={{ animation: 'spin 4s linear infinite' }} />}
            {status === 'rejected' && <XCircle size={24} />}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <span style={{
              fontWeight: 800,
              fontSize: '0.95rem',
              color:
                status === 'approved' ? '#14532d' :
                status === 'pending' ? '#78350f' :
                '#9f1239'
            }}>
              {status === 'approved' && 'Assessment Approved'}
              {status === 'pending' && 'Review Status: Pending'}
              {status === 'rejected' && 'Review Status: Changes Requested'}
            </span>
            <p style={{
              fontSize: '0.85rem',
              lineHeight: 1.4,
              margin: 0,
              color:
                status === 'approved' ? '#15803d' :
                status === 'pending' ? '#b45309' :
                '#b91c1c'
            }}>
              {status === 'pending' && 'Sarah Chen (Team Leader) is auditing your mortgage case. You will be notified once reviewed.'}
              {status === 'approved' && 'Excellent underwriting logic. Your certificate is unlocked.'}
              {status === 'rejected' && 'We requested adjustments to the DTI calculations. Please update cases and resubmit.'}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
